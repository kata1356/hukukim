"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { turkceHataMesaji } from "@/lib/hataMesajlari";
import AuthShell from "@/components/AuthShell";
import TextField from "@/components/TextField";
import Button from "@/components/Button";
import { IconOnay } from "@/components/icons";

export default function SifremiUnuttum() {
  const [email, setEmail] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState(null);
  const [gonderildi, setGonderildi] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setHata(null);
    setYukleniyor(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/sifre-sifirla`,
    });

    if (error) {
      console.error("Şifre sıfırlama isteği hatası:", error);
      setHata(turkceHataMesaji(error));
      setYukleniyor(false);
      return;
    }

    setYukleniyor(false);
    setGonderildi(true);
  }

  if (gonderildi) {
    return (
      <AuthShell baslik="E-postanı kontrol et" altBaslik="Sana bir bağlantı gönderdik.">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 text-green-400 ring-1 ring-green-500/20">
            <IconOnay className="h-7 w-7" />
          </span>
          <p className="text-sm text-white/60">
            <span className="font-semibold text-white">{email}</span>{" "}
            adresine bir şifre sıfırlama bağlantısı gönderdik. Gelen kutunu
            (ve spam klasörünü) kontrol et.
          </p>
          <Link href="/giris" className="text-sm font-semibold text-turkuaz">
            Giriş sayfasına dön
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      baslik="Şifremi Unuttum"
      altBaslik="E-posta adresini gir, sana bir sıfırlama bağlantısı gönderelim."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <TextField
          label="E-posta"
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ornek@eposta.com"
        />

        {hata && (
          <p className="rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-400 ring-1 ring-red-500/20">
            {hata}
          </p>
        )}

        <Button type="submit" yukleniyor={yukleniyor}>
          Sıfırlama Bağlantısı Gönder
        </Button>

        <p className="text-center text-sm text-white/60">
          <Link href="/giris" className="font-semibold text-turkuaz">
            Giriş sayfasına dön
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
