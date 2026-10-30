import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { adminBildir } from "@/lib/adminBildirim";

// Kayıt sürecini başlatıp (hesap açıp ya da Google ile girip) profilini tamamlamayan kullanıcıları
// yönetime bildirir. pg_cron her 10 dakikada çağırır; her kullanıcı yalnızca bir kez bildirilir.
const BEKLEME_DAKIKA = 15;
const GERIYE_BAKIS_GUN = 3;
const EN_FAZLA_KISI = 15;

export async function GET(request) {
  const yetkiBasligi = request.headers.get("authorization") ?? "";
  if (!process.env.CRON_SECRET || yetkiBasligi !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ hata: "Yetkisiz." }, { status: 401 });
  }

  const alt = Date.now() - GERIYE_BAKIS_GUN * 24 * 60 * 60 * 1000;
  const ust = Date.now() - BEKLEME_DAKIKA * 60 * 1000;

  // En yeni kayıtlar sondaki sayfalarda olabileceği için tüm sayfalar taranır (en fazla 10 sayfa).
  const adaylar = [];
  for (let sayfa = 1; sayfa <= 10; sayfa += 1) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: sayfa, perPage: 200 });
    if (error) return NextResponse.json({ hata: "Kullanıcılar okunamadı." }, { status: 500 });
    const kullanicilar = data?.users ?? [];
    for (const k of kullanicilar) {
      const zaman = new Date(k.created_at).getTime();
      if (zaman >= alt && zaman <= ust) adaylar.push(k);
    }
    if (kullanicilar.length < 200) break;
  }

  if (adaylar.length === 0) return NextResponse.json({ bildirilen: 0 });

  const idler = adaylar.map((k) => k.id);
  const [{ data: avukatlar }, { data: muvekkiller }, { data: loglar }] = await Promise.all([
    supabaseAdmin.from("avukatlar").select("id").in("id", idler),
    supabaseAdmin.from("muvekkiller").select("id").in("id", idler),
    supabaseAdmin.from("admin_bildirim_log").select("kullanici_id").eq("tip", "yarim_kayit").in("kullanici_id", idler),
  ]);

  const profilli = new Set([...(avukatlar ?? []), ...(muvekkiller ?? [])].map((x) => x.id));
  const bildirilmis = new Set((loglar ?? []).map((x) => x.kullanici_id));

  const yarim = adaylar
    .filter((k) => !profilli.has(k.id) && !bildirilmis.has(k.id))
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .slice(0, EN_FAZLA_KISI);

  if (yarim.length === 0) return NextResponse.json({ bildirilen: 0 });

  const satirlar = yarim.map((k) => {
    const meta = k.user_metadata ?? {};
    const saglayici = k.app_metadata?.provider === "google" ? "Google ile girdi" : "E-posta ile kayıt";
    const rol = meta.rol === "avukat" ? "AVUKAT olarak başlamış" : meta.rol === "muvekkil" ? "müvekkil olarak başlamış" : "rol seçmemiş";
    const onay = k.email_confirmed_at ? "e-postası onaylı" : "e-postasını onaylamamış";
    const tel = meta.telefon ?? meta.profil?.telefon ?? k.phone;
    const ad = meta.ad_soyad ?? meta.profil?.ad_soyad ?? meta.full_name ?? meta.name ?? "—";
    const tarih = new Date(k.created_at).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" });
    return `${ad} · ${k.email ?? "—"}${tel ? " · " + tel : ""} · ${saglayici}, ${rol}, ${onay} (${tarih})`;
  });

  // Kimlik bazlı kayıt: bir sonraki çalışmada aynı kişiler tekrar bildirilmesin.
  await supabaseAdmin.from("admin_bildirim_log").insert(yarim.map((k) => ({ tip: "yarim_kayit", kullanici_id: k.id })));

  await adminBildir({
    tip: "yarim_kayit_ozet",
    baslik: `Kaydı yarıda kalan ${yarim.length} kişi var`,
    satirlar,
    link: "/admin/kullanicilar",
  });

  return NextResponse.json({ bildirilen: yarim.length });
}
