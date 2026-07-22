"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { turkceHataMesaji } from "@/lib/hataMesajlari";
import { SEHIRLER } from "@/lib/sehirler";
import { UZMANLIK_ALANLARI } from "@/lib/uzmanlikAlanlari";
import { odemeDurumuBelirle } from "@/lib/odemeYardimci";
import TextField from "./TextField";
import Button from "./Button";
import { IconYildirim } from "./icons";

const BUGUN = () => new Date().toISOString().split("T")[0];

export default function AcilTalepFormu({ muvekkilProfil, onBasarili }) {
  const [form, setForm] = useState({
    sehir: muvekkilProfil.sehir ?? "",
    uzmanlikAlani: "",
    aciklama: "",
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
      acil: true,
      hedef_sehir: form.sehir,
      hedef_uzmanlik_alani: form.uzmanlikAlani,
      muvekkil_ad_soyad: muvekkilProfil.ad_soyad,
      muvekkil_telefon: muvekkilProfil.telefon,
      konu: `Acil: ${form.uzmanlikAlani}`,
      aciklama: form.aciklama,
      gorusme_sekli: "goruntulu",
      tarih: BUGUN(),
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
      <p className="flex items-start gap-2 rounded-xl bg-red-500/10 p-3 text-sm text-red-400 ring-1 ring-red-500/20">
        <IconYildirim className="mt-0.5 h-4 w-4 shrink-0" />
        Talebin, şehrine ve uzmanlık alanına uygun tüm avukatlara ACİL olarak
        gösterilir. İlk yanıt veren avukat seninle iletişime geçer.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          label="Şehir"
          id="acilSehir"
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
          id="acilUzmanlik"
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
        label="Ne oldu? Kısaca anlat"
        id="acilAciklama"
        as="textarea"
        rows={4}
        required
        value={form.aciklama}
        onChange={(e) => alanGuncelle("aciklama", e.target.value)}
        placeholder="Durumunu birkaç cümleyle özetle, avukatlar bunu görecek."
      />

      {hata && (
        <p className="rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-400 ring-1 ring-red-500/20">
          {hata}
        </p>
      )}

      <Button type="submit" variant="acil" yukleniyor={yukleniyor}>
        <IconYildirim className="h-4 w-4" />
        Acil Talebi Gönder
      </Button>
    </form>
  );
}
