"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Spinner from "./Spinner";
import { IconYildiz } from "./icons";

export default function DegerlendirmeFormu({ talep, muvekkilId, onKapat, onBasarili }) {
  const [puan, setPuan] = useState(0);
  const [uzerindeGezinilen, setUzerindeGezinilen] = useState(0);
  const [yorum, setYorum] = useState("");
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [hata, setHata] = useState(null);

  async function gonder(e) {
    e.preventDefault();
    if (puan === 0) {
      setHata("Lütfen bir puan seç.");
      return;
    }

    setHata(null);
    setGonderiliyor(true);

    const { error } = await supabase.from("degerlendirmeler").insert({
      randevu_talep_id: talep.id,
      muvekkil_id: muvekkilId,
      avukat_id: talep.avukat_id,
      puan,
      yorum: yorum.trim() || null,
    });

    if (error) {
      setHata("Değerlendirme gönderilirken bir hata oluştu.");
      setGonderiliyor(false);
      return;
    }

    onBasarili();
  }

  return (
    <form onSubmit={gonder} className="flex flex-col gap-4">
      <p className="text-sm text-white/60">
        {talep.avukatlar?.ad_soyad ?? "Avukatınız"} ile görüşmeniz nasıldı?
      </p>

      <div className="flex items-center gap-1.5">
        {Array.from({ length: 5 }).map((_, i) => {
          const deger = i + 1;
          const dolu = deger <= (uzerindeGezinilen || puan);
          return (
            <button
              key={deger}
              type="button"
              onClick={() => setPuan(deger)}
              onMouseEnter={() => setUzerindeGezinilen(deger)}
              onMouseLeave={() => setUzerindeGezinilen(0)}
              aria-label={`${deger} yıldız`}
              className="p-0.5"
            >
              <IconYildiz className={`h-8 w-8 transition ${dolu ? "text-turkuaz" : "text-white/15"}`} />
            </button>
          );
        })}
      </div>

      {puan > 0 && puan <= 2 && (
        <p className="rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-400 ring-1 ring-red-500/20">
          Üzgünüz, beklediğin gibi geçmemiş. Ne yaşadığını aşağıya yazarsan
          ekibimiz inceleyip seninle iletişime geçer.
        </p>
      )}

      <textarea
        value={yorum}
        onChange={(e) => setYorum(e.target.value)}
        rows={3}
        placeholder={
          puan > 0 && puan <= 2
            ? "Ne ters gitti? Bir sorun yaşadıysan lütfen anlat..."
            : "İsteğe bağlı yorum yaz, bir sorun yaşadıysan da belirtebilirsin..."
        }
        className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-turkuaz focus:ring-2 focus:ring-turkuaz/30"
      />

      {hata && (
        <p className="rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-400 ring-1 ring-red-500/20">{hata}</p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={gonderiliyor}
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-turkuaz px-5 py-3 text-sm font-bold text-gece transition hover:bg-turkuaz-parlak disabled:opacity-60"
        >
          {gonderiliyor && <Spinner className="h-4 w-4" />}
          Gönder
        </button>
        <button
          type="button"
          onClick={onKapat}
          className="rounded-full border-2 border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/40"
        >
          Vazgeç
        </button>
      </div>
    </form>
  );
}
