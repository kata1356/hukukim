import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { yoneticiIstegi } from "@/lib/adminYetki";
import { epostaGonder } from "@/lib/eposta";
import { kullaniciOzeti } from "@/lib/adminBildirim";
import { SITE_URL } from "@/lib/site";

// Yönetici bir destek konuşmasına yanıt verir; kullanıcıya zil bildirimi ve e-posta gider.
export async function POST(request) {
  const yetki = await yoneticiIstegi(request);
  if (yetki.hata) return NextResponse.json({ hata: yetki.hata }, { status: yetki.durum });

  const { kullaniciId, metin } = await request.json().catch(() => ({}));
  const temiz = typeof metin === "string" ? metin.trim().slice(0, 1500) : "";
  if (!kullaniciId || !temiz) return NextResponse.json({ hata: "Eksik bilgi." }, { status: 400 });

  const { data: mesaj, error } = await supabaseAdmin
    .from("destek_mesajlari")
    .insert({ kullanici_id: kullaniciId, gonderen: "admin", metin: temiz, okundu: true })
    .select("id, gonderen, metin, created_at, kullanici_id, okundu")
    .single();
  if (error || !mesaj) return NextResponse.json({ hata: "Yanıt gönderilemedi." }, { status: 500 });

  // Konuşmadaki bekleyen kullanıcı mesajları yanıtlandı sayılır.
  await supabaseAdmin
    .from("destek_mesajlari")
    .update({ okundu: true })
    .eq("kullanici_id", kullaniciId)
    .eq("gonderen", "kullanici")
    .eq("okundu", false);

  const ozet = await kullaniciOzeti(kullaniciId);
  const panel = ozet.rol === "Avukat" ? "/avukat/panel" : "/muvekkil/panel";

  await supabaseAdmin.from("bildirimler").insert({
    kullanici_id: kullaniciId,
    baslik: "Destek ekibi yanıtladı",
    mesaj: temiz.slice(0, 120),
    link: panel,
  });

  if (ozet.email) {
    epostaGonder({
      to: ozet.email,
      konu: "Hukukim destek ekibi mesajınızı yanıtladı",
      metin: `${temiz}\n\nYanıtlamak için Hukukim panelindeki Canlı Destek düğmesini kullanabilirsiniz: ${SITE_URL}${panel}`,
      html:
        `<div style="font-family:Arial,sans-serif;max-width:520px"><p>${temiz.replace(/[<>&]/g, " ")}</p>` +
        `<p style="margin-top:16px"><a href="${SITE_URL}${panel}">Hukukim paneline git</a> ve Canlı Destek düğmesinden yanıtlayabilirsin.</p></div>`,
    }).catch((e) => console.error("Destek yanıt e-postası gönderilemedi:", e?.message));
  }

  return NextResponse.json({ mesaj });
}
