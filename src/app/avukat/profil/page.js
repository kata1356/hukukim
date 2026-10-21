"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useAvukatProfili } from "@/lib/useAvukatProfili";
import AvukatShell from "@/components/AvukatShell";
import Avatar from "@/components/Avatar";
import Spinner from "@/components/Spinner";
import BelgeYukleme from "@/components/BelgeYukleme";
import DogrulamaRozeti from "@/components/DogrulamaRozeti";
import YildizGosterge from "@/components/YildizGosterge";
import {
  IconTelefon,
  IconKonum,
  IconBaro,
  IconUzmanlik,
  IconKamera,
  IconYildiz,
  IconKalem,
} from "@/components/icons";

export default function AvukatProfil() {
  const { profil, setProfil, yukleniyor } = useAvukatProfili();
  const [degerlendirmeler, setDegerlendirmeler] = useState([]);
  const [fotografYukleniyor, setFotografYukleniyor] = useState(false);
  const [fotografHata, setFotografHata] = useState(null);

  useEffect(() => {
    if (!profil?.id) return;
    supabase
      .from("degerlendirmeler")
      .select("*")
      .eq("avukat_id", profil.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setDegerlendirmeler(data ?? []));
  }, [profil?.id]);

  async function fotografYukle(e) {
    const dosya = e.target.files?.[0];
    if (!dosya || !profil) return;
    setFotografHata(null);
    setFotografYukleniyor(true);

    const uzanti = dosya.name.split(".").pop();
    const yol = `${profil.id}/profil.${uzanti}`;

    const { error: yuklemeHatasi } = await supabase.storage
      .from("avukat-fotograflari")
      .upload(yol, dosya, { upsert: true });

    if (yuklemeHatasi) {
      setFotografHata("Fotoğraf yüklenirken bir hata oluştu, lütfen tekrar dene.");
      setFotografYukleniyor(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from("avukat-fotograflari").getPublicUrl(yol);
    const yeniUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;

    const { error: guncelleHatasi } = await supabase
      .from("avukatlar")
      .update({ profil_fotografi_url: yeniUrl })
      .eq("id", profil.id);

    if (guncelleHatasi) {
      setFotografHata("Fotoğraf kaydedilirken bir hata oluştu, lütfen tekrar dene.");
      setFotografYukleniyor(false);
      return;
    }

    setProfil((onceki) => ({ ...onceki, profil_fotografi_url: yeniUrl }));
    setFotografYukleniyor(false);
  }

  if (yukleniyor) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-gece">
        <Spinner className="h-8 w-8 text-white" />
      </div>
    );
  }

  const ortalamaPuan =
    degerlendirmeler.length > 0 ? degerlendirmeler.reduce((t, d) => t + d.puan, 0) / degerlendirmeler.length : 0;

  return (
    <AvukatShell
      profil={profil}
      baslik="Profil"
      aciklama="Müvekkillerin seni nasıl gördüğü. Bilgilerini Ayarlar sayfasından düzenleyebilirsin."
      aksiyon={
        <Link
          href="/avukat/ayarlar"
          className="inline-flex items-center justify-center gap-2 rounded-md border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/40"
        >
          <IconKalem className="h-4 w-4" />
          Bilgilerimi Düzenle
        </Link>
      }
    >
      <section className="rounded-xl border border-white/10 bg-gece-yuzey p-5 sm:p-6">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <label className="group relative cursor-pointer">
            <Avatar
              adSoyad={profil.ad_soyad}
              fotografUrl={profil.profil_fotografi_url}
              dogrulanmis={profil.dogrulanmis}
              boyut="lg"
            />
            <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-turkuaz text-gece ring-2 ring-gece-yuzey transition group-hover:scale-110">
              {fotografYukleniyor ? <Spinner className="h-3.5 w-3.5" /> : <IconKamera className="h-3.5 w-3.5" />}
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={fotografYukle}
              disabled={fotografYukleniyor}
              className="hidden"
            />
          </label>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-white">{profil.ad_soyad}</h2>
            <p className="text-sm text-white/60">{profil.email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <DogrulamaRozeti dogrulanmis={profil.dogrulanmis} />
              <YildizGosterge ortalama={ortalamaPuan} sayi={degerlendirmeler.length} />
            </div>
          </div>
        </div>

        {fotografHata && (
          <p className="mt-3 rounded-lg bg-red-500/10 px-4 py-2.5 text-xs text-red-400 ring-1 ring-red-500/20">
            {fotografHata}
          </p>
        )}

        <div className="mt-6 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <IconTelefon className="h-4 w-4 shrink-0 text-turkuaz" />
            <span className="text-white/70">{profil.telefon}</span>
          </div>
          <div className="flex items-center gap-2">
            <IconKonum className="h-4 w-4 shrink-0 text-turkuaz" />
            <span className="text-white/70">{profil.sehir}</span>
          </div>
          <div className="flex items-center gap-2">
            <IconBaro className="h-4 w-4 shrink-0 text-turkuaz" />
            <span className="text-white/70">Baro Sicil No: {profil.baro_sicil_no}</span>
          </div>
          <div className="flex items-start gap-2">
            <IconUzmanlik className="mt-0.5 h-4 w-4 shrink-0 text-turkuaz" />
            <span className="text-white/70">{(profil.uzmanlik_alanlari ?? []).join(", ")}</span>
          </div>
        </div>

        {profil.biyografi && (
          <div className="mt-4 border-t border-white/10 pt-4">
            <span className="text-sm font-semibold text-white">Biyografi</span>
            <p className="mt-1 text-sm leading-relaxed text-white/70">{profil.biyografi}</p>
          </div>
        )}
      </section>

      {!profil.dogrulanmis && (
        <section className="scroll-mt-24 rounded-xl border border-white/10 bg-gece-yuzey p-5 sm:p-6">
          <BelgeYukleme
            profil={profil}
            onGuncel={(alanlar) => setProfil((onceki) => ({ ...onceki, ...alanlar }))}
          />
        </section>
      )}

      <section>
        <div className="mb-3 flex items-center gap-3">
          <h2 className="text-base font-semibold text-white">Değerlendirmeler</h2>
          <YildizGosterge ortalama={ortalamaPuan} sayi={degerlendirmeler.length} />
        </div>

        {degerlendirmeler.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-center text-sm text-white/50">
            Henüz bir değerlendirme almadın.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {degerlendirmeler.map((d) => (
              <div key={d.id} className="rounded-xl border border-white/10 bg-gece-yuzey p-5">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <IconYildiz key={i} className={`h-4 w-4 ${i < d.puan ? "text-turkuaz" : "text-white/15"}`} />
                  ))}
                </div>
                {d.yorum && <p className="mt-2 text-sm text-white/70">{d.yorum}</p>}
              </div>
            ))}
          </div>
        )}
      </section>
    </AvukatShell>
  );
}
