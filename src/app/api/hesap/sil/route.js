import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request) {
  const yetkiBasligi = request.headers.get("authorization") ?? "";
  const token = yetkiBasligi.replace(/^Bearer\s+/i, "");

  if (!token) {
    return NextResponse.json({ hata: "Oturum bulunamadı." }, { status: 401 });
  }

  const { data: kullaniciVerisi, error: kullaniciHatasi } = await supabaseAdmin.auth.getUser(token);
  if (kullaniciHatasi || !kullaniciVerisi.user) {
    return NextResponse.json({ hata: "Oturum geçersiz." }, { status: 401 });
  }

  const { error: silmeHatasi } = await supabaseAdmin.auth.admin.deleteUser(kullaniciVerisi.user.id);

  if (silmeHatasi) {
    return NextResponse.json({ hata: "Hesap silinirken bir hata oluştu." }, { status: 500 });
  }

  return NextResponse.json({ basarili: true });
}
