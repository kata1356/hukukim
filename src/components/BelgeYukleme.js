"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Button from "./Button";

const IZINLI_TURLER = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const EN_FAZLA_MB = 5;

function BelgeAlani({ etiket, aciklama, dosya, onSec }) {
  return (
    <label className="flex cursor-pointer flex-col gap-1 rounded-lg border border-dashed border-white/20 p-4 transition hover:border-white/40">
      <span className="text-sm font-medium text-white">{etiket}</span>
      <span className="text-xs text-white/50">{dosya ? dosya.name : aciklama}</span>
      <input
        type="file"
        accept={IZINLI_TURLER.join(",")}
        onChange={(e) => onSec(e.target.files?.[0] ?? null)}
        className="hidden"
      />
    </label>
  );
}

export default function BelgeYukleme({ profil, onGuncel }) {
  const [kimlik, setKimlik] = useState(null);
  const [baroKarti, setBaroKarti] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState(null);

  if (profil.belge_durumu === "incelemede") {
    return (
      <p className="mt-4 rounded-lg bg-amber-500/10 px-4 py-3 text-sm text-amber-400">
        Belgelerin inceleniyor. Onaylandığında profilin &quot;Doğrulanmış&quot; olarak işaretlenecek.
      </p>
    );
  }

  function dosyaGecerliMi(dosya) {
    if (!IZINLI_TURLER.includes(dosya.type)) return "Yalnızca JPG, PNG, WEBP veya PDF yükleyebilirsin.";
    if (dosya.size > EN_FAZLA_MB * 1024 * 1024) return `Dosya en fazla ${EN_FAZLA_MB} MB olabilir.`;
    return null;
  }

  async function yukle(dosya, ad) {
    const uzanti = dosya.name.split(".").pop().toLowerCase();
    const yol = `${profil.id}/${ad}-${Date.now()}.${uzanti}`;
    const { error } = await supabase.storage.from("avukat-belgeleri").upload(yol, dosya, { contentType: dosya.type });
    if (error) throw error;
    return yol;
  }

  async function gonder(e) {
    e.preventDefault();
    setHata(null);

    const sorun = dosyaGecerliMi(kimlik) ?? dosyaGecerliMi(baroKarti);
    if (sorun) {
      setHata(sorun);
      return;
    }

    setYukleniyor(true);
    try {
      const kimlikYolu = await yukle(kimlik, "kimlik");
      const baroYolu = await yukle(baroKarti, "baro-karti");
      const alanlar = { kimlik_belge_yolu: kimlikYolu, baro_karti_yolu: baroYolu, belge_durumu: "incelemede" };
      const { error } = await supabase.from("avukatlar").update(alanlar).eq("id", profil.id);
      if (error) throw error;
      onGuncel(alanlar);
    } catch (err) {
      console.error("Belge yükleme hatası:", err);
      setHata("Belgeler yüklenemedi, lütfen tekrar dene.");
      setYukleniyor(false);
    }
  }

  return (
    <form onSubmit={gonder} className="mt-4 flex flex-col gap-3 rounded-lg border border-white/10 p-4">
      <div>
        <p className="text-sm font-semibold text-white">Kimlik doğrulaması</p>
        <p className="mt-0.5 text-xs text-white/50">
          Profilinin &quot;Doğrulanmış&quot; olması için kimliğini ve baro kartını yükle. Belgelerin yalnızca
          doğrulama ekibimiz tarafından görülür.
        </p>
      </div>

      {profil.belge_durumu === "reddedildi" && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">
          Belgelerin onaylanmadı{profil.belge_notu ? `: ${profil.belge_notu}` : "."} Lütfen yeniden yükle.
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <BelgeAlani etiket="Kimlik (ön yüz)" aciklama="JPG, PNG veya PDF · en fazla 5 MB" dosya={kimlik} onSec={setKimlik} />
        <BelgeAlani etiket="Baro kartı" aciklama="JPG, PNG veya PDF · en fazla 5 MB" dosya={baroKarti} onSec={setBaroKarti} />
      </div>

      {hata && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">{hata}</p>}

      <Button type="submit" yukleniyor={yukleniyor} disabled={!kimlik || !baroKarti} className="w-auto self-start">
        Belgeleri Gönder
      </Button>
    </form>
  );
}
