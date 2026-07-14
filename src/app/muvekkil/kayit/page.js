"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { SEHIRLER } from "@/lib/sehirler";
import { turkceHataMesaji, emailZatenKayitliMi } from "@/lib/hataMesajlari";
import AuthShell from "@/components/AuthShell";
import TextField from "@/components/TextField";
import KvkkOnay from "@/components/KvkkOnay";
import Button from "@/components/Button";

export default function MuvekkilKayit() {
  const router = useRouter();

  const [form, setForm] = useState({
    adSoyad: "",
    email: "",
    sifre: "",
    telefon: "",
    sehir: "",
  });
  const [kvkkOnay, setKvkkOnay] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState(null);
  const [zatenKayitli, setZatenKayitli] = useState(false);

  function alanGuncelle(alan, deger) {
    setForm((onceki) => ({ ...onceki, [alan]: deger }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setHata(null);
    setZatenKayitli(false);
    setYukleniyor(true);

    const kayitYaniti = await fetch("/api/kayit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rol: "muvekkil",
        email: form.email,
        sifre: form.sifre,
        profil: {
          ad_soyad: form.adSoyad,
          telefon: form.telefon,
          sehir: form.sehir,
          kvkk_onay: kvkkOnay,
        },
      }),
    });
    const kayitSonucu = await kayitYaniti.json();

    if (!kayitYaniti.ok) {
      console.error("Müvekkil kayıt hatası:", kayitSonucu.hata);
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

    router.push("/muvekkil/panel");
  }

  return (
    <AuthShell
      baslik="Müvekkil Kaydı"
      altBaslik="Uzman avukatları bul, kolayca randevu talebi gönder."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <TextField
          label="Ad Soyad"
          id="adSoyad"
          type="text"
          required
          value={form.adSoyad}
          onChange={(e) => alanGuncelle("adSoyad", e.target.value)}
          placeholder="Ör. Mehmet Demir"
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
