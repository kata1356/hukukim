import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { anthropicJsonIste } from "@/lib/anthropic";
import { aiLimitiKontrolEt } from "@/lib/aiLimit";
import { UZMANLIK_ALANLARI } from "@/lib/uzmanlikAlanlari";

export async function POST(request) {
  const yetkiBasligi = request.headers.get("authorization") ?? "";
  const token = yetkiBasligi.replace(/^Bearer\s+/i, "");

  if (!token) {
    return NextResponse.json({ hata: "Oturum bulunamadı." }, { status: 401 });
  }

  const { data: kullaniciVerisi, error: kullaniciHatasi } = await supabaseAdmin.auth.getUser(token);
  if (kullaniciHatasi || !kullaniciVerisi.user) {
    return NextResponse.json({ hata: "Oturum geçersiz." }, { status: 401 });
  }

  const { aciklama } = await request.json().catch(() => ({}));

  if (typeof aciklama !== "string" || aciklama.trim().length < 15) {
    return NextResponse.json({ hata: "Önce durumunu biraz daha ayrıntılı anlat." }, { status: 400 });
  }
  if (aciklama.length > 4000) {
    return NextResponse.json({ hata: "Açıklama çok uzun, lütfen kısalt." }, { status: 400 });
  }

  if (!(await aiLimitiKontrolEt(kullaniciVerisi.user.id, "talep-analiz"))) {
    return NextResponse.json({ hata: "Çok fazla analiz istedin, bir saat sonra tekrar dene." }, { status: 429 });
  }

  try {
    const sonuc = await anthropicJsonIste({
      sistemMesaji: `Sen Türkiye'de bir hukuk danışmanlık platformunda çalışan bir asistansın. Müvekkilin serbest metinle anlattığı durumu okuyup SADECE şu JSON formatında yanıt ver, başka hiçbir metin ekleme:
{"konu": "kısa, 5-8 kelimelik başlık", "uzmanlikAlani": "aşağıdaki listeden en uygun olan tek bir alan"}

Uzmanlık alanı listesi: ${UZMANLIK_ALANLARI.join(", ")}

Hukuki tavsiye verme, sadece sınıflandırma ve başlıklandırma yap.`,
      kullaniciMesaji: aciklama,
      maxTokens: 200,
    });

    if (!UZMANLIK_ALANLARI.includes(sonuc.uzmanlikAlani)) {
      sonuc.uzmanlikAlani = null;
    }

    return NextResponse.json(sonuc);
  } catch {
    return NextResponse.json({ hata: "Yapay zeka analizi başarısız oldu." }, { status: 500 });
  }
}
