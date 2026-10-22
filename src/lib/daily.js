import "server-only";

const DAILY_API_URL = "https://api.daily.co/v1";

// Karşı tarafın odaya girmesini beklerken odanın açık kalacağı en uzun süre.
const BEKLEME_SURESI_SN = 60 * 60 * 2;

async function dailyIstek(yol, govde) {
  const yanit = await fetch(`${DAILY_API_URL}${yol}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(govde),
  });

  const veri = await yanit.json();
  if (!yanit.ok) {
    throw new Error(veri?.error ?? veri?.info ?? "Daily.co isteği başarısız oldu.");
  }
  return veri;
}

export async function dailyOdaGetirYaDaOlustur(odaAdi) {
  const kontrolYaniti = await fetch(`${DAILY_API_URL}/rooms/${odaAdi}`, {
    headers: { Authorization: `Bearer ${process.env.DAILY_API_KEY}` },
  });
  if (kontrolYaniti.ok) return kontrolYaniti.json();

  return dailyIstek("/rooms", {
    name: odaAdi,
    privacy: "private",
    properties: {
      enable_chat: true,
      enable_screenshare: true,
      lang: "tr",
      exp: Math.floor(Date.now() / 1000) + BEKLEME_SURESI_SN,
      eject_at_room_exp: true,
    },
  });
}

// Odanın bitiş anını ayarlar; süre dolunca Daily.co herkesi odadan çıkarır.
// bitisMs verilmezse oda yalnızca bekleme süresi kadar açık tutulur.
export async function dailyOdaSuresiniAyarla(odaAdi, bitisMs) {
  const exp = bitisMs
    ? Math.ceil(bitisMs / 1000)
    : Math.floor(Date.now() / 1000) + BEKLEME_SURESI_SN;

  return dailyIstek(`/rooms/${odaAdi}`, {
    properties: { exp, eject_at_room_exp: true },
  });
}

export async function dailyTokenOlustur({ odaAdi, kullaniciAdi }) {
  const sonuc = await dailyIstek("/meeting-tokens", {
    properties: {
      room_name: odaAdi,
      user_name: kullaniciAdi,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 6,
    },
  });
  return sonuc.token;
}
