"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { tarihFormatla } from "@/lib/gorusmeSekli";
import { avukatPayiHesapla } from "@/lib/odemeYardimci";
import { useAvukatProfili } from "@/lib/useAvukatProfili";
import { useAvukatTalepleri } from "@/lib/useAvukatTalepleri";
import AvukatShell from "@/components/AvukatShell";
import Spinner from "@/components/Spinner";
import DurumRozeti from "@/components/DurumRozeti";
import DogrulamaDurumKarti from "@/components/DogrulamaDurumKarti";
import YildizGosterge from "@/components/YildizGosterge";
import { IconOk, IconYildirim, IconOnay, IconKonum } from "@/components/icons";

function Kart({ etiket, deger, alt, vurgu }) {
  return (
    <div className="rounded-xl border border-white/10 bg-gece-yuzey p-4 sm:p-5">
      <p className="text-xs font-medium text-white/50">{etiket}</p>
      <p className={`mt-2 font-heading text-3xl font-bold ${vurgu ? "text-turkuaz" : "text-white"}`}>{deger}</p>
      {alt && <p className="mt-1 text-xs text-white/40">{alt}</p>}
    </div>
  );
}

function selamla() {
  const saat = new Date().getHours();
  if (saat < 6) return "İyi geceler";
  if (saat < 12) return "Günaydın";
  if (saat < 18) return "İyi günler";
  return "İyi akşamlar";
}

export default function AvukatPanel() {
  const router = useRouter();
  const { profil, yukleniyor } = useAvukatProfili();
  const { talepler, acikTalepler } = useAvukatTalepleri(profil);
  const [degerlendirmeler, setDegerlendirmeler] = useState([]);
  const [kazanclar, setKazanclar] = useState([]);

  useEffect(() => {
    // Eski bildirim bağlantıları /avukat/panel#talepler adresine gider.
    if (window.location.hash === "#talepler") router.replace("/avukat/talepler");
  }, [router]);

  useEffect(() => {
    if (!profil?.id) return;
    supabase
      .from("degerlendirmeler")
      .select("puan")
      .eq("avukat_id", profil.id)
      .then(({ data }) => setDegerlendirmeler(data ?? []));
    supabase
      .from("avukat_kazanclari")
      .select("kazanilan_miktar, tarih, avukata_odendi")
      .eq("avukat_id", profil.id)
      .then(({ data }) => setKazanclar(data ?? []));
  }, [profil?.id]);

  if (yukleniyor) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-gece">
        <Spinner className="h-8 w-8 text-white" />
      </div>
    );
  }

  const bekleyenler = talepler.filter((t) => t.durum === "bekliyor");
  const aktifler = talepler.filter((t) => t.durum === "kabul");
  const tamamlananSayisi = talepler.filter((t) => t.durum === "tamamlandi").length;
  const acilAcik = acikTalepler.filter((t) => t.acil);

  const buAy = new Date().toISOString().slice(0, 7);
  const toplam = (liste) => liste.reduce((t, k) => t + Number(k.kazanilan_miktar || 0), 0);
  const buAyKazanc = toplam(kazanclar.filter((k) => String(k.tarih).slice(0, 7) === buAy));
  const bekleyenHakedis = toplam(kazanclar.filter((k) => !k.avukata_odendi));

  const ortalamaPuan =
    degerlendirmeler.length > 0 ? degerlendirmeler.reduce((t, d) => t + d.puan, 0) / degerlendirmeler.length : 0;

  const adimlar = [
    { ad: "Profil fotoğrafı ekle", tamam: Boolean(profil.profil_fotografi_url), href: "/avukat/profil" },
    { ad: "Biyografini yaz (en az 100 karakter)", tamam: (profil.biyografi ?? "").length >= 100, href: "/avukat/ayarlar" },
    { ad: "Uzmanlık alanı seç", tamam: (profil.uzmanlik_alanlari ?? []).length > 0, href: "/avukat/ayarlar" },
    { ad: "Hakediş için IBAN gir", tamam: Boolean(profil.iban), href: "/avukat/ayarlar" },
    { ad: "Kimliğini doğrulat", tamam: Boolean(profil.dogrulanmis), href: "/avukat/profil#kimlik-dogrulama" },
  ];
  const tamamlanan = adimlar.filter((a) => a.tamam).length;
  const yuzde = Math.round((tamamlanan / adimlar.length) * 100);

  const ilkAd = (profil.ad_soyad ?? "").split(" ")[0];

  return (
    <AvukatShell
      profil={profil}
      rozetler={{ "/avukat/talepler": bekleyenler.length + acikTalepler.length }}
      baslik={`${selamla()}, ${ilkAd}`}
      aciklama="Bugün seni bekleyen işler ve genel durumun."
    >
      {!profil.dogrulanmis && <DogrulamaDurumKarti profil={profil} />}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <Kart etiket="Açık havuz" deger={acikTalepler.length} alt={acilAcik.length > 0 ? `${acilAcik.length} acil` : "uygun talep"} vurgu={acikTalepler.length > 0} />
        <Kart etiket="Onay bekleyen" deger={bekleyenler.length} alt="cevap bekliyor" />
        <Kart etiket="Aktif görüşme" deger={aktifler.length} alt={`${tamamlananSayisi} tamamlandı`} />
        <Kart etiket="Bu ay kazanç" deger={`${buAyKazanc} TL`} alt={`${bekleyenHakedis} TL havale bekliyor`} />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="flex flex-col gap-6 lg:col-span-2">
          {profil.dogrulanmis && (
            <div className="rounded-xl border border-white/10 bg-gece-yuzey p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-white">Seni bekleyenler</h2>
                <Link href="/avukat/talepler" className="flex items-center gap-1 text-xs font-semibold text-turkuaz hover:underline">
                  Tümünü gör
                  <IconOk className="h-3.5 w-3.5" />
                </Link>
              </div>

              {acikTalepler.length === 0 && bekleyenler.length === 0 && aktifler.length === 0 ? (
                <p className="mt-4 rounded-lg border border-dashed border-white/15 p-6 text-center text-sm text-white/50">
                  Şu an bekleyen bir iş yok. Yeni talep gelince burada ve bildirimlerde görürsün.
                </p>
              ) : (
                <ul className="mt-4 flex flex-col divide-y divide-white/5">
                  {[...acilAcik, ...acikTalepler.filter((t) => !t.acil)].slice(0, 3).map((talep) => (
                    <li key={talep.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 truncate text-sm font-semibold text-white">
                          {talep.acil && (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded bg-red-500/15 px-1.5 py-0.5 text-[10px] font-bold text-red-400">
                              <IconYildirim className="h-3 w-3" />
                              ACİL
                            </span>
                          )}
                          <span className="truncate">{talep.konu}</span>
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-white/50">
                          <IconKonum className="h-3 w-3" />
                          {talep.hedef_sehir} · {talep.hedef_uzmanlik_alani}
                          {talep.odeme_tutari > 0 && ` · ${avukatPayiHesapla(talep.odeme_tutari)} TL`}
                        </p>
                      </div>
                      <Link
                        href="/avukat/talepler"
                        className="shrink-0 rounded-md bg-turkuaz/10 px-3 py-1.5 text-xs font-bold text-turkuaz transition hover:bg-turkuaz/20"
                      >
                        İncele
                      </Link>
                    </li>
                  ))}
                  {[...bekleyenler, ...aktifler].slice(0, 3).map((talep) => (
                    <li key={talep.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{talep.muvekkil_ad_soyad}</p>
                        <p className="mt-0.5 truncate text-xs text-white/50">
                          {talep.konu} · {tarihFormatla(talep.tarih)}
                        </p>
                      </div>
                      <DurumRozeti durum={talep.durum} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className="rounded-xl border border-white/10 bg-gece-yuzey p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">Müvekkil memnuniyeti</h2>
              <Link href="/avukat/profil" className="text-xs font-semibold text-turkuaz hover:underline">
                Değerlendirmeler
              </Link>
            </div>
            {degerlendirmeler.length === 0 ? (
              <p className="mt-3 text-sm text-white/50">
                Henüz değerlendirme yok. İlk görüşmelerini tamamladıkça burada puanın oluşur.
              </p>
            ) : (
              <div className="mt-3 flex items-center gap-4">
                <p className="font-heading text-4xl font-bold text-white">{ortalamaPuan.toFixed(1)}</p>
                <YildizGosterge ortalama={ortalamaPuan} sayi={degerlendirmeler.length} />
              </div>
            )}
          </div>
        </section>

        <aside className="rounded-xl border border-white/10 bg-gece-yuzey p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Profil gücü</h2>
            <span className="text-sm font-bold text-turkuaz">%{yuzde}</span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/5">
            <div className="h-full rounded-full bg-turkuaz transition-all" style={{ width: `${yuzde}%` }} />
          </div>
          <p className="mt-2 text-xs text-white/40">Tam profiller müvekkillerde daha çok güven uyandırır.</p>

          <ul className="mt-4 flex flex-col gap-2.5">
            {adimlar.map(({ ad, tamam, href }) => (
              <li key={ad}>
                {tamam ? (
                  <span className="flex items-center gap-2 text-sm text-white/50 line-through decoration-white/20">
                    <IconOnay className="h-4 w-4 shrink-0 text-green-400" />
                    {ad}
                  </span>
                ) : (
                  <Link href={href} className="flex items-center gap-2 text-sm font-medium text-white transition hover:text-turkuaz">
                    <span className="h-4 w-4 shrink-0 rounded-full border border-white/30" />
                    {ad}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </AvukatShell>
  );
}
