import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

// Saklama süresi dolan kayıtları siler (KVKK Aydınlatma Metni, "Saklama Süreleri"):
//  - görüşme katılım kayıtları (gorusme_olaylari): oluşturulmasından 24 ay sonra
//  - kapanmış şikayetler (çözüldü / reddedildi): son güncellemeden 24 ay sonra
// Açık ve incelemedeki şikayetlere dokunulmaz. Vercel Cron günde bir kez çağırır (bkz. vercel.json).
const SAKLAMA_AY = 24;

export async function GET(request) {
  const yetkiBasligi = request.headers.get("authorization") ?? "";
  if (!process.env.CRON_SECRET || yetkiBasligi !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ hata: "Yetkisiz." }, { status: 401 });
  }

  const esik = new Date();
  esik.setMonth(esik.getMonth() - SAKLAMA_AY);
  const esikZaman = esik.toISOString();

  const { data: silinenOlaylar, error: olayHatasi } = await supabaseAdmin
    .from("gorusme_olaylari")
    .delete()
    .lt("created_at", esikZaman)
    .select("id");

  const { data: silinenSikayetler, error: sikayetHatasi } = await supabaseAdmin
    .from("sikayetler")
    .delete()
    .in("durum", ["cozuldu", "reddedildi"])
    .lt("guncellendi_at", esikZaman)
    .select("id");

  if (olayHatasi || sikayetHatasi) {
    console.error("Saklama temizliği hatası:", olayHatasi ?? sikayetHatasi);
    return NextResponse.json({ hata: "Temizlik tamamlanamadı." }, { status: 500 });
  }

  return NextResponse.json({
    silinenGorusmeOlayi: silinenOlaylar?.length ?? 0,
    silinenSikayet: silinenSikayetler?.length ?? 0,
  });
}
