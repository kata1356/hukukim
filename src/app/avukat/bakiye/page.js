"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import PanelHeader from "@/components/PanelHeader";
import Spinner from "@/components/Spinner";
import StatKarti from "@/components/StatKarti";
import { tarihFormatla } from "@/lib/gorusmeSekli";
import { IconOnay } from "@/components/icons";

export default function AvukatBakiye() {
  const router = useRouter();
  const [sayfaYukleniyor, setSayfaYukleniyor] = useState(true);
  const [profil, setProfil] = useState(null);
  const [kazanclar, setKazanclar] = useState([]);

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

      const { data: avukatProfili } = await supabase
        .from("avukatlar")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (!avukatProfili) {
        router.push("/giris");
        return;
      }

      const { data: talepler } = await supabase
        .from("randevu_talepleri")
        .select("*")
        .eq("avukat_id", user.id)
        .eq("odeme_durumu", "odendi")
        .order("created_at", { ascending: false });

      if (iptalEdildi) return;
      setProfil(avukatProfili);
      setKazanclar(talepler ?? []);
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

  const toplamKazanc = kazanclar.reduce((t, k) => t + Number(k.odeme_tutari || 0), 0);

  return (
    <div className="flex min-h-full flex-1 flex-col bg-gece">
      <PanelHeader adSoyad={profil.ad_soyad} panelAdi="Avukat Paneli" panelYolu="/avukat" />

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
        <div>
          <h1 className="text-xl font-bold text-white">Bakiye</h1>
          <p className="mt-1 text-sm text-white/60">Tamamlanmış ve ödemesi alınmış görüşmelerin özeti.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <StatKarti deger={`${toplamKazanc} TL`} etiket="Toplam Kazanç" />
          <StatKarti deger={kazanclar.length} etiket="Ücretli Görüşme" />
        </div>

        <p className="flex items-start gap-2 rounded-xl bg-gece-yuzey px-4 py-3 text-xs leading-relaxed text-white/40">
          <IconOnay className="mt-0.5 h-4 w-4 shrink-0 text-turkuaz" />
          Bu tutarlar bilgilendirme amaçlıdır. Hak edişlerinin sana aktarılması
          ile ilgili detaylar için ekibimizle iletişime geçebilirsin.
        </p>

        <section>
          <h2 className="mb-3 text-sm font-bold text-white">Görüşme Geçmişi</h2>
          {kazanclar.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-center text-sm text-white/50">
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
                    <p className="text-xs text-white/40">
                      {tarihFormatla(k.tarih)} · {k.gorusme_suresi_dakika} dk
                    </p>
                  </div>
                  <span className="font-bold text-turkuaz">{k.odeme_tutari} TL</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
