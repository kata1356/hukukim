import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { telefonKullanimda } from "@/lib/talepYardimci";

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

  if (profil.telefon && !/^0\d{10}$/.test(profil.telefon)) {
    return NextResponse.json({ hata: { message: "Telefon numarası 11 haneli olmalı (05XXXXXXXXX)." } }, { status: 400 });
  }
  delete profil.telefon_dogrulandi;

  if (profil.telefon && (await telefonKullanimda(supabaseAdmin, profil.telefon))) {
    return NextResponse.json(
      { hata: { message: "Bu telefon numarası başka bir hesapta kayıtlı." } },
      { status: 409 }
    );
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
