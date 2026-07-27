"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import PanelHeader from "@/components/PanelHeader";
import Spinner from "@/components/Spinner";
import StatKarti from "@/components/StatKarti";
import { tarihFormatla } from "@/lib/gorusmeSekli";
import { IconKvkk, IconEtiket } from "@/components/icons";

export default function MuvekkilBakiye() {
  const router = useRouter();
  const [sayfaYukleniyor, setSayfaYukleniyor] = useState(true);
  const [profil, setProfil] = useState(null);
  const [bakiye, setBakiye] = useState(0);
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

      const [{ data: bakiyeSatiri }, { data: talepler }] = await Promise.all([
        supabase.from("muvekkil_bakiyeleri").select("bakiye_miktari").eq("muvekkil_id", user.id).maybeSingle(),
        supabase
          .from("randevu_talepleri")
          .select("*, avukatlar(ad_soyad)")
          .eq("muvekkil_id", user.id)
          .eq("odeme_durumu", "odendi")
          .order("created_at", { ascending: false }),
      ]);

      if (iptalEdildi) return;
      setProfil(muvekkilProfili);
      setBakiye(Number(bakiyeSatiri?.bakiye_miktari || 0));
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
          <h1 className="text-xl font-bold text-white">Bakiye</h1>
          <p className="mt-1 text-sm text-white/60">Görüşme ücretleri güncel bakiyenden düşülür.</p>
        </div>

        <div className="flex flex-col items-center gap-4 rounded-2xl border border-turkuaz/20 bg-gece-yuzey p-6 text-center shadow-md sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="text-sm text-white/60">Güncel Bakiye</p>
            <p className="text-3xl font-bold text-turkuaz">{bakiye} TL</p>
          </div>
          <Link
            href="/muvekkil/bakiye-yukle"
            className="flex shrink-0 items-center gap-2 rounded-full bg-turkuaz px-5 py-2.5 text-sm font-bold text-gece shadow-sm transition hover:-translate-y-0.5 hover:bg-turkuaz-parlak hover:shadow-md"
          >
            <IconEtiket className="h-4 w-4" />
            Bakiye Yükle
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <StatKarti deger={`${toplamHarcanan} TL`} etiket="Toplam Harcanan" />
          <StatKarti deger={odemeler.length} etiket="Tamamlanan Görüşme" />
        </div>

        <p className="flex items-start gap-2 rounded-xl bg-gece-yuzey px-4 py-3 text-xs leading-relaxed text-white/40">
          <IconKvkk className="mt-0.5 h-4 w-4 shrink-0 text-turkuaz" />
          Görüşme başlamadan önce en az 150 TL bakiyen olması gerekir. Görüşme
          sırasında her dakika bakiyenden otomatik düşülür, bakiye biterse
          görüşme sona erer.
        </p>

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
                      {tarihFormatla(o.tarih)} · {o.gorusme_suresi_dakika} dk
                    </p>
                  </div>
                  <span className="font-bold text-turkuaz">{o.odeme_tutari} TL</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
