"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import TextField from "./TextField";
import Button from "./Button";

async function apiPost(yol, govde) {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const yanit = await fetch(yol, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
    body: JSON.stringify(govde),
  });
  const sonuc = await yanit.json().catch(() => ({}));
  return { ok: yanit.ok, sonuc };
}

export default function TelefonDogrulama({ baslangicTelefon = "", onTamam }) {
  const [telefon, setTelefon] = useState(baslangicTelefon);
  const [kod, setKod] = useState("");
  const [kodGonderildi, setKodGonderildi] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState(null);
  const [kalanSaniye, setKalanSaniye] = useState(0);

  useEffect(() => {
    if (kalanSaniye <= 0) return;
    const zamanlayici = setTimeout(() => setKalanSaniye((s) => s - 1), 1000);
    return () => clearTimeout(zamanlayici);
  }, [kalanSaniye]);

  async function kodGonder(e) {
    e?.preventDefault();
    setHata(null);
    setYukleniyor(true);
    const { ok, sonuc } = await apiPost("/api/telefon/kod-gonder", { telefon });
    setYukleniyor(false);
    if (!ok) {
      setHata(sonuc.hata ?? "Kod gönderilemedi.");
      return;
    }
    setKod("");
    setKodGonderildi(true);
    setKalanSaniye(sonuc.bekleme ?? 60);
  }

  async function kodDogrula(e) {
    e.preventDefault();
    setHata(null);
    setYukleniyor(true);
    const { ok, sonuc } = await apiPost("/api/telefon/dogrula", { kod });
    if (!ok) {
      setHata(sonuc.hata ?? "Kod doğrulanamadı.");
      setYukleniyor(false);
      return;
    }
    onTamam(sonuc.telefon);
  }

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-gece px-4">
      <div className="w-full max-w-md rounded-lg border border-white/10 bg-gece-yuzey p-6 sm:p-8">
        <h1 className="text-xl font-semibold text-white">Telefonunu Doğrula</h1>
        <p className="mt-1 text-sm text-white/60">
          {kodGonderildi
            ? `${telefon} numarasına 6 haneli bir kod gönderdik.`
            : "Hesabını güvende tutmak için telefon numarana bir doğrulama kodu göndereceğiz."}
        </p>

        {!kodGonderildi ? (
          <form onSubmit={kodGonder} className="mt-6 flex flex-col gap-4">
            <TextField
              label="Telefon"
              id="dogrulamaTelefon"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              value={telefon}
              onChange={(e) => setTelefon(e.target.value)}
              placeholder="05XXXXXXXXX"
            />
            {hata && <p className="rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-400">{hata}</p>}
            <Button type="submit" yukleniyor={yukleniyor} disabled={telefon.length !== 11}>
              Kod Gönder
            </Button>
          </form>
        ) : (
          <form onSubmit={kodDogrula} className="mt-6 flex flex-col gap-4">
            <TextField
              label="Doğrulama Kodu"
              id="dogrulamaKodu"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              maxLength={6}
              value={kod}
              onChange={(e) => setKod(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="6 haneli kod"
            />
            {hata && <p className="rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-400">{hata}</p>}
            <Button type="submit" yukleniyor={yukleniyor} disabled={kod.length !== 6}>
              Doğrula
            </Button>
            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => {
                  setKodGonderildi(false);
                  setHata(null);
                }}
                className="font-medium text-white/50 hover:text-white"
              >
                Numarayı değiştir
              </button>
              <button
                type="button"
                onClick={kodGonder}
                disabled={kalanSaniye > 0 || yukleniyor}
                className="font-medium text-turkuaz disabled:text-white/30"
              >
                {kalanSaniye > 0 ? `Tekrar gönder (${kalanSaniye})` : "Kodu tekrar gönder"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
