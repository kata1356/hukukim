"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import Avatar from "./Avatar";
import DogrulamaRozeti from "./DogrulamaRozeti";
import { IconKonum } from "./icons";

export default function OneCikanAvukatlar() {
  const [avukatlar, setAvukatlar] = useState([]);
  const [yuklendi, setYuklendi] = useState(false);

  useEffect(() => {
    let iptalEdildi = false;

    async function veriGetir() {
      const { data } = await supabase
        .from("avukatlar")
        .select("*")
        .not("profil_fotografi_url", "is", null)
        .order("dogrulanmis", { ascending: false })
        .limit(4);

      if (!iptalEdildi) {
        setAvukatlar(data ?? []);
        setYuklendi(true);
      }
    }

    veriGetir();
    return () => {
      iptalEdildi = true;
    };
  }, []);

  if (!yuklendi || avukatlar.length === 0) return null;

  return (
    <section className="border-t border-gece-kenar bg-gece-yuzey/40 px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="rounded-full bg-turkuaz/15 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-turkuaz">
            Öne Çıkan Avukatlar
          </span>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Doğrulanmış Uzmanlarla Tanışın
          </h2>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {avukatlar.map((avukat) => (
            <Link
              href="/avukatlar"
              key={avukat.id}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-gece p-6 text-center shadow-sm transition hover:-translate-y-1 hover:border-turkuaz/40"
            >
              <Avatar
                adSoyad={avukat.ad_soyad}
                fotografUrl={avukat.profil_fotografi_url}
                dogrulanmis={avukat.dogrulanmis}
                boyut="lg"
              />
              <p className="font-bold text-white">{avukat.ad_soyad}</p>
              <p className="flex items-center gap-1 text-xs text-white/50">
                <IconKonum className="h-3 w-3" />
                {avukat.sehir}
              </p>
              {avukat.uzmanlik_alanlari?.[0] && (
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-white/70">
                  {avukat.uzmanlik_alanlari[0]}
                </span>
              )}
              <DogrulamaRozeti dogrulanmis={avukat.dogrulanmis} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
