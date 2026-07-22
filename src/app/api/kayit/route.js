import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Bu uç nokta, e-posta doğrulama bağlantısına tıklandıktan sonra çağrılır.
// Kullanıcı zaten Supabase Auth üzerinde doğrulanmış bir oturuma sahiptir;
// burada yalnızca kayıt sırasında toplanan bilgileri (user_metadata) okuyup
// avukatlar/muvekkiller tablosuna profil satırını ekliyoruz.
export async function POST(request) {
  const yetkiBasligi = request.headers.get("authorization") ?? "";
  const token = yetkiBasligi.replace(/^Bearer\s+/i, "");

  if (!token) {
    return NextResponse.json({ hata: { message: "Oturum bulunamadı." } }, { status: 401 });
  }

  const { data: kullaniciVerisi, error: kullaniciHatasi } = await supabaseAdmin.auth.getUser(token);

  if (kullaniciHatasi || !kullaniciVerisi.user) {
    return NextResponse.json({ hata: { message: "Oturum geçersiz." } }, { status: 401 });
  }

  const kullanici = kullaniciVerisi.user;
  const metadata = kullanici.user_metadata ?? {};
  const { rol, profil, web_sitesi } = metadata;

  if (web_sitesi) {
    // Honeypot alanı doldurulmuş: bot kaydı. Profil oluşturmadan sahte
    // başarı yanıtı dön.
    return NextResponse.json({ basarili: true });
  }

  if (!rol || !profil || (rol !== "avukat" && rol !== "muvekkil")) {
    return NextResponse.json({ hata: { message: "Kayıt bilgileri eksik." } }, { status: 400 });
  }

  const tabloAdi = rol === "avukat" ? "avukatlar" : "muvekkiller";

  const { data: mevcutProfil } = await supabaseAdmin
    .from(tabloAdi)
    .select("id")
    .eq("id", kullanici.id)
    .maybeSingle();

  if (mevcutProfil) {
    return NextResponse.json({ basarili: true, rol });
  }

  const { error: eklemeHatasi } = await supabaseAdmin
    .from(tabloAdi)
    .insert({ id: kullanici.id, email: kullanici.email, ...profil });

  if (eklemeHatasi) {
    return NextResponse.json({ hata: eklemeHatasi }, { status: 400 });
  }

  return NextResponse.json({ basarili: true, rol });
}
