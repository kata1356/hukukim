"use client";

import { useEffect, useRef, useState } from "react";
import DailyIframe from "@daily-co/daily-js";
import { supabase } from "@/lib/supabaseClient";
import Modal from "./Modal";
import Spinner from "./Spinner";
import { IconVideo, IconTelefonKapat, IconKvkk } from "./icons";

function sureFormatla(saniye) {
  const dk = Math.floor(saniye / 60);
  const sn = saniye % 60;
  return `${String(dk).padStart(2, "0")}:${String(sn).padStart(2, "0")}`;
}

export default function VideoGorusmeButonu({ randevuTalepId, onGorusmeBitti }) {
  const [onayAcik, setOnayAcik] = useState(false);
  const [onayVerildi, setOnayVerildi] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [odaUrl, setOdaUrl] = useState(null);
  const [hata, setHata] = useState(null);
  const [gecenSaniye, setGecenSaniye] = useState(0);
  const baslangicRef = useRef(null);
  const iframeRef = useRef(null);
  const callFrameRef = useRef(null);
  const bittiCagrildiRef = useRef(false);

  useEffect(() => {
    if (!odaUrl) return;

    const zamanlayici = setInterval(() => {
      setGecenSaniye(Math.floor((Date.now() - baslangicRef.current) / 1000));
    }, 1000);

    return () => clearInterval(zamanlayici);
  }, [odaUrl]);

  useEffect(() => {
    if (!odaUrl || !iframeRef.current) return;

    bittiCagrildiRef.current = false;
    const callFrame = DailyIframe.wrap(iframeRef.current);
    callFrameRef.current = callFrame;
    callFrame.join({ url: odaUrl });
    callFrame.on("left-meeting", gorusmeBitince);

    return () => {
      callFrame.off("left-meeting", gorusmeBitince);
      callFrame.destroy();
      callFrameRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [odaUrl]);

  function gorusmeBitince() {
    if (bittiCagrildiRef.current) return;
    bittiCagrildiRef.current = true;
    const saniyeGecti = Math.floor((Date.now() - baslangicRef.current) / 1000);
    const dakika = Math.max(1, Math.ceil(saniyeGecti / 60));
    setOdaUrl(null);
    if (onGorusmeBitti) onGorusmeBitti(dakika);
  }

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

  function gorusmeyiSonlandir() {
    if (callFrameRef.current) {
      callFrameRef.current.leave();
    } else {
      gorusmeBitince();
    }
  }

  return (
    <>
      <button
        onClick={() => setOnayAcik(true)}
        className="flex items-center gap-1.5 rounded-full bg-turkuaz px-4 py-2 text-xs font-bold text-gece transition hover:bg-turkuaz-parlak"
      >
        <IconVideo className="h-3.5 w-3.5" />
        Görüşmeye Katıl
      </button>

      {hata && <p className="w-full text-xs text-red-400">{hata}</p>}

      {onayAcik && (
        <Modal baslik="Görüşmeye Başlamadan Önce" onKapat={() => setOnayAcik(false)}>
          <div className="flex flex-col gap-4">
            <p className="flex items-start gap-2 rounded-lg bg-white/5 px-4 py-3 text-sm text-white/70">
              <IconVideo className="mt-0.5 h-4 w-4 shrink-0 text-turkuaz" />
              Sağlıklı bir görüşme için internet bağlantının stabil olduğundan
              emin ol ve sessiz bir ortamda katıl.
            </p>

            <label className="flex items-start gap-2.5 text-sm text-white/70">
              <input
                type="checkbox"
                checked={onayVerildi}
                onChange={(e) => setOnayVerildi(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-white/5 text-turkuaz focus:ring-turkuaz/40"
              />
              <span>
                <a href="/kvkk-aydinlatma-metni" target="_blank" className="font-semibold text-turkuaz underline">
                  KVKK Aydınlatma Metni
                </a>
                &apos;ni okudum, görüşmenin kayda alınmadığını ve yalnızca
                taraflar arasında gerçekleştiğini biliyorum.
              </span>
            </label>

            <button
              onClick={() => {
                setOnayAcik(false);
                gorusmeyeKatil();
              }}
              disabled={!onayVerildi || yukleniyor}
              className="flex items-center justify-center gap-2 rounded-full bg-turkuaz px-5 py-3 text-sm font-bold text-gece transition hover:bg-turkuaz-parlak disabled:cursor-not-allowed disabled:opacity-50"
            >
              {yukleniyor && <Spinner className="h-4 w-4" />}
              <IconKvkk className="h-4 w-4" />
              Görüşmeye Başla
            </button>
          </div>
        </Modal>
      )}

      {odaUrl && (
        <Modal baslik={`Görüntülü Görüşme · ${sureFormatla(gecenSaniye)}`} onKapat={gorusmeyiSonlandir}>
          <div className="overflow-hidden rounded-xl bg-black">
            <iframe
              ref={iframeRef}
              title="Görüntülü Görüşme"
              allow="camera; microphone; fullscreen; display-capture; autoplay"
              style={{ width: "100%", height: "70vh", border: "none" }}
            />
          </div>

          <button
            onClick={gorusmeyiSonlandir}
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
