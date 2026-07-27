"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import PanelHeader from "@/components/PanelHeader";
import Spinner from "@/components/Spinner";
import Modal from "@/components/Modal";
import { BAKIYE_PAKETLERI, OZEL_BAKIYE_MIN, OZEL_BAKIYE_MAX } from "@/lib/odemeYardimci";
import TextField from "@/components/TextField";
import Button from "@/components/Button";
import { IconEtiket } from "@/components/icons";

export default function MuvekkilBakiyeYukle() {
  const router = useRouter();
  const [sayfaYukleniyor, setSayfaYukleniyor] = useState(true);
  const [profil, setProfil] = useState(null);
  const [odemeToken, setOdemeToken] = useState(null);
  const [secilenTutar, setSecilenTutar] = useState(null);
  const [ozelTutar, setOzelTutar] = useState("");
  const [hata, setHata] = useState(() => {
    if (typeof window === "undefined") return null;
    const sonuc = new URLSearchParams(window.location.search).get("odeme");
    return sonuc === "basarisiz" ? "Ödeme tamamlanamadı, tekrar deneyebilirsin." : null;
  });
  const [basariMesaji, setBasariMesaji] = useState(() => {
    if (typeof window === "undefined") return null;
    const sonuc = new URLSearchParams(window.location.search).get("odeme");
    return sonuc === "basarili" ? "Bakiyen yüklendi." : null;
  });

  useEffect(() => {
    if (window.location.search.includes("odeme=")) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

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
        .select("ad_soyad")
        .eq("id", user.id)
        .maybeSingle();

      if (!muvekkilProfili) {
        router.push("/giris");
        return;
      }

      if (iptalEdildi) return;
      setProfil(muvekkilProfili);
      setSayfaYukleniyor(false);
    }

    veriGetir();
    return () => {
      iptalEdildi = true;
    };
  }, [router]);

  async function bakiyeYukle(tutar) {
    setHata(null);
    setSecilenTutar(tutar);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const yanit = await fetch("/api/bakiye/yukle", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ tutar }),
    });
    const sonuc = await yanit.json();

    if (!yanit.ok) {
      setHata(sonuc.hata ?? "Ödeme başlatılamadı.");
      setSecilenTutar(null);
      return;
    }

    setOdemeToken(sonuc.token);
    setSecilenTutar(null);
  }

  function ozelTutarYukle(e) {
    e.preventDefault();
    const tutar = Number(ozelTutar);

    if (!Number.isInteger(tutar) || tutar < OZEL_BAKIYE_MIN || tutar > OZEL_BAKIYE_MAX) {
      setHata(`Lütfen ${OZEL_BAKIYE_MIN} - ${OZEL_BAKIYE_MAX} TL arasında tam sayı bir tutar gir.`);
      return;
    }

    bakiyeYukle(tutar);
  }

  if (sayfaYukleniyor) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-gece">
        <Spinner className="h-8 w-8 text-white" />
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col bg-gece">
      <PanelHeader adSoyad={profil.ad_soyad} panelAdi="Müvekkil Paneli" panelYolu="/muvekkil" />

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
        <div>
          <h1 className="text-xl font-bold text-white">Bakiye Yükle</h1>
          <p className="mt-1 text-sm text-white/60">
            Bir paket seç, ödeme sonrası bakiyen anında hesabına yansır.
          </p>
        </div>

        {basariMesaji && (
          <p className="rounded-lg bg-green-500/10 px-4 py-2.5 text-sm text-green-400 ring-1 ring-green-500/20">
            {basariMesaji}
          </p>
        )}
        {hata && (
          <p className="rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-400 ring-1 ring-red-500/20">{hata}</p>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {BAKIYE_PAKETLERI.map((tutar) => (
            <button
              key={tutar}
              onClick={() => bakiyeYukle(tutar)}
              disabled={secilenTutar !== null}
              className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-gece-yuzey p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-turkuaz/40 hover:shadow-md disabled:opacity-60"
            >
              {secilenTutar === tutar ? (
                <Spinner className="h-6 w-6 text-turkuaz" />
              ) : (
                <IconEtiket className="h-6 w-6 text-turkuaz" />
              )}
              <span className="text-2xl font-bold text-white">{tutar} TL</span>
              <span className="text-xs text-white/40">Bakiye Yükle</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold text-white/30">
          <span className="h-px flex-1 bg-white/10" />
          YA DA KENDİ TUTARINI GİR
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <form onSubmit={ozelTutarYukle} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <TextField
              label="Tutar (TL)"
              id="ozelTutar"
              type="number"
              min={OZEL_BAKIYE_MIN}
              max={OZEL_BAKIYE_MAX}
              step="1"
              value={ozelTutar}
              onChange={(e) => setOzelTutar(e.target.value)}
              placeholder={`${OZEL_BAKIYE_MIN} - ${OZEL_BAKIYE_MAX} TL arası`}
            />
          </div>
          <Button type="submit" yukleniyor={secilenTutar !== null} className="w-auto sm:self-end">
            Yükle
          </Button>
        </form>
      </main>

      {odemeToken && (
        <Modal baslik="Bakiye Yükleme Ödemesi" onKapat={() => setOdemeToken(null)}>
          <div className="overflow-hidden rounded-xl bg-white">
            <iframe
              src={`https://www.paytr.com/odeme/guvenli/${odemeToken}`}
              title="PayTR Ödeme"
              style={{ width: "100%", height: "600px", border: "none" }}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
