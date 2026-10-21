"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Spinner from "./Spinner";

function IconGoogle(props) {
  return (
    <svg viewBox="0 0 48 48" className={props.className ?? "h-4 w-4"} aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917Z"
      />
      <path
        fill="#FF3D00"
        d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691Z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44Z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917Z"
      />
    </svg>
  );
}

const GOOGLE_ISTEMCI_KIMLIGI = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const GIS_SCRIPT = "https://accounts.google.com/gsi/client";

function gisYukle() {
  return new Promise((coz, reddet) => {
    if (window.google?.accounts?.id) return coz();
    const mevcut = document.querySelector(`script[src="${GIS_SCRIPT}"]`);
    const script = mevcut ?? Object.assign(document.createElement("script"), { src: GIS_SCRIPT, async: true });
    script.addEventListener("load", () => coz());
    script.addEventListener("error", reddet);
    if (!mevcut) document.head.appendChild(script);
  });
}

// Google'ın kendi hesap seçici butonunu kullanır: sayfa yönlendirilmediği için
// "supabase.co" adresi görünmez; kimlik jetonu doğrudan Supabase'e verilir.
function GoogleHesapButonu({ redirectYolu, metin }) {
  const kutuRef = useRef(null);
  const [hata, setHata] = useState(null);

  useEffect(() => {
    let iptalEdildi = false;

    async function kur() {
      try {
        await gisYukle();
      } catch {
        if (!iptalEdildi) setHata("Google yüklenemedi, sayfayı yenile.");
        return;
      }
      if (iptalEdildi || !kutuRef.current) return;

      window.google.accounts.id.initialize({
        client_id: GOOGLE_ISTEMCI_KIMLIGI,
        callback: async ({ credential }) => {
          const { error } = await supabase.auth.signInWithIdToken({ provider: "google", token: credential });
          if (error) {
            console.error("Google giriş hatası:", error);
            setHata("Google ile giriş yapılamadı, tekrar dene.");
            return;
          }
          window.location.assign(redirectYolu);
        },
      });
      window.google.accounts.id.renderButton(kutuRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        shape: "rectangular",
        text: metin.includes("Giriş") ? "signin_with" : "continue_with",
        locale: "tr",
        width: Math.min(kutuRef.current.offsetWidth || 320, 400),
      });
    }

    kur();
    return () => {
      iptalEdildi = true;
    };
  }, [redirectYolu, metin]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div ref={kutuRef} className="flex min-h-10 w-full justify-center" />
      {hata && <p className="text-xs text-red-400">{hata}</p>}
    </div>
  );
}

export default function GoogleGirisButonu({ redirectYolu, metin = "Google ile Devam Et" }) {
  const [yukleniyor, setYukleniyor] = useState(false);

  if (GOOGLE_ISTEMCI_KIMLIGI) {
    return <GoogleHesapButonu redirectYolu={redirectYolu} metin={metin} />;
  }

  async function tikla() {
    setYukleniyor(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}${redirectYolu}` },
    });
  }

  return (
    <button
      type="button"
      onClick={tikla}
      disabled={yukleniyor}
      className="flex w-full items-center justify-center gap-2.5 rounded-full border-2 border-white/15 bg-white px-5 py-3 text-sm font-bold text-gece transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {yukleniyor ? <Spinner className="h-4 w-4" /> : <IconGoogle className="h-4 w-4" />}
      {metin}
    </button>
  );
}
