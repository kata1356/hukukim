"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { turkceHataMesaji } from "@/lib/hataMesajlari";
import AuthShell from "@/components/AuthShell";
import TextField from "@/components/TextField";
import Button from "@/components/Button";
import Spinner from "@/components/Spinner";

export default function SifreSifirla() {
  const router = useRouter();

  const [hazir, setHazir] = useState(false);
  const [gecersiz, setGecersiz] = useState(false);
  const [sifre, setSifre] = useState("");
  const [sifreTekrar, setSifreTekrar] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState(null);
  const [basarili, setBasarili] = useState(false);

  useEffect(() => {
    let iptalEdildi = false;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" && !iptalEdildi) {
        setHazir(true);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (!iptalEdildi && data.session) {
        setHazir(true);
      }
    });

    const zamanAsimi = setTimeout(() => {
      if (!iptalEdildi) {
        setHazir((oncekiHazir) => {
          if (!oncekiHazir) setGecersiz(true);
          return oncekiHazir;
        });
      }
    }, 4000);

    return () => {
      iptalEdildi = true;
      clearTimeout(zamanAsimi);
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setHata(null);

    if (sifre !== sifreTekrar) {
      setHata("Şifreler birbiriyle uyuşmuyor.");
      return;
    }

    setYukleniyor(true);
    const { error } = await supabase.auth.updateUser({ password: sifre });

    if (error) {
      console.error("Şifre güncelleme hatası:", error);
      setHata(turkceHataMesaji(error));
      setYukleniyor(false);
      return;
    }

    await supabase.auth.signOut();
    setYukleniyor(false);
    setBasarili(true);
    setTimeout(() => router.push("/giris"), 2500);
  }

  if (gecersiz) {
    return (
      <AuthShell
        baslik="Bağlantı geçersiz"
        altBaslik="Bu şifre sıfırlama bağlantısı süresi dolmuş ya da geçersiz olabilir."
      >
        <Button onClick={() => router.push("/sifremi-unuttum")}>
          Yeni bağlantı iste
        </Button>
      </AuthShell>
    );
  }

  if (basarili) {
    return (
      <AuthShell baslik="Şifren güncellendi" altBaslik="Giriş sayfasına yönlendiriliyorsun...">
        <Spinner className="h-6 w-6 text-white" />
      </AuthShell>
    );
  }

  if (!hazir) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center">
        <Spinner className="h-8 w-8 text-white" />
      </div>
    );
  }

  return (
    <AuthShell baslik="Yeni Şifre Belirle" altBaslik="Hesabın için yeni bir şifre oluştur.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <TextField
          label="Yeni Şifre"
          id="sifre"
          type="password"
          required
          minLength={6}
          value={sifre}
          onChange={(e) => setSifre(e.target.value)}
          placeholder="En az 6 karakter"
        />
        <TextField
          label="Yeni Şifre (Tekrar)"
          id="sifreTekrar"
          type="password"
          required
          minLength={6}
          value={sifreTekrar}
          onChange={(e) => setSifreTekrar(e.target.value)}
          placeholder="Şifreni tekrar gir"
        />

        {hata && (
          <p className="rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-400 ring-1 ring-red-500/20">
            {hata}
          </p>
        )}

        <Button type="submit" yukleniyor={yukleniyor}>
          Şifreyi Güncelle
        </Button>
      </form>
    </AuthShell>
  );
}
