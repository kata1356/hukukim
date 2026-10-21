"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Spinner from "./Spinner";

const ACILIYET = {
  dusuk: { metin: "Düşük aciliyet", sinif: "bg-white/10 text-white/70" },
  orta: { metin: "Orta aciliyet", sinif: "bg-amber-500/10 text-amber-400" },
  yuksek: { metin: "Yüksek aciliyet", sinif: "bg-red-500/10 text-red-400" },
};

// Talep için yapay zeka özeti: kısa özet, anahtar noktalar, ilk görüşmede sorulacak sorular.
export default function TalepOzetiAI({ talepId }) {
  const [yukleniyor, setYukleniyor] = useState(false);
  const [sonuc, setSonuc] = useState(null);
  const [hata, setHata] = useState(null);

  async function ozetle() {
    setHata(null);
    setYukleniyor(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const yanit = await fetch("/api/ai/talep-ozeti", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ talepId }),
      });
      const veri = await yanit.json();
      if (!yanit.ok) throw new Error(veri.hata ?? "Özet oluşturulamadı.");
      setSonuc(veri);
    } catch (err) {
      setHata(err.message || "Özet oluşturulamadı.");
    }
    setYukleniyor(false);
  }

  if (!sonuc) {
    return (
      <div className="mt-3">
        <button
          type="button"
          onClick={ozetle}
          disabled={yukleniyor}
          className="inline-flex items-center gap-2 rounded-md border border-turkuaz/30 bg-turkuaz/5 px-3 py-1.5 text-xs font-semibold text-turkuaz transition hover:bg-turkuaz/10 disabled:opacity-60"
        >
          {yukleniyor ? <Spinner className="h-3.5 w-3.5" /> : <span aria-hidden="true">✦</span>}
          Yapay zekâ özeti
        </button>
        {hata && <p className="mt-2 text-xs text-red-400">{hata}</p>}
      </div>
    );
  }

  const aciliyet = ACILIYET[sonuc.aciliyet] ?? ACILIYET.orta;

  return (
    <div className="mt-3 rounded-lg border border-turkuaz/20 bg-turkuaz/5 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-turkuaz">
          <span aria-hidden="true">✦</span> Yapay zekâ özeti
        </p>
        <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${aciliyet.sinif}`}>
          {aciliyet.metin}
        </span>
      </div>

      {sonuc.ozet && <p className="mt-2 text-sm text-white/80">{sonuc.ozet}</p>}

      {sonuc.anahtarNoktalar.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1 text-sm text-white/70">
          {sonuc.anahtarNoktalar.map((nokta) => (
            <li key={nokta} className="flex gap-2">
              <span className="text-turkuaz">•</span>
              {nokta}
            </li>
          ))}
        </ul>
      )}

      {sonuc.sorular.length > 0 && (
        <div className="mt-3 border-t border-white/10 pt-3">
          <p className="text-xs font-semibold text-white/50">İlk görüşmede sorulabilecekler</p>
          <ul className="mt-1.5 flex flex-col gap-1 text-sm text-white/70">
            {sonuc.sorular.map((soru) => (
              <li key={soru} className="flex gap-2">
                <span className="text-white/30">?</span>
                {soru}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-3 text-[11px] text-white/30">
        Otomatik oluşturulmuş özettir, hukuki görüş değildir. Müvekkilin asıl metnini esas al.
      </p>
    </div>
  );
}
