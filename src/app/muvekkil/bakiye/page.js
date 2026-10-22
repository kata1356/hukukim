"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { tarihFormatla } from "@/lib/gorusmeSekli";
import { useMuvekkilProfili } from "@/lib/useMuvekkilProfili";
import MuvekkilShell from "@/components/MuvekkilShell";
import Spinner from "@/components/Spinner";
import { IconOnay } from "@/components/icons";

function ayAdi(anahtar) {
  const [yil, ay] = anahtar.split("-");
  return new Date(Number(yil), Number(ay) - 1, 1).toLocaleDateString("tr-TR", { month: "long", year: "numeric" });
}

export default function MuvekkilOdemelerim() {
  const { profil, yukleniyor } = useMuvekkilProfili();
  const [kayitlar, setKayitlar] = useState([]);
  const [yuklendi, setYuklendi] = useState(false);

  useEffect(() => {
    if (!profil?.id) return;
    supabase
      .from("randevu_talepleri")
      .select("*, avukatlar(ad_soyad)")
      .eq("muvekkil_id", profil.id)
      .in("odeme_durumu", ["odendi", "muaf"])
      .neq("durum", "iptal")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setKayitlar(data ?? []);
        setYuklendi(true);
      });
  }, [profil?.id]);

  if (yukleniyor || !yuklendi) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-gece">
        <Spinner className="h-8 w-8 text-white" />
      </div>
    );
  }

  const odemeler = kayitlar.filter((k) => k.odeme_durumu === "odendi");
  const denemeler = kayitlar.filter((k) => k.odeme_durumu === "muaf");
  const tutar = (k) => Number(k.odeme_tutari || 0);
  const toplam = odemeler.reduce((t, k) => t + tutar(k), 0);
  const buAy = new Date().toISOString().slice(0, 7);
  const buAyToplam = odemeler.filter((k) => String(k.tarih).slice(0, 7) === buAy).reduce((t, k) => t + tutar(k), 0);
  const ortalama = odemeler.length > 0 ? Math.round(toplam / odemeler.length) : 0;

  const aylik = {};
  for (const k of odemeler) {
    const anahtar = String(k.tarih).slice(0, 7);
    aylik[anahtar] = (aylik[anahtar] ?? 0) + tutar(k);
  }
  const aylar = Object.entries(aylik).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 6);
  const enYuksek = Math.max(1, ...aylar.map(([, d]) => d));

  return (
    <MuvekkilShell profil={profil} baslik="Ödemelerim" aciklama="Görüşme paketlerin ve harcamalarının özeti.">
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { etiket: "Toplam ödenen", deger: `${toplam.toLocaleString("tr-TR")} TL`, vurgu: true },
          { etiket: "Bu ay", deger: `${buAyToplam.toLocaleString("tr-TR")} TL` },
          { etiket: "Ücretli görüşme", deger: odemeler.length },
          { etiket: "Ortalama paket tutarı", deger: `${ortalama} TL` },
        ].map(({ etiket, deger, vurgu }) => (
          <div key={etiket} className="rounded-xl border border-white/10 bg-gece-yuzey p-4">
            <p className="text-xs text-white/50">{etiket}</p>
            <p className={`mt-1 font-heading text-2xl font-bold ${vurgu ? "text-turkuaz" : "text-white"}`}>{deger}</p>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <section className="lg:col-span-3">
          <h2 className="mb-3 text-sm font-bold text-white">Ödeme geçmişi</h2>
          {kayitlar.length === 0 ? (
            <p className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-center text-sm text-white/50">
              Henüz bir ödemen veya ücretsiz denemen yok.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {kayitlar.map((k) => (
                <div
                  key={k.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-gece-yuzey p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{k.avukatlar?.ad_soyad ?? "Eşleşme bekleniyor"}</p>
                    <p className="truncate text-xs text-white/40">
                      {tarihFormatla(k.tarih)} · {k.paket_dakika ? `${k.paket_dakika} dk` : "—"} · {k.konu}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="font-bold text-turkuaz">
                      {k.odeme_durumu === "muaf" ? "Ücretsiz" : `${tutar(k).toLocaleString("tr-TR")} TL`}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        k.odeme_durumu === "muaf" ? "bg-turkuaz/10 text-turkuaz" : "bg-green-500/10 text-green-400"
                      }`}
                    >
                      {k.odeme_durumu === "muaf" ? "Ücretsiz deneme" : "Ödendi"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <aside className="flex flex-col gap-4 lg:col-span-2">
          <div className="rounded-xl border border-white/10 bg-gece-yuzey p-5">
            <h2 className="text-sm font-bold text-white">Aylık harcama</h2>
            {aylar.length === 0 ? (
              <p className="mt-3 text-sm text-white/50">Henüz veri yok.</p>
            ) : (
              <ul className="mt-4 flex flex-col gap-3">
                {aylar.map(([anahtar, deger]) => (
                  <li key={anahtar}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="capitalize text-white/60">{ayAdi(anahtar)}</span>
                      <span className="font-semibold text-white">{deger.toLocaleString("tr-TR")} TL</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                      <div className="h-full rounded-full bg-turkuaz" style={{ width: `${Math.round((deger / enYuksek) * 100)}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-white/10 bg-gece-yuzey p-5">
            <h2 className="text-sm font-bold text-white">Ücretsiz deneme</h2>
            <p className="mt-2 text-sm text-white/60">
              {denemeler.length > 0
                ? "İlk 5 dakikalık ücretsiz denemeni kullandın. Sonraki görüşmeler için paket seçebilirsin."
                : "İlk 5 dakikalık görüşmen ücretsiz. İlk talebinde paket almana gerek yok."}
            </p>
          </div>

          <p className="flex items-start gap-2 rounded-xl bg-gece-yuzey px-4 py-3 text-xs leading-relaxed text-white/40">
            <IconOnay className="mt-0.5 h-4 w-4 shrink-0 text-turkuaz" />
            Ödemelerin PayTR güvenli ödeme altyapısı üzerinden alınır. Kart bilgilerin Hukukim&apos;de saklanmaz. İade
            koşulları için İptal ve İade Koşulları sayfasına bakabilirsin.
          </p>
        </aside>
      </div>
    </MuvekkilShell>
  );
}
