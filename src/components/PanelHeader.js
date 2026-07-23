"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Avatar from "./Avatar";
import BildirimZili from "./BildirimZili";
import Logo from "./Logo";

export default function PanelHeader({ adSoyad, panelAdi }) {
  const router = useRouter();

  async function cikisYap() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-gece/90 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Logo className="h-7" />
          </Link>
          <span className="hidden text-sm text-white/30 sm:inline">|</span>
          <span className="hidden rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-white/70 sm:inline">
            {panelAdi}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <BildirimZili />
          <Avatar adSoyad={adSoyad} boyut="sm" />
          <span className="hidden text-sm font-medium text-white sm:inline">
            {adSoyad}
          </span>
          <button
            onClick={cikisYap}
            className="rounded-full px-3 py-1.5 text-sm font-semibold text-white/60 transition hover:bg-white/5 hover:text-turkuaz"
          >
            Çıkış Yap
          </button>
        </div>
      </div>
    </header>
  );
}
