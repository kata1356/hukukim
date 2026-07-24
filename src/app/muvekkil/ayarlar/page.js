"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import PanelHeader from "@/components/PanelHeader";
import Spinner from "@/components/Spinner";
import TextField from "@/components/TextField";
import Button from "@/components/Button";
import HesapSilButonu from "@/components/HesapSilButonu";
import { SEHIRLER } from "@/lib/sehirler";

export default function MuvekkilAyarlar() {
  const router = useRouter();
  const [sayfaYukleniyor, setSayfaYukleniyor] = useState(true);
  const [profil, setProfil] = useState(null);
  const [form, setForm] = useState({ adSoyad: "", telefon: "", sehir: "" });
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [hata, setHata] = useState(null);
  const [basariMesaji, setBasariMesaji] = useState(null);

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

      if (iptalEdildi) return;
      setProfil(muvekkilProfili);
      setForm({
        adSoyad: muvekkilProfili.ad_soyad ?? "",
        telefon: muvekkilProfili.telefon ?? "",
        sehir: muvekkilProfili.sehir ?? "",
      });
      setSayfaYukleniyor(false);
    }

    veriGetir();
    return () => {
      iptalEdildi = true;
    };
  }, [router]);

  function alanGuncelle(alan, deger) {
    setForm((onceki) => ({ ...onceki, [alan]: deger }));
  }

  async function kaydet(e) {
    e.preventDefault();
    setHata(null);
    setBasariMesaji(null);
    setKaydediliyor(true);

    const { error } = await supabase
      .from("muvekkiller")
      .update({
        ad_soyad: form.adSoyad,
        telefon: form.telefon,
        sehir: form.sehir,
      })
      .eq("id", profil.id);

    if (error) {
      setHata("Kaydedilirken bir hata oluştu, lütfen tekrar dene.");
      setKaydediliyor(false);
      return;
    }

    setBasariMesaji("Bilgilerin güncellendi.");
    setKaydediliyor(false);
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

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
        <div>
          <h1 className="text-xl font-bold text-white">Ayarlar</h1>
          <p className="mt-1 text-sm text-white/60">Profil bilgilerini güncelle.</p>
        </div>

        <form onSubmit={kaydet} className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-gece-yuzey p-6">
          <TextField
            label="Ad Soyad"
            id="adSoyad"
            type="text"
            required
            value={form.adSoyad}
            onChange={(e) => alanGuncelle("adSoyad", e.target.value)}
          />
          <TextField
            label="E-posta"
            id="email"
            type="email"
            value={profil.email}
            disabled
          />
          <TextField
            label="Telefon"
            id="telefon"
            type="tel"
            required
            value={form.telefon}
            onChange={(e) => alanGuncelle("telefon", e.target.value)}
            placeholder="05XX XXX XX XX"
          />
          <TextField
            label="Şehir"
            id="sehir"
            as="select"
            required
            value={form.sehir}
            onChange={(e) => alanGuncelle("sehir", e.target.value)}
          >
            <option value="" disabled>
              Şehir seç
            </option>
            {SEHIRLER.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </TextField>

          {hata && (
            <p className="rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-400 ring-1 ring-red-500/20">{hata}</p>
          )}
          {basariMesaji && (
            <p className="rounded-lg bg-green-500/10 px-4 py-2.5 text-sm text-green-400 ring-1 ring-green-500/20">
              {basariMesaji}
            </p>
          )}

          <Button type="submit" yukleniyor={kaydediliyor} className="w-auto self-start">
            Kaydet
          </Button>
        </form>

        <div className="flex justify-center border-t border-white/5 pt-6">
          <HesapSilButonu />
        </div>
      </main>
    </div>
  );
}
