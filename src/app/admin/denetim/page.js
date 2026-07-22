"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AdminShell from "@/components/AdminShell";
import { TABLO_ADLARI, kimlikOzeti, degisenAlanlar } from "@/lib/denetim";
import { IconArti, IconKalem, IconRed } from "@/components/icons";

const ISLEM_AYARLARI = {
  ekle: { etiket: "Eklendi", sinif: "bg-green-500/10 text-green-400 ring-1 ring-green-500/20", Icon: IconArti },
  guncelle: { etiket: "Güncellendi", sinif: "bg-vurgu/10 text-vurgu ring-1 ring-vurgu/20", Icon: IconKalem },
  sil: { etiket: "Silindi", sinif: "bg-red-500/10 text-red-400 ring-1 ring-red-500/20", Icon: IconRed },
};

const TABLO_FILTRELERI = [
  { deger: "hepsi", etiket: "Hepsi" },
  { deger: "avukatlar", etiket: "Avukatlar" },
  { deger: "muvekkiller", etiket: "Müvekkiller" },
  { deger: "randevu_talepleri", etiket: "Talepler" },
  { deger: "yoneticiler", etiket: "Yöneticiler" },
];

export default function AdminDenetim() {
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kayitlar, setKayitlar] = useState([]);
  const [tabloFiltresi, setTabloFiltresi] = useState("hepsi");

  useEffect(() => {
    let iptalEdildi = false;

    async function veriGetir() {
      const { data } = await supabase
        .from("denetim_kayitlari")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      if (!iptalEdildi) {
        setKayitlar(data ?? []);
        setYukleniyor(false);
      }
    }

    veriGetir();
    return () => {
      iptalEdildi = true;
    };
  }, []);

  const filtrelenmisListe = useMemo(() => {
    if (tabloFiltresi === "hepsi") return kayitlar;
    return kayitlar.filter((k) => k.hedef_tablo === tabloFiltresi);
  }, [kayitlar, tabloFiltresi]);

  return (
    <AdminShell baslik="Denetim Kaydı" aciklama="Yöneticilerin yaptığı tüm değişikliklerin geçmişi.">
      <div className="mb-5 flex flex-wrap gap-2">
        {TABLO_FILTRELERI.map(({ deger, etiket }) => (
          <button
            key={deger}
            onClick={() => setTabloFiltresi(deger)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              tabloFiltresi === deger
                ? "bg-vurgu text-yonetim"
                : "border border-yonetim-kenar text-white/60 hover:bg-white/5"
            }`}
          >
            {etiket}
          </button>
        ))}
      </div>

      {yukleniyor ? (
        <p className="text-sm text-white/40">Yükleniyor...</p>
      ) : filtrelenmisListe.length === 0 ? (
        <p className="rounded-xl border border-dashed border-yonetim-kenar p-8 text-center text-sm text-white/40">
          Bu filtreyle eşleşen denetim kaydı yok.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtrelenmisListe.map((kayit) => {
            const ayar = ISLEM_AYARLARI[kayit.islem];
            const kimlik =
              kayit.islem === "sil" ? kimlikOzeti(kayit.onceki_veri, kayit.hedef_tablo) : kimlikOzeti(kayit.yeni_veri, kayit.hedef_tablo);
            const degisimler = kayit.islem === "guncelle" ? degisenAlanlar(kayit.onceki_veri, kayit.yeni_veri) : [];

            return (
              <div key={kayit.id} className="rounded-xl border border-yonetim-kenar bg-yonetim-kutu p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${ayar.sinif}`}>
                    <ayar.Icon className="h-3 w-3" />
                    {ayar.etiket}
                  </span>
                  <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-[11px] font-semibold text-white/50">
                    {TABLO_ADLARI[kayit.hedef_tablo] ?? kayit.hedef_tablo}
                  </span>
                  {kimlik && <span className="text-sm font-semibold text-white">{kimlik}</span>}
                </div>

                <p className="mt-2 text-xs text-white/40">
                  <span className="font-semibold text-white/60">{kayit.yonetici_adi}</span>
                  {" · "}
                  {new Date(kayit.created_at).toLocaleString("tr-TR")}
                </p>

                {degisimler.length > 0 && (
                  <div className="mt-3 flex flex-col gap-1.5 border-t border-yonetim-kenar pt-3">
                    {degisimler.map((d) => (
                      <p key={d.etiket} className="text-xs text-white/60">
                        <span className="font-semibold text-white/80">{d.etiket}:</span>{" "}
                        <span className="text-white/40 line-through">{d.eski}</span>{" "}
                        <span className="text-vurgu">→ {d.yeni}</span>
                      </p>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AdminShell>
  );
}
