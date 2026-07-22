"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MEVZUAT_LISTESI } from "@/lib/mevzuat";
import { IconArama, IconKitap, IconDisLink, IconTakvim } from "@/components/icons";

export default function Mevzuat() {
  const [aramaMetni, setAramaMetni] = useState("");

  const filtrelenmisListe = useMemo(() => {
    const arama = aramaMetni.trim().toLocaleLowerCase("tr-TR");
    if (!arama) return MEVZUAT_LISTESI;
    return MEVZUAT_LISTESI.filter((m) =>
      `${m.ad} ${m.no}`.toLocaleLowerCase("tr-TR").includes(arama)
    );
  }, [aramaMetni]);

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
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 text-xs font-bold text-white">
            <IconKitap className="h-3.5 w-3.5 text-turkuaz" />
            Mevzuat ve Anayasa
          </span>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            Temel Kanunlara Kolayca Ulaş
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-white/60 sm:text-base">
            Aşağıdaki her kanun, Adalet Bakanlığı&apos;nın resmî mevzuat
            sitesindeki güncel ve tam metnine yönlendirir.
          </p>
        </div>

        <div className="relative mx-auto mt-8 max-w-xl">
          <IconArama className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={aramaMetni}
            onChange={(e) => setAramaMetni(e.target.value)}
            placeholder="Kanun adı veya numarası ara..."
            className="w-full rounded-full border border-white/15 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-turkuaz focus:ring-2 focus:ring-turkuaz/30"
          />
        </div>

        {filtrelenmisListe.length === 0 ? (
          <p className="mx-auto mt-10 max-w-md rounded-2xl border border-dashed border-white/15 p-8 text-center text-sm text-white/50">
            Aramanla eşleşen bir kanun bulunamadı.
          </p>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filtrelenmisListe.map((m) => (
              <a
                key={m.no}
                href={m.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col gap-3 rounded-2xl border border-white/10 bg-gece-yuzey p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-turkuaz/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-white">{m.ad}</p>
                    <p className="mt-1 text-xs font-semibold text-white/40">
                      Kanun No: {m.no}
                    </p>
                  </div>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/5 text-white/40 transition group-hover:bg-turkuaz/15 group-hover:text-turkuaz">
                    <IconDisLink className="h-4 w-4" />
                  </span>
                </div>

                <p className="flex items-center gap-1.5 text-xs text-white/40">
                  <IconTakvim className="h-3.5 w-3.5" />
                  Kabul Tarihi: {m.kabulTarihi}
                </p>

                <span className="mt-1 text-xs font-semibold text-turkuaz">
                  Resmî Kaynağı Görüntüle →
                </span>
              </a>
            ))}
          </div>
        )}

        <div className="mx-auto mt-12 max-w-2xl rounded-xl bg-white/5 px-5 py-4 text-xs leading-relaxed text-white/50">
          Bu bölüm yalnızca genel bilgilendirme amacı taşır ve hukuki
          danışmanlık yerine geçmez. Madde metinleri burada saklanmaz;
          yukarıdaki bağlantılar seni doğrudan mevzuat.gov.tr üzerindeki
          güncel, resmî ve konsolide metne yönlendirir. Mevzuat
          değişebileceğinden, işlem yapmadan önce resmî kaynağı kontrol et.
        </div>
      </main>

      <footer className="border-t border-white/10 py-8 text-center">
        <p className="text-xs text-white/40">
          © {new Date().getFullYear()} Hukukim. Tüm hakları saklıdır.
        </p>
      </footer>
    </div>
  );
}
