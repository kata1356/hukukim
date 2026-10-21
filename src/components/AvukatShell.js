"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AltMenu from "./AltMenu";
import Avatar from "./Avatar";
import BildirimZili from "./BildirimZili";
import Logo from "./Logo";
import ProfilMenusu from "./ProfilMenusu";
import { AVUKAT_MENU, AVUKAT_SEKMELER } from "@/lib/avukatMenu";

// Avukat panelinin ortak çerçevesi: masaüstünde sol menü, telefonda alt menü.
// `rozetler` ile menü öğelerinin yanına sayı konabilir ({ "/avukat/talepler": 3 }).
export default function AvukatShell({ profil, rozetler = {}, baslik, aciklama, aksiyon, children }) {
  const yol = usePathname();

  return (
    <div className="flex min-h-full flex-1 bg-gece">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-white/10 bg-gece-yuzey/60 lg:flex">
        <div className="flex h-16 items-center border-b border-white/10 px-5">
          <Link href="/avukat/panel">
            <Logo className="h-7" />
          </Link>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {AVUKAT_MENU.map(({ etiket, href, Icon }) => {
            const aktif = yol === href;
            const rozet = rozetler[href];
            return (
              <Link
                key={href}
                href={href}
                aria-current={aktif ? "page" : undefined}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                  aktif
                    ? "bg-turkuaz/10 text-turkuaz"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" />
                <span className="flex-1">{etiket}</span>
                {rozet > 0 && (
                  <span className="rounded-full bg-turkuaz px-2 py-0.5 text-[11px] font-bold text-gece">
                    {rozet}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <div className="flex items-center gap-3 rounded-lg bg-white/5 p-3">
            <Avatar
              adSoyad={profil.ad_soyad}
              fotografUrl={profil.profil_fotografi_url}
              dogrulanmis={profil.dogrulanmis}
              boyut="sm"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{profil.ad_soyad}</p>
              <p
                className={`text-xs font-medium ${
                  profil.dogrulanmis ? "text-green-400" : "text-amber-400"
                }`}
              >
                {profil.dogrulanmis
                  ? "Doğrulanmış avukat"
                  : profil.belge_durumu === "incelemede"
                    ? "Belgeler inceleniyor"
                    : "Doğrulama bekliyor"}
              </p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b border-white/10 bg-gece/90 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3 lg:hidden">
            <Link href="/avukat/panel">
              <Logo className="h-7" />
            </Link>
          </div>
          <p className="hidden text-sm font-medium text-white/50 lg:block">Avukat Paneli</p>
          <div className="flex items-center gap-3">
            <BildirimZili />
            <ProfilMenusu adSoyad={profil.ad_soyad} panelYolu="/avukat" />
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 pb-28 sm:px-6 sm:py-8 lg:pb-10">
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

      <AltMenu sekmeler={AVUKAT_SEKMELER} gizle="lg:hidden" />
    </div>
  );
}
