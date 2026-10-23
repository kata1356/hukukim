"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

// true: havuzda yalnızca şehri/uzmanlığı uyan talepler görünür. false: tüm talepler görünür (uyanlar üstte).
const SADECE_UYGUN_TALEPLER = false;

// Avukatın kendi talepleri ile açık havuz taleplerini yükler ve gerçek zamanlı olarak günceller.
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
      const uyumPuani = (t) =>
        (t.hedef_sehir === profil.sehir ? 1 : 0) + (uygunAlanlar.includes(t.hedef_uzmanlik_alani) ? 1 : 0);

      // Avukat sayısı azken talep sahipsiz kalmasın diye havuzdaki tüm talepler her doğrulanmış
      // avukata gösterilir. Önce acil, sonra şehir/alan uyumu yüksek olanlar, sonra en yeniler gelir.
      // Avukat sayısı artınca SADECE_UYGUN_TALEPLER = true yapılarak eski filtre geri açılabilir.
      const liste = SADECE_UYGUN_TALEPLER ? (data ?? []).filter((t) => uyumPuani(t) > 0) : (data ?? []);
      const sirali = [...liste].sort(
        (a, b) => Number(b.acil) - Number(a.acil) || uyumPuani(b) - uyumPuani(a)
      );
      if (!iptalEdildi) setAcikTalepler(sirali);
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
