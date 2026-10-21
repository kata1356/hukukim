import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { ilkOdemeyiIadeEt } from "@/lib/iade";
import { denemeHakkiniGeriVer } from "@/lib/talepYardimci";

// Muvekkil, henuz kimse ustlenmemis (bekliyor) odenmis bir talebi iptal edip
// anlik iade alabilir. Ucretsiz (odeme_tutari 0) talepler icin iade cagirilmaz,
// direkt iptal edilir.
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

  if (talep.muvekkil_id !== kullanici.id) {
    return NextResponse.json({ hata: "Bu randevu sana ait değil." }, { status: 403 });
  }

  if (talep.durum !== "bekliyor") {
    return NextResponse.json({ hata: "Bu talep artık iptal edilemez." }, { status: 400 });
  }

  // Once atomik olarak iptal et: bir avukat tam o anda ustlenmisse (409) iade
  // hic baslatilmaz, boylece hem iade hem aktif gorusme olusamaz.
  const { data: guncellenen, error: guncelleHatasi } = await supabaseAdmin
    .from("randevu_talepleri")
    .update({ durum: "iptal" })
    .eq("id", randevuTalepId)
    .eq("durum", "bekliyor")
    .select("id")
    .maybeSingle();

  if (guncelleHatasi) {
    console.error("Talep iptal guncelleme hatasi:", guncelleHatasi);
    return NextResponse.json({ hata: "Talep iptal edilemedi." }, { status: 500 });
  }

  if (!guncellenen) {
    return NextResponse.json({ hata: "Talep iptal edilemedi, az önce bir avukat üstlenmiş olabilir." }, { status: 409 });
  }

  if (talep.odeme_durumu === "muaf") {
    await denemeHakkiniGeriVer(supabaseAdmin, talep.muvekkil_id);
  }

  if (Number(talep.odeme_tutari || 0) > 0 && talep.odeme_durumu === "odendi") {
    const { basarili, hata } = await ilkOdemeyiIadeEt(randevuTalepId);

    if (!basarili) {
      // Iade olmadiysa talep tekrar aktif hale gelsin, muvekkil yeniden deneyebilsin.
      await supabaseAdmin
        .from("randevu_talepleri")
        .update({ durum: "bekliyor" })
        .eq("id", randevuTalepId)
        .eq("durum", "iptal");
      return NextResponse.json({ hata: hata ?? "İade işlemi başarısız oldu, lütfen tekrar dene." }, { status: 500 });
    }
  }

  return NextResponse.json({ basarili: true });
}
