import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { adminBildir, kullaniciOzeti } from "@/lib/adminBildirim";
import { epostaGonder } from "@/lib/eposta";
import { SITE_URL } from "@/lib/site";

// Yanıtsız kalan destek mesajlarını takip eder (pg_cron, 10 dakikada bir):
//  - Kullanıcıya "mesajınızı aldık, dönüş yapacağız" e-postası gider,
//  - Yöneticiye "şu kişiler bekliyor" hatırlatması gider.
// Her bekleyen mesaj için yalnızca bir kez çalışır.
const BEKLEME_DAKIKA = 10;
const GERIYE_BAKIS_SAAT = 24;
const EN_FAZLA_KISI = 20;

export async function GET(request) {
  const yetkiBasligi = request.headers.get("authorization") ?? "";
  if (!process.env.CRON_SECRET || yetkiBasligi !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ hata: "Yetkisiz." }, { status: 401 });
  }

  const alt = new Date(Date.now() - GERIYE_BAKIS_SAAT * 60 * 60 * 1000).toISOString();
  const { data: mesajlar, error } = await supabaseAdmin
    .from("destek_mesajlari")
    .select("kullanici_id, gonderen, created_at")
    .gt("created_at", alt)
    .order("created_at", { ascending: true })
    .limit(3000);
  if (error) return NextResponse.json({ hata: "Sorgu başarısız." }, { status: 500 });

  // Her kullanıcı için son kullanıcı mesajı ve ondan sonra gelen admin/asistan yanıtı.
  const durum = new Map();
  for (const m of mesajlar ?? []) {
    const d = durum.get(m.kullanici_id) ?? { sonKullanici: null, yanitlandi: true };
    if (m.gonderen === "kullanici") {
      d.sonKullanici = m.created_at;
      d.yanitlandi = false;
    } else if (m.gonderen === "admin" || m.gonderen === "asistan") {
      d.yanitlandi = true;
    }
    durum.set(m.kullanici_id, d);
  }

  const esik = Date.now() - BEKLEME_DAKIKA * 60 * 1000;
  const bekleyenler = [...durum.entries()]
    .filter(([, d]) => !d.yanitlandi && d.sonKullanici && new Date(d.sonKullanici).getTime() <= esik)
    .slice(0, EN_FAZLA_KISI);

  if (bekleyenler.length === 0) return NextResponse.json({ takip: 0 });

  const idler = bekleyenler.map(([id]) => id);
  const { data: loglar } = await supabaseAdmin
    .from("admin_bildirim_log")
    .select("kullanici_id, created_at")
    .eq("tip", "destek_takip")
    .in("kullanici_id", idler);

  const yeni = bekleyenler.filter(([id, d]) => {
    const kayit = (loglar ?? []).filter((l) => l.kullanici_id === id);
    return !kayit.some((l) => new Date(l.created_at) > new Date(d.sonKullanici));
  });

  if (yeni.length === 0) return NextResponse.json({ takip: 0 });

  await supabaseAdmin.from("admin_bildirim_log").insert(yeni.map(([id]) => ({ tip: "destek_takip", kullanici_id: id })));

  const satirlar = [];
  for (const [id, d] of yeni) {
    const ozet = await kullaniciOzeti(id);
    const dk = Math.round((Date.now() - new Date(d.sonKullanici).getTime()) / 60000);
    satirlar.push(`${ozet.ad_soyad ?? "Kullanıcı"} (${ozet.rol}) · ${dk} dakikadır bekliyor · ${ozet.email ?? "—"}`);

    if (ozet.email) {
      epostaGonder({
        tur: "destek_takip",
        aliciId: id,
        to: ozet.email,
        konu: "Hukukim: mesajınızı aldık",
        metin:
          `Merhaba ${ozet.ad_soyad ?? ""},\n\nDestek mesajınız bize ulaştı ve ekibimiz inceliyor. En kısa sürede size dönüş yapacağız; ` +
          `yanıtımızı panelinizdeki Canlı Destek penceresinde görebilirsiniz.\n\n${SITE_URL}\n\nHukukim Ekibi`,
        html:
          `<div style="font-family:Arial,sans-serif;max-width:520px;line-height:1.55"><p>Merhaba ${String(ozet.ad_soyad ?? "").replace(/[<>&"']/g, " ")},</p>` +
          `<p>Destek mesajınız bize ulaştı ve ekibimiz inceliyor. En kısa sürede size dönüş yapacağız.</p>` +
          `<p>Yanıtımızı panelinizdeki <strong>Canlı Destek</strong> penceresinde görebilirsiniz.</p>` +
          `<p style="margin:18px 0"><a href="${SITE_URL}" style="background:#22d3ee;color:#0b1220;padding:10px 16px;border-radius:999px;text-decoration:none;font-weight:bold">Hukukim'e git</a></p>` +
          `<p>Hukukim Ekibi</p></div>`,
      }).catch((e) => console.error("Destek takip e-postası gönderilemedi:", e?.message));
    }
  }

  await adminBildir({
    tip: "destek_takip_ozet",
    baslik: `${yeni.length} destek mesajı ${BEKLEME_DAKIKA}+ dakikadır yanıt bekliyor`,
    satirlar,
    link: "/admin/destek",
  });

  return NextResponse.json({ takip: yeni.length });
}
