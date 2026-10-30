import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { yoneticiIstegi } from "@/lib/adminYetki";
import { epostaGonder } from "@/lib/eposta";
import { SITE_URL } from "@/lib/site";

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

  const ad = String(avukat.ad_soyad ?? "").replace(/[<>&"']/g, " ").trim();
  const adres = `${SITE_URL}/avukat/panel#kimlik-dogrulama`;
  const konu = "Hukukim: profilinizin yayında olması için kimlik doğrulaması gerekiyor";
  const metin =
    `Merhaba ${ad},\n\n` +
    `Hukukim'e katıldığınız için teşekkür ederiz. Müvekkillerin sizi görebilmesi ve taleplere yanıt verebilmeniz için ` +
    `kimlik ve baro kartı doğrulamanızı tamamlamanız gerekiyor.\n\n` +
    `Yapmanız gereken: panele girip "Kimlik doğrulaması gerekli" bölümünden kimliğinizin ön yüzünü ve baro kartınızı yüklemeniz. ` +
    `Belgeleriniz yalnızca doğrulama ekibimiz tarafından görülür ve onay genellikle kısa sürede tamamlanır.\n\n` +
    `${adres}\n\nYardıma ihtiyacınız olursa panelden Canlı Destek düğmesiyle bize yazabilirsiniz.\n\nHukukim Ekibi`;
  const html =
    `<div style="font-family:Arial,sans-serif;max-width:520px;line-height:1.55">` +
    `<p>Merhaba ${ad},</p>` +
    `<p>Hukukim'e katıldığınız için teşekkür ederiz. Müvekkillerin sizi görebilmesi ve taleplere yanıt verebilmeniz için ` +
    `<strong>kimlik ve baro kartı doğrulamanızı</strong> tamamlamanız gerekiyor.</p>` +
    `<p>Panele girip "Kimlik doğrulaması gerekli" bölümünden kimliğinizin ön yüzünü ve baro kartınızı yükleyin. ` +
    `Belgeleriniz yalnızca doğrulama ekibimiz tarafından görülür.</p>` +
    `<p style="margin:20px 0"><a href="${adres}" style="background:#22d3ee;color:#0b1220;padding:11px 18px;border-radius:999px;text-decoration:none;font-weight:bold">Belgelerimi yükle</a></p>` +
    `<p>Yardıma ihtiyacınız olursa panelden <strong>Canlı Destek</strong> düğmesiyle bize yazabilirsiniz.</p>` +
    `<p>Hukukim Ekibi</p></div>`;

  try {
    await epostaGonder({ to: avukat.email, konu, metin, html });
  } catch (hata) {
    console.error("Belge hatırlatma e-postası gönderilemedi:", hata?.message);
    return NextResponse.json({ hata: "E-posta gönderilemedi." }, { status: 502 });
  }

  return NextResponse.json({ basarili: true });
}
