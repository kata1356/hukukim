"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AltMenu({ sekmeler }) {
  const yol = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-gece pb-[env(safe-area-inset-bottom)] sm:hidden">
      <div className="flex items-stretch justify-around">
        {sekmeler.map(({ etiket, href, Icon }) => {
          const sayfaIciBaglanti = href.startsWith("#");
          const aktif = !sayfaIciBaglanti && yol === href;
          const sinif = `flex flex-1 flex-col items-center gap-1 py-2.5 transition ${
            aktif ? "text-turkuaz" : "text-white/50 hover:text-white"
          }`;
          const icerik = (
            <>
              <Icon className="h-5 w-5" />
              <span className="text-[11px] font-semibold">{etiket}</span>
            </>
          );

          return sayfaIciBaglanti ? (
            <a key={etiket} href={href} className={sinif}>
              {icerik}
            </a>
          ) : (
            <Link key={etiket} href={href} aria-current={aktif ? "page" : undefined} className={sinif}>
              {icerik}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
