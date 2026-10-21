import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { ilkOdemeyiIadeEt } from "@/lib/iade";
import { denemeHakkiniGeriVer } from "@/lib/talepYardimci";

// Odenip 15 dakika icinde hicbir avukat tarafindan ustlenilmeyen talepleri
// otomatik iptal edip, ucretli olanlar icin PayTR uzerinden iade baslatir.
// Vercel Cron tarafindan her 5 dakikada bir cagirilir (bkz. vercel.json).
const ZAMAN_ASIMI_DAKIKA = 15;

export async function GET(request) {
  const yetkiBasligi = request.headers.get("authorization") ?? "";
  if (yetkiBasligi !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ hata: "Yetkisiz." }, { status: 401 });
  }

  const esikZaman = new Date(Date.now() - ZAMAN_ASIMI_DAKIKA * 60 * 1000).toISOString();

  const { data: bekleyenler, error } = await supabaseAdmin
    .from("randevu_talepleri")
    .select("id, muvekkil_id, odeme_tutari, odeme_durumu")
    .eq("durum", "bekliyor")
    .is("avukat_id", null)
    .lt("created_at", esikZaman);

  if (error) {
    return NextResponse.json({ hata: "Sorgu başarısız." }, { status: 500 });
  }

  const sonuclar = [];

  for (const talep of bekleyenler ?? []) {
    // Once atomik iptal: arada bir avukat ustlendiyse (satir donmez) iade
    // baslatilmaz, para ve gorusme birlikte gitmez.
    const { data: iptalEdilen, error: guncelleHatasi } = await supabaseAdmin
      .from("randevu_talepleri")
      .update({ durum: "iptal" })
      .eq("id", talep.id)
      .eq("durum", "bekliyor")
      .is("avukat_id", null)
      .select("id")
      .maybeSingle();

    const durumGuncellendi = !guncelleHatasi && Boolean(iptalEdilen);
    let iadeBasarili = true;

    if (durumGuncellendi && talep.odeme_durumu === "muaf") {
      await denemeHakkiniGeriVer(supabaseAdmin, talep.muvekkil_id);
    }

    if (durumGuncellendi && Number(talep.odeme_tutari || 0) > 0 && talep.odeme_durumu === "odendi") {
      iadeBasarili = (await ilkOdemeyiIadeEt(talep.id)).basarili;

      if (!iadeBasarili) {
        // Iade olmadiysa talep tekrar bekliyor olsun, sonraki calismada yeniden denenir.
        await supabaseAdmin
          .from("randevu_talepleri")
          .update({ durum: "bekliyor" })
          .eq("id", talep.id)
          .eq("durum", "iptal");
      }
    }

    sonuclar.push({ talepId: talep.id, iadeBasarili, durumGuncellendi });
  }

  return NextResponse.json({ islenenSayisi: sonuclar.length, sonuclar });
}
