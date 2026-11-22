import { NextResponse, after } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { adminBildir, kullaniciOzeti } from "@/lib/adminBildirim";
import {
  SIKAYET_KATEGORILERI,
  SIKAYET_ACIKLAMA_MIN,
  SIKAYET_ACIKLAMA_MAX,
  kategoriEtiketi,
} from "@/lib/sikayetKategorileri";

// Kötüye kullanımı önlemek için kullanıcı başına 24 saatte en fazla bu kadar şikayet.
const GUNLUK_LIMIT = 5;

export async function POST(request) {
  const token = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ hata: "Oturum bulunamadı." }, { status: 401 });

  const { data: kullaniciVerisi, error: kullaniciHatasi } = await supabaseAdmin.auth.getUser(token);
  if (kullaniciHatasi || !kullaniciVerisi.user) {
    return NextResponse.json({ hata: "Oturum geçersiz." }, { status: 401 });
  }
  const kullanici = kullaniciVerisi.user;

  const govde = await request.json().catch(() => ({}));
  const talepId = typeof govde.talepId === "string" ? govde.talepId : "";
  const kategori = typeof govde.kategori === "string" ? govde.kategori : "";
  const aciklama = typeof govde.aciklama === "string" ? govde.aciklama.trim() : "";

  if (!talepId) return NextResponse.json({ hata: "Görüşme seçilmedi." }, { status: 400 });
  if (aciklama.length < SIKAYET_ACIKLAMA_MIN) {
    return NextResponse.json(
      { hata: `Lütfen en az ${SIKAYET_ACIKLAMA_MIN} karakterle ne yaşadığını anlat.` },
      { status: 400 }
    );
  }
  if (aciklama.length > SIKAYET_ACIKLAMA_MAX) {
    return NextResponse.json({ hata: `Açıklama en fazla ${SIKAYET_ACIKLAMA_MAX} karakter olabilir.` }, { status: 400 });
  }

  const { data: talep } = await supabaseAdmin
    .from("randevu_talepleri")
    .select("id, durum, muvekkil_id, avukat_id, konu")
    .eq("id", talepId)
    .maybeSingle();

  if (!talep) return NextResponse.json({ hata: "Görüşme bulunamadı." }, { status: 404 });

  // Rol, istemciden değil görüşme kaydından belirlenir: yalnızca görüşmenin tarafları şikayet edebilir.
  let rol = null;
  let sikayetEdilenId = null;
  if (talep.muvekkil_id === kullanici.id) {
    rol = "muvekkil";
    sikayetEdilenId = talep.avukat_id;
  } else if (talep.avukat_id === kullanici.id) {
    rol = "avukat";
    sikayetEdilenId = talep.muvekkil_id;
  }
  if (!rol) return NextResponse.json({ hata: "Bu görüşme için şikayet açamazsın." }, { status: 403 });

  if (!talep.avukat_id || !["kabul", "tamamlandi"].includes(talep.durum)) {
    return NextResponse.json({ hata: "Şikayet yalnızca eşleşmiş görüşmeler için açılabilir." }, { status: 400 });
  }

  const kategoriGecerli = SIKAYET_KATEGORILERI.some((k) => k.deger === kategori && k.roller.includes(rol));
  if (!kategoriGecerli) return NextResponse.json({ hata: "Geçersiz şikayet türü." }, { status: 400 });

  // Aynı görüşme için hâlâ sonuçlanmamış bir şikayeti varsa ikincisini açtırma.
  const { data: acikSikayet } = await supabaseAdmin
    .from("sikayetler")
    .select("id")
    .eq("randevu_talep_id", talep.id)
    .eq("sikayet_eden_id", kullanici.id)
    .in("durum", ["acik", "incelemede"])
    .limit(1);
  if (acikSikayet?.length) {
    return NextResponse.json(
      { hata: "Bu görüşme için zaten açık bir şikayetin var. Ekibimiz inceliyor." },
      { status: 409 }
    );
  }

  const { count } = await supabaseAdmin
    .from("sikayetler")
    .select("id", { count: "exact", head: true })
    .eq("sikayet_eden_id", kullanici.id)
    .gt("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
  if ((count ?? 0) >= GUNLUK_LIMIT) {
    return NextResponse.json({ hata: "Bugün çok fazla şikayet gönderdin. Lütfen yarın tekrar dene." }, { status: 429 });
  }

  const { data: sikayet, error } = await supabaseAdmin
    .from("sikayetler")
    .insert({
      randevu_talep_id: talep.id,
      sikayet_eden_id: kullanici.id,
      sikayet_eden_rol: rol,
      sikayet_edilen_id: sikayetEdilenId,
      kategori,
      aciklama,
    })
    .select("id")
    .single();

  if (error || !sikayet) {
    console.error("Şikayet kaydedilemedi:", error?.message);
    return NextResponse.json({ hata: "Şikayet gönderilemedi, lütfen tekrar dene." }, { status: 500 });
  }

  after(async () => {
    const ozet = await kullaniciOzeti(kullanici.id);
    await adminBildir({
      tip: "sikayet",
      baslik: `Yeni şikayet: ${ozet.ad_soyad ?? "Kullanıcı"} (${rol === "avukat" ? "Avukat" : "Müvekkil"})`,
      satirlar: [
        `Görüşme no: ${talep.id.slice(0, 8).toUpperCase()}`,
        `Tür: ${kategoriEtiketi(kategori)}`,
        `Açıklama: ${aciklama.slice(0, 300)}`,
      ],
      link: "/admin/sikayetler",
    });
  });

  return NextResponse.json({ basarili: true, id: sikayet.id });
}
