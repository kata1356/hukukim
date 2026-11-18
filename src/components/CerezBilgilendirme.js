"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const ANAHTAR = "hukukim-cerez-bilgilendirme";

// Sitede yalnızca zorunlu çerezler kullanıldığı için bu bir bilgilendirme çubuğudur (onay gerektirmez).
export default function CerezBilgilendirme() {
  const [gorunur, setGorunur] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(ANAHTAR)) setGorunur(true);
    } catch {
      setGorunur(true);
    }
  }, []);

  function kapat() {
    try {
      localStorage.setItem(ANAHTAR, "1");
    } catch {
      // depolama yoksa yalnızca bu oturumda gizle
    }
    setGorunur(false);
  }

  if (!gorunur) return null;

  return (
    <div
      role="region"
      aria-label="Çerez bilgilendirmesi"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-2xl flex-col gap-3 rounded-xl border border-white/10 bg-gece/95 p-4 text-sm text-white/80 shadow-2xl backdrop-blur sm:flex-row sm:items-center"
    >
      <p className="flex-1 leading-relaxed">
        Sitemizde yalnızca oturumun için zorunlu çerezler kullanılır.{" "}
        <Link href="/cerez-politikasi" className="underline hover:text-white">
          Çerez Politikası
        </Link>
      </p>
      <button
        type="button"
        onClick={kapat}
        className="shrink-0 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-gece hover:bg-white/90"
      >
        Anladım
      </button>
    </div>
  );
}
