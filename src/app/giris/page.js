"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { turkceHataMesaji } from "@/lib/hataMesajlari";
import TextField from "@/components/TextField";
import Button from "@/components/Button";
import GoogleGirisButonu from "@/components/GoogleGirisButonu";
import Spinner from "@/components/Spinner";
import { IconTerazi, IconKvkk, IconBaro, IconTakvim } from "@/components/icons";
import Logo from "@/components/Logo";

const OZELLIKLER = [
  { Icon: IconBaro, metin: "Baro sicil numarasıyla doğrulanan avukat profilleri" },
  { Icon: IconKvkk, metin: "6698 sayılı KVKK kapsamında korunan kişisel veriler" },
  { Icon: IconTakvim, metin: "Uçtan uca dijital randevu talebi ve onay süreci" },
];

export default function Giris() {
  return (
    <Suspense fallback={null}>
      <GirisIcerik />
    </Suspense>
  );
}

function GirisIcerik() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const donusAdresi = searchParams.get("donus");

  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState(null);
  const [oauthKontrolEdiliyor, setOauthKontrolEdiliyor] = useState(true);
  const [rolSeciliyor, setRolSeciliyor] = useState(false);

  useEffect(() => {
    let iptalEdildi = false;

    async function oauthDurumunuKontrolEt() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!iptalEdildi) setOauthKontrolEdiliyor(false);
        return;
      }

      const { data: avukatKaydi } = await supabase
        .from("avukatlar")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (iptalEdildi) return;

      if (avukatKaydi) {
        router.push("/avukat/panel");
        return;
      }

      const { data: muvekkilKaydi } = await supabase
        .from("muvekkiller")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (iptalEdildi) return;

      if (muvekkilKaydi) {
        router.push(donusAdresi && donusAdresi.startsWith("/") ? donusAdresi : "/muvekkil/panel");
        return;
      }

      // Google ile ilk kez giriş yapan, henuz avukat/muvekkil profili
      // olmayan bir kullanici: hangi rolde devam edecegini soralim.
      setRolSeciliyor(true);
      setOauthKontrolEdiliyor(false);
    }

    oauthDurumunuKontrolEt();
    return () => {
      iptalEdildi = true;
    };
  }, [router, donusAdresi]);

  async function handleSubmit(e) {
    e.preventDefault();
    setHata(null);
    setYukleniyor(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: sifre,
    });

    if (error || !data.user) {
      console.error("Giriş hatası:", error);
      setHata(turkceHataMesaji(error));
      setYukleniyor(false);
      return;
    }

    const { data: avukatKaydi } = await supabase
      .from("avukatlar")
      .select("id")
      .eq("id", data.user.id)
      .maybeSingle();

    if (avukatKaydi) {
      router.push("/avukat/panel");
      return;
    }

    const { data: muvekkilKaydi } = await supabase
      .from("muvekkiller")
      .select("id")
      .eq("id", data.user.id)
      .maybeSingle();

    if (muvekkilKaydi) {
      router.push(donusAdresi && donusAdresi.startsWith("/") ? donusAdresi : "/muvekkil/panel");
      return;
    }

    setHata("Bu hesaba ait bir profil bulunamadı.");
    setYukleniyor(false);
  }

  if (oauthKontrolEdiliyor) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-gece">
        <Spinner className="h-8 w-8 text-white" />
      </div>
    );
  }

  if (rolSeciliyor) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-gradient-to-b from-turkuaz/[0.06] to-gece px-4">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-gece-yuzey p-6 shadow-lg sm:p-8">
          <h1 className="text-2xl font-bold text-white">Nasıl Devam Etmek İstersin?</h1>
          <p className="mt-1 text-sm text-white/60">
            Google hesabınla ilk kez giriş yapıyorsun, hangi rolde devam edeceğini seç.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/avukat/kayit"
              className="rounded-full bg-turkuaz px-5 py-3 text-center text-sm font-bold text-gece transition hover:bg-turkuaz-parlak"
            >
              Avukat Olarak Devam Et
            </Link>
            <Link
              href="/muvekkil/kayit"
              className="rounded-full border-2 border-white/15 px-5 py-3 text-center text-sm font-bold text-white transition hover:border-white/40"
            >
              Müvekkil Olarak Devam Et
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col lg:flex-row">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-gece-yuzey to-gece px-12 py-14 text-white lg:flex lg:w-[45%] lg:flex-col lg:justify-between">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-turkuaz/10 blur-3xl"
        />

        <Link href="/" className="relative">
          <Logo className="h-8" />
        </Link>

        <div className="relative">
          <IconTerazi className="h-14 w-14 text-turkuaz" />
          <h2 className="mt-6 text-3xl font-bold leading-snug">
            Türkiye&apos;nin dijital
            <br />
            adalet buluşma noktası
          </h2>
          <p className="mt-4 max-w-sm text-sm text-white/70">
            Avukatlar ve müvekkilleri güvenli, şeffaf ve tamamen dijital bir
            süreçte bir araya getiriyoruz.
          </p>
        </div>

        <ul className="relative flex flex-col gap-4">
          {OZELLIKLER.map(({ Icon, metin }) => (
            <li key={metin} className="flex items-center gap-3 text-sm text-white/80">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10">
                <Icon className="h-4 w-4 text-turkuaz" />
              </span>
              {metin}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-1 flex-col bg-gradient-to-b from-turkuaz/[0.06] to-gece">
        <header className="border-b border-white/10 bg-gece/80 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-5xl items-center px-6 py-5">
            <Link href="/">
              <Logo className="h-8" />
            </Link>
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center px-4 py-10 sm:py-14">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-gece-yuzey p-6 shadow-lg sm:p-8">
            <h1 className="text-2xl font-bold text-white">Giriş Yap</h1>
            <p className="mt-1 text-sm text-white/60">
              Hukukim hesabınla devam et.
            </p>

            <div className="mt-6 flex flex-col gap-4">
              <GoogleGirisButonu redirectYolu="/giris" metin="Google ile Giriş Yap" />
              <div className="flex items-center gap-3 text-xs font-semibold text-white/30">
                <span className="h-px flex-1 bg-white/10" />
                VEYA
                <span className="h-px flex-1 bg-white/10" />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-5">
              <TextField
                label="E-posta"
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@eposta.com"
              />
              <div className="flex flex-col gap-1.5">
                <TextField
                  label="Şifre"
                  id="sifre"
                  type="password"
                  required
                  value={sifre}
                  onChange={(e) => setSifre(e.target.value)}
                  placeholder="Şifren"
                />
                <Link
                  href="/sifremi-unuttum"
                  className="self-end text-xs font-semibold text-white/40 hover:text-turkuaz"
                >
                  Şifremi unuttum
                </Link>
              </div>

              {hata && (
                <p className="rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-400 ring-1 ring-red-500/20">
                  {hata}
                </p>
              )}

              <Button type="submit" yukleniyor={yukleniyor}>
                Giriş Yap
              </Button>

              <p className="text-center text-sm text-white/60">
                Hesabın yok mu?{" "}
                <Link href="/avukat/kayit" className="font-semibold text-turkuaz">
                  Avukat olarak kaydol
                </Link>{" "}
                ·{" "}
                <Link href="/muvekkil/kayit" className="font-semibold text-turkuaz">
                  Müvekkil olarak kaydol
                </Link>
              </p>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
