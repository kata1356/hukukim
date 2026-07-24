"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Spinner from "./Spinner";
import { IconYildiz } from "./icons";

export default function AIKonuAsistani({ aciklama, onSonuc }) {
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState(null);

  async function analizEt() {
    setHata(null);

    if (!aciklama || aciklama.trim().length < 15) {
      setHata("Önce açıklama alanına durumunu biraz daha ayrıntılı yaz.");
      return;
    }

    setYukleniyor(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const yanit = await fetch("/api/ai/talep-analiz", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ aciklama }),
    });
    const sonuc = await yanit.json();

    if (!yanit.ok) {
      setHata(sonuc.hata ?? "Analiz başarısız oldu.");
      setYukleniyor(false);
      return;
    }

    onSonuc(sonuc);
    setYukleniyor(false);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <button
        type="button"
        onClick={analizEt}
        disabled={yukleniyor}
        className="flex w-fit items-center gap-1.5 rounded-full border border-turkuaz/30 bg-turkuaz/10 px-3 py-1.5 text-xs font-semibold text-turkuaz transition hover:bg-turkuaz/20 disabled:opacity-60"
      >
        {yukleniyor ? <Spinner className="h-3.5 w-3.5" /> : <IconYildiz className="h-3.5 w-3.5" />}
        Yapay Zeka ile Konuyu Doldur
      </button>
      {hata && <p className="text-xs text-red-400">{hata}</p>}
    </div>
  );
}
