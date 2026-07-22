"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import AdminShell from "@/components/AdminShell";
import Avatar from "@/components/Avatar";
import TextField from "@/components/TextField";
import Button from "@/components/Button";
import Spinner from "@/components/Spinner";
import { SEHIRLER } from "@/lib/sehirler";
import { IconGeri } from "@/components/icons";

export default function AdminMuvekkilDetay() {
  const { id } = useParams();
  const router = useRouter();

  const [yukleniyor, setYukleniyor] = useState(true);
  const [muvekkil, setMuvekkil] = useState(null);
  const [form, setForm] = useState(null);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [hata, setHata] = useState(null);
  const [basari, setBasari] = useState(null);

  useEffect(() => {
    let iptalEdildi = false;

    async function veriGetir() {
      const { data } = await supabase.from("muvekkiller").select("*").eq("id", id).maybeSingle();
      if (iptalEdildi) return;

      if (!data) {
        router.replace("/admin/kullanicilar");
        return;
      }

      setMuvekkil(data);
      setForm({
        ad_soyad: data.ad_soyad ?? "",
        telefon: data.telefon ?? "",
        sehir: data.sehir ?? "",
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

  async function kaydet(e) {
    e.preventDefault();
    setHata(null);
    setBasari(null);
    setKaydediliyor(true);

    const { error } = await supabase.from("muvekkiller").update(form).eq("id", id);

    if (error) {
      setHata("Kaydedilirken bir hata oluştu.");
      setKaydediliyor(false);
      return;
    }

    setMuvekkil((onceki) => ({ ...onceki, ...form }));
    setBasari("Değişiklikler kaydedildi.");
    setKaydediliyor(false);
  }

  if (yukleniyor) {
    return (
      <AdminShell baslik="Müvekkil Detayı">
        <Spinner className="h-6 w-6 text-vurgu" />
      </AdminShell>
    );
  }

  return (
    <AdminShell baslik={muvekkil.ad_soyad} aciklama={muvekkil.email}>
      <Link href="/admin/kullanicilar" className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-white/50 hover:text-white">
        <IconGeri className="h-4 w-4" />
        Kullanıcılara Dön
      </Link>

      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl border border-yonetim-kenar bg-yonetim-kutu p-5">
        <Avatar adSoyad={muvekkil.ad_soyad} boyut="lg" />
        <div className="flex-1">
          <p className="font-bold text-white">{muvekkil.ad_soyad}</p>
          <p className="text-sm text-white/50">{muvekkil.email}</p>
          <p className="mt-1 text-xs text-white/30">
            Kayıt tarihi: {new Date(muvekkil.created_at).toLocaleDateString("tr-TR")}
          </p>
        </div>
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
