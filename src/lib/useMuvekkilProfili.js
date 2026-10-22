"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

// Giriş yapmış müvekkilin profilini yükler; oturum ya da müvekkil kaydı yoksa girişe yönlendirir.
export function useMuvekkilProfili() {
  const router = useRouter();
  const [profil, setProfil] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(true);

  useEffect(() => {
    let iptalEdildi = false;

    async function getir() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/giris");
        return;
      }

      const { data } = await supabase.from("muvekkiller").select("*").eq("id", user.id).maybeSingle();

      if (!data) {
        router.push("/giris");
        return;
      }

      if (iptalEdildi) return;
      setProfil(data);
      setYukleniyor(false);
    }

    getir();
    return () => {
      iptalEdildi = true;
    };
  }, [router]);

  return { profil, setProfil, yukleniyor };
}
