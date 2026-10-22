import "server-only";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { SOZLESME_SURUMU } from "@/lib/avukatSozlesmesi";

export function istekIpAdresi(request) {
  const ileriIp = request.headers.get("x-forwarded-for");
  if (ileriIp) return ileriIp.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? null;
}

// Avukatın sözleşme onayını kaydeder: değiştirilemez log satırı + profil üzerindeki son onay.
export async function sozlesmeOnayiniKaydet(avukatId, request) {
  const simdi = new Date().toISOString();

  const { error: logHatasi } = await supabaseAdmin.from("avukat_sozlesme_onaylari").insert({
    avukat_id: avukatId,
    surum: SOZLESME_SURUMU,
    ip: istekIpAdresi(request),
    user_agent: (request.headers.get("user-agent") ?? "").slice(0, 400),
    onay_zamani: simdi,
  });
  if (logHatasi) return { hata: logHatasi };

  const { error: profilHatasi } = await supabaseAdmin
    .from("avukatlar")
    .update({ sozlesme_surumu: SOZLESME_SURUMU, sozlesme_onay_zamani: simdi })
    .eq("id", avukatId);
  if (profilHatasi) return { hata: profilHatasi };

  return { basarili: true };
}
