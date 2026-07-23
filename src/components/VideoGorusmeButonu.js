"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Modal from "./Modal";
import Spinner from "./Spinner";
import { IconVideo, IconTelefonKapat } from "./icons";

function sureFormatla(saniye) {
  const dk = Math.floor(saniye / 60);
  const sn = saniye % 60;
  return `${String(dk).padStart(2, "0")}:${String(sn).padStart(2, "0")}`;
}

export default function VideoGorusmeButonu({ randevuTalepId, onGorusmeBitti }) {
  const [yukleniyor, setYukleniyor] = useState(false);
  const [odaUrl, setOdaUrl] = useState(null);
  const [hata, setHata] = useState(null);
  const [gecenSaniye, setGecenSaniye] = useState(0);
  const baslangicRef = useRef(null);

  useEffect(() => {
    if (!odaUrl) return;

    const zamanlayici = setInterval(() => {
      setGecenSaniye(Math.floor((Date.now() - baslangicRef.current) / 1000));
    }, 1000);

    return () => clearInterval(zamanlayici);
  }, [odaUrl]);

  async function gorusmeyeKatil() {
    setHata(null);
    setYukleniyor(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const yanit = await fetch("/api/video/katil", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ randevuTalepId }),
    });
    const sonuc = await yanit.json();

    if (!yanit.ok) {
      setHata(sonuc.hata ?? "Görüşmeye katılırken bir hata oluştu.");
      setYukleniyor(false);
      return;
    }

    baslangicRef.current = new Date(sonuc.videoBaslangicZamani).getTime();
    setGecenSaniye(Math.floor((Date.now() - baslangicRef.current) / 1000));
    setOdaUrl(sonuc.odaUrl);
    setYukleniyor(false);
  }

  function gorusmeyiKapat() {
    const dakika = Math.max(1, Math.ceil(gecenSaniye / 60));
    setOdaUrl(null);
    if (onGorusmeBitti) onGorusmeBitti(dakika);
  }

  return (
    <>
      <button
        onClick={gorusmeyeKatil}
        disabled={yukleniyor}
        className="flex items-center gap-1.5 rounded-full bg-turkuaz px-4 py-2 text-xs font-bold text-gece transition hover:bg-turkuaz-parlak disabled:opacity-60"
      >
        {yukleniyor ? <Spinner className="h-3.5 w-3.5" /> : <IconVideo className="h-3.5 w-3.5" />}
        Görüşmeye Katıl
      </button>

      {hata && <p className="w-full text-xs text-red-400">{hata}</p>}

      {odaUrl && (
        <Modal baslik={`Görüntülü Görüşme · ${sureFormatla(gecenSaniye)}`} onKapat={gorusmeyiKapat}>
          <div className="overflow-hidden rounded-xl bg-black">
            <iframe
              src={odaUrl}
              title="Görüntülü Görüşme"
              allow="camera; microphone; fullscreen; display-capture; autoplay"
              style={{ width: "100%", height: "70vh", border: "none" }}
            />
          </div>
          <button
            onClick={gorusmeyiKapat}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-700"
          >
            <IconTelefonKapat className="h-4 w-4" />
            Görüşmeyi Sonlandır
          </button>

          {onGorusmeBitti && (
            <p className="mt-3 text-center text-xs text-white/40">
              Görüşmeyi sonlandırınca süre otomatik hesaplanıp tamamlanacak.
            </p>
          )}
        </Modal>
      )}
    </>
  );
}
