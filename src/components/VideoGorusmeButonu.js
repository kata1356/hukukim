"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Modal from "./Modal";
import Spinner from "./Spinner";
import { IconVideo } from "./icons";

export default function VideoGorusmeButonu({ randevuTalepId }) {
  const [yukleniyor, setYukleniyor] = useState(false);
  const [odaUrl, setOdaUrl] = useState(null);
  const [hata, setHata] = useState(null);

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

    setOdaUrl(sonuc.odaUrl);
    setYukleniyor(false);
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
        <Modal baslik="Görüntülü Görüşme" onKapat={() => setOdaUrl(null)}>
          <div className="overflow-hidden rounded-xl bg-black">
            <iframe
              src={odaUrl}
              title="Görüntülü Görüşme"
              allow="camera; microphone; fullscreen; display-capture; autoplay"
              style={{ width: "100%", height: "70vh", border: "none" }}
            />
          </div>
        </Modal>
      )}
    </>
  );
}
