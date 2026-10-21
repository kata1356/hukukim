"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AuthShell from "@/components/AuthShell";
import Spinner from "@/components/Spinner";
import AcilTalepFormu from "@/components/AcilTalepFormu";

export default function AcilAvukat() {
  const router = useRouter();
  const [durum, setDurum] = useState("yukleniyor");
  const [profil, setProfil] = useState(null);
  const [ilkGorusmeMi, setIlkGorusmeMi] = useState(true);

  useEffect(() => {
    let iptalEdildi = false;

    async function kontrolEt() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!iptalEdildi) setDurum("giris");
        return;
      }

      const { data: muvekkilProfili } = await supabase
        .from("muvekkiller")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (iptalEdildi) return;

      if (muvekkilProfili) {
        const { count } = await supabase
          .from("randevu_talepleri")
          .select("id", { count: "exact", head: true })
          .eq("muvekkil_id", user.id)
          .or("odeme_durumu.eq.odendi,and(odeme_durumu.eq.muaf,durum.neq.iptal)");
        if (!iptalEdildi) setIlkGorusmeMi(!count);
        setProfil(muvekkilProfili);
        setDurum("form");
        return;
      }

      const { data: avukatProfili } = await supabase
        .from("avukatlar")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      setDurum(avukatProfili ? "avukat" : "giris");
    }

    kontrolEt();
    return () => {
      iptalEdildi = true;
    };
  }, []);

  if (durum === "yukleniyor") {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-gece">
        <Spinner className="h-8 w-8 text-white" />
      </div>
    );
  }

  if (durum === "avukat") {
    return (
      <AuthShell baslik="Acil Avukat Ara" altBaslik="Bu özellik müvekkiller içindir.">
        <p className="text-sm text-white/60">
          Avukat hesabınla buraya giremezsin. Gelen acil talepleri panelindeki
          &quot;Açık Talepler&quot; bölümünden görebilirsin.
        </p>
        <Link
          href="/avukat/panel"
          className="mt-6 inline-block rounded-full bg-turkuaz px-5 py-2.5 text-sm font-semibold text-gece"
        >
          Panelime Git
        </Link>
      </AuthShell>
    );
  }

  if (durum === "form") {
    return (
      <AuthShell
        baslik="Acil Avukat Ara"
        altBaslik="Şehrini ve uzmanlık alanını seç, uygun avukatlar sana ulaşsın."
      >
        <AcilTalepFormu
          muvekkilProfil={profil}
          ilkGorusmeMi={ilkGorusmeMi}
          onBasarili={(talepId) => router.push(`/muvekkil/panel?talep=${talepId}`)}
        />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      baslik="Acil Avukat Ara"
      altBaslik="Güvenliğin için acil talepler de doğrulanmış hesapla açılır."
    >
      <p className="rounded-lg bg-white/5 px-4 py-3 text-sm text-white/60">
        Devam etmek için giriş yap. Hesabın yoksa e-postanı doğrulayarak birkaç dakikada müvekkil hesabı
        açabilirsin, sonra acil talebini hemen gönderirsin.
      </p>

      <div className="mt-5 flex flex-col gap-3">
        <Link
          href="/giris?donus=/acil-avukat"
          className="flex min-h-12 items-center justify-center rounded-full bg-turkuaz px-6 py-3 text-sm font-bold text-gece transition hover:bg-turkuaz-parlak"
        >
          Giriş Yap
        </Link>
        <Link
          href="/muvekkil/kayit"
          className="flex min-h-12 items-center justify-center rounded-full border-2 border-white/20 px-6 py-3 text-sm font-bold text-white transition hover:border-white/50"
        >
          Müvekkil Hesabı Oluştur
        </Link>
      </div>
    </AuthShell>
  );
}
