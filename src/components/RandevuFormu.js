"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { turkceHataMesaji } from "@/lib/hataMesajlari";
import { GORUSME_SEKILLERI } from "@/lib/gorusmeSekli";
import TextField from "./TextField";
import Button from "./Button";
import Avatar from "./Avatar";

const BUGUN = () => new Date().toISOString().split("T")[0];

export default function RandevuFormu({ avukat, muvekkilProfil, onKapat, onBasarili }) {
  const [form, setForm] = useState({
    konu: "",
    aciklama: "",
    gorusmeSekli: "goruntulu",
    tarih: "",
  });
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState(null);

  function alanGuncelle(alan, deger) {
    setForm((onceki) => ({ ...onceki, [alan]: deger }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setHata(null);
    setYukleniyor(true);

    const { error } = await supabase.from("randevu_talepleri").insert({
      muvekkil_id: muvekkilProfil.id,
      avukat_id: avukat.id,
      muvekkil_ad_soyad: muvekkilProfil.ad_soyad,
      muvekkil_telefon: muvekkilProfil.telefon,
      konu: form.konu,
      aciklama: form.aciklama,
      gorusme_sekli: form.gorusmeSekli,
      tarih: form.tarih,
    });

    if (error) {
      setHata(turkceHataMesaji(error));
      setYukleniyor(false);
      return;
    }

    setYukleniyor(false);
    onBasarili();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-3">
        <Avatar
          adSoyad={avukat.ad_soyad}
          fotografUrl={avukat.profil_fotografi_url}
          dogrulanmis={avukat.dogrulanmis}
          boyut="sm"
        />
        <p className="text-sm text-white/60">
          <span className="font-semibold text-white">{avukat.ad_soyad}</span>{" "}
          için randevu talebi gönderiyorsun.
        </p>
      </div>

      <TextField
        label="Konu"
        id="konu"
        type="text"
        required
        value={form.konu}
        onChange={(e) => alanGuncelle("konu", e.target.value)}
        placeholder="Ör. Kira sözleşmesi uyuşmazlığı"
      />

      <TextField
        label="Açıklama"
        id="aciklama"
        as="textarea"
        rows={4}
        required
        value={form.aciklama}
        onChange={(e) => alanGuncelle("aciklama", e.target.value)}
        placeholder="Durumunu kısaca anlat."
      />

      <TextField
        label="Görüşme Şekli"
        id="gorusmeSekli"
        as="select"
        required
        value={form.gorusmeSekli}
        onChange={(e) => alanGuncelle("gorusmeSekli", e.target.value)}
      >
        {GORUSME_SEKILLERI.map((g) => (
          <option key={g.value} value={g.value}>
            {g.label}
          </option>
        ))}
      </TextField>

      <TextField
        label="Tarih"
        id="tarih"
        type="date"
        required
        min={BUGUN()}
        value={form.tarih}
        onChange={(e) => alanGuncelle("tarih", e.target.value)}
      />

      {hata && (
        <p className="rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-400 ring-1 ring-red-500/20">
          {hata}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="button" variant="anahat" onClick={onKapat} className="w-auto flex-1">
          Vazgeç
        </Button>
        <Button type="submit" yukleniyor={yukleniyor} className="w-auto flex-1">
          Talebi Gönder
        </Button>
      </div>
    </form>
  );
}
