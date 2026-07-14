"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { SEHIRLER } from "@/lib/sehirler";
import { UZMANLIK_ALANLARI } from "@/lib/uzmanlikAlanlari";
import { turkceHataMesaji, emailZatenKayitliMi } from "@/lib/hataMesajlari";
import AuthShell from "@/components/AuthShell";
import TextField from "@/components/TextField";
import KvkkOnay from "@/components/KvkkOnay";
import Button from "@/components/Button";

export default function AvukatKayit() {
  const router = useRouter();

  const [form, setForm] = useState({
    adSoyad: "",
    email: "",
    sifre: "",
    telefon: "",
    baroSicilNo: "",
    sehir: "",
    biyografi: "",
  });
  const [uzmanlikSecimi, setUzmanlikSecimi] = useState([]);
  const [kvkkOnay, setKvkkOnay] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState(null);
  const [zatenKayitli, setZatenKayitli] = useState(false);

  function alanGuncelle(alan, deger) {
    setForm((onceki) => ({ ...onceki, [alan]: deger }));
  }

  function uzmanlikDegistir(alan) {
    setUzmanlikSecimi((onceki) =>
      onceki.includes(alan)
        ? onceki.filter((a) => a !== alan)
        : [...onceki, alan]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setHata(null);
    setZatenKayitli(false);

    if (uzmanlikSecimi.length === 0) {
      setHata("En az bir uzmanlık alanı seçmelisin.");
      return;
    }

    setYukleniyor(true);

    const kayitYaniti = await fetch("/api/kayit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rol: "avukat",
        email: form.email,
        sifre: form.sifre,
        profil: {
          ad_soyad: form.adSoyad,
          telefon: form.telefon,
          baro_sicil_no: form.baroSicilNo,
          sehir: form.sehir,
          uzmanlik_alanlari: uzmanlikSecimi,
          biyografi: form.biyografi,
          kvkk_onay: kvkkOnay,
        },
      }),
    });
    const kayitSonucu = await kayitYaniti.json();

    if (!kayitYaniti.ok) {
      console.error("Avukat kayıt hatası:", kayitSonucu.hata);
      setHata(turkceHataMesaji(kayitSonucu.hata));
      setZatenKayitli(emailZatenKayitliMi(kayitSonucu.hata));
      setYukleniyor(false);
      return;
    }

    const { error: girisHatasi } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.sifre,
    });

    if (girisHatasi) {
      console.error("Kayıt sonrası giriş hatası:", girisHatasi);
      setHata(turkceHataMesaji(girisHatasi));
      setYukleniyor(false);
      return;
    }

    router.push("/avukat/panel");
  }

  return (
    <AuthShell
      baslik="Avukat Kaydı"
      altBaslik="Profilini oluştur, müvekkillerden randevu talebi almaya başla."
      genis
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <TextField
            label="Ad Soyad"
            id="adSoyad"
            type="text"
            required
            value={form.adSoyad}
            onChange={(e) => alanGuncelle("adSoyad", e.target.value)}
            placeholder="Ör. Ayşe Yılmaz"
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
            label="E-posta"
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => alanGuncelle("email", e.target.value)}
            placeholder="ornek@eposta.com"
          />
          <TextField
            label="Şifre"
            id="sifre"
            type="password"
            required
            minLength={6}
            value={form.sifre}
            onChange={(e) => alanGuncelle("sifre", e.target.value)}
            placeholder="En az 6 karakter"
          />
          <TextField
            label="Baro Sicil Numarası"
            id="baroSicilNo"
            type="text"
            required
            value={form.baroSicilNo}
            onChange={(e) => alanGuncelle("baroSicilNo", e.target.value)}
            placeholder="Ör. 12345"
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

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-lacivert">
            Uzmanlık Alanları
          </span>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg border border-lacivert/20 p-4 sm:grid-cols-3">
            {UZMANLIK_ALANLARI.map((alan) => (
              <label
                key={alan}
                className="flex items-center gap-2 text-sm text-lacivert/80"
              >
                <input
                  type="checkbox"
                  checked={uzmanlikSecimi.includes(alan)}
                  onChange={() => uzmanlikDegistir(alan)}
                  className="h-4 w-4 shrink-0 rounded border-lacivert/30 text-altin focus:ring-altin/50"
                />
                {alan}
              </label>
            ))}
          </div>
        </div>

        <TextField
          label="Biyografi"
          id="biyografi"
          as="textarea"
          rows={4}
          required
          value={form.biyografi}
          onChange={(e) => alanGuncelle("biyografi", e.target.value)}
          placeholder="Deneyimlerinden ve çalışma alanlarından kısaca bahset."
        />

        <KvkkOnay checked={kvkkOnay} onChange={(e) => setKvkkOnay(e.target.checked)} />

        {hata && (
          <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">
            {hata}
            {zatenKayitli && (
              <>
                {" "}
                <Link href="/giris" className="font-semibold underline">
                  Giriş yapmak için tıkla
                </Link>
                .
              </>
            )}
          </p>
        )}

        <Button type="submit" yukleniyor={yukleniyor}>
          Kayıt Ol
        </Button>

        <p className="text-center text-sm text-lacivert/60">
          Zaten hesabın var mı?{" "}
          <Link href="/giris" className="font-semibold text-altin-koyu">
            Giriş yap
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
