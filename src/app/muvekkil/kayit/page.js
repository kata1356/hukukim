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
import Honeypot from "@/components/Honeypot";
import { IconOnay } from "@/components/icons";

export default function MuvekkilKayit() {
  const router = useRouter();
  const [gonderildi, setGonderildi] = useState(false);

  const [form, setForm] = useState({
    adSoyad: "",
    email: "",
    sifre: "",
    telefon: "",
    sehir: "",
  });
  const [kvkkOnay, setKvkkOnay] = useState(false);
  const [webSitesi, setWebSitesi] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState(null);
  const [zatenKayitli, setZatenKayitli] = useState(false);

  const [kod, setKod] = useState("");
  const [dogrulaniyor, setDogrulaniyor] = useState(false);
  const [dogrulamaHatasi, setDogrulamaHatasi] = useState(null);
  const [yenidenGonderiliyor, setYenidenGonderiliyor] = useState(false);
  const [yenidenGonderildi, setYenidenGonderildi] = useState(false);

  function alanGuncelle(alan, deger) {
    setForm((onceki) => ({ ...onceki, [alan]: deger }));
  }

  async function oturumuTamamla(session) {
    const tamamlaYaniti = await fetch("/api/kayit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
    });
    const tamamlaSonucu = await tamamlaYaniti.json();

    if (!tamamlaYaniti.ok) {
      return { basarili: false, hata: turkceHataMesaji(tamamlaSonucu.hata) };
    }

    router.push("/muvekkil/panel");
    return { basarili: true };
  }

  async function handleKodDogrula(e) {
    e.preventDefault();
    setDogrulamaHatasi(null);
    setDogrulaniyor(true);

    const { data, error } = await supabase.auth.verifyOtp({
      email: form.email,
      token: kod,
      type: "signup",
    });

    if (error || !data.session) {
      setDogrulamaHatasi("Kod geçersiz ya da süresi dolmuş. Tekrar dene ya da yeni kod iste.");
      setDogrulaniyor(false);
      return;
    }

    const sonuc = await oturumuTamamla(data.session);
    if (!sonuc.basarili) {
      setDogrulamaHatasi(sonuc.hata);
      setDogrulaniyor(false);
    }
  }

  async function handleKoduTekrarGonder() {
    setYenidenGonderiliyor(true);
    setDogrulamaHatasi(null);
    await supabase.auth.resend({ type: "signup", email: form.email });
    setYenidenGonderiliyor(false);
    setYenidenGonderildi(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setHata(null);
    setZatenKayitli(false);
    setYukleniyor(true);

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.sifre,
      options: {
        emailRedirectTo: `${window.location.origin}/kayit-dogrulama`,
        data: {
          rol: "muvekkil",
          profil: {
            ad_soyad: form.adSoyad,
            telefon: form.telefon,
            sehir: form.sehir,
            kvkk_onay: kvkkOnay,
          },
          web_sitesi: webSitesi,
        },
      },
    });

    if (error) {
      console.error("Müvekkil kayıt hatası:", error);
      setHata(turkceHataMesaji(error));
      setZatenKayitli(emailZatenKayitliMi(error));
      setYukleniyor(false);
      return;
    }

    if (data.session) {
      const sonuc = await oturumuTamamla(data.session);
      if (!sonuc.basarili) {
        setHata(sonuc.hata);
        setYukleniyor(false);
      }
      return;
    }

    setYukleniyor(false);
    setGonderildi(true);
  }

  if (gonderildi) {
    return (
      <AuthShell baslik="E-postanı Kontrol Et" altBaslik="Kaydını tamamlamak için sana bir kod gönderdik.">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 text-green-400 ring-1 ring-green-500/20">
            <IconOnay className="h-7 w-7" />
          </span>
          <p className="text-sm text-white/60">
            <span className="font-semibold text-white">{form.email}</span>{" "}
            adresine bir doğrulama kodu (ve bağlantı) gönderdik. Kodu aşağıya
            girerek buradan devam edebilirsin.
          </p>
        </div>

        <form onSubmit={handleKodDogrula} className="mt-6 flex flex-col gap-4">
          <TextField
            label="Doğrulama Kodu"
            id="kod"
            type="text"
            required
            value={kod}
            onChange={(e) => setKod(e.target.value)}
            placeholder="6 haneli kod"
          />

          {dogrulamaHatasi && (
            <p className="rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-400 ring-1 ring-red-500/20">
              {dogrulamaHatasi}
            </p>
          )}

          <Button type="submit" yukleniyor={dogrulaniyor}>
            Kodu Doğrula
          </Button>

          <button
            type="button"
            onClick={handleKoduTekrarGonder}
            disabled={yenidenGonderiliyor}
            className="text-center text-sm font-semibold text-turkuaz disabled:opacity-60"
          >
            {yenidenGonderiliyor
              ? "Gönderiliyor..."
              : yenidenGonderildi
              ? "Kod tekrar gönderildi"
              : "Kodu tekrar gönder"}
          </button>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      baslik="Müvekkil Kaydı"
      altBaslik="Uzman avukatları bul, kolayca randevu talebi gönder."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Honeypot value={webSitesi} onChange={(e) => setWebSitesi(e.target.value)} />
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
          <p className="rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-400 ring-1 ring-red-500/20">
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

        <p className="text-center text-sm text-white/60">
          Zaten hesabın var mı?{" "}
          <Link href="/giris" className="font-semibold text-turkuaz">
            Giriş yap
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
