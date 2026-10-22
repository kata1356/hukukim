"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { SOZLESME_TARIHI } from "@/lib/avukatSozlesmesi";
import Spinner from "./Spinner";

// Sözleşmeyi onaylamamış (ya da eski sürümü onaylamış) avukatın panel kullanımını engeller.
export default function SozlesmeKapisi() {
  const [onay, setOnay] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState(null);

  async function onayla() {
    setHata(null);
    setYukleniyor(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const yanit = await fetch("/api/avukat/sozlesme-onay", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ onay: true }),
    });
    const sonuc = await yanit.json();

    if (!yanit.ok) {
      setHata(typeof sonuc.hata === "string" ? sonuc.hata : "Onay kaydedilemedi, lütfen tekrar dene.");
      setYukleniyor(false);
      return;
    }

    window.location.reload();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-gece-yuzey p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-white">Avukat Hizmet Sözleşmesi</h2>
        <p className="mt-2 text-sm text-white/60">
          Hukukim&apos;i kullanmaya devam etmek için güncel Avukat Hizmet Sözleşmesi&apos;ni ({SOZLESME_TARIHI}) onaylaman
          gerekiyor. Onay verilene kadar talepleri göremez ve panelde işlem yapamazsın.
        </p>

        <ul className="mt-4 flex flex-col gap-1.5 text-sm text-white/70">
          <li>• Yeni müvekkillerin ilk 5 dakikası ücretsiz denemedir; bu süre için hakediş doğmaz.</li>
          <li>• Ek süre ve paket ücretlerinin %60&apos;ı hakedişindir, IBAN&apos;ına havale edilir.</li>
          <li>• Görüşme süresi platformun sunucu kayıtlarına göre ölçülür; süre dolunca görüşme sona erer.</li>
          <li>• Platform üzerinden başlayan görüşmeyi platform dışına taşımamayı kabul edersin.</li>
          <li>• Baro kaydın ve belgelerin doğru ve güncel olmalıdır; değişiklikleri bildirirsin.</li>
          <li>• Müvekkil bilgileri avukatlık sırrı ve KVKK kapsamında gizli tutulur.</li>
        </ul>

        <Link
          href="/avukat-sozlesmesi"
          target="_blank"
          className="mt-4 inline-block text-sm font-semibold text-turkuaz underline"
        >
          Sözleşmenin tamamını oku
        </Link>

        <label className="mt-5 flex items-start gap-3 text-sm text-white/80">
          <input
            type="checkbox"
            checked={onay}
            onChange={(e) => setOnay(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-white/5 text-turkuaz focus:ring-turkuaz/40"
          />
          Avukat Hizmet Sözleşmesi&apos;ni okudum ve kabul ediyorum.
        </label>

        {hata && (
          <p className="mt-3 rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-400 ring-1 ring-red-500/20">{hata}</p>
        )}

        <button
          type="button"
          onClick={onayla}
          disabled={!onay || yukleniyor}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-turkuaz px-5 py-3 text-sm font-bold text-gece transition hover:bg-turkuaz-parlak disabled:cursor-not-allowed disabled:opacity-50"
        >
          {yukleniyor && <Spinner className="h-4 w-4" />}
          Onayla ve Devam Et
        </button>
      </div>
    </div>
  );
}
