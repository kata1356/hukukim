import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request) {
  const govde = await request.json();
  const { rol, email, sifre, profil } = govde;

  if (!rol || !email || !sifre || !profil) {
    return NextResponse.json(
      { hata: { message: "Eksik bilgi gönderildi." } },
      { status: 400 }
    );
  }

  if (rol !== "avukat" && rol !== "muvekkil") {
    return NextResponse.json(
      { hata: { message: "Geçersiz rol." } },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: sifre,
    email_confirm: true,
    user_metadata: { rol },
  });

  if (error || !data.user) {
    return NextResponse.json({ hata: error }, { status: 400 });
  }

  const tabloAdi = rol === "avukat" ? "avukatlar" : "muvekkiller";
  const { error: eklemeHatasi } = await supabaseAdmin
    .from(tabloAdi)
    .insert({ id: data.user.id, email, ...profil });

  if (eklemeHatasi) {
    await supabaseAdmin.auth.admin.deleteUser(data.user.id);
    return NextResponse.json({ hata: eklemeHatasi }, { status: 400 });
  }

  return NextResponse.json({ basarili: true });
}
