"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import PanelHeader from "@/components/PanelHeader";
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

      const { data: kazanclarListesi } = await supabase
        .from("avukat_kazanclari")
        .select("*")
        .eq("avukat_id", user.id)
        .order("tarih", { ascending: false });

      if (iptalEdildi) return;
      setProfil(avukatProfili);
      setKazanclar(kazanclarListesi ?? []);
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

  const toplamKazanc = kazanclar.reduce((t, k) => t + Number(k.kazanilan_miktar || 0), 0);
  const odenenKazanc = kazanclar
    .filter((k) => k.avukata_odendi)
    .reduce((t, k) => t + Number(k.kazanilan_miktar || 0), 0);
  const odenmemisKazanc = toplamKazanc - odenenKazanc;
  const odenenYuzde = toplamKazanc > 0 ? Math.round((odenenKazanc / toplamKazanc) * 100) : 0;

  return (
    <div className="flex min-h-full flex-1 flex-col bg-gece">
      <PanelHeader adSoyad={profil.ad_soyad} panelAdi="Avukat Paneli" panelYolu="/avukat" />

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
        <div>
          <h1 className="text-xl font-bold text-white">Bakiye</h1>
          <p className="mt-1 text-sm text-white/60">Tamamlanmış görüşmelerden kazandığın tutarların özeti.</p>
        </div>

        <div className="rounded-2xl border border-turkuaz/20 bg-gece-yuzey p-6 shadow-sm">
          <p className="text-sm text-white/50">Toplam Kazanç</p>
          <p className="mt-1 text-4xl font-bold text-white">{toplamKazanc} TL</p>

          <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-green-400 transition-all"
              style={{ width: `${odenenYuzde}%` }}
            />
          </div>

          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-white/70">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              Ödendi: <strong className="text-white">{odenenKazanc} TL</strong>
            </span>
            <span className="flex items-center gap-2 text-white/70">
              <span className="h-2 w-2 rounded-full bg-white/20" />
              Bekliyor: <strong className="text-white">{odenmemisKazanc} TL</strong>
            </span>
          </div>
        </div>

        <p className="flex items-start gap-2 rounded-xl bg-gece-yuzey px-4 py-3 text-xs leading-relaxed text-white/40">
          <IconOnay className="mt-0.5 h-4 w-4 shrink-0 text-turkuaz" />
          Görüşme ücretinin %60&apos;ı sana ait. Hakedişlerin, Ayarlar sayfasına
          gireceğin IBAN&apos;a periyodik olarak havale ile gönderilir. Aşağıdaki
          listede her görüşmenin havalesinin yapılıp yapılmadığını görebilirsin.
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
                    <p className="text-xs text-white/40">{tarihSaatFormatla(k.tarih)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-bold text-turkuaz">{k.kazanilan_miktar} TL</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        k.avukata_odendi
                          ? "bg-green-500/10 text-green-400"
                          : "bg-white/5 text-white/40"
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
      </main>
    </div>
  );
}
