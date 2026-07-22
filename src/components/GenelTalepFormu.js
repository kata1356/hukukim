"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { turkceHataMesaji } from "@/lib/hataMesajlari";
import { GORUSME_SEKILLERI } from "@/lib/gorusmeSekli";
import { SEHIRLER } from "@/lib/sehirler";
import { UZMANLIK_ALANLARI } from "@/lib/uzmanlikAlanlari";
import { odemeDurumuBelirle } from "@/lib/odemeYardimci";
import TextField from "./TextField";
import Button from "./Button";

const BUGUN = () => new Date().toISOString().split("T")[0];

export default function GenelTalepFormu({ muvekkilProfil, onKapat, onBasarili }) {
  const [form, setForm] = useState({
    sehir: muvekkilProfil.sehir ?? "",
    uzmanlikAlani: "",
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

    const odemeDurumu = await odemeDurumuBelirle(supabase, muvekkilProfil.id);

    const { error } = await supabase.from("randevu_talepleri").insert({
      muvekkil_id: muvekkilProfil.id,
      avukat_id: null,
      tur: "genel",
      hedef_sehir: form.sehir,
      hedef_uzmanlik_alani: form.uzmanlikAlani,
      muvekkil_ad_soyad: muvekkilProfil.ad_soyad,
      muvekkil_telefon: muvekkilProfil.telefon,
      konu: form.konu,
      aciklama: form.aciklama,
      gorusme_sekli: form.gorusmeSekli,
      tarih: form.tarih,
      odeme_durumu: odemeDurumu,
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
      <p className="text-sm text-white/60">
        Talebin, seçtiğin şehir ve uzmanlık alanına uygun tüm avukatlara
        gösterilir. İlk yanıt veren avukat talebini üstlenir.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="Şehir"
          id="genelSehir"
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

        <TextField
          label="Uzmanlık Alanı"
          id="genelUzmanlik"
          as="select"
          required
          value={form.uzmanlikAlani}
          onChange={(e) => alanGuncelle("uzmanlikAlani", e.target.value)}
        >
          <option value="" disabled>
            Alan seç
          </option>
          {UZMANLIK_ALANLARI.map((alan) => (
            <option key={alan} value={alan}>
              {alan}
            </option>
          ))}
        </TextField>
      </div>

      <TextField
        label="Konu"
        id="genelKonu"
        type="text"
        required
        value={form.konu}
        onChange={(e) => alanGuncelle("konu", e.target.value)}
        placeholder="Ör. Kira sözleşmesi uyuşmazlığı"
      />

      <TextField
        label="Açıklama"
        id="genelAciklama"
        as="textarea"
        rows={4}
        required
        value={form.aciklama}
        onChange={(e) => alanGuncelle("aciklama", e.target.value)}
        placeholder="Durumunu kısaca anlat."
      />

      <TextField
        label="Görüşme Şekli"
        id="genelGorusmeSekli"
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
        id="genelTarih"
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
          Talebi Yayınla
        </Button>
      </div>
    </form>
  );
}
