"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import PanelHeader from "@/components/PanelHeader";
import Spinner from "@/components/Spinner";
import StatKarti from "@/components/StatKarti";
import { tarihFormatla } from "@/lib/gorusmeSekli";

export default function MuvekkilOdemelerim() {
  const router = useRouter();
  const [sayfaYukleniyor, setSayfaYukleniyor] = useState(true);
  const [profil, setProfil] = useState(null);
  const [odemeler, setOdemeler] = useState([]);

  useEffect(() => {
    let iptalEdildi = false;

    async function veriGetir() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/giris");
        return;
      }

      const { data: muvekkilProfili } = await supabase
        .from("muvekkiller")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (!muvekkilProfili) {
        router.push("/giris");
        return;
      }

      const { data: talepler } = await supabase
        .from("randevu_talepleri")
        .select("*, avukatlar(ad_soyad)")
        .eq("muvekkil_id", user.id)
        .eq("odeme_durumu", "odendi")
        .order("created_at", { ascending: false });

      if (iptalEdildi) return;
      setProfil(muvekkilProfili);
      setOdemeler(talepler ?? []);
      setSayfaYukleniyor(false);
    }

    veriGetir();
    return () => {
      iptalEdildi = true;
    };
  }, [router]);

  if (sayfaYukleniyor) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-gece">
        <Spinner className="h-8 w-8 text-white" />
      </div>
    );
  }

  const toplamHarcanan = odemeler.reduce((t, o) => t + Number(o.odeme_tutari || 0), 0);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-gece">
      <PanelHeader adSoyad={profil.ad_soyad} panelAdi="Müvekkil Paneli" panelYolu="/muvekkil" />

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
        <div>
          <h1 className="text-xl font-bold text-white">Ödemelerim</h1>
          <p className="mt-1 text-sm text-white/60">Geçmiş görüşme paketlerinin özeti.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <StatKarti deger={`${toplamHarcanan} TL`} etiket="Toplam Ödenen" />
          <StatKarti deger={odemeler.length} etiket="Tamamlanan Görüşme" />
        </div>

        <section>
          <h2 className="mb-3 text-sm font-bold text-white">Görüşme Geçmişi</h2>
          {odemeler.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-center text-sm text-white/50">
              Henüz tamamlanan bir görüşmen yok.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {odemeler.map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-gece-yuzey p-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{o.avukatlar?.ad_soyad ?? "Avukat"}</p>
                    <p className="text-xs text-white/40">
                      {tarihFormatla(o.tarih)} · {o.paket_dakika ? `${o.paket_dakika} dk paket` : ""}
                    </p>
                  </div>
                  <span className="font-bold text-turkuaz">
                    {o.odeme_tutari > 0 ? `${o.odeme_tutari} TL` : "Ücretsiz"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
