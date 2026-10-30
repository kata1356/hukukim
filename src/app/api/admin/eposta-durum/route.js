import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { yoneticiIstegi } from "@/lib/adminYetki";

// Gönderilen e-postanın gerçekten teslim edilip edilmediğini Resend'den sorar ve kayda yazar.
export async function POST(request) {
  const yetki = await yoneticiIstegi(request);
  if (yetki.hata) return NextResponse.json({ hata: yetki.hata }, { status: yetki.durum });

  const anahtar = process.env.RESEND_API_KEY;
  if (!anahtar) return NextResponse.json({ hata: "RESEND_API_KEY tanımlı değil." }, { status: 400 });

  const { idler } = await request.json().catch(() => ({}));
  const liste = Array.isArray(idler) ? idler.slice(0, 30) : [];
  if (liste.length === 0) return NextResponse.json({ hata: "Eksik bilgi." }, { status: 400 });

  const { data: kayitlar } = await supabaseAdmin
    .from("eposta_kayitlari")
    .select("id, resend_id")
    .in("id", liste)
    .not("resend_id", "is", null);

  const sonuclar = {};
  for (const kayit of kayitlar ?? []) {
    const yanit = await fetch(`https://api.resend.com/emails/${kayit.resend_id}`, {
      headers: { Authorization: `Bearer ${anahtar}` },
    }).catch(() => null);
    if (!yanit?.ok) continue;
    const veri = await yanit.json().catch(() => ({}));
    if (!veri.last_event) continue;
    await supabaseAdmin.from("eposta_kayitlari").update({ teslim_durumu: veri.last_event }).eq("id", kayit.id);
    sonuclar[kayit.id] = veri.last_event;
  }

  return NextResponse.json({ sonuclar });
}
