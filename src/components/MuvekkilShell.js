"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AltMenu from "./AltMenu";
import Avatar from "./Avatar";
import BildirimZili from "./BildirimZili";
import Logo from "./Logo";
import ProfilMenusu from "./ProfilMenusu";
import { MUVEKKIL_SEKMELER } from "@/lib/muvekkilMenu";
import { IconYildirim } from "./icons";

// Müvekkil panelinin ortak çerçevesi: masaüstünde sol menü, telefonda alt menü.
export default function MuvekkilShell({ profil, baslik, aciklama, aksiyon, children }) {
  const yol = usePathname();

  return (
    <div className="flex min-h-full flex-1 bg-gece">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-white/10 bg-gece-yuzey/60 lg:flex">
        <div className="flex h-16 items-center border-b border-white/10 px-5">
          <Link href="/muvekkil/panel">
            <Logo className="h-7" />
          </Link>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {MUVEKKIL_SEKMELER.map(({ etiket, href, Icon }) => {
            const aktif = yol === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={aktif ? "page" : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                  aktif ? "bg-turkuaz/10 text-turkuaz" : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                {etiket}
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-col gap-3 border-t border-white/10 p-3">
          <Link
            href="/acil-avukat"
            className="flex items-center justify-center gap-2 rounded-lg bg-red-600/90 px-3 py-2.5 text-sm font-bold text-white transition hover:bg-red-600"
          >
            <IconYildirim className="h-4 w-4" />
            Acil Avukat
          </Link>
          <div className="flex items-center gap-3 rounded-lg bg-white/5 p-3">
            <Avatar adSoyad={profil.ad_soyad} boyut="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{profil.ad_soyad}</p>
              <p className="truncate text-xs text-white/40">{profil.email}</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b border-white/10 bg-gece/90 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3 lg:hidden">
            <Link href="/muvekkil/panel">
              <Logo className="h-7" />
            </Link>
          </div>
          <p className="hidden text-sm font-medium text-white/50 lg:block">Müvekkil Paneli</p>
          <div className="flex items-center gap-3">
            <BildirimZili />
            <ProfilMenusu adSoyad={profil.ad_soyad} panelYolu="/muvekkil" />
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 pb-28 sm:px-6 sm:py-8 lg:pb-10">
          {(baslik || aksiyon) && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                {baslik && <h1 className="text-2xl font-bold text-white">{baslik}</h1>}
                {aciklama && <p className="mt-1 text-sm text-white/60">{aciklama}</p>}
              </div>
              {aksiyon}
            </div>
          )}
          {children}
        </main>
      </div>

      <AltMenu sekmeler={MUVEKKIL_SEKMELER} gizle="lg:hidden" />
    </div>
  );
}
