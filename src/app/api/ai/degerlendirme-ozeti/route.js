import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { anthropicJsonIste } from "@/lib/anthropic";

async function cagiranYoneticiyiDogrula(request) {
  const yetkiBasligi = request.headers.get("authorization") ?? "";
  const token = yetkiBasligi.replace(/^Bearer\s+/i, "");

  if (!token) return { hata: "Oturum bulunamadı." };

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return { hata: "Oturum geçersiz." };

  const { data: yoneticiKaydi } = await supabaseAdmin
    .from("yoneticiler")
    .select("id")
    .eq("id", data.user.id)
    .maybeSingle();

  if (!yoneticiKaydi) return { hata: "Bu işlemi yapmak için yönetici yetkisi gerekir." };

  return { yonetici: yoneticiKaydi };
}

export async function POST(request) {
  const { hata: yetkiHatasi } = await cagiranYoneticiyiDogrula(request);
  if (yetkiHatasi) {
    return NextResponse.json({ hata: yetkiHatasi }, { status: 401 });
  }

  const { data: degerlendirmeler } = await supabaseAdmin
    .from("degerlendirmeler")
    .select("puan, yorum, avukatlar(ad_soyad)")
    .not("yorum", "is", null)
    .order("created_at", { ascending: false })
    .limit(100);

  const yorumluListe = (degerlendirmeler ?? []).filter((d) => d.yorum?.trim());

  if (yorumluListe.length === 0) {
    return NextResponse.json({ hata: "Özetlenecek yorumlu değerlendirme yok." }, { status: 400 });
  }

  const girdiMetni = yorumluListe
    .map((d) => `- [${d.puan}/5] ${d.avukatlar?.ad_soyad ?? "Bilinmiyor"}: ${d.yorum}`)
    .join("\n");

  try {
    const sonuc = await anthropicJsonIste({
      sistemMesaji: `Sen bir hukuk danışmanlık platformunun yöneticisine yardım eden bir asistansın. Sana müvekkillerin avukatlara verdiği puan ve yorumların bir listesi verilecek. Bunları analiz edip SADECE şu JSON formatında yanıt ver, başka hiçbir metin ekleme:
{"genelOzet": "2-3 cümlelik genel durum özeti", "dikkatEdilmesiGerekenler": ["önemli/acil sorun 1", "önemli/acil sorun 2", "..."], "olumluNoktalar": ["öne çıkan olumlu nokta 1", "..."]}

"dikkatEdilmesiGerekenler" listesine sadece gerçekten ciddi şikayet içeren (düşük puanlı, somut sorun belirten) yorumları al, avukat ismini de belirt. Liste boşsa boş array döndür.`,
      kullaniciMesaji: girdiMetni,
      maxTokens: 1000,
    });

    return NextResponse.json(sonuc);
  } catch {
    return NextResponse.json({ hata: "Yapay zeka analizi başarısız oldu." }, { status: 500 });
  }
}
