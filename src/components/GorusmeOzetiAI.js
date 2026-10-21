"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Spinner from "./Spinner";

// Görüşme sonrası notlardan müvekkile gönderilecek özet mesaj taslağı üretir (kopyalanabilir).
export default function GorusmeOzetiAI({ talepId }) {
  const [acik, setAcik] = useState(false);
  const [notlar, setNotlar] = useState("");
  const [mesaj, setMesaj] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState(null);
  const [kopyalandi, setKopyalandi] = useState(false);

  async function olustur() {
    setHata(null);
    setKopyalandi(false);
    setYukleniyor(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const yanit = await fetch("/api/ai/gorusme-ozeti", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
        body: JSON.stringify({ talepId, notlar }),
      });
      const veri = await yanit.json();
      if (!yanit.ok) throw new Error(veri.hata ?? "Özet oluşturulamadı.");
      setMesaj(veri.mesaj);
    } catch (err) {
      setHata(err.message || "Özet oluşturulamadı.");
    }
    setYukleniyor(false);
  }

  async function kopyala() {
    try {
      await navigator.clipboard.writeText(mesaj);
      setKopyalandi(true);
    } catch {
      setHata("Kopyalanamadı, metni elle seçip kopyalayabilirsin.");
    }
  }

  if (!acik) {
    return (
      <button
        type="button"
        onClick={() => setAcik(true)}
        className="mt-3 inline-flex items-center gap-2 rounded-md border border-turkuaz/30 bg-turkuaz/5 px-3 py-1.5 text-xs font-semibold text-turkuaz transition hover:bg-turkuaz/10"
      >
        <span aria-hidden="true">✦</span>
        Müvekkile özet mesaj hazırla
      </button>
    );
  }

  return (
    <div className="mt-3 rounded-lg border border-turkuaz/20 bg-turkuaz/5 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-turkuaz">✦ Görüşme özeti taslağı</p>
      <p className="mt-1 text-xs text-white/50">
        Görüşmeden aldığın kısa notları yaz; müvekkile gönderebileceğin düzenli bir özet hazırlayalım.
      </p>

      <textarea
        rows={4}
        value={notlar}
        onChange={(e) => setNotlar(e.target.value)}
        placeholder="Örn. Kira artışı TÜFE sınırını aşıyor, ihtarname çekilecek, müvekkil sözleşme ve dekontları getirecek..."
        className="mt-3 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-turkuaz"
      />

      <button
        type="button"
        onClick={olustur}
        disabled={yukleniyor || notlar.trim().length < 20}
        className="mt-2 inline-flex items-center gap-2 rounded-md bg-turkuaz px-4 py-2 text-xs font-bold text-gece transition hover:bg-turkuaz-parlak disabled:opacity-50"
      >
        {yukleniyor && <Spinner className="h-3.5 w-3.5" />}
        Taslağı oluştur
      </button>

      {hata && <p className="mt-2 text-xs text-red-400">{hata}</p>}

      {mesaj && (
        <div className="mt-3 border-t border-white/10 pt-3">
          <textarea
            rows={8}
            value={mesaj}
            onChange={(e) => setMesaj(e.target.value)}
            className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-turkuaz"
          />
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={kopyala}
              className="rounded-md border border-white/20 px-3 py-1.5 text-xs font-semibold text-white transition hover:border-white/50"
            >
              {kopyalandi ? "Kopyalandı ✓" : "Kopyala"}
            </button>
            <span className="text-[11px] text-white/30">
              Taslağı gönderme öncesi kontrol et ve düzenle. Otomatik gönderilmez.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
