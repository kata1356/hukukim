import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sozlesmeOnayiniKaydet } from "@/lib/sozlesmeKaydi";

// Mevcut avukatın güncel sözleşme sürümünü onaylaması (panele girişte zorunlu).
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

  const { onay } = await request.json().catch(() => ({}));
  if (onay !== true) {
    return NextResponse.json({ hata: "Sözleşmeyi onaylamalısın." }, { status: 400 });
  }

  const { data: avukat } = await supabaseAdmin
    .from("avukatlar")
    .select("id")
    .eq("id", kullaniciVerisi.user.id)
    .maybeSingle();
  if (!avukat) {
    return NextResponse.json({ hata: "Avukat hesabı bulunamadı." }, { status: 403 });
  }

  const sonuc = await sozlesmeOnayiniKaydet(avukat.id, request);
  if (sonuc.hata) {
    console.error("Sözleşme onayı kaydedilemedi:", sonuc.hata);
    return NextResponse.json({ hata: "Onay kaydedilemedi, lütfen tekrar dene." }, { status: 500 });
  }

  return NextResponse.json({ basarili: true });
}
