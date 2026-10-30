import { NextResponse, after } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { istekKullanicisi } from "@/lib/adminYetki";
import { adminBildir } from "@/lib/adminBildirim";

// Avukat belgelerini gönderince yönetime anında haber verir.
// Durum sunucuda doğrulanır: yalnızca gerçekten "incelemede" olan avukat için bildirim gider.
export async function POST(request) {
  const sonuc = await istekKullanicisi(request);
  if (sonuc.hata) return NextResponse.json({ hata: sonuc.hata }, { status: sonuc.durum });

  const { data: avukat } = await supabaseAdmin
    .from("avukatlar")
    .select("id, ad_soyad, email, telefon, sehir, baro_sicil_no, belge_durumu")
    .eq("id", sonuc.kullanici.id)
    .maybeSingle();

  if (!avukat || avukat.belge_durumu !== "incelemede") return NextResponse.json({ basarili: true });

  after(() =>
    adminBildir({
      tip: "belge_yuklendi",
      kullaniciId: avukat.id,
      baslik: `Belge incelemesi bekliyor: ${avukat.ad_soyad}`,
      satirlar: [
        `${avukat.ad_soyad} kimlik ve baro kartını yükledi.`,
        `Baro sicil no: ${avukat.baro_sicil_no ?? "—"} · ${avukat.sehir ?? "—"}`,
        `İletişim: ${avukat.email ?? "—"}${avukat.telefon ? " · " + avukat.telefon : ""}`,
      ],
      link: `/admin/avukatlar/${avukat.id}`,
      tekrarDakika: 30,
    })
  );

  return NextResponse.json({ basarili: true });
}
