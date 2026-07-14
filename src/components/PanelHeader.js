"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Avatar from "./Avatar";

export default function PanelHeader({ adSoyad, panelAdi }) {
  const router = useRouter();

  async function cikisYap() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-10 border-b border-lacivert/10 bg-white/90 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-xl font-bold text-lacivert">
            Hukuk<span className="text-altin">im</span>
          </Link>
          <span className="hidden text-sm text-lacivert/40 sm:inline">|</span>
          <span className="hidden rounded-full bg-lacivert/5 px-3 py-1 text-xs font-semibold text-lacivert/70 sm:inline">
            {panelAdi}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Avatar adSoyad={adSoyad} boyut="sm" />
          <span className="hidden text-sm font-medium text-lacivert sm:inline">
            {adSoyad}
          </span>
          <button
            onClick={cikisYap}
            className="rounded-full px-3 py-1.5 text-sm font-semibold text-lacivert/60 transition hover:bg-lacivert/5 hover:text-altin-koyu"
          >
            Çıkış Yap
          </button>
        </div>
      </div>
    </header>
  );
}
