import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { yoneticiIstegi } from "@/lib/adminYetki";
import { epostaGonder } from "@/lib/eposta";
import { SITE_URL } from "@/lib/site";

// Aynı avukata art arda e-posta gitmesin diye en fazla bu aralıkla gönderilir.
const TEKRAR_SAAT = 24;

// Kimlik ve baro kartını henüz yüklememiş (ya da reddedilmiş) avukata hatırlatma e-postası gönderir.
export async function POST(request) {
  const yetki = await yoneticiIstegi(request);
  if (yetki.hata) return NextResponse.json({ hata: yetki.hata }, { status: yetki.durum });

  const { avukatId } = await request.json().catch(() => ({}));
  if (!avukatId) return NextResponse.json({ hata: "Eksik bilgi." }, { status: 400 });

  const { data: avukat } = await supabaseAdmin
    .from("avukatlar")
    .select("ad_soyad, email, belge_durumu, dogrulanmis")
    .eq("id", avukatId)
    .maybeSingle();

  if (!avukat?.email) return NextResponse.json({ hata: "Avukatın e-posta adresi yok." }, { status: 404 });
  if (avukat.belge_durumu === "onaylandi") {
    return NextResponse.json({ hata: "Bu avukatın belgeleri zaten onaylı." }, { status: 400 });
  }

  const esik = new Date(Date.now() - TEKRAR_SAAT * 60 * 60 * 1000).toISOString();
  const { data: onceki } = await supabaseAdmin
    .from("admin_bildirim_log")
    .select("id")
    .eq("tip", "belge_hatirlat")
    .eq("kullanici_id", avukatId)
    .gt("created_at", esik)
    .limit(1);
  if (onceki?.length) {
    return NextResponse.json({ hata: "Bu avukata son 24 saat içinde zaten hatırlatma gönderildi." }, { status: 429 });
  }

  const ad = String(avukat.ad_soyad ?? "").replace(/[<>&"']/g, " ").trim();
  const adres = `${SITE_URL}/avukat/panel#kimlik-dogrulama`;
  const konu = "Hukukim: profilinizi yayına almak için son adım";

  const metin =
    `Merhaba ${ad},\n\n` +
    `Hukukim ailesine katıldığınız için teşekkür ederiz.\n\n` +
    `Müvekkillerimizin güvenini her şeyin üstünde tutuyoruz. Bu yüzden platformdaki her avukatın kimliği ve baro kaydı ` +
    `ekibimizce doğrulanıyor. "Doğrulanmış Avukat" rozeti, müvekkillerin sizi tercih etmesinde en belirleyici unsurlardan biri.\n\n` +
    `Yapmanız gereken tek şey: panele girip "Kimlik doğrulaması gerekli" bölümünden kimliğinizin ön yüzünü ve baro kartınızı yüklemek.\n\n` +
    `Belgelerinizin gizliliği bizim için önceliklidir:\n` +
    `- Belgeleriniz yalnızca doğrulama ekibimiz tarafından görülür.\n` +
    `- 6698 sayılı KVKK kapsamında korunur, üçüncü kişilerle paylaşılmaz ve doğrulama dışında hiçbir amaçla kullanılmaz.\n` +
    `- Müvekkillere belgeleriniz gösterilmez; yalnızca profilinizde "Doğrulanmış" rozeti görünür.\n\n` +
    `Sırada ne var? Doğrulanan avukatlarımızla birlikte tanıtım ve reklam çalışmalarımıza başlıyoruz. ` +
    `Müvekkil talepleri geldiğinde profili hazır ve doğrulanmış olan avukatlar bu taleplere ilk ulaşanlar olacak.\n\n` +
    `${adres}\n\n` +
    `Herhangi bir sorunuzda panelinizdeki Canlı Destek düğmesiyle bize 7/24 yazabilirsiniz; her zaman yanınızdayız.\n\n` +
    `Hukukim Ekibi`;

  const html =
    `<div style="font-family:Arial,sans-serif;max-width:540px;line-height:1.6;color:#111">` +
    `<p>Merhaba ${ad},</p>` +
    `<p>Hukukim ailesine katıldığınız için teşekkür ederiz.</p>` +
    `<p>Müvekkillerimizin güvenini her şeyin üstünde tutuyoruz. Bu yüzden platformdaki her avukatın <strong>kimliği ve baro kaydı ekibimizce doğrulanıyor</strong>. ` +
    `"Doğrulanmış Avukat" rozeti, müvekkillerin sizi tercih etmesinde en belirleyici unsurlardan biri.</p>` +
    `<p><strong>Yapmanız gereken tek şey:</strong> panele girip "Kimlik doğrulaması gerekli" bölümünden kimliğinizin ön yüzünü ve baro kartınızı yüklemek.</p>` +
    `<p style="margin:22px 0"><a href="${adres}" style="background:#22d3ee;color:#0b1220;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:bold">Belgelerimi yükle</a></p>` +
    `<div style="background:#f1f5f9;border-radius:10px;padding:14px 16px;margin:18px 0">` +
    `<p style="margin:0 0 6px"><strong>Belgelerinizin gizliliği bizim için önceliklidir</strong></p>` +
    `<ul style="margin:0;padding-left:18px">` +
    `<li>Belgeleriniz yalnızca doğrulama ekibimiz tarafından görülür.</li>` +
    `<li>6698 sayılı KVKK kapsamında korunur, üçüncü kişilerle paylaşılmaz ve doğrulama dışında hiçbir amaçla kullanılmaz.</li>` +
    `<li>Müvekkillere belgeleriniz gösterilmez; yalnızca profilinizde "Doğrulanmış" rozeti görünür.</li>` +
    `</ul></div>` +
    `<p><strong>Sırada ne var?</strong> Doğrulanan avukatlarımızla birlikte tanıtım ve reklam çalışmalarımıza başlıyoruz. ` +
    `Müvekkil talepleri geldiğinde profili hazır ve doğrulanmış olan avukatlar bu taleplere ilk ulaşanlar olacak.</p>` +
    `<p>Herhangi bir sorunuzda panelinizdeki <strong>Canlı Destek</strong> düğmesiyle bize <strong>7/24</strong> yazabilirsiniz; her zaman yanınızdayız.</p>` +
    `<p>Hukukim Ekibi</p></div>`;

  try {
    await epostaGonder({ to: avukat.email, konu, metin, html, tur: "belge_hatirlat", aliciId: avukatId });
  } catch (hata) {
    console.error("Belge hatırlatma e-postası gönderilemedi:", hata?.message);
    return NextResponse.json({ hata: "E-posta gönderilemedi." }, { status: 502 });
  }

  await supabaseAdmin.from("admin_bildirim_log").insert({ tip: "belge_hatirlat", kullanici_id: avukatId });
  return NextResponse.json({ basarili: true });
}
