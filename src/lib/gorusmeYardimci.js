import "server-only";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { avukatPayiHesapla } from "@/lib/odemeYardimci";

// Küçük ağ gecikmelerini tolere etmek için süre sonuna eklenen pay (milisaniye).
export const SURE_TOLERANSI_MS = 5000;

// Görüşmenin sunucu saatine göre planlanan bitiş anı (ms). Başlamadıysa null.
export function gorusmeBitisMs(talep) {
  if (!talep?.gorusme_baslangic_zamani) return null;
  return new Date(talep.gorusme_baslangic_zamani).getTime() + Number(talep.paket_dakika || 0) * 60 * 1000;
}

// Görüşmeyi tamamlandı olarak işaretler ve kazancı yazar. İdempotenttir: aynı görüşmeyi
// iki taraf aynı anda tamamlamaya çalışsa bile kazanç satırını yalnızca bir istek ekler.
// Gerçek süre istemciden değil, sunucunun kaydettiği başlangıç anından hesaplanır.
export async function gorusmeyiTamamla(talep) {
  const baslangic = talep.gorusme_baslangic_zamani ? new Date(talep.gorusme_baslangic_zamani).getTime() : null;
  let dakika = null;
  if (baslangic) {
    const gecenMs = Math.min(Date.now() - baslangic, Number(talep.paket_dakika || 0) * 60 * 1000);
    dakika = Math.max(1, Math.ceil(gecenMs / 60000));
  }

  const { data: guncellenen, error: guncelleHatasi } = await supabaseAdmin
    .from("randevu_talepleri")
    .update({
      durum: "tamamlandi",
      ...(dakika ? { gorusme_suresi_dakika: dakika } : {}),
    })
    .eq("id", talep.id)
    .eq("durum", "kabul")
    .select("id")
    .maybeSingle();

  if (guncelleHatasi) return { hata: guncelleHatasi };

  if (guncellenen && Number(talep.odeme_tutari || 0) > 0 && talep.avukat_id) {
    // Aynı talep için kazanç zaten yazıldıysa (önceki bir denemede) tekrar eklenmez.
    const { data: mevcutKazanc } = await supabaseAdmin
      .from("avukat_kazanclari")
      .select("id")
      .eq("randevu_talep_id", talep.id)
      .maybeSingle();

    if (!mevcutKazanc) {
      const { error: kazancHatasi } = await supabaseAdmin.from("avukat_kazanclari").insert({
        avukat_id: talep.avukat_id,
        randevu_talep_id: talep.id,
        muvekkil_ad_soyad: talep.muvekkil_ad_soyad,
        kazanilan_miktar: avukatPayiHesapla(talep.odeme_tutari),
      });

      if (kazancHatasi) {
        // Kazanç yazılamadıysa talebi "kabul"e geri al: bir sonraki tamamlama denemesi
        // (diğer taraf ya da süre dolumu) kazancı yeniden yazabilsin, avukatın parası kaybolmasın.
        console.error("Avukat kazancı yazılamadı, talep:", talep.id, kazancHatasi);
        await supabaseAdmin
          .from("randevu_talepleri")
          .update({ durum: "kabul" })
          .eq("id", talep.id)
          .eq("durum", "tamamlandi");
        return { hata: kazancHatasi };
      }
    }
  }

  return { basarili: true };
}
