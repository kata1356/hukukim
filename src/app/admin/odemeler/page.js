"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AdminShell from "@/components/AdminShell";

// Hakediş düzeni (Avukat Hizmet Sözleşmesi Madde 7): haftalık dönemler (Pazartesi-Pazar),
// ödeme vadesi ilgili haftanın bitiminden sonraki 7 iş günü. Resmi tatiller hesaba katılmaz.
const VADE_IS_GUNU = 7;

function haftaBasi(tarih) {
  const t = new Date(tarih);
  t.setHours(0, 0, 0, 0);
  t.setDate(t.getDate() - ((t.getDay() + 6) % 7));
  return t;
}

function vadeTarihi(basi) {
  const v = new Date(basi);
  v.setDate(v.getDate() + 6); // Pazar
  let eklenen = 0;
  while (eklenen < VADE_IS_GUNU) {
    v.setDate(v.getDate() + 1);
    const gun = v.getDay();
    if (gun !== 0 && gun !== 6) eklenen += 1;
  }
  return v;
}

function gunFormatla(tarih) {
  return tarih.toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
}

function tl(deger) {
  return `${Number(deger).toLocaleString("tr-TR")} TL`;
}

export default function AdminOdemeler() {
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kazanclar, setKazanclar] = useState([]);
  const [onayBekleyen, setOnayBekleyen] = useState(null);
  const [isleniyor, setIsleniyor] = useState(false);
  const [hata, setHata] = useState(null);
  const [kopyalandi, setKopyalandi] = useState(false);

  useEffect(() => {
    veriGetir();
  }, []);

  async function veriGetir() {
    setYukleniyor(true);
    const { data } = await supabase
      .from("avukat_kazanclari")
      .select("id, avukat_id, muvekkil_ad_soyad, tarih, kazanilan_miktar, avukata_odendi, avukatlar(ad_soyad, iban)")
      .order("tarih", { ascending: false });

    setKazanclar(data ?? []);
    setYukleniyor(false);
  }

  // Avukat -> hafta -> kayıtlar
  const { avukatlar, vadesiGelen, vadesiGelmeyen, odenen } = useMemo(() => {
    const simdi = new Date();
    const avukatHaritasi = new Map();
    let vadeGelenToplam = 0;
    let vadeGelmeyenToplam = 0;
    let odenenToplam = 0;

    for (const k of kazanclar) {
      const tutar = Number(k.kazanilan_miktar || 0);
      if (k.avukata_odendi) {
        odenenToplam += tutar;
        continue;
      }

      if (!avukatHaritasi.has(k.avukat_id)) {
        avukatHaritasi.set(k.avukat_id, {
          avukatId: k.avukat_id,
          adSoyad: k.avukatlar?.ad_soyad ?? "Bilinmiyor",
          iban: k.avukatlar?.iban ?? null,
          haftalar: new Map(),
        });
      }
      const avukat = avukatHaritasi.get(k.avukat_id);

      const basi = haftaBasi(k.tarih);
      const anahtar = basi.toISOString();
      if (!avukat.haftalar.has(anahtar)) {
        const vade = vadeTarihi(basi);
        const sonu = new Date(basi);
        sonu.setDate(sonu.getDate() + 6);
        avukat.haftalar.set(anahtar, {
          anahtar,
          basi,
          sonu,
          vade,
          vadesiGeldi: simdi >= vade,
          tutar: 0,
          kayitIdleri: [],
        });
      }
      const hafta = avukat.haftalar.get(anahtar);
      hafta.tutar += tutar;
      hafta.kayitIdleri.push(k.id);

      if (hafta.vadesiGeldi) vadeGelenToplam += tutar;
      else vadeGelmeyenToplam += tutar;
    }

    const liste = Array.from(avukatHaritasi.values())
      .map((a) => {
        const haftalar = Array.from(a.haftalar.values()).sort((x, y) => x.basi - y.basi);
        return {
          ...a,
          haftalar,
          vadesiGelenTutar: haftalar.filter((h) => h.vadesiGeldi).reduce((t, h) => t + h.tutar, 0),
          toplamTutar: haftalar.reduce((t, h) => t + h.tutar, 0),
        };
      })
      .sort((a, b) => b.vadesiGelenTutar - a.vadesiGelenTutar || b.toplamTutar - a.toplamTutar);

    return {
      avukatlar: liste,
      vadesiGelen: vadeGelenToplam,
      vadesiGelmeyen: vadeGelmeyenToplam,
      odenen: odenenToplam,
    };
  }, [kazanclar]);

  async function haftayiOdendiIsaretle(avukat, hafta) {
    setHata(null);
    setIsleniyor(true);

    const { data, error } = await supabase
      .from("avukat_kazanclari")
      .update({ avukata_odendi: true, odeme_tarihi: new Date().toISOString() })
      .in("id", hafta.kayitIdleri)
      .eq("avukata_odendi", false)
      .select("id");

    if (error) {
      console.error("Hakediş ödendi işaretlenemedi:", error);
      setHata("İşaretlenemedi. supabase-hakedis.sql dosyasını çalıştırdığından emin ol.");
    } else if ((data?.length ?? 0) !== hafta.kayitIdleri.length) {
      setHata("Bazı kayıtlar zaten ödenmiş görünüyor, liste yenilendi.");
    }

    await veriGetir();
    setOnayBekleyen(null);
    setIsleniyor(false);
  }

  async function havaleListesiniKopyala() {
    const satirlar = avukatlar
      .filter((a) => a.vadesiGelenTutar > 0)
      .map((a) => `${a.adSoyad}\t${a.iban ?? "IBAN YOK"}\t${a.vadesiGelenTutar} TL`);
    if (satirlar.length === 0) return;
    try {
      await navigator.clipboard.writeText(["Ad Soyad\tIBAN\tTutar", ...satirlar].join("\n"));
      setKopyalandi(true);
      setTimeout(() => setKopyalandi(false), 2500);
    } catch {
      setHata("Kopyalanamadı, listeyi elle seçebilirsin.");
    }
  }

  return (
    <AdminShell
      baslik="Avukat Ödemeleri"
      aciklama="Avukatlara haftalık hakediş havalesi: her hafta (Pazartesi-Pazar) bitiminden sonraki 7 iş günü içinde ödenir."
    >
      {yukleniyor ? (
        <p className="text-sm text-white/40">Yükleniyor...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-yonetim-kenar bg-yonetim-kutu p-4">
              <p className="text-xs text-white/50">Vadesi gelen (şimdi ödenecek)</p>
              <p className="mt-1 text-2xl font-bold text-vurgu">{tl(vadesiGelen)}</p>
            </div>
            <div className="rounded-xl border border-yonetim-kenar bg-yonetim-kutu p-4">
              <p className="text-xs text-white/50">Henüz vadesi gelmeyen</p>
              <p className="mt-1 text-2xl font-bold text-white">{tl(vadesiGelmeyen)}</p>
            </div>
            <div className="rounded-xl border border-yonetim-kenar bg-yonetim-kutu p-4">
              <p className="text-xs text-white/50">Şimdiye kadar ödenen</p>
              <p className="mt-1 text-2xl font-bold text-white/80">{tl(odenen)}</p>
            </div>
          </div>

          {vadesiGelen > 0 && (
            <button
              onClick={havaleListesiniKopyala}
              className="w-fit rounded-full border border-yonetim-kenar px-4 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/5"
            >
              {kopyalandi ? "Kopyalandı ✓" : "Vadesi gelenlerin havale listesini kopyala (Ad, IBAN, Tutar)"}
            </button>
          )}

          {hata && <p className="rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-400">{hata}</p>}

          {avukatlar.length === 0 ? (
            <p className="rounded-xl border border-dashed border-yonetim-kenar p-8 text-center text-sm text-white/40">
              Havalesi bekleyen bir hakediş yok.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {avukatlar.map((avukat) => (
                <div key={avukat.avukatId} className="rounded-xl border border-yonetim-kenar bg-yonetim-kutu p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{avukat.adSoyad}</p>
                      {avukat.iban ? (
                        <p className="mt-0.5 font-mono text-xs text-white/60">{avukat.iban}</p>
                      ) : (
                        <p className="mt-0.5 text-xs text-red-400">IBAN girilmemiş, avukata ulaşman gerekiyor.</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-vurgu">{tl(avukat.vadesiGelenTutar)}</p>
                      <p className="text-xs text-white/40">vadesi gelen · toplam bekleyen {tl(avukat.toplamTutar)}</p>
                    </div>
                  </div>

                  <ul className="mt-4 flex flex-col divide-y divide-white/5 border-t border-white/10">
                    {avukat.haftalar.map((hafta) => {
                      const onayAcik = onayBekleyen === `${avukat.avukatId}|${hafta.anahtar}`;
                      return (
                        <li key={hafta.anahtar} className="flex flex-wrap items-center justify-between gap-3 py-3">
                          <div>
                            <p className="text-sm font-medium text-white">
                              {gunFormatla(hafta.basi)} – {gunFormatla(hafta.sonu)}
                            </p>
                            <p className="text-xs text-white/40">
                              {hafta.kayitIdleri.length} görüşme · vade {gunFormatla(hafta.vade)}
                              {hafta.vadesiGeldi ? (
                                <span className="ml-2 rounded bg-amber-500/15 px-1.5 py-0.5 font-semibold text-amber-400">
                                  Vadesi geldi
                                </span>
                              ) : (
                                <span className="ml-2 text-white/30">vadesi gelmedi</span>
                              )}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-white">{tl(hafta.tutar)}</span>
                            {onayAcik ? (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-white/50">Havaleyi gönderdin mi?</span>
                                <button
                                  onClick={() => setOnayBekleyen(null)}
                                  className="rounded-full border border-yonetim-kenar px-3 py-1 text-xs font-semibold text-white/60 hover:bg-white/5"
                                >
                                  Vazgeç
                                </button>
                                <button
                                  onClick={() => haftayiOdendiIsaretle(avukat, hafta)}
                                  disabled={isleniyor}
                                  className="rounded-full bg-vurgu px-3 py-1 text-xs font-bold text-yonetim disabled:opacity-50"
                                >
                                  Evet, Ödendi
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setOnayBekleyen(`${avukat.avukatId}|${hafta.anahtar}`)}
                                className="rounded-full border border-yonetim-kenar px-3 py-1 text-xs font-semibold text-white/70 hover:bg-white/5"
                              >
                                Ödendi İşaretle
                              </button>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </AdminShell>
  );
}
