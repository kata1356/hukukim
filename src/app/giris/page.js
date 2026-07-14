"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { turkceHataMesaji } from "@/lib/hataMesajlari";
import TextField from "@/components/TextField";
import Button from "@/components/Button";
import { IconTerazi, IconKvkk, IconBaro, IconTakvim } from "@/components/icons";

const OZELLIKLER = [
  { Icon: IconBaro, metin: "Baro sicil numarasıyla doğrulanan avukat profilleri" },
  { Icon: IconKvkk, metin: "6698 sayılı KVKK kapsamında korunan kişisel veriler" },
  { Icon: IconTakvim, metin: "Uçtan uca dijital randevu talebi ve onay süreci" },
];

export default function Giris() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState(null);

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
      router.push("/muvekkil/panel");
      return;
    }

    setHata("Bu hesaba ait bir profil bulunamadı.");
    setYukleniyor(false);
  }

  return (
    <div className="flex min-h-full flex-1 flex-col lg:flex-row">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-lacivert to-lacivert-koyu px-12 py-14 text-white lg:flex lg:w-[45%] lg:flex-col lg:justify-between">
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
          className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-altin/10 blur-3xl"
        />

        <Link href="/" className="relative text-2xl font-bold">
          Hukuk<span className="text-altin">im</span>
        </Link>

        <div className="relative">
          <IconTerazi className="h-14 w-14 text-altin" />
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
                <Icon className="h-4 w-4 text-altin" />
              </span>
              {metin}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-1 flex-col bg-gradient-to-b from-lacivert/[0.03] to-white">
        <header className="border-b border-lacivert/10 bg-white/80 backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-5xl items-center px-6 py-5">
            <Link href="/" className="text-2xl font-bold text-lacivert">
              Hukuk<span className="text-altin">im</span>
            </Link>
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center px-4 py-10 sm:py-14">
          <div className="w-full max-w-md rounded-2xl border border-lacivert/10 bg-white p-6 shadow-lg shadow-lacivert/5 sm:p-8">
            <h1 className="text-2xl font-bold text-lacivert">Giriş Yap</h1>
            <p className="mt-1 text-sm text-lacivert/60">
              Hukukim hesabınla devam et.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
              <TextField
                label="E-posta"
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@eposta.com"
              />
              <TextField
                label="Şifre"
                id="sifre"
                type="password"
                required
                value={sifre}
                onChange={(e) => setSifre(e.target.value)}
                placeholder="Şifren"
              />

              {hata && (
                <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">
                  {hata}
                </p>
              )}

              <Button type="submit" yukleniyor={yukleniyor}>
                Giriş Yap
              </Button>

              <p className="text-center text-sm text-lacivert/60">
                Hesabın yok mu?{" "}
                <Link href="/avukat/kayit" className="font-semibold text-altin-koyu">
                  Avukat olarak kaydol
                </Link>{" "}
                ·{" "}
                <Link href="/muvekkil/kayit" className="font-semibold text-altin-koyu">
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
