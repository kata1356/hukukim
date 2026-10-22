"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { tarihFormatla } from "@/lib/gorusmeSekli";
import Avatar from "./Avatar";
import YildizGosterge from "./YildizGosterge";
import {
  IconEv,
  IconKalp,
  IconUzmanlik,
  IconKalkan,
  IconEtiket,
  IconBina,
  IconCip,
  IconBaro,
  IconKonum,
  IconOnay,
  IconKvkk,
  IconVideo,
  IconCuzdan,
  IconOk,
} from "./icons";

// Müvekkilin en sık başvurduğu konular; her biri talep formunda ilgili uzmanlık alanını seçili açar.
const HIZLI_KONULAR = [
  { etiket: "Kira ve Tahliye", alan: "Gayrimenkul Hukuku", Icon: IconEv },
  { etiket: "Boşanma ve Velayet", alan: "Boşanma Hukuku", Icon: IconKalp },
  { etiket: "İşten Çıkarılma", alan: "İş Hukuku", Icon: IconUzmanlik },
  { etiket: "Ceza ve Savunma", alan: "Ceza Hukuku", Icon: IconKalkan },
  { etiket: "Tüketici Sorunu", alan: "Tüketici Hukuku", Icon: IconEtiket },
  { etiket: "Miras", alan: "Miras Hukuku", Icon: IconBina },
  { etiket: "Trafik Kazası", alan: "Trafik Kazaları Hukuku", Icon: IconCip },
  { etiket: "Şirket ve Ticaret", alan: "Ticaret Hukuku", Icon: IconBaro },
];

export function HizliKonular({ onSec }) {
  return (
    <section>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-white">Hangi konuda destek arıyorsun?</h2>
          <p className="mt-0.5 text-sm text-white/50">Konuyu seç, uygun avukatla hemen eşleşelim.</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {HIZLI_KONULAR.map(({ etiket, alan, Icon }) => (
          <button
            key={alan}
            type="button"
            onClick={() => onSec(alan)}
            className="group flex flex-col items-start gap-3 rounded-xl border border-white/10 bg-gece-yuzey p-4 text-left transition hover:-translate-y-0.5 hover:border-turkuaz/40"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-turkuaz/10 text-turkuaz transition group-hover:bg-turkuaz group-hover:text-gece">
              <Icon className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold text-white">{etiket}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

const HAREKET_AYARLARI = {
  bekliyor: { nokta: "bg-amber-400", baslik: "Talep gönderildi", alt: "Avukat eşleşmesi bekleniyor" },
  kabul: { nokta: "bg-green-400", baslik: "Avukatla eşleştin", alt: "Görüşme için hazır" },
  tamamlandi: { nokta: "bg-turkuaz", baslik: "Görüşme tamamlandı", alt: "Değerlendirme yapabilirsin" },
  red: { nokta: "bg-red-400", baslik: "Talep reddedildi", alt: "Yeni bir talep açabilirsin" },
  iptal: { nokta: "bg-white/40", baslik: "Talep iptal edildi", alt: "" },
};

export function SonHareketler({ talepler }) {
  const son = talepler.slice(0, 6);

  return (
    <section className="rounded-xl border border-white/10 bg-gece-yuzey p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">Son hareketler</h2>
        <Link href="/muvekkil/gorusmelerim" className="flex items-center gap-1 text-xs font-semibold text-turkuaz hover:underline">
          Tüm görüşmelerim
          <IconOk className="h-3.5 w-3.5" />
        </Link>
      </div>

      {son.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-white/15 p-6 text-center text-sm text-white/50">
          Henüz bir hareket yok. İlk talebini oluşturunca burada görünür.
        </p>
      ) : (
        <ol className="mt-5 flex flex-col">
          {son.map((talep, i) => {
            const ayar = HAREKET_AYARLARI[talep.durum] ?? HAREKET_AYARLARI.bekliyor;
            const sonMu = i === son.length - 1;
            return (
              <li key={talep.id} className="relative flex gap-4 pb-5 last:pb-0">
                {!sonMu && <span className="absolute left-[7px] top-4 h-full w-px bg-white/10" aria-hidden="true" />}
                <span className={`relative mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full ring-4 ring-gece-yuzey ${ayar.nokta}`} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">
                    {ayar.baslik}
                    {talep.avukatlar?.ad_soyad && talep.durum !== "bekliyor" && (
                      <span className="font-normal text-white/60"> · {talep.avukatlar.ad_soyad}</span>
                    )}
                  </p>
                  <p className="truncate text-xs text-white/50">{talep.konu}</p>
                  <p className="mt-0.5 text-[11px] text-white/30">{tarihFormatla(talep.tarih)}</p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

// Müvekkilin şehrindeki doğrulanmış avukatlardan puanı en yüksek olanları gösterir.
export function OnerilenAvukatlar({ sehir }) {
  const [avukatlar, setAvukatlar] = useState(null);

  useEffect(() => {
    let iptalEdildi = false;

    async function getir() {
      let sorgu = supabase.from("avukatlar").select("*").eq("dogrulanmis", true).limit(30);
      if (sehir) sorgu = sorgu.eq("sehir", sehir);
      const { data: liste } = await sorgu;
      const idler = (liste ?? []).map((a) => a.id);

      const puanlar = {};
      if (idler.length > 0) {
        const { data: degerlendirmeler } = await supabase
          .from("degerlendirmeler")
          .select("avukat_id, puan")
          .in("avukat_id", idler);
        for (const d of degerlendirmeler ?? []) {
          const kayit = (puanlar[d.avukat_id] ??= { toplam: 0, sayi: 0 });
          kayit.toplam += d.puan;
          kayit.sayi += 1;
        }
      }

      const siralanmis = (liste ?? [])
        .map((a) => {
          const p = puanlar[a.id];
          return { ...a, ortalama: p ? p.toplam / p.sayi : 0, puanSayisi: p?.sayi ?? 0 };
        })
        .sort((a, b) => b.ortalama - a.ortalama || b.puanSayisi - a.puanSayisi)
        .slice(0, 4);

      if (!iptalEdildi) setAvukatlar(siralanmis);
    }

    getir();
    return () => {
      iptalEdildi = true;
    };
  }, [sehir]);

  return (
    <section className="rounded-xl border border-white/10 bg-gece-yuzey p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">{sehir ? `${sehir} için öne çıkan avukatlar` : "Öne çıkan avukatlar"}</h2>
        <Link href="/avukatlar" className="flex items-center gap-1 text-xs font-semibold text-turkuaz hover:underline">
          Tümü
          <IconOk className="h-3.5 w-3.5" />
        </Link>
      </div>

      {avukatlar === null ? (
        <p className="mt-4 text-sm text-white/40">Yükleniyor...</p>
      ) : avukatlar.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-white/15 p-6 text-center text-sm text-white/50">
          Şehrinde henüz doğrulanmış avukat görünmüyor. Talebin tüm uygun avukatlara iletilir.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col divide-y divide-white/5">
          {avukatlar.map((avukat) => (
            <li key={avukat.id} className="flex items-center gap-3 py-3">
              <Avatar adSoyad={avukat.ad_soyad} fotografUrl={avukat.profil_fotografi_url} dogrulanmis={avukat.dogrulanmis} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{avukat.ad_soyad}</p>
                <p className="flex items-center gap-1 truncate text-xs text-white/50">
                  <IconKonum className="h-3 w-3 shrink-0" />
                  {avukat.sehir}
                  {avukat.uzmanlik_alanlari?.[0] && ` · ${avukat.uzmanlik_alanlari[0]}`}
                </p>
              </div>
              <YildizGosterge ortalama={avukat.ortalama} sayi={avukat.puanSayisi} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

const HAZIRLIK_MADDELERI = [
  "Olayı tarih sırasıyla birkaç cümleyle yaz.",
  "Sözleşme, tebligat, ihtar, dekont gibi belgeleri hazırla.",
  "Karşı tarafın adı ve olayın yeri/tarihi gibi bilgileri not al.",
  "Avukata sormak istediğin 2-3 soruyu önceden belirle.",
  "Sakin ve sessiz bir ortamda, bağlantısı güçlü bir yerde ol.",
];

export function HazirlikRehberi() {
  return (
    <section className="rounded-xl border border-white/10 bg-gece-yuzey p-5 sm:p-6">
      <h2 className="text-base font-semibold text-white">Görüşmeye hazırlan</h2>
      <p className="mt-1 text-sm text-white/50">Süren değerli; hazırlıklı gelirsen daha çok iş çıkar.</p>
      <ul className="mt-4 flex flex-col gap-2.5">
        {HAZIRLIK_MADDELERI.map((madde) => (
          <li key={madde} className="flex items-start gap-2.5 text-sm text-white/70">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-turkuaz/15 text-turkuaz">
              <IconOnay className="h-3 w-3" />
            </span>
            {madde}
          </li>
        ))}
      </ul>
    </section>
  );
}

const GUVEN_MADDELERI = [
  { Icon: IconBaro, baslik: "Doğrulanmış avukatlar", metin: "Her avukatın baro kaydı ve kimliği ekibimizce kontrol edilir." },
  { Icon: IconKvkk, baslik: "Gizlilik", metin: "Görüşmeler kaydedilmez; bilgilerin KVKK kapsamında korunur." },
  { Icon: IconCuzdan, baslik: "Şeffaf fiyat", metin: "Süre ve ücret baştan belli. Sürpriz ödeme yok." },
  { Icon: IconVideo, baslik: "Güvenli görüşme", metin: "Görüntülü görüşme platformun içinde, uçtan uca güvenli yapılır." },
];

export function GuvenSeridi() {
  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {GUVEN_MADDELERI.map(({ Icon, baslik, metin }) => (
        <div key={baslik} className="flex items-start gap-3 rounded-xl border border-white/10 bg-gece-yuzey p-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-turkuaz/10 text-turkuaz">
            <Icon className="h-[18px] w-[18px]" />
          </span>
          <div>
            <p className="text-sm font-semibold text-white">{baslik}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-white/50">{metin}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
