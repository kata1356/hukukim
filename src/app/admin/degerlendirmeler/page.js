"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AdminShell from "@/components/AdminShell";
import Spinner from "@/components/Spinner";
import { IconYildiz } from "@/components/icons";

const FILTRELER = [
  { deger: "hepsi", etiket: "Hepsi" },
  { deger: "dusuk", etiket: "Düşük Puanlılar (1-2 yıldız)" },
];

function tarihFormatla(tarih) {
  return new Date(tarih).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
}

export default function AdminDegerlendirmeler() {
  const [yukleniyor, setYukleniyor] = useState(true);
  const [degerlendirmeler, setDegerlendirmeler] = useState([]);
  const [filtre, setFiltre] = useState("hepsi");
  const [ozet, setOzet] = useState(null);
  const [ozetYukleniyor, setOzetYukleniyor] = useState(false);
  const [ozetHata, setOzetHata] = useState(null);

  async function ozetOlustur() {
    setOzetHata(null);
    setOzetYukleniyor(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const yanit = await fetch("/api/ai/degerlendirme-ozeti", {
      method: "POST",
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });
    const sonuc = await yanit.json();

    if (!yanit.ok) {
      setOzetHata(sonuc.hata ?? "Özet oluşturulamadı.");
      setOzetYukleniyor(false);
      return;
    }

    setOzet(sonuc);
    setOzetYukleniyor(false);
  }

  useEffect(() => {
    let iptalEdildi = false;

    async function veriGetir() {
      const { data } = await supabase
        .from("degerlendirmeler")
        .select("*, avukatlar(ad_soyad), muvekkiller(ad_soyad)")
        .order("puan", { ascending: true })
        .order("created_at", { ascending: false });

      if (!iptalEdildi) {
        setDegerlendirmeler(data ?? []);
        setYukleniyor(false);
      }
    }

    veriGetir();
    return () => {
      iptalEdildi = true;
    };
  }, []);

  const filtrelenmisListe = useMemo(() => {
    if (filtre === "dusuk") return degerlendirmeler.filter((d) => d.puan <= 2);
    return degerlendirmeler;
  }, [degerlendirmeler, filtre]);

  return (
    <AdminShell baslik="Değerlendirmeler" aciklama="Müvekkillerin avukatlara verdiği puanları ve yorumları incele.">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {FILTRELER.map(({ deger, etiket }) => (
            <button
              key={deger}
              onClick={() => setFiltre(deger)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                filtre === deger ? "bg-vurgu text-yonetim" : "border border-yonetim-kenar text-white/60 hover:bg-white/5"
              }`}
            >
              {etiket}
            </button>
          ))}
        </div>

        <button
          onClick={ozetOlustur}
          disabled={ozetYukleniyor}
          className="flex items-center gap-1.5 rounded-full bg-vurgu px-4 py-1.5 text-xs font-bold text-yonetim transition hover:opacity-90 disabled:opacity-60"
        >
          {ozetYukleniyor && <Spinner className="h-3.5 w-3.5" />}
          Yapay Zeka ile Özetle
        </button>
      </div>

      {ozetHata && (
        <p className="mb-5 rounded-xl border border-red-500/30 bg-red-500/[0.04] p-4 text-sm text-red-400">
          {ozetHata}
        </p>
      )}

      {ozet && (
        <div className="mb-5 flex flex-col gap-4 rounded-xl border border-yonetim-kenar bg-yonetim-kutu p-5">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-white/40">Genel Özet</p>
            <p className="text-sm text-white/80">{ozet.genelOzet}</p>
          </div>

          {ozet.dikkatEdilmesiGerekenler?.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-red-400">
                Dikkat Edilmesi Gerekenler
              </p>
              <ul className="flex flex-col gap-1.5">
                {ozet.dikkatEdilmesiGerekenler.map((madde, i) => (
                  <li key={i} className="rounded-lg bg-red-500/[0.06] px-3 py-2 text-sm text-white/70">
                    {madde}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {ozet.olumluNoktalar?.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-green-400">
                Olumlu Noktalar
              </p>
              <ul className="flex flex-col gap-1.5">
                {ozet.olumluNoktalar.map((madde, i) => (
                  <li key={i} className="rounded-lg bg-green-500/[0.06] px-3 py-2 text-sm text-white/70">
                    {madde}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {yukleniyor ? (
        <p className="text-sm text-white/40">Yükleniyor...</p>
      ) : filtrelenmisListe.length === 0 ? (
        <p className="rounded-xl border border-dashed border-yonetim-kenar p-8 text-center text-sm text-white/40">
          Bu filtreyle eşleşen değerlendirme yok.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtrelenmisListe.map((d) => (
            <div
              key={d.id}
              className={`rounded-xl border p-5 ${
                d.puan <= 2 ? "border-red-500/30 bg-red-500/[0.04]" : "border-yonetim-kenar bg-yonetim-kutu"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{d.avukatlar?.ad_soyad ?? "Bilinmiyor"}</p>
                  <p className="text-xs text-white/40">Müvekkil: {d.muvekkiller?.ad_soyad ?? "Bilinmiyor"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <IconYildiz key={i} className={`h-4 w-4 ${i < d.puan ? "text-vurgu" : "text-white/15"}`} />
                    ))}
                  </div>
                  <span className="text-xs text-white/40">{tarihFormatla(d.created_at)}</span>
                </div>
              </div>

              {d.yorum && <p className="mt-3 rounded-lg bg-white/5 p-3 text-sm text-white/70">{d.yorum}</p>}
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
