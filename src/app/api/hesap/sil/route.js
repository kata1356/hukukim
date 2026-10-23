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

  const kullaniciId = kullaniciVerisi.user.id;

  // Açık (bekleyen ya da devam eden) talebi olan hesap silinemez: ödeme/iade ve görüşme
  // kayıtları yarım kalır. Önce talepler tamamlanmalı ya da iptal edilmeli.
  const [muvekkilAcik, avukatAcik] = await Promise.all([
    supabaseAdmin
      .from("randevu_talepleri")
      .select("id", { count: "exact", head: true })
      .eq("muvekkil_id", kullaniciId)
      .in("durum", ["bekliyor", "kabul"]),
    supabaseAdmin
      .from("randevu_talepleri")
      .select("id", { count: "exact", head: true })
      .eq("avukat_id", kullaniciId)
      .in("durum", ["bekliyor", "kabul"]),
  ]);

  if (muvekkilAcik.error || avukatAcik.error) {
    return NextResponse.json({ hata: "Hesap durumu kontrol edilemedi, lütfen tekrar dene." }, { status: 500 });
  }

  if ((muvekkilAcik.count ?? 0) > 0 || (avukatAcik.count ?? 0) > 0) {
    return NextResponse.json(
      { hata: "Devam eden ya da bekleyen talebin var. Hesabını silmeden önce talepleri tamamla veya iptal et." },
      { status: 409 }
    );
  }

  // Avukata ödenmemiş kazanç varsa hesap silinirse kazanç kayıtları da silinir (cascade); engellenir.
  const { count: odenmemisKazanc, error: kazancHatasi } = await supabaseAdmin
    .from("avukat_kazanclari")
    .select("id", { count: "exact", head: true })
    .eq("avukat_id", kullaniciId)
    .eq("avukata_odendi", false);

  if (kazancHatasi) {
    return NextResponse.json({ hata: "Hesap durumu kontrol edilemedi, lütfen tekrar dene." }, { status: 500 });
  }

  if ((odenmemisKazanc ?? 0) > 0) {
    return NextResponse.json(
      {
        hata: "Henüz ödenmemiş kazancın var. Hesabını silmeden önce ödemenin yapılması için bizimle iletişime geç.",
      },
      { status: 409 }
    );
  }

  const { error: silmeHatasi } = await supabaseAdmin.auth.admin.deleteUser(kullaniciId);

  if (silmeHatasi) {
    return NextResponse.json({ hata: "Hesap silinirken bir hata oluştu." }, { status: 500 });
  }

  return NextResponse.json({ basarili: true });
}
