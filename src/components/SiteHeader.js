"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import Logo from "./Logo";
import { IconKitap, IconYildirim, IconMenu } from "./icons";

const NAV_LINKS = [
  { href: "#nasil-calisir", label: "Nasıl Çalışır?" },
  { href: "#hukuk-alanlari", label: "Hukuk Alanları" },
  { href: "#akilli-eslesme", label: "Akıllı Eşleşme" },
  { href: "#fiyatlandirma", label: "Fiyatlandırma" },
  { href: "#sss", label: "SSS" },
];

export default function SiteHeader() {
  const [acik, setAcik] = useState(false);
  const [panelYolu, setPanelYolu] = useState(null);

  useEffect(() => {
    let iptalEdildi = false;

    async function oturumKontrolEt() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: avukatKaydi } = await supabase
        .from("avukatlar")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (iptalEdildi) return;

      if (avukatKaydi) {
        setPanelYolu("/avukat/panel");
        return;
      }

      const { data: muvekkilKaydi } = await supabase
        .from("muvekkiller")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (!iptalEdildi && muvekkilKaydi) {
        setPanelYolu("/muvekkil/panel");
      }
    }

    oturumKontrolEt();
    return () => {
      iptalEdildi = true;
    };
  }, []);

  async function cikisYap() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  const girisYapilmis = Boolean(panelYolu);

  return (
    <header className="sticky top-0 z-20 border-b border-gece-kenar bg-gece/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-5">
        <Logo className="h-8 shrink-0" />

        <nav className="hidden items-center gap-5 whitespace-nowrap text-sm font-semibold text-white/60 xl:flex">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="transition hover:text-white">
              {link.label}
            </a>
          ))}
          <Link href="/mevzuat" className="flex items-center gap-1.5 transition hover:text-white">
            <IconKitap className="h-4 w-4" />
            Mevzuat
          </Link>
        </nav>

        <div className="hidden shrink-0 items-center gap-2 xl:flex">
          {girisYapilmis ? (
            <>
              <Link
                href={panelYolu}
                className="rounded-full px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/5"
              >
                Panelim
              </Link>
              <button
                onClick={cikisYap}
                className="inline-block rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/5"
              >
                Çıkış Yap
              </button>
            </>
          ) : (
            <>
              <Link
                href="/giris"
                className="rounded-full px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/5"
              >
                Giriş Yap
              </Link>
              <Link
                href="/acil-avukat"
                className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                <IconYildirim className="h-4 w-4" />
                Acil Avukat
              </Link>
              <a
                href="#basla"
                className="inline-block rounded-full bg-turkuaz px-4 py-2 text-sm font-bold text-gece transition hover:bg-turkuaz-parlak"
              >
                Ücretsiz Kaydol
              </a>
            </>
          )}
        </div>

        <button
          onClick={() => setAcik((onceki) => !onceki)}
          aria-label={acik ? "Menüyü kapat" : "Menüyü aç"}
          aria-expanded={acik}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition hover:bg-white/5 xl:hidden"
        >
          {acik ? <span className="text-xl leading-none">✕</span> : <IconMenu className="h-5 w-5" />}
        </button>
      </div>

      {acik && (
        <div className="border-t border-gece-kenar bg-gece px-6 py-5 xl:hidden">
          <nav className="flex flex-col gap-1 text-sm font-semibold text-white/70">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setAcik(false)}
                className="rounded-lg px-3 py-2.5 transition hover:bg-white/5 hover:text-white"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/mevzuat"
              onClick={() => setAcik(false)}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2.5 transition hover:bg-white/5 hover:text-white"
            >
              <IconKitap className="h-4 w-4" />
              Mevzuat
            </Link>
          </nav>

          <div className="mt-4 flex flex-col gap-2.5 border-t border-gece-kenar pt-4">
            {girisYapilmis ? (
              <>
                <Link
                  href={panelYolu}
                  onClick={() => setAcik(false)}
                  className="rounded-full bg-turkuaz px-4 py-2.5 text-center text-sm font-bold text-gece transition hover:bg-turkuaz-parlak"
                >
                  Panelim
                </Link>
                <button
                  onClick={cikisYap}
                  className="rounded-full border border-white/15 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-white/5"
                >
                  Çıkış Yap
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/giris"
                  onClick={() => setAcik(false)}
                  className="rounded-full border border-white/15 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-white/5"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/acil-avukat"
                  onClick={() => setAcik(false)}
                  className="flex items-center justify-center gap-1.5 rounded-full bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  <IconYildirim className="h-4 w-4" />
                  Acil Avukat
                </Link>
                <a
                  href="#basla"
                  onClick={() => setAcik(false)}
                  className="rounded-full bg-turkuaz px-4 py-2.5 text-center text-sm font-bold text-gece transition hover:bg-turkuaz-parlak"
                >
                  Ücretsiz Kaydol
                </a>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
