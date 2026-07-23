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

  const kullanici = kullaniciVerisi.user;
  const { randevuTalepId } = await request.json();

  if (!randevuTalepId) {
    return NextResponse.json({ hata: "Randevu talebi belirtilmedi." }, { status: 400 });
  }

  const { data: talep, error: talepHatasi } = await supabaseAdmin
    .from("randevu_talepleri")
    .select("*, avukatlar(ad_soyad), muvekkiller(ad_soyad)")
    .eq("id", randevuTalepId)
    .maybeSingle();

  if (talepHatasi || !talep) {
    return NextResponse.json({ hata: "Randevu talebi bulunamadı." }, { status: 404 });
  }

  if (talep.avukat_id !== kullanici.id && talep.muvekkil_id !== kullanici.id) {
    return NextResponse.json({ hata: "Bu görüşmeye katılma yetkin yok." }, { status: 403 });
  }

  if (talep.gorusme_sekli !== "goruntulu") {
    return NextResponse.json({ hata: "Bu randevu görüntülü görüşme değil." }, { status: 400 });
  }

  if (talep.durum !== "kabul" && talep.durum !== "tamamlandi") {
    return NextResponse.json({ hata: "Randevu henüz kabul edilmedi." }, { status: 400 });
  }

  const odaAdi = `hukukim-gizli-${randevuTalepId}`;
  const kullaniciAdi =
    talep.avukat_id === kullanici.id ? talep.avukatlar?.ad_soyad ?? "Avukat" : talep.muvekkiller?.ad_soyad ?? "Müvekkil";

  const odaUrl = `https://meet.jit.si/${odaAdi}#config.prejoinPageEnabled=false&userInfo.displayName=${encodeURIComponent(kullaniciAdi)}`;

  return NextResponse.json({ odaUrl });
}
