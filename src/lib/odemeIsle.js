import "server-only";
import { after } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { genelTalepBildir } from "@/lib/talepBildirimi";
import { iyzicoOdemeSorgula, iyzicoIadeYap } from "@/lib/iyzico";
import { GORUSME_PAKETLERI } from "@/lib/odemeYardimci";
import { dailyOdaSuresiniAyarla } from "@/lib/daily";
import { gorusmeBitisMs, SURE_TOLERANSI_MS } from "@/lib/gorusmeYardimci";
import { ODEME_DONUS_ADRESI } from "@/lib/site";

const EK_SURE_PAKETI = GORUSME_PAKETLERI[0];

// Sipariş numarasından (TLP... / EK... / TEST...) ödeme sonrası dönülecek adresi üretir.
export function donusAdresiBul({ merchantOid, randevuTalepId, basarili }) {
  const durum = basarili ? "basarili" : "basarisiz";
  const oid = String(merchantOid ?? "");
  if (oid.startsWith("TLP") && randevuTalepId) {
    return `${ODEME_DONUS_ADRESI}/muvekkil/panel?talep=${randevuTalepId}&odeme=${durum}`;
  }
  return `${ODEME_DONUS_ADRESI}/odeme/${durum}${oid.startsWith("TEST") ? `?oid=${oid}` : ""}`;
}

async function yanEtkisiBasarisiz(merchantOid, ayrinti) {
  // Ödeme kaydını geri "basladi"ya çekeriz ki bir sonraki deneme (webhook tekrarı ya da dönüş
  // adresinin yeniden çağrılması) işlemi baştan, tek seferlik olarak yeniden yapsın.
  console.error("iyzico ödeme yan etkisi başarısız:", merchantOid, ayrinti);
  await supabaseAdmin.from("odemeler").update({ durum: "basladi" }).eq("merchant_oid", merchantOid);
  return { yenidenDene: true };
}

// iyzico token'ı ile ödemeyi sorgular ve sonucu işler (ödeme kaydı, talep, ek süre, iade).
// Hem tarayıcı dönüşünden hem webhook'tan çağrılır; tekrar çağrılması güvenlidir (tek seferlik
// yan etkiler yalnızca ilk başarılı işlemde çalışır).
// Dönüş: { durum: "basarili" | "basarisiz" | "belirsiz" | "bilinmiyor", merchantOid, randevuTalepId, yenidenDene }
export async function odemeyiIsle(token) {
  if (!token || typeof token !== "string") return { durum: "bilinmiyor" };

  const { data: kayit } = await supabaseAdmin
    .from("odemeler")
    .select("merchant_oid, tutar, randevu_talep_id")
    .eq("iyzico_token", token)
    .maybeSingle();

  if (!kayit) return { durum: "bilinmiyor" };

  const merchantOid = kayit.merchant_oid;
  const sorgu = await iyzicoOdemeSorgula(token);
  const temel = { merchantOid, randevuTalepId: kayit.randevu_talep_id };

  // iyzico sorguya cevap vermediyse ya da ödeme henüz sonuçlanmadıysa hiçbir şeyi değiştirme.
  if (!sorgu.istekBasarili) return { ...temel, durum: "belirsiz" };

  let basarili = sorgu.basarili;
  let basarisizNedeni = basarili ? null : sorgu.hataMesaji ?? "Ödeme tamamlanmadı.";

  // Tahsil edilen tutar kaydımızla uyuşmuyorsa ödemeyi kabul etme, parayı geri ver.
  if (basarili && Math.abs(sorgu.odenenTutar - Number(kayit.tutar)) > 0.009) {
    console.error("iyzico tutar uyuşmazlığı:", merchantOid, sorgu.odenenTutar, kayit.tutar);
    await iyzicoIadeYap({ odemeId: sorgu.odemeId, tutar: sorgu.odenenTutar });
    basarili = false;
    basarisizNedeni = "Tahsil edilen tutar beklenenle uyuşmadı.";
  }

  // Atomik koşullu güncelleme: aynı sonuç birden fazla kez gelebilir (dönüş + webhook + tekrarlar).
  // "basarili"dan tekrar "basarili"ya geçişi WHERE koşuluyla engelleyerek tek seferlik yan etkilerin
  // (ek süre, iade, bildirim) yalnızca ILK başarılı işlemde çalışmasını sağlarız.
  const { data: odeme, error: odemeHatasi } = await supabaseAdmin
    .from("odemeler")
    .update({
      durum: basarili ? "basarili" : "basarisiz",
      basarisiz_nedeni: basarili ? null : basarisizNedeni,
      iyzico_odeme_id: sorgu.odemeId,
      guncellendi_at: new Date().toISOString(),
    })
    .eq("merchant_oid", merchantOid)
    .neq("durum", "basarili")
    .select("muvekkil_id, randevu_talep_id, tutar")
    .maybeSingle();

  if (odemeHatasi) {
    console.error("iyzico ödeme güncelleme hatası:", odemeHatasi);
    return { ...temel, durum: basarili ? "basarili" : "basarisiz", yenidenDene: true };
  }

  const durum = basarili ? "basarili" : "basarisiz";

  // Daha önce işlenmiş (tekrar gelen sonuç): yapılacak bir şey yok.
  if (!odeme) return { ...temel, durum };

  if (basarili && odeme.randevu_talep_id) {
    const iade = () => iyzicoIadeYap({ odemeId: sorgu.odemeId, tutar: Number(odeme.tutar) });

    // Ek süre siparişleri: eski "EKS..." (her zaman 5 dk) ve yeni "EKP<dakika>X..." biçimi.
    const ekSureMi = /^EK[SP]/.test(String(merchantOid));
    const ekSureEslesmesi = /^EKP(\d+)X/.exec(String(merchantOid));
    const ekPaket =
      GORUSME_PAKETLERI.slice(0, 2).find((p) => p.dakika === Number(ekSureEslesmesi?.[1])) ?? EK_SURE_PAKETI;

    const { data: talep, error: talepHatasi } = await supabaseAdmin
      .from("randevu_talepleri")
      .select("durum, paket_dakika, paket_tutari, odeme_tutari, gorusme_baslangic_zamani")
      .eq("id", odeme.randevu_talep_id)
      .maybeSingle();

    if (talepHatasi) return { ...temel, durum, ...(await yanEtkisiBasarisiz(merchantOid, talepHatasi)) };

    if (ekSureMi) {
      // Görüşme sırasında satın alınan ek süre: paket dakikasını ve tutarını mevcut talebin üzerine ekle.
      // Görüşme bu arada bittiyse iade et.
      if (talep?.durum === "kabul") {
        const { error } = await supabaseAdmin
          .from("randevu_talepleri")
          .update({
            paket_dakika: Number(talep.paket_dakika || 0) + ekPaket.dakika,
            paket_tutari: Number(talep.paket_tutari || 0) + ekPaket.tutar,
            odeme_tutari: Number(talep.odeme_tutari || 0) + ekPaket.tutar,
          })
          .eq("id", odeme.randevu_talep_id);

        if (error) return { ...temel, durum, ...(await yanEtkisiBasarisiz(merchantOid, error)) };

        // Görüşme sürerken Daily.co odasının bitişini yeni süreye göre uzat. Başarısız olursa
        // ödeme geri alınmaz (dakika zaten eklendi); istemci ek süre sonrası odayı yeniden senkronlar.
        if (talep.gorusme_baslangic_zamani) {
          try {
            const yeniBitisMs = gorusmeBitisMs({
              ...talep,
              paket_dakika: Number(talep.paket_dakika || 0) + ekPaket.dakika,
            });
            await dailyOdaSuresiniAyarla(`hukukim-${odeme.randevu_talep_id}`, yeniBitisMs + SURE_TOLERANSI_MS);
          } catch (err) {
            console.error("Ek süre sonrası oda süresi uzatılamadı:", err);
          }
        }
      } else {
        await iade();
      }
    } else if (talep?.durum === "bekliyor") {
      // Talep ön ödemesi: görüşme henüz eşleşmedi, yalnızca odeme_durumu "odendi" olarak işaretlenir,
      // talep havuzda görünür hale gelir. durum ("bekliyor") kasten değiştirilmez.
      const { error } = await supabaseAdmin
        .from("randevu_talepleri")
        .update({ odeme_durumu: "odendi" })
        .eq("id", odeme.randevu_talep_id);

      if (error) return { ...temel, durum, ...(await yanEtkisiBasarisiz(merchantOid, error)) };

      // Talep havuzda görünür oldu: uygun avukatlara haber ver. Yanıtı geciktirmemek için yanıt sonrası
      // çalışır; hata olursa ödeme akışını etkilemez.
      after(() => genelTalepBildir(odeme.randevu_talep_id));
    } else {
      // Müvekkil ödemeyi talep zaman aşımı/iptal sonrası tamamladı: talep artık geçersiz, parayı iade et.
      const sonuc = await iade();
      if (!sonuc.basarili) return { ...temel, durum, ...(await yanEtkisiBasarisiz(merchantOid, "geç ödeme iadesi başarısız")) };
    }
  }

  return { ...temel, durum };
}
