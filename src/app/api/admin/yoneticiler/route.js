import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function cagiranYoneticiyiDogrula(request) {
  const yetkiBasligi = request.headers.get("authorization") ?? "";
  const token = yetkiBasligi.replace(/^Bearer\s+/i, "");

  if (!token) {
    return { hata: "Oturum bulunamadı." };
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) {
    return { hata: "Oturum geçersiz." };
  }

  const { data: yoneticiKaydi } = await supabaseAdmin
    .from("yoneticiler")
    .select("id, ad_soyad, email")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!yoneticiKaydi) {
    return { hata: "Bu işlemi yapmak için yönetici yetkisi gerekir." };
  }

  return { yonetici: yoneticiKaydi };
}

export async function POST(request) {
  const { yonetici, hata } = await cagiranYoneticiyiDogrula(request);
  if (hata) {
    return NextResponse.json({ hata }, { status: 401 });
  }

  const { email } = await request.json();
  if (!email) {
    return NextResponse.json({ hata: "E-posta gerekli." }, { status: 400 });
  }

  const temizEmail = email.trim().toLocaleLowerCase("tr-TR");

  const [{ data: avukatKaydi }, { data: muvekkilKaydi }] = await Promise.all([
    supabaseAdmin.from("avukatlar").select("id, ad_soyad, email").ilike("email", temizEmail).maybeSingle(),
    supabaseAdmin.from("muvekkiller").select("id, ad_soyad, email").ilike("email", temizEmail).maybeSingle(),
  ]);

  const hedefKullanici = avukatKaydi ?? muvekkilKaydi;

  if (!hedefKullanici) {
    return NextResponse.json(
      { hata: "Bu e-posta ile kayıtlı bir avukat/müvekkil hesabı bulunamadı. Önce normal kayıt olması gerekir." },
      { status: 404 }
    );
  }

  const { data: mevcutYonetici } = await supabaseAdmin
    .from("yoneticiler")
    .select("id")
    .eq("id", hedefKullanici.id)
    .maybeSingle();

  if (mevcutYonetici) {
    return NextResponse.json({ hata: "Bu hesap zaten yönetici." }, { status: 400 });
  }

  const { error: eklemeHatasi } = await supabaseAdmin.from("yoneticiler").insert({
    id: hedefKullanici.id,
    ad_soyad: hedefKullanici.ad_soyad,
    email: hedefKullanici.email,
  });

  if (eklemeHatasi) {
    return NextResponse.json({ hata: eklemeHatasi.message }, { status: 400 });
  }

  await supabaseAdmin.from("denetim_kayitlari").insert({
    yonetici_id: yonetici.id,
    yonetici_adi: yonetici.ad_soyad,
    islem: "ekle",
    hedef_tablo: "yoneticiler",
    hedef_id: hedefKullanici.id,
    yeni_veri: { ad_soyad: hedefKullanici.ad_soyad, email: hedefKullanici.email },
  });

  return NextResponse.json({ basarili: true });
}

export async function DELETE(request) {
  const { yonetici, hata } = await cagiranYoneticiyiDogrula(request);
  if (hata) {
    return NextResponse.json({ hata }, { status: 401 });
  }

  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ hata: "Kaldırılacak yönetici id'si gerekli." }, { status: 400 });
  }

  if (id === yonetici.id) {
    return NextResponse.json({ hata: "Kendi yönetici yetkini kaldıramazsın." }, { status: 400 });
  }

  const { data: hedefYonetici } = await supabaseAdmin
    .from("yoneticiler")
    .select("ad_soyad, email")
    .eq("id", id)
    .maybeSingle();

  const { error: silmeHatasi } = await supabaseAdmin.from("yoneticiler").delete().eq("id", id);

  if (silmeHatasi) {
    return NextResponse.json({ hata: silmeHatasi.message }, { status: 400 });
  }

  await supabaseAdmin.from("denetim_kayitlari").insert({
    yonetici_id: yonetici.id,
    yonetici_adi: yonetici.ad_soyad,
    islem: "sil",
    hedef_tablo: "yoneticiler",
    hedef_id: id,
    onceki_veri: hedefYonetici ?? null,
  });

  return NextResponse.json({ basarili: true });
}
