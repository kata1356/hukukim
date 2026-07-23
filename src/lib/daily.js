import "server-only";

const DAILY_API_URL = "https://api.daily.co/v1";

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
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
    },
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
