"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { turkceHataMesaji } from "@/lib/hataMesajlari";
import TextField from "@/components/TextField";
import Button from "@/components/Button";
import { IconTerazi } from "@/components/icons";

export default function AdminGiris() {
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
      setHata(turkceHataMesaji(error));
      setYukleniyor(false);
      return;
    }

    const { data: yoneticiKaydi } = await supabase
      .from("yoneticiler")
      .select("id")
      .eq("id", data.user.id)
      .maybeSingle();

    if (!yoneticiKaydi) {
      await supabase.auth.signOut();
      setHata("Bu hesabın yönetici yetkisi yok.");
      setYukleniyor(false);
      return;
    }

    router.push("/admin");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-yonetim px-4 py-10">
      <div className="mb-8 flex items-center gap-2.5">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-vurgu/10 text-vurgu">
          <IconTerazi className="h-5 w-5" />
        </span>
        <div className="flex flex-col leading-tight">
          <span className="text-lg font-bold text-white">Hukukim</span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40">Yönetim Paneli</span>
        </div>
      </div>

      <div className="w-full max-w-sm rounded-2xl border border-yonetim-kenar bg-yonetim-kutu p-6 shadow-lg sm:p-8">
        <h1 className="text-xl font-bold text-white">Yönetici Girişi</h1>
        <p className="mt-1 text-sm text-white/50">
          Bu panel yalnızca yetkili yöneticiler içindir.
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
            <p className="rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-400 ring-1 ring-red-500/20">
              {hata}
            </p>
          )}

          <Button type="submit" yukleniyor={yukleniyor}>
            Giriş Yap
          </Button>
        </form>
      </div>
    </div>
  );
}
