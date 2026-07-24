"use client";

import Link from "next/link";
import BildirimZili from "./BildirimZili";
import Logo from "./Logo";
import ProfilMenusu from "./ProfilMenusu";

export default function PanelHeader({ adSoyad, panelAdi, panelYolu }) {
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
          <ProfilMenusu adSoyad={adSoyad} panelYolu={panelYolu} />
        </div>
      </div>
    </header>
  );
}
