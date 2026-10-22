import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { anthropicMetinIste, aiHataNedeni } from "@/lib/anthropic";
import { avukatiDogrula } from "@/lib/aiYetki";

// Avukatın görüşme sonrası yazdığı kısa notları, müvekkile gönderilebilecek düzenli bir özet mesaja çevirir.
// Avukat mesajı kopyalayıp kendisi gönderir; sistem hiçbir şeyi otomatik göndermez.
export async function POST(request) {
  const { avukat, hata, durum } = await avukatiDogrula(request);
  if (hata) return NextResponse.json({ hata }, { status: durum });

  const { talepId, notlar } = await request.json().catch(() => ({}));
  const metin = String(notlar ?? "").trim();
  if (!talepId || metin.length < 20) {
    return NextResponse.json({ hata: "Görüşme notlarını biraz daha ayrıntılı yaz." }, { status: 400 });
  }

  const { data: talep } = await supabaseAdmin
    .from("randevu_talepleri")
    .select("id, avukat_id, konu, muvekkil_ad_soyad")
    .eq("id", talepId)
    .maybeSingle();

  if (!talep || talep.avukat_id !== avukat.id) {
    return NextResponse.json({ hata: "Talep bulunamadı." }, { status: 404 });
  }

  try {
    const mesaj = await anthropicMetinIste({
      sistemMesaji: `Sen bir avukatın yardımcısısın. Avukatın görüşme sonrası aldığı kısa notları, müvekkile gönderilecek düzenli ve anlaşılır bir özet mesaja çevir. Yanıt olarak SADECE müvekkile gönderilecek mesaj metnini ver (4-10 cümle, gerekirse madde işaretleri olabilir). Başka açıklama veya başlık ekleme.

Kurallar:
- Yalnızca avukatın notlarındaki bilgileri kullan; yeni hukuki görüş, süre, tutar veya sonuç tahmini ekleme.
- Sade, saygılı ve sakin bir dil kullan. "${talep.muvekkil_ad_soyad ?? "Müvekkil"}" kişisine hitap et.
- Notlarda belirtilen sonraki adımları ve müvekkilden istenen belgeleri ayrı bir bölümde listele.
- Mesaj "${avukat.ad_soyad ?? "Avukatınız"}" adına yazılmış gibi bitsin.`,
      kullaniciMesaji: `Konu: ${talep.konu ?? "-"}\nAvukat notları: ${metin.slice(0, 3000)}`,
      maxTokens: 1000,
    });

    return NextResponse.json({ mesaj });
  } catch (err) {
    console.error("Görüşme özeti hatası:", err);
    return NextResponse.json({ hata: `Yapay zeka şu an özet üretemedi: ${aiHataNedeni(err)}` }, { status: 500 });
  }
}
