import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { DAKIKA_UCRETI, ILK_UCRETSIZ_DAKIKA } from "@/lib/odemeYardimci";

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
  const { randevuTalepId, dakika } = await request.json();

  const dakikaSayisi = Number(dakika);
  if (!randevuTalepId || !dakikaSayisi || dakikaSayisi <= 0) {
    return NextResponse.json({ hata: "Geçerli bir süre (dakika) gir." }, { status: 400 });
  }

  const { data: talep, error: talepHatasi } = await supabaseAdmin
    .from("randevu_talepleri")
    .select("*")
    .eq("id", randevuTalepId)
    .maybeSingle();

  if (talepHatasi || !talep) {
    return NextResponse.json({ hata: "Randevu talebi bulunamadı." }, { status: 404 });
  }

  if (talep.avukat_id !== kullanici.id) {
    return NextResponse.json({ hata: "Bu randevu sana ait değil." }, { status: 403 });
  }

  if (talep.durum !== "kabul") {
    return NextResponse.json({ hata: "Bu randevu tamamlanabilir durumda değil." }, { status: 400 });
  }

  // "muaf" olarak isaretlenmis (musterinin ilk randevusu olan) talepler icin
  // ilk ILK_UCRETSIZ_DAKIKA dakika ucretsiz, sadece asan sure faturalandirilir.
  // Diger talepler icin sure tamamen ucretlidir.
  const ucretliDakika =
    talep.odeme_durumu === "muaf" ? Math.max(0, dakikaSayisi - ILK_UCRETSIZ_DAKIKA) : dakikaSayisi;
  const tutar = ucretliDakika * DAKIKA_UCRETI;
  const odemeGerekli = tutar > 0;

  const { error: guncelleHatasi } = await supabaseAdmin
    .from("randevu_talepleri")
    .update({
      gorusme_suresi_dakika: dakikaSayisi,
      odeme_tutari: tutar,
      odeme_durumu: odemeGerekli ? "gerekli" : "muaf",
      durum: odemeGerekli ? "kabul" : "tamamlandi",
    })
    .eq("id", randevuTalepId);

  if (guncelleHatasi) {
    return NextResponse.json({ hata: "Güncellenemedi." }, { status: 500 });
  }

  return NextResponse.json({ basarili: true, tutar, odemeGerekli });
}
