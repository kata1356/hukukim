"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import Spinner from "@/components/Spinner";
import { IconRed } from "@/components/icons";

export default function KayitDogrulama() {
  const router = useRouter();
  const [durum, setDurum] = useState("isleniyor");
  const [hata, setHata] = useState(null);

  useEffect(() => {
    let iptalEdildi = false;

    async function tamamla() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        if (!iptalEdildi) setDurum("gecersiz");
        return;
      }

      const metadata = session.user.user_metadata ?? {};

      if (!metadata.rol) {
        router.replace("/giris");
        return;
      }

      const yanit = await fetch("/api/kayit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const sonuc = await yanit.json();

      if (iptalEdildi) return;

      if (!yanit.ok) {
        setHata(sonuc.hata?.message ?? "Kayıt tamamlanamadı.");
        setDurum("hata");
        return;
      }

      router.replace(sonuc.rol === "avukat" ? "/avukat/panel" : "/muvekkil/panel");
    }

    tamamla();
    return () => {
      iptalEdildi = true;
    };
  }, [router]);

  if (durum === "gecersiz") {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-gece px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-400 ring-1 ring-red-500/20">
            <IconRed className="h-7 w-7" />
          </span>
          <h1 className="text-2xl font-bold text-white">Bağlantı Geçersiz</h1>
          <p className="max-w-sm text-sm text-white/60">
            Bu doğrulama bağlantısının süresi dolmuş ya da daha önce
            kullanılmış olabilir.
          </p>
          <Link href="/giris" className="mt-2 rounded-full bg-turkuaz px-5 py-2.5 text-sm font-bold text-gece">
            Giriş Sayfasına Dön
          </Link>
        </div>
      </div>
    );
  }

  if (durum === "hata") {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-gece px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-400 ring-1 ring-red-500/20">
            <IconRed className="h-7 w-7" />
          </span>
          <h1 className="text-2xl font-bold text-white">Bir Şeyler Ters Gitti</h1>
          <p className="max-w-sm text-sm text-white/60">{hata}</p>
          <Link href="/giris" className="mt-2 rounded-full bg-turkuaz px-5 py-2.5 text-sm font-bold text-gece">
            Giriş Sayfasına Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-gece px-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <Spinner className="h-8 w-8 text-white" />
        <p className="text-sm text-white/60">Hesabın hazırlanıyor...</p>
      </div>
    </div>
  );
}
