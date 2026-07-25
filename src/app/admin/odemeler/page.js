"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AdminShell from "@/components/AdminShell";
import { avukatPayiHesapla } from "@/lib/odemeYardimci";

export default function AdminOdemeler() {
  const [yukleniyor, setYukleniyor] = useState(true);
  const [talepler, setTalepler] = useState([]);
  const [onayBekleyenAvukatId, setOnayBekleyenAvukatId] = useState(null);
  const [isleniyor, setIsleniyor] = useState(false);

  useEffect(() => {
    veriGetir();
  }, []);

  async function veriGetir() {
    setYukleniyor(true);
    const { data } = await supabase
      .from("randevu_talepleri")
      .select("id, avukat_id, muvekkil_ad_soyad, tarih, gorusme_suresi_dakika, odeme_tutari, avukata_odendi, avukatlar(ad_soyad, iban)")
      .eq("odeme_durumu", "odendi")
      .order("tarih", { ascending: false });

    setTalepler(data ?? []);
    setYukleniyor(false);
  }

  const avukatBazliOzet = useMemo(() => {
    const map = new Map();
    for (const t of talepler) {
      if (!map.has(t.avukat_id)) {
        map.set(t.avukat_id, {
          avukatId: t.avukat_id,
          adSoyad: t.avukatlar?.ad_soyad ?? "Bilinmiyor",
          iban: t.avukatlar?.iban ?? null,
          bekleyenTutar: 0,
          bekleyenBrutTutar: 0,
          bekleyenTalepIdleri: [],
          gorusmeler: [],
        });
      }
      const kayit = map.get(t.avukat_id);
      kayit.gorusmeler.push(t);
      if (!t.avukata_odendi) {
        kayit.bekleyenTutar += avukatPayiHesapla(t.odeme_tutari);
        kayit.bekleyenBrutTutar += Number(t.odeme_tutari || 0);
        kayit.bekleyenTalepIdleri.push(t.id);
      }
    }
    return Array.from(map.values())
      .filter((k) => k.bekleyenTalepIdleri.length > 0)
      .sort((a, b) => b.bekleyenTutar - a.bekleyenTutar);
  }, [talepler]);

  async function odendiOlarakIsaretle(kayit) {
    setIsleniyor(true);
    await supabase
      .from("randevu_talepleri")
      .update({ avukata_odendi: true })
      .in("id", kayit.bekleyenTalepIdleri);

    await veriGetir();
    setOnayBekleyenAvukatId(null);
    setIsleniyor(false);
  }

  return (
    <AdminShell
      baslik="Avukat Ödemeleri"
      aciklama="Müvekkillerden tahsil edilen tutarların avukatlara IBAN üzerinden havalesini takip et."
    >
      {yukleniyor ? (
        <p className="text-sm text-white/40">Yükleniyor...</p>
      ) : avukatBazliOzet.length === 0 ? (
        <p className="rounded-xl border border-dashed border-yonetim-kenar p-8 text-center text-sm text-white/40">
          Havalesi bekleyen bir hakediş yok.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {avukatBazliOzet.map((kayit) => (
            <div key={kayit.avukatId} className="rounded-xl border border-yonetim-kenar bg-yonetim-kutu p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{kayit.adSoyad}</p>
                  {kayit.iban ? (
                    <p className="mt-0.5 font-mono text-xs text-white/60">{kayit.iban}</p>
                  ) : (
                    <p className="mt-0.5 text-xs text-red-400">IBAN girilmemiş — avukata ulaşman gerekiyor.</p>
                  )}
                  <p className="mt-1 text-xs text-white/40">
                    {kayit.bekleyenTalepIdleri.length} görüşme · havalesi bekleyen
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-lg font-bold text-vurgu">{kayit.bekleyenTutar} TL</span>
                  <span className="text-[11px] text-white/40">Brüt: {kayit.bekleyenBrutTutar} TL (%60 avukat payı)</span>
                  {onayBekleyenAvukatId === kayit.avukatId ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/50">Havaleyi gönderdin mi?</span>
                      <button
                        onClick={() => setOnayBekleyenAvukatId(null)}
                        className="rounded-full border border-yonetim-kenar px-3 py-1 text-xs font-semibold text-white/60 hover:bg-white/5"
                      >
                        Vazgeç
                      </button>
                      <button
                        onClick={() => odendiOlarakIsaretle(kayit)}
                        disabled={isleniyor}
                        className="rounded-full bg-vurgu px-3 py-1 text-xs font-bold text-yonetim disabled:opacity-50"
                      >
                        Evet, Ödendi
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setOnayBekleyenAvukatId(kayit.avukatId)}
                      className="rounded-full border border-yonetim-kenar px-3 py-1 text-xs font-semibold text-white/70 hover:bg-white/5"
                    >
                      Ödendi Olarak İşaretle
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
