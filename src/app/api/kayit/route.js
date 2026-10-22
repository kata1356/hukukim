import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { telefonKullanimda } from "@/lib/talepYardimci";
import { sozlesmeOnayiniKaydet } from "@/lib/sozlesmeKaydi";

// Bu uç nokta, e-posta doğrulama bağlantısına tıklandıktan sonra çağrılır.
// Kullanıcı zaten Supabase Auth üzerinde doğrulanmış bir oturuma sahiptir;
// burada yalnızca kayıt sırasında toplanan bilgileri (user_metadata) okuyup
// avukatlar/muvekkiller tablosuna profil satırını ekliyoruz.
export async function POST(request) {
  const yetkiBasligi = request.headers.get("authorization") ?? "";
  const token = yetkiBasligi.replace(/^Bearer\s+/i, "");

  if (!token) {
    return NextResponse.json({ hata: { message: "Oturum bulunamadı." } }, { status: 401 });
  }

  const { data: kullaniciVerisi, error: kullaniciHatasi } = await supabaseAdmin.auth.getUser(token);

  if (kullaniciHatasi || !kullaniciVerisi.user) {
    return NextResponse.json({ hata: { message: "Oturum geçersiz." } }, { status: 401 });
  }

  const kullanici = kullaniciVerisi.user;
  const metadata = kullanici.user_metadata ?? {};
  const { rol, profil, web_sitesi } = metadata;

  if (web_sitesi) {
    // Honeypot alanı doldurulmuş: bot kaydı. Profil oluşturmadan sahte
    // başarı yanıtı dön.
    return NextResponse.json({ basarili: true });
  }

  if (!rol || !profil || (rol !== "avukat" && rol !== "muvekkil")) {
    return NextResponse.json({ hata: { message: "Kayıt bilgileri eksik." } }, { status: 400 });
  }

  if (profil.telefon && !/^0\d{10}$/.test(profil.telefon)) {
    return NextResponse.json({ hata: { message: "Telefon numarası 11 haneli olmalı (05XXXXXXXXX)." } }, { status: 400 });
  }

  // Doğrulama alanları yalnızca sunucu tarafından (SMS / admin onayı) değiştirilebilir.
  delete profil.telefon_dogrulandi;
  delete profil.dogrulanmis;
  delete profil.belge_durumu;

  // Avukat kaydı için Avukat Hizmet Sözleşmesi onayı zorunludur. Onay bilgisi profil
  // satırına istemciden değil, sunucuda (aşağıda) yazılır.
  const sozlesmeKabul = profil.sozlesme_kabul === true;
  delete profil.sozlesme_kabul;
  delete profil.sozlesme_surumu;
  delete profil.sozlesme_onay_zamani;

  if (rol === "avukat" && !sozlesmeKabul) {
    return NextResponse.json(
      { hata: { message: "Avukat Hizmet Sözleşmesi'ni onaylaman gerekiyor." } },
      { status: 400 }
    );
  }

  const tabloAdi = rol === "avukat" ? "avukatlar" : "muvekkiller";

  const { data: mevcutProfil } = await supabaseAdmin
    .from(tabloAdi)
    .select("id")
    .eq("id", kullanici.id)
    .maybeSingle();

  if (mevcutProfil) {
    return NextResponse.json({ basarili: true, rol });
  }

  // Bir telefon numarası yalnızca bir hesapta kullanılabilir. Profil henüz
  // oluşmadığı için yarım kalan oturumu silip kullanıcıyı başka numarayla
  // yeniden kayda yönlendiriyoruz.
  if (profil.telefon && (await telefonKullanimda(supabaseAdmin, profil.telefon, kullanici.id))) {
    await supabaseAdmin.auth.admin.deleteUser(kullanici.id);
    return NextResponse.json(
      { hata: { message: "Bu telefon numarası başka bir hesapta kayıtlı. Farklı bir numarayla yeniden kaydol." } },
      { status: 409 }
    );
  }

  const { error: eklemeHatasi } = await supabaseAdmin
    .from(tabloAdi)
    .insert({ id: kullanici.id, email: kullanici.email, ...profil });

  if (eklemeHatasi) {
    return NextResponse.json({ hata: eklemeHatasi }, { status: 400 });
  }

  if (rol === "avukat") {
    const sonuc = await sozlesmeOnayiniKaydet(kullanici.id, request);
    if (sonuc.hata) {
      // Profil oluştu; onay kaydı yazılamadıysa avukat panele girişte sözleşmeyi yeniden onaylar.
      console.error("Kayıtta sözleşme onayı yazılamadı:", sonuc.hata);
    }
  }

  return NextResponse.json({ basarili: true, rol });
}
