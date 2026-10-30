import "server-only";
import { supabaseAdmin } from "./supabaseAdmin";
import { epostaGonder } from "./eposta";
import { SITE_URL } from "./site";

function kacis(metin) {
  return String(metin ?? "").replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c]);
}

async function yoneticiler() {
  const { data } = await supabaseAdmin.from("yoneticiler").select("id, email");
  return data ?? [];
}

// ADMIN_BILDIRIM_EPOSTA (virgülle ayrılmış) tanımlıysa e-postalar oraya, değilse tüm yöneticilere gider.
async function alicilar(yonetici) {
  const ozel = process.env.ADMIN_BILDIRIM_EPOSTA;
  if (ozel) return ozel.split(",").map((s) => s.trim()).filter(Boolean);
  return yonetici.map((y) => y.email).filter(Boolean);
}

// Yöneticiye anında e-posta + panel zili bildirimi gönderir.
// tekrarDakika verilirse aynı (tip, kullanıcı) için bu süre içinde ikinci kez gönderilmez.
// Hata olursa akışı bozmamak için hiçbir şey fırlatmaz.
export async function adminBildir({ tip, kullaniciId = null, baslik, satirlar = [], link = "/admin", tekrarDakika = 0 }) {
  try {
    if (tekrarDakika > 0 && kullaniciId) {
      const esik = new Date(Date.now() - tekrarDakika * 60 * 1000).toISOString();
      const { data: onceki } = await supabaseAdmin
        .from("admin_bildirim_log")
        .select("id")
        .eq("tip", tip)
        .eq("kullanici_id", kullaniciId)
        .gt("created_at", esik)
        .limit(1);
      if (onceki?.length) return;
    }

    await supabaseAdmin.from("admin_bildirim_log").insert({ tip, kullanici_id: kullaniciId });

    const yonetici = await yoneticiler();
    const adresler = await alicilar(yonetici);

    if (yonetici.length) {
      await supabaseAdmin.from("bildirimler").insert(
        yonetici.map((y) => ({ kullanici_id: y.id, baslik, mesaj: satirlar[0] ?? null, link }))
      );
    }

    const tamLink = `${SITE_URL}${link}`;
    const metin = `${baslik}\n\n${satirlar.join("\n")}\n\n${tamLink}`;
    const html =
      `<div style="font-family:Arial,sans-serif;max-width:520px">` +
      `<h2 style="margin:0 0 12px">${kacis(baslik)}</h2>` +
      satirlar.map((s) => `<p style="margin:4px 0">${kacis(s)}</p>`).join("") +
      `<p style="margin-top:16px"><a href="${tamLink}" style="background:#22d3ee;color:#0b1220;padding:10px 16px;border-radius:999px;text-decoration:none;font-weight:bold">Yönetim panelinde aç</a></p>` +
      `</div>`;

    await Promise.allSettled(adresler.map((to) => epostaGonder({ to, konu: baslik, metin, html, tur: "admin_bildirim" })));
  } catch (hata) {
    console.error("Yönetici bildirimi başarısız:", hata?.message ?? hata);
  }
}

// Kullanıcı kimliğinden görünen ad ve rolü bulur.
export async function kullaniciOzeti(kullaniciId) {
  const [{ data: avukat }, { data: muvekkil }] = await Promise.all([
    supabaseAdmin.from("avukatlar").select("ad_soyad, email, telefon, sehir").eq("id", kullaniciId).maybeSingle(),
    supabaseAdmin.from("muvekkiller").select("ad_soyad, email, telefon, sehir").eq("id", kullaniciId).maybeSingle(),
  ]);
  if (avukat) return { rol: "Avukat", ...avukat };
  if (muvekkil) return { rol: "Müvekkil", ...muvekkil };
  return { rol: "Bilinmiyor", ad_soyad: null, email: null, telefon: null, sehir: null };
}
