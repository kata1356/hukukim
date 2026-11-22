import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { dailyKatilimlariGetir } from "@/lib/daily";

async function cagiranYoneticiyiDogrula(request) {
  const token = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return false;

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return false;

  const { data: yoneticiKaydi } = await supabaseAdmin.from("yoneticiler").select("id").eq("id", data.user.id).maybeSingle();
  return Boolean(yoneticiKaydi);
}

// Yönetici için: bir görüşmenin Daily.co katılım kayıtları (kim ne zaman girdi, kaç saniye kaldı).
export async function GET(request) {
  if (!(await cagiranYoneticiyiDogrula(request))) {
    return NextResponse.json({ hata: "Bu işlem için yönetici yetkisi gerekir." }, { status: 401 });
  }

  const talepId = new URL(request.url).searchParams.get("talepId") ?? "";
  if (!/^[0-9a-f-]{36}$/i.test(talepId)) {
    return NextResponse.json({ hata: "Geçersiz görüşme kimliği." }, { status: 400 });
  }

  try {
    const oturumlar = await dailyKatilimlariGetir(`hukukim-${talepId}`);
    const katilimlar = oturumlar.flatMap((oturum) =>
      (oturum.participants ?? []).map((k) => ({
        kullaniciId: k.user_id ?? null,
        ad: k.user_name ?? null,
        giris: k.join_time ? new Date(k.join_time * 1000).toISOString() : null,
        sureSaniye: k.duration ?? null,
      }))
    );
    katilimlar.sort((a, b) => String(a.giris).localeCompare(String(b.giris)));
    return NextResponse.json({ katilimlar });
  } catch (err) {
    console.error("Daily katılım kayıtları alınamadı:", err?.message);
    return NextResponse.json({ hata: "Daily.co katılım kayıtları alınamadı." }, { status: 502 });
  }
}
