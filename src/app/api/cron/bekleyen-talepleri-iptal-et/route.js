import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { paytrIadeYap } from "@/lib/paytr";

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
    .select("id, odeme_tutari, odeme_durumu")
    .eq("durum", "bekliyor")
    .is("avukat_id", null)
    .lt("created_at", esikZaman);

  if (error) {
    return NextResponse.json({ hata: "Sorgu başarısız." }, { status: 500 });
  }

  const sonuclar = [];

  for (const talep of bekleyenler ?? []) {
    let iadeBasarili = true;

    if (Number(talep.odeme_tutari || 0) > 0 && talep.odeme_durumu === "odendi") {
      const { data: odeme } = await supabaseAdmin
        .from("odemeler")
        .select("merchant_oid, tutar")
        .eq("randevu_talep_id", talep.id)
        .eq("durum", "basarili")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (odeme) {
        const { basarili } = await paytrIadeYap({
          merchantOid: odeme.merchant_oid,
          tutarKurus: Math.round(Number(odeme.tutar) * 100),
        });
        iadeBasarili = basarili;
      }
    }

    let durumGuncellendi = false;
    if (iadeBasarili) {
      const { error: guncelleHatasi } = await supabaseAdmin
        .from("randevu_talepleri")
        .update({ durum: "iptal" })
        .eq("id", talep.id)
        .eq("durum", "bekliyor");
      durumGuncellendi = !guncelleHatasi;
    }

    sonuclar.push({ talepId: talep.id, iadeBasarili, durumGuncellendi });
  }

  return NextResponse.json({ islenenSayisi: sonuclar.length, sonuclar });
}
