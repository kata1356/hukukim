"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import AdminShell from "@/components/AdminShell";
import DurumRozeti from "@/components/DurumRozeti";
import GorusmeSekliEtiketi from "@/components/GorusmeSekliEtiketi";
import Spinner from "@/components/Spinner";
import { tarihFormatla } from "@/lib/gorusmeSekli";
import { IconKonum, IconUzmanlik, IconOnay, IconRed, IconYildirim, IconTakvim, IconKalem } from "@/components/icons";

const DURUM_FILTRELERI = [
  { deger: "hepsi", etiket: "Hepsi" },
  { deger: "bekliyor", etiket: "Bekliyor" },
  { deger: "kabul", etiket: "Kabul Edildi" },
  { deger: "red", etiket: "Reddedildi" },
];

export default function AdminTalepler() {
  const [yukleniyor, setYukleniyor] = useState(true);
  const [talepler, setTalepler] = useState([]);
  const [durumFiltresi, setDurumFiltresi] = useState("hepsi");
  const [islemYukleniyor, setIslemYukleniyor] = useState(null);
  const [hata, setHata] = useState(null);

  useEffect(() => {
    let iptalEdildi = false;

    async function veriGetir() {
      const { data } = await supabase
        .from("randevu_talepleri")
        .select("*, avukatlar(ad_soyad)")
        .order("created_at", { ascending: false });

      if (!iptalEdildi) {
        setTalepler(data ?? []);
        setYukleniyor(false);
      }
    }

    veriGetir();
    return () => {
      iptalEdildi = true;
    };
  }, []);

  const filtrelenmisListe = useMemo(() => {
    if (durumFiltresi === "hepsi") return talepler;
    return talepler.filter((t) => t.durum === durumFiltresi);
  }, [talepler, durumFiltresi]);

  async function durumGuncelle(talepId, durum) {
    setHata(null);
    setIslemYukleniyor(talepId);

    const { error } = await supabase.from("randevu_talepleri").update({ durum }).eq("id", talepId);

    if (error) {
      setHata("Talep güncellenirken bir hata oluştu.");
      setIslemYukleniyor(null);
      return;
    }

    setTalepler((oncekiler) => oncekiler.map((t) => (t.id === talepId ? { ...t, durum } : t)));
    setIslemYukleniyor(null);
  }

  async function talebiKaldir(talepId) {
    if (!confirm("Bu talebi kalıcı olarak kaldırmak istediğine emin misin?")) return;

    setHata(null);
    setIslemYukleniyor(talepId);

    const { error } = await supabase.from("randevu_talepleri").delete().eq("id", talepId);

    if (error) {
      setHata("Talep kaldırılırken bir hata oluştu.");
      setIslemYukleniyor(null);
      return;
    }

    setTalepler((oncekiler) => oncekiler.filter((t) => t.id !== talepId));
    setIslemYukleniyor(null);
  }

  return (
    <AdminShell baslik="Talepler" aciklama="Platformdaki tüm randevu taleplerini görüntüle ve yönet.">
      <div className="mb-5 flex flex-wrap gap-2">
        {DURUM_FILTRELERI.map(({ deger, etiket }) => (
          <button
            key={deger}
            onClick={() => setDurumFiltresi(deger)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              durumFiltresi === deger
                ? "bg-vurgu text-yonetim"
                : "border border-yonetim-kenar text-white/60 hover:bg-white/5"
            }`}
          >
            {etiket}
          </button>
        ))}
      </div>

      {hata && (
        <p className="mb-4 rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-400 ring-1 ring-red-500/20">
          {hata}
        </p>
      )}

      {yukleniyor ? (
        <p className="text-sm text-white/40">Yükleniyor...</p>
      ) : filtrelenmisListe.length === 0 ? (
        <p className="rounded-xl border border-dashed border-yonetim-kenar p-8 text-center text-sm text-white/40">
          Bu filtreyle eşleşen talep yok.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtrelenmisListe.map((talep) => (
            <div key={talep.id} className="rounded-xl border border-yonetim-kenar bg-yonetim-kutu p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {talep.acil && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2.5 py-0.5 text-[11px] font-bold text-white">
                        <IconYildirim className="h-3 w-3" />
                        ACİL
                      </span>
                    )}
                    <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] font-semibold text-white/50">
                      {talep.tur === "genel" ? "Genel Havuz" : "Direkt"}
                    </span>
                    <p className="font-semibold text-white">{talep.konu || talep.hedef_uzmanlik_alani}</p>
                  </div>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/50">
                    <span>{talep.muvekkil_ad_soyad}</span>
                    <span className="flex items-center gap-1">
                      <IconKonum className="h-3.5 w-3.5" />
                      {talep.hedef_sehir || "—"}
                    </span>
                    <span className="flex items-center gap-1">
                      <IconUzmanlik className="h-3.5 w-3.5" />
                      {talep.hedef_uzmanlik_alani || "—"}
                    </span>
                    <span className="flex items-center gap-1">
                      <IconTakvim className="h-3.5 w-3.5" />
                      {tarihFormatla(talep.tarih)}
                    </span>
                    <GorusmeSekliEtiketi deger={talep.gorusme_sekli} />
                  </p>
                  <p className="mt-1 text-xs text-white/40">
                    Avukat: {talep.avukatlar?.ad_soyad ?? (talep.avukat_id ? "—" : "Henüz atanmadı")}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <DurumRozeti durum={talep.durum} />
                  <Link
                    href={`/admin/talepler/${talep.id}`}
                    className="flex items-center gap-1.5 rounded-full border border-yonetim-kenar px-3 py-1.5 text-xs font-semibold text-white/60 transition hover:bg-white/5"
                  >
                    <IconKalem className="h-3.5 w-3.5" />
                    Detay
                  </Link>
                </div>
              </div>

              {talep.aciklama && (
                <p className="mt-3 rounded-lg bg-white/5 p-3 text-sm text-white/60">{talep.aciklama}</p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {talep.durum !== "kabul" && (
                  <button
                    onClick={() => durumGuncelle(talep.id, "kabul")}
                    disabled={islemYukleniyor === talep.id}
                    className="flex items-center gap-1.5 rounded-full bg-vurgu px-3 py-1.5 text-xs font-bold text-yonetim transition hover:opacity-90 disabled:opacity-50"
                  >
                    <IconOnay className="h-3.5 w-3.5" />
                    Kabul Et
                  </button>
                )}
                {talep.durum !== "red" && (
                  <button
                    onClick={() => durumGuncelle(talep.id, "red")}
                    disabled={islemYukleniyor === talep.id}
                    className="flex items-center gap-1.5 rounded-full border border-red-500/30 px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                  >
                    <IconRed className="h-3.5 w-3.5" />
                    Reddet
                  </button>
                )}
                {talep.durum !== "bekliyor" && (
                  <button
                    onClick={() => durumGuncelle(talep.id, "bekliyor")}
                    disabled={islemYukleniyor === talep.id}
                    className="flex items-center gap-1.5 rounded-full border border-yonetim-kenar px-3 py-1.5 text-xs font-semibold text-white/60 transition hover:bg-white/5 disabled:opacity-50"
                  >
                    Bekliyora Al
                  </button>
                )}
                <button
                  onClick={() => talebiKaldir(talep.id)}
                  disabled={islemYukleniyor === talep.id}
                  className="ml-auto flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white/40 transition hover:bg-white/5 hover:text-red-400 disabled:opacity-50"
                >
                  {islemYukleniyor === talep.id ? <Spinner className="h-3.5 w-3.5" /> : null}
                  Talebi Kaldır
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
