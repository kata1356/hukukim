"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { turkceHataMesaji, emailZatenKayitliMi } from "@/lib/hataMesajlari";
import { SEHIRLER } from "@/lib/sehirler";
import AuthShell from "@/components/AuthShell";
import TextField from "@/components/TextField";
import KvkkOnay from "@/components/KvkkOnay";
import Button from "@/components/Button";
import Spinner from "@/components/Spinner";
import AcilTalepFormu from "@/components/AcilTalepFormu";
import Honeypot from "@/components/Honeypot";
import { IconYildirim } from "@/components/icons";

export default function AcilAvukat() {
  const router = useRouter();
  const [durum, setDurum] = useState("yukleniyor");
  const [profil, setProfil] = useState(null);
  const [ilkGorusmeMi, setIlkGorusmeMi] = useState(true);

  const [form, setForm] = useState({
    adSoyad: "",
    email: "",
    sifre: "",
    telefon: "",
    sehir: "",
  });
  const [kvkkOnay, setKvkkOnay] = useState(false);
  const [webSitesi, setWebSitesi] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState(null);
  const [zatenKayitli, setZatenKayitli] = useState(false);

  useEffect(() => {
    let iptalEdildi = false;

    async function kontrolEt() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!iptalEdildi) setDurum("kayit");
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
          .eq("muvekkil_id", user.id);
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

      if (avukatProfili) {
        setDurum("avukat");
      } else {
        setDurum("kayit");
      }
    }

    kontrolEt();
    return () => {
      iptalEdildi = true;
    };
  }, []);

  function alanGuncelle(alan, deger) {
    setForm((onceki) => ({ ...onceki, [alan]: deger }));
  }

  async function handleKayitSubmit(e) {
    e.preventDefault();
    setHata(null);
    setZatenKayitli(false);
    setYukleniyor(true);

    const kayitYaniti = await fetch("/api/kayit/acil", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.email,
        sifre: form.sifre,
        profil: {
          ad_soyad: form.adSoyad,
          telefon: form.telefon,
          sehir: form.sehir,
          kvkk_onay: kvkkOnay,
        },
        web_sitesi: webSitesi,
      }),
    });
    const kayitSonucu = await kayitYaniti.json();

    if (!kayitYaniti.ok) {
      console.error("Acil avukat kayıt hatası:", kayitSonucu.hata);
      setHata(turkceHataMesaji(kayitSonucu.hata));
      setZatenKayitli(emailZatenKayitliMi(kayitSonucu.hata));
      setYukleniyor(false);
      return;
    }

    const { error: girisHatasi } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.sifre,
    });

    if (girisHatasi) {
      console.error("Kayıt sonrası giriş hatası:", girisHatasi);
      setHata(turkceHataMesaji(girisHatasi));
      setYukleniyor(false);
      return;
    }

    setProfil({
      id: (await supabase.auth.getUser()).data.user.id,
      ad_soyad: form.adSoyad,
      telefon: form.telefon,
      sehir: form.sehir,
    });
    setYukleniyor(false);
    setDurum("form");
  }

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
      altBaslik="Devam etmek için giriş yap ya da hızlı bir müvekkil kaydı oluştur."
    >
      <p className="mb-5 rounded-lg bg-white/5 px-4 py-3 text-sm text-white/60">
        Zaten hesabın var mı?{" "}
        <Link
          href="/giris?donus=/acil-avukat"
          className="font-semibold text-turkuaz underline"
        >
          Giriş yap
        </Link>{" "}
        ve talebini hemen gönder.
      </p>

      <form onSubmit={handleKayitSubmit} className="flex flex-col gap-5">
        <Honeypot value={webSitesi} onChange={(e) => setWebSitesi(e.target.value)} />
        <TextField
          label="Ad Soyad"
          id="adSoyad"
          type="text"
          required
          value={form.adSoyad}
          onChange={(e) => alanGuncelle("adSoyad", e.target.value)}
          placeholder="Ör. Mehmet Demir"
        />
        <TextField
          label="E-posta"
          id="email"
          type="email"
          required
          value={form.email}
          onChange={(e) => alanGuncelle("email", e.target.value)}
          placeholder="ornek@eposta.com"
        />
        <TextField
          label="Şifre"
          id="sifre"
          type="password"
          required
          minLength={6}
          value={form.sifre}
          onChange={(e) => alanGuncelle("sifre", e.target.value)}
          placeholder="En az 6 karakter"
        />
        <TextField
          label="Telefon"
          id="telefon"
          type="tel"
          required
          value={form.telefon}
          onChange={(e) => alanGuncelle("telefon", e.target.value)}
          placeholder="05XX XXX XX XX"
        />
        <TextField
          label="Şehir"
          id="sehir"
          as="select"
          required
          value={form.sehir}
          onChange={(e) => alanGuncelle("sehir", e.target.value)}
        >
          <option value="" disabled>
            Şehir seç
          </option>
          {SEHIRLER.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </TextField>

        <KvkkOnay checked={kvkkOnay} onChange={(e) => setKvkkOnay(e.target.checked)} />

        {hata && (
          <p className="rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-400 ring-1 ring-red-500/20">
            {hata}
            {zatenKayitli && (
              <>
                {" "}
                <Link href="/giris?donus=/acil-avukat" className="font-semibold underline">
                  Giriş yapmak için tıkla
                </Link>
                .
              </>
            )}
          </p>
        )}

        <Button type="submit" variant="acil" yukleniyor={yukleniyor}>
          <IconYildirim className="h-4 w-4" />
          Kaydol ve Acil Talebe Devam Et
        </Button>
      </form>
    </AuthShell>
  );
}
