import "server-only";
import { createHash, randomInt } from "crypto";
import { supabaseAdmin } from "./supabaseAdmin";

export const KOD_GECERLILIK_DAKIKA = 5;
export const KOD_BEKLEME_SANIYE = 60;
export const KOD_SAATLIK_LIMIT = 5;
export const KOD_TELEFON_SAATLIK_LIMIT = 5;
export const KOD_DENEME_LIMIT = 5;

export function telefonGecerliMi(telefon) {
  return typeof telefon === "string" && /^0\d{10}$/.test(telefon);
}

export function kodUret() {
  return String(randomInt(0, 1000000)).padStart(6, "0");
}

export function kodHashle(kullaniciId, kod) {
  const tuz = process.env.SMS_KOD_TUZU ?? "hukukim";
  return createHash("sha256").update(`${kullaniciId}:${kod}:${tuz}`).digest("hex");
}

export async function istekKullanicisi(request) {
  const token = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  return error || !data.user ? null : data.user;
}

// Kullanıcının profilinin hangi tabloda olduğunu bulur.
export async function profilTablosu(kullaniciId) {
  for (const tablo of ["avukatlar", "muvekkiller"]) {
    const { data } = await supabaseAdmin.from(tablo).select("id").eq("id", kullaniciId).maybeSingle();
    if (data) return tablo;
  }
  return null;
}
