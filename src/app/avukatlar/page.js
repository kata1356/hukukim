"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import Avatar from "@/components/Avatar";
import DogrulamaRozeti from "@/components/DogrulamaRozeti";
import Spinner from "@/components/Spinner";
import { SEHIRLER } from "@/lib/sehirler";
import { UZMANLIK_ALANLARI } from "@/lib/uzmanlikAlanlari";
import { IconArama, IconKonum, IconOk } from "@/components/icons";

export default function Avukatlar() {
  const [yukleniyor, setYukleniyor] = useState(true);
  const [avukatlar, setAvukatlar] = useState([]);
  const [aramaMetni, setAramaMetni] = useState("");
  const [seciliSehir, setSeciliSehir] = useState("");
  const [seciliUzmanlik, setSeciliUzmanlik] = useState("");

  useEffect(() => {
    let iptalEdildi = false;

    async function veriGetir() {
      const { data } = await supabase
        .from("avukatlar")
        .select("*")
        .order("dogrulanmis", { ascending: false })
        .order("ad_soyad", { ascending: true });

      if (!iptalEdildi) {
        setAvukatlar(data ?? []);
        setYukleniyor(false);
      }
    }

    veriGetir();
    return () => {
      iptalEdildi = true;
    };
  }, []);

  const filtrelenmisListe = useMemo(() => {
    const arama = aramaMetni.trim().toLocaleLowerCase("tr-TR");
    return avukatlar.filter((a) => {
      if (seciliSehir && a.sehir !== seciliSehir) return false;
      if (seciliUzmanlik && !(a.uzmanlik_alanlari ?? []).includes(seciliUzmanlik)) return false;
      if (!arama) return true;
      const metin = [a.ad_soyad, a.sehir, ...(a.uzmanlik_alanlari ?? [])]
        .join(" ")
        .toLocaleLowerCase("tr-TR");
      return metin.includes(arama);
    });
  }, [avukatlar, aramaMetni, seciliSehir, seciliUzmanlik]);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-gece">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-gece/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-2xl font-bold text-white">
            Hukuk<span className="text-turkuaz">im</span>
          </Link>
          <Link
            href="/"
            className="rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/5"
          >
            Ana Sayfa
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-14">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            Avukatlarımız
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/60 sm:text-base">
            Hukukim&apos;e kayıtlı avukatları incele, uygun olanı bulup
            randevu talebi gönder.
          </p>
        </div>

        <div className="relative mx-auto mt-8 max-w-xl">
          <IconArama className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={aramaMetni}
            onChange={(e) => setAramaMetni(e.target.value)}
            placeholder="Ör. Ankara, Aile Hukuku, Ayşe Yılmaz..."
            className="w-full rounded-full border border-white/15 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-turkuaz focus:ring-2 focus:ring-turkuaz/30"
          />
        </div>

        <div className="mx-auto mt-4 flex max-w-xl flex-col gap-3 sm:flex-row">
          <select
            value={seciliSehir}
            onChange={(e) => setSeciliSehir(e.target.value)}
            className="w-full rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition focus:border-turkuaz focus:ring-2 focus:ring-turkuaz/30 [&>option]:bg-gece-yuzey [&>option]:text-white"
          >
            <option value="">Tüm Şehirler</option>
            {SEHIRLER.map((sehir) => (
              <option key={sehir} value={sehir}>
                {sehir}
              </option>
            ))}
          </select>

          <select
            value={seciliUzmanlik}
            onChange={(e) => setSeciliUzmanlik(e.target.value)}
            className="w-full rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition focus:border-turkuaz focus:ring-2 focus:ring-turkuaz/30 [&>option]:bg-gece-yuzey [&>option]:text-white"
          >
            <option value="">Tüm Uzmanlık Alanları</option>
            {UZMANLIK_ALANLARI.map((alan) => (
              <option key={alan} value={alan}>
                {alan}
              </option>
            ))}
          </select>
        </div>

        {yukleniyor ? (
          <div className="mt-16 flex justify-center">
            <Spinner className="h-8 w-8 text-white" />
          </div>
        ) : filtrelenmisListe.length === 0 ? (
          <p className="mx-auto mt-10 max-w-md rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-white/50">
            Aramanla eşleşen bir avukat bulunamadı.
          </p>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filtrelenmisListe.map((avukat) => (
              <div
                key={avukat.id}
                className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-gece-yuzey p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-white/20"
              >
                <div className="flex items-start gap-3">
                  <Avatar
                    adSoyad={avukat.ad_soyad}
                    fotografUrl={avukat.profil_fotografi_url}
                    dogrulanmis={avukat.dogrulanmis}
                  />
                  <div>
                    <p className="font-semibold text-white">
                      {avukat.ad_soyad}
                    </p>
                    <p className="flex items-center gap-1 text-sm text-white/60">
                      <IconKonum className="h-3.5 w-3.5" />
                      {avukat.sehir}
                    </p>
                    <div className="mt-1.5">
                      <DogrulamaRozeti dogrulanmis={avukat.dogrulanmis} />
                    </div>
                  </div>
                </div>

                {avukat.uzmanlik_alanlari?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {avukat.uzmanlik_alanlari.map((alan) => (
                      <span
                        key={alan}
                        className="rounded-full bg-white/5 px-2.5 py-1 text-xs font-medium text-white/70"
                      >
                        {alan}
                      </span>
                    ))}
                  </div>
                )}

                {avukat.biyografi && (
                  <p className="line-clamp-3 text-sm text-white/60">
                    {avukat.biyografi}
                  </p>
                )}

                <Link
                  href="/muvekkil/kayit"
                  className="mt-auto flex items-center justify-center gap-1.5 rounded-full bg-turkuaz px-4 py-2 text-sm font-semibold text-gece shadow-sm transition hover:bg-turkuaz-parlak hover:shadow-md"
                >
                  Randevu Talebi Gönder
                  <IconOk className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-white/10 py-8 text-center">
        <p className="text-xs text-white/40">
          © {new Date().getFullYear()} Hukukim. Tüm hakları saklıdır.
        </p>
      </footer>
    </div>
  );
}
