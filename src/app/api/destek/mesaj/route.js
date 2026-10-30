import { NextResponse, after } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { adminBildir, kullaniciOzeti } from "@/lib/adminBildirim";
import { asistanCevabi, KARSILAMA_METNI } from "@/lib/destekAsistani";

const EN_FAZLA_KARAKTER = 1500;
// Kötüye kullanımı önlemek için kullanıcı başına 10 dakikada en fazla bu kadar mesaj.
const PENCERE_DAKIKA = 10;
const PENCERE_LIMIT = 20;
// Bir yönetici bu süre içinde yanıt verdiyse konuşmada insan aktif sayılır; bot araya girmez.
const INSAN_AKTIF_DAKIKA = 15;
// Karşılama mesajı en sık bu aralıkla tekrarlanır.
const KARSILAMA_ARALIK_DAKIKA = 5;

function dakikaOnce(dakika) {
  return new Date(Date.now() - dakika * 60 * 1000).toISOString();
}

async function sonMesajVarMi(kullaniciId, gonderenler, dakika) {
  const { data } = await supabaseAdmin
    .from("destek_mesajlari")
    .select("id")
    .eq("kullanici_id", kullaniciId)
    .in("gonderen", gonderenler)
    .gt("created_at", dakikaOnce(dakika))
    .limit(1);
  return Boolean(data?.length);
}

export async function POST(request) {
  const token = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ hata: "Oturum bulunamadı." }, { status: 401 });

  const { data: kullaniciVerisi, error: kullaniciHatasi } = await supabaseAdmin.auth.getUser(token);
  if (kullaniciHatasi || !kullaniciVerisi.user) {
    return NextResponse.json({ hata: "Oturum geçersiz." }, { status: 401 });
  }
  const kullanici = kullaniciVerisi.user;

  const { metin } = await request.json().catch(() => ({}));
  const temiz = typeof metin === "string" ? metin.trim().slice(0, EN_FAZLA_KARAKTER) : "";
  if (!temiz) return NextResponse.json({ hata: "Mesaj boş olamaz." }, { status: 400 });

  const { count } = await supabaseAdmin
    .from("destek_mesajlari")
    .select("id", { count: "exact", head: true })
    .eq("kullanici_id", kullanici.id)
    .eq("gonderen", "kullanici")
    .gt("created_at", dakikaOnce(PENCERE_DAKIKA));
  if ((count ?? 0) >= PENCERE_LIMIT) {
    return NextResponse.json({ hata: "Çok fazla mesaj gönderdin, birkaç dakika sonra tekrar dene." }, { status: 429 });
  }

  const { data: mesaj, error } = await supabaseAdmin
    .from("destek_mesajlari")
    .insert({ kullanici_id: kullanici.id, gonderen: "kullanici", metin: temiz })
    .select("id, gonderen, metin, created_at")
    .single();

  if (error || !mesaj) return NextResponse.json({ hata: "Mesaj gönderilemedi." }, { status: 500 });

  after(async () => {
    try {
      const insanAktif = await sonMesajVarMi(kullanici.id, ["admin"], INSAN_AKTIF_DAKIKA);
      let durum = "Yanıt bekliyor";
      let otomatik = null;

      if (!insanAktif) {
        otomatik = await asistanCevabi(kullanici.id, temiz);
        if (otomatik) {
          await supabaseAdmin.from("destek_mesajlari").insert({ kullanici_id: kullanici.id, gonderen: "asistan", metin: otomatik });
          durum = "Otomatik yanıt verildi";
        } else if (!(await sonMesajVarMi(kullanici.id, ["sistem", "asistan"], KARSILAMA_ARALIK_DAKIKA))) {
          await supabaseAdmin.from("destek_mesajlari").insert({ kullanici_id: kullanici.id, gonderen: "sistem", metin: KARSILAMA_METNI });
        }
      } else {
        durum = "Sohbet sürüyor";
      }

      const ozet = await kullaniciOzeti(kullanici.id);
      await adminBildir({
        tip: "destek_mesaji",
        kullaniciId: kullanici.id,
        baslik: `[${durum}] Canlı destek: ${ozet.ad_soyad ?? kullanici.email ?? "Kullanıcı"} yazdı`,
        satirlar: [
          `${ozet.rol}${ozet.sehir ? " · " + ozet.sehir : ""}`,
          `Mesaj: ${temiz.slice(0, 300)}`,
          otomatik
            ? `Botun yanıtı: ${otomatik.split("\n\n(")[0].slice(0, 300)}`
            : insanAktif
              ? "Sohbette yakın zamanda yanıt verdiğiniz için bot araya girmedi."
              : "Bot bu konuda yanıt vermedi, sizin dönüşünüz gerekiyor.",
          `İletişim: ${ozet.email ?? kullanici.email ?? "—"}${ozet.telefon ? " · " + ozet.telefon : ""}`,
        ],
        link: `/admin/destek?kullanici=${kullanici.id}`,
        tekrarDakika: 3,
      });
    } catch (hata) {
      console.error("Destek mesajı sonrası işlemler başarısız:", hata?.message ?? hata);
    }
  });

  return NextResponse.json({ mesaj });
}
