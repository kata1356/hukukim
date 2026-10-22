import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { gorusmeyiTamamla } from "@/lib/gorusmeYardimci";

// Paket sistemi: fiyat talep olusturulurken zaten sabitlenmis oldugu icin
// gorusme bitince yapilacak tek is, kazanci avukat_kazanclari tablosuna
// islemek ve talebi tamamlandi olarak isaretlemektir. Hem avukat hem
// muvekkil tarafi cagirabilir (kim once cagirirsa o tamamlar), idempotenttir.
// Gorusme suresi istemciden degil, sunucunun kaydettigi baslangic aninda hesaplanir.
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
    .select("*")
    .eq("id", randevuTalepId)
    .maybeSingle();

  if (talepHatasi || !talep) {
    return NextResponse.json({ hata: "Randevu talebi bulunamadı." }, { status: 404 });
  }

  if (kullanici.id !== talep.avukat_id && kullanici.id !== talep.muvekkil_id) {
    return NextResponse.json({ hata: "Bu randevu sana ait değil." }, { status: 403 });
  }

  if (talep.durum === "tamamlandi") {
    return NextResponse.json({ basarili: true });
  }

  // Yalnızca devam eden (kabul edilmiş) görüşme tamamlanabilir; beklemedeki
  // ya da iptal edilmiş bir talep "tamamlandı" yapılamaz.
  if (talep.durum !== "kabul") {
    return NextResponse.json({ hata: "Bu görüşme tamamlanabilir durumda değil." }, { status: 400 });
  }

  const sonuc = await gorusmeyiTamamla(talep);
  if (sonuc.hata) {
    return NextResponse.json({ hata: "Görüşme tamamlanamadı." }, { status: 500 });
  }

  return NextResponse.json({ basarili: true });
}
