"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  SIKAYET_KATEGORILERI,
  SIKAYET_ACIKLAMA_MIN,
  SIKAYET_ACIKLAMA_MAX,
} from "@/lib/sikayetKategorileri";
import Modal from "./Modal";
import Spinner from "./Spinner";

// Görüşme kartlarına konan "Şikayet Et" düğmesi + formu. rol: "muvekkil" | "avukat".
export default function SikayetButonu({ talepId, rol }) {
  const [acik, setAcik] = useState(false);
  const [kategori, setKategori] = useState("");
  const [aciklama, setAciklama] = useState("");
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [hata, setHata] = useState(null);
  const [gonderildi, setGonderildi] = useState(false);

  const kategoriler = SIKAYET_KATEGORILERI.filter((k) => k.roller.includes(rol));

  async function gonder(e) {
    e.preventDefault();
    if (!kategori) {
      setHata("Lütfen şikayet türünü seç.");
      return;
    }
    setHata(null);
    setGonderiliyor(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const yanit = await fetch("/api/sikayet", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ talepId, kategori, aciklama }),
    });
    const sonuc = await yanit.json().catch(() => ({}));
    setGonderiliyor(false);

    if (!yanit.ok) {
      setHata(sonuc.hata ?? "Şikayet gönderilemedi.");
      return;
    }
    setGonderildi(true);
  }

  function kapat() {
    setAcik(false);
    if (gonderildi) {
      setKategori("");
      setAciklama("");
      setGonderildi(false);
    }
    setHata(null);
  }

  return (
    <>
      <button
        onClick={() => setAcik(true)}
        className="rounded-md border border-red-500/30 px-4 py-2 text-xs font-bold text-red-400 transition hover:bg-red-500/10"
      >
        Şikayet Et
      </button>

      {acik && (
        <Modal baslik="Şikayet / Mağduriyet Bildir" onKapat={kapat}>
          {gonderildi ? (
            <div className="flex flex-col gap-4">
              <p className="rounded-lg bg-green-500/10 px-4 py-3 text-sm text-green-400 ring-1 ring-green-500/20">
                Şikayetin bize ulaştı. Ekibimiz görüşme kaydını inceleyip seninle iletişime geçecek.
              </p>
              <button
                onClick={kapat}
                className="rounded-full bg-turkuaz px-5 py-3 text-sm font-bold text-gece transition hover:bg-turkuaz-parlak"
              >
                Tamam
              </button>
            </div>
          ) : (
            <form onSubmit={gonder} className="flex flex-col gap-4">
              <p className="text-sm text-white/60">
                Görüşme no: <span className="font-mono text-white/80">{talepId.slice(0, 8).toUpperCase()}</span>
              </p>

              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-gece px-4 py-2.5 text-sm text-white outline-none transition focus:border-turkuaz focus:ring-2 focus:ring-turkuaz/30"
              >
                <option value="">Şikayet türünü seç</option>
                {kategoriler.map((k) => (
                  <option key={k.deger} value={k.deger}>
                    {k.etiket}
                  </option>
                ))}
              </select>

              <div>
                <textarea
                  value={aciklama}
                  onChange={(e) => setAciklama(e.target.value)}
                  rows={5}
                  maxLength={SIKAYET_ACIKLAMA_MAX}
                  placeholder="Ne yaşadığını ayrıntılı anlat..."
                  className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-turkuaz focus:ring-2 focus:ring-turkuaz/30"
                />
                <p className="mt-1 text-right text-xs text-white/30">
                  {aciklama.length}/{SIKAYET_ACIKLAMA_MAX} (en az {SIKAYET_ACIKLAMA_MIN})
                </p>
              </div>

              {hata && (
                <p className="rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-400 ring-1 ring-red-500/20">{hata}</p>
              )}

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={gonderiliyor}
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-turkuaz px-5 py-3 text-sm font-bold text-gece transition hover:bg-turkuaz-parlak disabled:opacity-60"
                >
                  {gonderiliyor && <Spinner className="h-4 w-4" />}
                  Gönder
                </button>
                <button
                  type="button"
                  onClick={kapat}
                  className="rounded-full border-2 border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/40"
                >
                  Vazgeç
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </>
  );
}
