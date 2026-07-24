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
import { UZMANLIK_ALANLARI } from "@/lib/uzmanlikAlanlari";

export default function AvukatAyarlar() {
  const router = useRouter();
  const [sayfaYukleniyor, setSayfaYukleniyor] = useState(true);
  const [profil, setProfil] = useState(null);
  const [form, setForm] = useState({ adSoyad: "", telefon: "", sehir: "", biyografi: "" });
  const [uzmanlikSecimi, setUzmanlikSecimi] = useState([]);
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

      const { data: avukatProfili } = await supabase
        .from("avukatlar")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (!avukatProfili) {
        router.push("/giris");
        return;
      }

      if (iptalEdildi) return;
      setProfil(avukatProfili);
      setForm({
        adSoyad: avukatProfili.ad_soyad ?? "",
        telefon: avukatProfili.telefon ?? "",
        sehir: avukatProfili.sehir ?? "",
        biyografi: avukatProfili.biyografi ?? "",
      });
      setUzmanlikSecimi(avukatProfili.uzmanlik_alanlari ?? []);
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

  function uzmanlikDegistir(alan) {
    setUzmanlikSecimi((onceki) =>
      onceki.includes(alan) ? onceki.filter((a) => a !== alan) : [...onceki, alan]
    );
  }

  async function kaydet(e) {
    e.preventDefault();
    setHata(null);
    setBasariMesaji(null);

    if (uzmanlikSecimi.length === 0) {
      setHata("En az bir uzmanlık alanı seçmelisin.");
      return;
    }

    setKaydediliyor(true);

    const { error } = await supabase
      .from("avukatlar")
      .update({
        ad_soyad: form.adSoyad,
        telefon: form.telefon,
        sehir: form.sehir,
        biyografi: form.biyografi,
        uzmanlik_alanlari: uzmanlikSecimi,
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
      <PanelHeader adSoyad={profil.ad_soyad} panelAdi="Avukat Paneli" panelYolu="/avukat" />

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
        <div>
          <h1 className="text-xl font-bold text-white">Ayarlar</h1>
          <p className="mt-1 text-sm text-white/60">Profil bilgilerini güncelle.</p>
        </div>

        <form onSubmit={kaydet} className="flex flex-col gap-5 rounded-2xl border border-white/10 bg-gece-yuzey p-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <TextField
              label="Ad Soyad"
              id="adSoyad"
              type="text"
              required
              value={form.adSoyad}
              onChange={(e) => alanGuncelle("adSoyad", e.target.value)}
            />
            <TextField label="E-posta" id="email" type="email" value={profil.email} disabled />
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
              label="Baro Sicil Numarası"
              id="baroSicilNo"
              type="text"
              value={profil.baro_sicil_no}
              disabled
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
          </div>
          <p className="-mt-3 text-xs text-white/40">
            Baro sicil numaranı değiştirmek istersen bizimle iletişime geç.
          </p>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-white">Uzmanlık Alanları</span>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg border border-white/15 p-4 sm:grid-cols-3">
              {UZMANLIK_ALANLARI.map((alan) => (
                <label key={alan} className="flex items-center gap-2 text-sm text-white/70">
                  <input
                    type="checkbox"
                    checked={uzmanlikSecimi.includes(alan)}
                    onChange={() => uzmanlikDegistir(alan)}
                    className="h-4 w-4 shrink-0 rounded border-white/20 bg-white/5 text-turkuaz focus:ring-turkuaz/40"
                  />
                  {alan}
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <TextField
              label="Biyografi"
              id="biyografi"
              as="textarea"
              rows={4}
              required
              minLength={100}
              value={form.biyografi}
              onChange={(e) => alanGuncelle("biyografi", e.target.value)}
            />
            <p className={`text-xs ${form.biyografi.length < 100 ? "text-white/40" : "text-turkuaz"}`}>
              En az 100 karakter gerekli · şu an {form.biyografi.length}
            </p>
          </div>

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
