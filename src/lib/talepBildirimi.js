import "server-only";
import { supabaseAdmin } from "./supabaseAdmin";
import { smsGonder } from "./sms";
import { epostaGonder } from "./eposta";
import { SITE_URL } from "./site";

// Bir talepte en fazla kaç avukata bildirim gider (bildirim seli ve SMS maliyeti için sınır).
const EN_FAZLA_AVUKAT = 30;

// true: e-posta ve SMS yalnızca ACİL taleplerde gider; tüm genel taleplerde uygulama içi bildirim gider.
// false yapılırsa e-posta ve SMS de tüm genel taleplerde gönderilir.
const EPOSTA_VE_SMS_SADECE_ACIL = true;

// Kullanıcıdan gelen metin e-posta/SMS'e girmeden önce güvenli hale getirilir.
function temizle(metin) {
  return String(metin ?? "")
    .replace(/[<>&"'\r\n]/g, " ")
    .trim()
    .slice(0, 60);
}

// true: yalnızca şehri/alanı uyan avukatlara bildirim gider. false: tüm baro onaylı avukatlar bildirim alır
// (uyanlar önce, EN_FAZLA_AVUKAT sınırıyla). Avukat panelindeki aynı ada sahip ayarla (useAvukatTalepleri) tutarlı tutulmalı.
const SADECE_UYGUN_AVUKATLAR = false;

// Baro doğrulaması onaylı avukatlar; talebin şehrine ve/veya uzmanlık alanına uyanlar önce gelir.
async function uygunAvukatlar(talep) {
  const { data: avukatlar, error } = await supabaseAdmin.from("avukatlar").select("*").eq("dogrulanmis", true);
  if (error) throw error;

  return (avukatlar ?? [])
    .map((avukat) => {
      const sehirUyar = Boolean(talep.hedef_sehir) && avukat.sehir === talep.hedef_sehir;
      const alanUyar = (avukat.uzmanlik_alanlari ?? []).includes(talep.hedef_uzmanlik_alani);
      return { avukat, puan: (sehirUyar ? 1 : 0) + (alanUyar ? 1 : 0) };
    })
    .filter((x) => !SADECE_UYGUN_AVUKATLAR || x.puan > 0)
    .sort((a, b) => b.puan - a.puan)
    .slice(0, EN_FAZLA_AVUKAT)
    .map((x) => x.avukat);
}

// Ödemesi tamamlanmış (ya da ücretsiz denemeli) bir genel havuz talebi için uygun avukatlara haber verir.
// KVKK: mesajlara müvekkilin adı, konusu ve açıklaması yazılmaz; yalnızca şehir ve uzmanlık alanı.
// Hata olursa talep akışı etkilenmesin diye hiçbir şey fırlatmaz.
export async function genelTalepBildir(talepId) {
  try {
    const { data: talep } = await supabaseAdmin
      .from("randevu_talepleri")
      .select("id, tur, acil, durum, avukat_id, hedef_sehir, hedef_uzmanlik_alani, odeme_durumu")
      .eq("id", talepId)
      .maybeSingle();

    if (!talep || talep.tur !== "genel" || talep.durum !== "bekliyor" || talep.avukat_id) return;
    if (!["odendi", "muaf"].includes(talep.odeme_durumu)) return;

    const avukatlar = await uygunAvukatlar(talep);
    if (avukatlar.length === 0) return;

    const sehir = temizle(talep.hedef_sehir) || "—";
    const alan = temizle(talep.hedef_uzmanlik_alani) || "Genel";
    const acil = Boolean(talep.acil);
    const panelAdresi = `${SITE_URL}/avukat/talepler`;

    // 1) Uygulama içi bildirim (tüm genel taleplerde).
    const { error: bildirimHatasi } = await supabaseAdmin.from("bildirimler").insert(
      avukatlar.map((avukat) => ({
        kullanici_id: avukat.id,
        baslik: acil ? "ACİL talep: yanıt bekliyor" : "Yeni açık havuz talebi",
        mesaj: acil ? `${alan} · ${sehir}. En kısa sürede dönüş yapmanız gerekmektedir.` : `${alan} · ${sehir}`,
        link: "/avukat/talepler",
      }))
    );
    if (bildirimHatasi) console.error("Talep bildirimi eklenemedi:", bildirimHatasi.message);

    if (EPOSTA_VE_SMS_SADECE_ACIL && !acil) return;

    // 2) E-posta ve 3) SMS. Anahtarlar tanımlı değilse ilgili adım atlanır/başarısız olur ve loglanır.
    const konu = acil ? `ACİL talep: ${alan} / ${sehir}` : `Yeni talep: ${alan} / ${sehir}`;
    const girisCumlesi = acil
      ? `Hukukim'de ${sehir} için ${alan} alanında ACİL bir görüşme talebi açıldı. En kısa sürede dönüş yapmanız gerekmektedir.`
      : `Hukukim'de ${sehir} için ${alan} alanında yeni bir görüşme talebi açıldı.`;
    const smsMetni = acil
      ? `Hukukim ACIL talep: ${alan}/${sehir}. En kisa surede donus yapmaniz gerekmektedir. hukukim.com/avukat/talepler`
      : `Hukukim yeni talep: ${alan}/${sehir}. hukukim.com/avukat/talepler`;

    const gonderimler = avukatlar.flatMap((avukat) => {
      const isler = [];

      if (avukat.email) {
        const ad = temizle(avukat.ad_soyad);
        isler.push(
          epostaGonder({
            to: avukat.email,
            konu,
            metin: `Merhaba ${ad},\n\n${girisCumlesi}\n\nTalebi görüntülemek ve üstlenmek için: ${panelAdresi}\n\nBu e-posta, Hukukim avukat hesabınıza bağlı bildirimler kapsamında gönderilmiştir.`,
            html: `<p>Merhaba ${ad},</p><p>${girisCumlesi}</p><p><a href="${panelAdresi}">Talebi görüntüle ve üstlen</a></p><p style="color:#666;font-size:12px">Bu e-posta, Hukukim avukat hesabınıza bağlı bildirimler kapsamında gönderilmiştir.</p>`,
          })
        );
      }

      // SMS yalnızca doğrulanmış telefona gönderilir.
      if (avukat.telefon && avukat.telefon_dogrulandi !== false) {
        isler.push(smsGonder(avukat.telefon, smsMetni));
      }

      return isler;
    });

    const sonuclar = await Promise.allSettled(gonderimler);
    const basarisiz = sonuclar.filter((s) => s.status === "rejected");
    if (basarisiz.length > 0) {
      console.error(
        `Talep bildirimi: ${basarisiz.length}/${sonuclar.length} gönderim başarısız.`,
        basarisiz[0].reason?.message
      );
    }
  } catch (hata) {
    console.error("Talep bildirimi başarısız:", hata?.message ?? hata);
  }
}
