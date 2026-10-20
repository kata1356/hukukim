"use client";

import Link from "next/link";
import BildirimZili from "./BildirimZili";
import Logo from "./Logo";
import ProfilMenusu from "./ProfilMenusu";

export default function PanelHeader({ adSoyad, panelAdi, panelYolu }) {
  return (
    <header className="sticky top-0 z-10 h-14 border-b border-white/10 bg-gece">
      <div className="mx-auto flex h-full max-w-5xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <Link href={`${panelYolu}/panel`}>
            <Logo className="h-7" />
          </Link>
          <span className="hidden h-5 w-px bg-white/15 sm:inline-block" />
          <span className="hidden text-sm font-medium text-white/60 sm:inline">{panelAdi}</span>
        </div>
        <div className="flex items-center gap-3">
          <BildirimZili />
          <ProfilMenusu adSoyad={adSoyad} panelYolu={panelYolu} />
        </div>
      </div>
    </header>
  );
}
