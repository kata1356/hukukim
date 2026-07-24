"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Avatar from "./Avatar";
import { IconAsagiOk, IconCuzdan, IconAyarlar, IconCikis } from "./icons";

export default function ProfilMenusu({ adSoyad, panelYolu }) {
  const router = useRouter();
  const [acik, setAcik] = useState(false);
  const kutuRef = useRef(null);

  useEffect(() => {
    function disariTiklandi(e) {
      if (kutuRef.current && !kutuRef.current.contains(e.target)) setAcik(false);
    }
    document.addEventListener("mousedown", disariTiklandi);
    return () => document.removeEventListener("mousedown", disariTiklandi);
  }, []);

  async function cikisYap() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <div className="relative" ref={kutuRef}>
      <button
        onClick={() => setAcik((onceki) => !onceki)}
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 transition hover:bg-white/5"
      >
        <Avatar adSoyad={adSoyad} boyut="sm" />
        <span className="hidden text-sm font-medium text-white sm:inline">{adSoyad}</span>
        <IconAsagiOk className={`h-3.5 w-3.5 text-white/40 transition-transform ${acik ? "rotate-180" : ""}`} />
      </button>

      {acik && (
        <div className="absolute right-0 top-full z-30 mt-2 w-56 overflow-hidden rounded-2xl border border-white/10 bg-gece-yuzey shadow-xl">
          <Link
            href={`${panelYolu}/bakiye`}
            onClick={() => setAcik(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/5"
          >
            <IconCuzdan className="h-4 w-4" />
            Bakiye
          </Link>
          <Link
            href={`${panelYolu}/ayarlar`}
            onClick={() => setAcik(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/5"
          >
            <IconAyarlar className="h-4 w-4" />
            Ayarlar
          </Link>

          <div className="border-t border-white/5" />

          <button
            onClick={cikisYap}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-semibold text-white/60 transition hover:bg-white/5 hover:text-white"
          >
            <IconCikis className="h-4 w-4" />
            Çıkış Yap
          </button>
        </div>
      )}
    </div>
  );
}
