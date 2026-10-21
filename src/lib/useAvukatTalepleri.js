"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

// Avukatın kendi talepleri ile şehrine/uzmanlığına uyan açık havuz taleplerini yükler
// ve gerçek zamanlı olarak günceller.
export function useAvukatTalepleri(profil) {
  const [talepler, setTalepler] = useState([]);
  const [acikTalepler, setAcikTalepler] = useState([]);

  useEffect(() => {
    if (!profil?.id) return;
    let iptalEdildi = false;

    async function talepleriYenile() {
      const { data } = await supabase
        .from("randevu_talepleri")
        .select("*")
        .eq("avukat_id", profil.id)
        .order("created_at", { ascending: false });
      if (!iptalEdildi) setTalepler(data ?? []);
    }

    async function acikTalepleriYenile() {
      if (!profil.dogrulanmis) return;
      const { data } = await supabase
        .from("randevu_talepleri")
        .select("*")
        .eq("tur", "genel")
        .is("avukat_id", null)
        .in("odeme_durumu", ["odendi", "muaf"])
        .order("created_at", { ascending: false });

      const uygunAlanlar = profil.uzmanlik_alanlari ?? [];
      const uygunlar = (data ?? [])
        .filter((t) => t.hedef_sehir === profil.sehir || uygunAlanlar.includes(t.hedef_uzmanlik_alani))
        .sort((a, b) => (b.acil === a.acil ? 0 : b.acil ? 1 : -1));
      if (!iptalEdildi) setAcikTalepler(uygunlar);
    }

    talepleriYenile();
    acikTalepleriYenile();

    const kanal = supabase
      .channel(`avukat-talepleri-${profil.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "randevu_talepleri", filter: `avukat_id=eq.${profil.id}` },
        talepleriYenile
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "randevu_talepleri", filter: "tur=eq.genel" },
        acikTalepleriYenile
      )
      .subscribe();

    return () => {
      iptalEdildi = true;
      supabase.removeChannel(kanal);
    };
  }, [profil]);

  return { talepler, setTalepler, acikTalepler, setAcikTalepler };
}
