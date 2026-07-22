"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import AdminShell from "@/components/AdminShell";
import Avatar from "@/components/Avatar";
import DogrulamaRozeti from "@/components/DogrulamaRozeti";
import TextField from "@/components/TextField";
import Button from "@/components/Button";
import Spinner from "@/components/Spinner";
import { SEHIRLER } from "@/lib/sehirler";
import { UZMANLIK_ALANLARI } from "@/lib/uzmanlikAlanlari";
import { IconGeri, IconOnay, IconRed } from "@/components/icons";

export default function AdminAvukatDetay() {
  const { id } = useParams();
  const router = useRouter();

  const [yukleniyor, setYukleniyor] = useState(true);
  const [avukat, setAvukat] = useState(null);
  const [form, setForm] = useState(null);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [hata, setHata] = useState(null);
  const [basari, setBasari] = useState(null);

  useEffect(() => {
    let iptalEdildi = false;

    async function veriGetir() {
      const { data } = await supabase.from("avukatlar").select("*").eq("id", id).maybeSingle();
      if (iptalEdildi) return;

      if (!data) {
        router.replace("/admin/avukatlar");
        return;
      }

      setAvukat(data);
      setForm({
        ad_soyad: data.ad_soyad ?? "",
        telefon: data.telefon ?? "",
        sehir: data.sehir ?? "",
        baro_sicil_no: data.baro_sicil_no ?? "",
        biyografi: data.biyografi ?? "",
        uzmanlik_alanlari: data.uzmanlik_alanlari ?? [],
      });
      setYukleniyor(false);
    }

    veriGetir();
    return () => {
      iptalEdildi = true;
    };
  }, [id, router]);

  function alanGuncelle(alan, deger) {
    setForm((onceki) => ({ ...onceki, [alan]: deger }));
  }

  function uzmanlikDegistir(alan) {
    setForm((onceki) => ({
      ...onceki,
      uzmanlik_alanlari: onceki.uzmanlik_alanlari.includes(alan)
        ? onceki.uzmanlik_alanlari.filter((a) => a !== alan)
        : [...onceki.uzmanlik_alanlari, alan],
    }));
  }

  async function kaydet(e) {
    e.preventDefault();
    setHata(null);
    setBasari(null);
    setKaydediliyor(true);

    const { error } = await supabase.from("avukatlar").update(form).eq("id", id);

    if (error) {
      setHata("Kaydedilirken bir hata oluştu.");
      setKaydediliyor(false);
      return;
    }

    setAvukat((onceki) => ({ ...onceki, ...form }));
    setBasari("Değişiklikler kaydedildi.");
    setKaydediliyor(false);
  }

  async function dogrulamaDegistir() {
    setHata(null);
    const { error } = await supabase.from("avukatlar").update({ dogrulanmis: !avukat.dogrulanmis }).eq("id", id);
    if (error) {
      setHata("Doğrulama durumu güncellenirken bir hata oluştu.");
      return;
    }
    setAvukat((onceki) => ({ ...onceki, dogrulanmis: !onceki.dogrulanmis }));
  }

  if (yukleniyor) {
    return (
      <AdminShell baslik="Avukat Detayı">
        <Spinner className="h-6 w-6 text-vurgu" />
      </AdminShell>
    );
  }

  return (
    <AdminShell baslik={avukat.ad_soyad} aciklama={avukat.email}>
      <Link href="/admin/avukatlar" className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-white/50 hover:text-white">
        <IconGeri className="h-4 w-4" />
        Avukatlara Dön
      </Link>

      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl border border-yonetim-kenar bg-yonetim-kutu p-5">
        <Avatar adSoyad={avukat.ad_soyad} fotografUrl={avukat.profil_fotografi_url} boyut="lg" dogrulanmis={avukat.dogrulanmis} />
        <div className="flex-1">
          <p className="font-bold text-white">{avukat.ad_soyad}</p>
          <p className="text-sm text-white/50">{avukat.email}</p>
          <div className="mt-1.5">
            <DogrulamaRozeti dogrulanmis={avukat.dogrulanmis} />
          </div>
        </div>
        <button
          onClick={dogrulamaDegistir}
          className={
            avukat.dogrulanmis
              ? "flex items-center gap-1.5 rounded-full border border-yonetim-kenar px-4 py-2 text-sm font-semibold text-white/60 transition hover:bg-white/5"
              : "flex items-center gap-1.5 rounded-full bg-vurgu px-4 py-2 text-sm font-bold text-yonetim transition hover:opacity-90"
          }
        >
          {avukat.dogrulanmis ? <IconRed className="h-4 w-4" /> : <IconOnay className="h-4 w-4" />}
          {avukat.dogrulanmis ? "Doğrulamayı Kaldır" : "Doğrula"}
        </button>
      </div>

      <form onSubmit={kaydet} className="flex max-w-2xl flex-col gap-5 rounded-xl border border-yonetim-kenar bg-yonetim-kutu p-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <TextField
            label="Ad Soyad"
            id="ad_soyad"
            value={form.ad_soyad}
            onChange={(e) => alanGuncelle("ad_soyad", e.target.value)}
          />
          <TextField
            label="Telefon"
            id="telefon"
            value={form.telefon}
            onChange={(e) => alanGuncelle("telefon", e.target.value)}
          />
          <TextField label="Şehir" id="sehir" as="select" value={form.sehir} onChange={(e) => alanGuncelle("sehir", e.target.value)}>
            <option value="" disabled>
              Şehir seç
            </option>
            {SEHIRLER.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </TextField>
          <TextField
            label="Baro Sicil No"
            id="baro_sicil_no"
            value={form.baro_sicil_no}
            onChange={(e) => alanGuncelle("baro_sicil_no", e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-white">Uzmanlık Alanları</span>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg border border-yonetim-kenar p-4 sm:grid-cols-3">
            {UZMANLIK_ALANLARI.map((alan) => (
              <label key={alan} className="flex items-center gap-2 text-sm text-white/70">
                <input
                  type="checkbox"
                  checked={form.uzmanlik_alanlari.includes(alan)}
                  onChange={() => uzmanlikDegistir(alan)}
                  className="h-4 w-4 shrink-0 rounded border-white/20 bg-white/5 text-vurgu focus:ring-vurgu/40"
                />
                {alan}
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <TextField
            label="Biyografi"
            id="biyografi"
            as="textarea"
            rows={4}
            minLength={100}
            value={form.biyografi}
            onChange={(e) => alanGuncelle("biyografi", e.target.value)}
          />
          <p className={`text-xs ${form.biyografi.length < 100 ? "text-white/40" : "text-vurgu"}`}>
            En az 100 karakter önerilir · şu an {form.biyografi.length}
          </p>
        </div>

        {hata && (
          <p className="rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-400 ring-1 ring-red-500/20">{hata}</p>
        )}
        {basari && (
          <p className="rounded-lg bg-green-500/10 px-4 py-2.5 text-sm text-green-400 ring-1 ring-green-500/20">{basari}</p>
        )}

        <Button type="submit" yukleniyor={kaydediliyor} className="w-auto self-start">
          Değişiklikleri Kaydet
        </Button>
      </form>
    </AdminShell>
  );
}
