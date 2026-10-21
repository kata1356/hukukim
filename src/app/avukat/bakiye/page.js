"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAvukatProfili } from "@/lib/useAvukatProfili";
import AvukatShell from "@/components/AvukatShell";
import Spinner from "@/components/Spinner";
import { IconOnay } from "@/components/icons";

function tarihSaatFormatla(tarih) {
  return new Date(tarih).toLocaleString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ayAdi(anahtar) {
  const [yil, ay] = anahtar.split("-");
  return new Date(Number(yil), Number(ay) - 1, 1).toLocaleDateString("tr-TR", { month: "long", year: "numeric" });
}

export default function AvukatBakiye() {
  const { profil, yukleniyor } = useAvukatProfili();
  const [kazanclar, setKazanclar] = useState([]);
  const [kazancYukleniyor, setKazancYukleniyor] = useState(true);

  useEffect(() => {
    if (!profil?.id) return;
    supabase
      .from("avukat_kazanclari")
      .select("*")
      .eq("avukat_id", profil.id)
      .order("tarih", { ascending: false })
      .then(({ data }) => {
        setKazanclar(data ?? []);
        setKazancYukleniyor(false);
      });
  }, [profil?.id]);

  if (yukleniyor || kazancYukleniyor) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-gece">
        <Spinner className="h-8 w-8 text-white" />
      </div>
    );
  }

  const tutar = (k) => Number(k.kazanilan_miktar || 0);
  const toplamKazanc = kazanclar.reduce((t, k) => t + tutar(k), 0);
  const odenenKazanc = kazanclar.filter((k) => k.avukata_odendi).reduce((t, k) => t + tutar(k), 0);
  const odenmemisKazanc = toplamKazanc - odenenKazanc;
  const odenenYuzde = toplamKazanc > 0 ? Math.round((odenenKazanc / toplamKazanc) * 100) : 0;

  const aylikToplam = {};
  for (const k of kazanclar) {
    const anahtar = String(k.tarih).slice(0, 7);
    aylikToplam[anahtar] = (aylikToplam[anahtar] ?? 0) + tutar(k);
  }
  const aylar = Object.entries(aylikToplam).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 6);
  const enYuksekAy = Math.max(1, ...aylar.map(([, deger]) => deger));

  return (
    <AvukatShell profil={profil} baslik="Kazançlar" aciklama="Tamamlanmış görüşmelerden kazandığın tutarların özeti.">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-turkuaz/20 bg-gece-yuzey p-5 sm:col-span-1">
          <p className="text-sm text-white/50">Toplam kazanç</p>
          <p className="mt-1 font-heading text-4xl font-bold text-white">{toplamKazanc} TL</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-gece-yuzey p-5">
          <p className="text-sm text-white/50">Havale edildi</p>
          <p className="mt-1 font-heading text-3xl font-bold text-green-400">{odenenKazanc} TL</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-gece-yuzey p-5">
          <p className="text-sm text-white/50">Havale bekliyor</p>
          <p className="mt-1 font-heading text-3xl font-bold text-white">{odenmemisKazanc} TL</p>
        </div>
      </section>

      {toplamKazanc > 0 && (
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
          <div className="h-full rounded-full bg-green-400 transition-all" style={{ width: `${odenenYuzde}%` }} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <section className="lg:col-span-3">
          <h2 className="mb-3 text-sm font-bold text-white">Görüşme geçmişi</h2>
          {kazanclar.length === 0 ? (
            <p className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-center text-sm text-white/50">
              Henüz ücretli bir görüşmen yok.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {kazanclar.map((k) => (
                <div
                  key={k.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-gece-yuzey p-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{k.muvekkil_ad_soyad}</p>
                    <p className="text-xs text-white/40">{tarihSaatFormatla(k.tarih)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-bold text-turkuaz">{k.kazanilan_miktar} TL</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        k.avukata_odendi ? "bg-green-500/10 text-green-400" : "bg-white/5 text-white/40"
                      }`}
                    >
                      {k.avukata_odendi ? "Havale edildi" : "Havale bekliyor"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <aside className="flex flex-col gap-4 lg:col-span-2">
          <div className="rounded-xl border border-white/10 bg-gece-yuzey p-5">
            <h2 className="text-sm font-bold text-white">Aylık kazanç</h2>
            {aylar.length === 0 ? (
              <p className="mt-3 text-sm text-white/50">Henüz veri yok.</p>
            ) : (
              <ul className="mt-4 flex flex-col gap-3">
                {aylar.map(([anahtar, deger]) => (
                  <li key={anahtar}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="capitalize text-white/60">{ayAdi(anahtar)}</span>
                      <span className="font-semibold text-white">{deger} TL</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-turkuaz"
                        style={{ width: `${Math.round((deger / enYuksekAy) * 100)}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="flex items-start gap-2 rounded-xl bg-gece-yuzey px-4 py-3 text-xs leading-relaxed text-white/40">
            <IconOnay className="mt-0.5 h-4 w-4 shrink-0 text-turkuaz" />
            Görüşme ücretinin %60&apos;ı sana ait. Hakedişlerin, Ayarlar sayfasına girdiğin IBAN&apos;a periyodik olarak
            havale ile gönderilir.
          </p>
        </aside>
      </div>
    </AvukatShell>
  );
}
