import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// "Acil Avukat" akışı hız gerektirdiği için e-posta doğrulama beklemez:
// hesap anında oluşturulup onaylanmış sayılır. Bu yol yalnızca müvekkil
// kaydı içindir ve normal avukat/müvekkil kaydından bilinçli olarak
// farklıdır (aciliyet önceliklidir).
export async function POST(request) {
  const govde = await request.json();
  const { email, sifre, profil, web_sitesi } = govde;

  if (web_sitesi) {
    return NextResponse.json({ basarili: true });
  }

  if (!email || !sifre || !profil) {
    return NextResponse.json({ hata: { message: "Eksik bilgi gönderildi." } }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: sifre,
    email_confirm: true,
    user_metadata: { rol: "muvekkil" },
  });

  if (error || !data.user) {
    return NextResponse.json({ hata: error }, { status: 400 });
  }

  const { error: eklemeHatasi } = await supabaseAdmin
    .from("muvekkiller")
    .insert({ id: data.user.id, email, ...profil });

  if (eklemeHatasi) {
    await supabaseAdmin.auth.admin.deleteUser(data.user.id);
    return NextResponse.json({ hata: eklemeHatasi }, { status: 400 });
  }

  return NextResponse.json({ basarili: true });
}
