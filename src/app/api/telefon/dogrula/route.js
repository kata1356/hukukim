import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { KOD_DENEME_LIMIT, istekKullanicisi, kodHashle, profilTablosu } from "@/lib/telefonKodu";

export async function POST(request) {
  const kullanici = await istekKullanicisi(request);
  if (!kullanici) {
    return NextResponse.json({ hata: "Oturum geçersiz." }, { status: 401 });
  }

  const { kod } = await request.json().catch(() => ({}));
  if (typeof kod !== "string" || !/^\d{6}$/.test(kod)) {
    return NextResponse.json({ hata: "6 haneli kodu gir." }, { status: 400 });
  }

  const tablo = await profilTablosu(kullanici.id);
  if (!tablo) {
    return NextResponse.json({ hata: "Profil bulunamadı." }, { status: 404 });
  }

  const { data: kayit } = await supabaseAdmin
    .from("telefon_kodlari")
    .select("*")
    .eq("user_id", kullanici.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!kayit || new Date(kayit.bitis) < new Date()) {
    return NextResponse.json({ hata: "Kodun süresi doldu, yeni kod iste." }, { status: 400 });
  }
  if (kayit.deneme >= KOD_DENEME_LIMIT) {
    return NextResponse.json({ hata: "Çok fazla hatalı deneme, yeni kod iste." }, { status: 429 });
  }

  if (kayit.kod_hash !== kodHashle(kullanici.id, kod)) {
    await supabaseAdmin.from("telefon_kodlari").update({ deneme: kayit.deneme + 1 }).eq("id", kayit.id);
    return NextResponse.json({ hata: "Kod hatalı." }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from(tablo)
    .update({ telefon: kayit.telefon, telefon_dogrulandi: true })
    .eq("id", kullanici.id);

  if (error) {
    // Telefon başka bir hesapta kayıtlıysa (tekillik kısıtı) kullanıcıya bunu söyle.
    if (error.code === "23505") {
      return NextResponse.json({ hata: "Bu numara başka bir hesapta kayıtlı." }, { status: 409 });
    }
    return NextResponse.json({ hata: "Telefon kaydedilemedi." }, { status: 500 });
  }

  await supabaseAdmin.from("telefon_kodlari").delete().eq("user_id", kullanici.id);

  return NextResponse.json({ basarili: true, telefon: kayit.telefon });
}
