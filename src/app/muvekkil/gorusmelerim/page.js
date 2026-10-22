"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { tarihFormatla } from "@/lib/gorusmeSekli";
import { useMuvekkilProfili } from "@/lib/useMuvekkilProfili";
import MuvekkilShell from "@/components/MuvekkilShell";
import Avatar from "@/components/Avatar";
import Spinner from "@/components/Spinner";
import Modal from "@/components/Modal";
import DurumRozeti from "@/components/DurumRozeti";
import GorusmeSekliEtiketi from "@/components/GorusmeSekliEtiketi";
import DegerlendirmeFormu from "@/components/DegerlendirmeFormu";
import VideoGorusmeButonu from "@/components/VideoGorusmeButonu";
import { IconArama, IconYildiz, IconSaat, IconOnay } from "@/components/icons";

const FILTRELER = [
  { anahtar: "hepsi", etiket: "Tümü" },
  { anahtar: "aktif", etiket: "Aktif" },
  { anahtar: "tamamlandi", etiket: "Tamamlanan" },
  { anahtar: "diger", etiket: "İptal / Reddedilen" },
];

function filtreUyar(talep, filtre) {
  if (filtre === "hepsi") return true;
  if (filtre === "aktif") return talep.durum === "bekliyor" || talep.durum === "kabul";
  if (filtre === "tamamlandi") return talep.durum === "tamamlandi";
  return talep.durum === "iptal" || talep.durum === "red";
}

// Talebin ilerleme adımları: Talep → Eşleşme → Görüşme → Tamamlandı
function adimlar(talep) {
  const iptalMi = talep.durum === "iptal" || talep.durum === "red";
  return [
    { ad: "Talep", tamam: true },
    { ad: "Eşleşme", tamam: ["kabul", "tamamlandi"].includes(talep.durum) },
    { ad: "Görüşme", tamam: talep.durum === "tamamlandi" },
    { ad: iptalMi ? (talep.durum === "red" ? "Reddedildi" : "İptal") : "Tamamlandı", tamam: talep.durum === "tamamlandi", iptal: iptalMi },
  ];
}

export default function MuvekkilGorusmelerim() {
  const { profil, yukleniyor } = useMuvekkilProfili();
  const [talepler, setTalepler] = useState([]);
  const [degerlendirilenIdler, setDegerlendirilenIdler] = useState([]);
  const [yuklendi, setYuklendi] = useState(false);
  const [filtre, setFiltre] = useState("hepsi");
  const [arama, setArama] = useState("");
  const [acikId, setAcikId] = useState(null);
  const [degerlendirilecek, setDegerlendirilecek] = useState(null);

  useEffect(() => {
    if (!profil?.id) return;
    let iptalEdildi = false;

    async function getir() {
      const { data } = await supabase
        .from("randevu_talepleri")
        .select("*, avukatlar(ad_soyad, profil_fotografi_url, sehir)")
        .eq("muvekkil_id", profil.id)
        .order("created_at", { ascending: false });
      const { data: degerlendirmeler } = await supabase
        .from("degerlendirmeler")
        .select("randevu_talep_id")
        .eq("muvekkil_id", profil.id);

      if (iptalEdildi) return;
      setTalepler(data ?? []);
      setDegerlendirilenIdler((degerlendirmeler ?? []).map((d) => d.randevu_talep_id));
      setYuklendi(true);
    }

    getir();
    return () => {
      iptalEdildi = true;
    };
  }, [profil?.id]);

  const gorunen = useMemo(() => {
    const kucuk = arama.trim().toLocaleLowerCase("tr-TR");
    return talepler.filter((t) => {
      if (!filtreUyar(t, filtre)) return false;
      if (!kucuk) return true;
      return [t.konu, t.hedef_uzmanlik_alani, t.hedef_sehir, t.avukatlar?.ad_soyad]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("tr-TR")
        .includes(kucuk);
    });
  }, [talepler, filtre, arama]);

  if (yukleniyor || !yuklendi) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-gece">
        <Spinner className="h-8 w-8 text-white" />
      </div>
    );
  }

  const sayilar = {
    hepsi: talepler.length,
    aktif: talepler.filter((t) => filtreUyar(t, "aktif")).length,
    tamamlandi: talepler.filter((t) => filtreUyar(t, "tamamlandi")).length,
    diger: talepler.filter((t) => filtreUyar(t, "diger")).length,
  };
  const toplamDakika = talepler
    .filter((t) => t.durum === "tamamlandi")
    .reduce((t, x) => t + Number(x.gorusme_suresi_dakika || 0), 0);

  return (
    <>
      <MuvekkilShell
        profil={profil}
        baslik="Görüşmelerim"
        aciklama="Tüm taleplerin, görüşmelerin ve geçmişin tek yerde."
      >
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { etiket: "Toplam talep", deger: sayilar.hepsi },
            { etiket: "Aktif", deger: sayilar.aktif },
            { etiket: "Tamamlanan", deger: sayilar.tamamlandi },
            { etiket: "Toplam görüşme süresi", deger: `${toplamDakika} dk` },
          ].map(({ etiket, deger }) => (
            <div key={etiket} className="rounded-xl border border-white/10 bg-gece-yuzey p-4">
              <p className="text-xs text-white/50">{etiket}</p>
              <p className="mt-1 font-heading text-2xl font-bold text-white">{deger}</p>
            </div>
          ))}
        </section>

        <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {FILTRELER.map(({ anahtar, etiket }) => (
              <button
                key={anahtar}
                onClick={() => setFiltre(anahtar)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  filtre === anahtar ? "bg-turkuaz text-gece" : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                {etiket} ({sayilar[anahtar]})
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 rounded-full border border-white/10 bg-gece-yuzey px-4 py-2 sm:w-72">
            <IconArama className="h-4 w-4 shrink-0 text-white/40" />
            <input
              type="text"
              value={arama}
              onChange={(e) => setArama(e.target.value)}
              placeholder="Konu, avukat veya şehir ara"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
            />
          </label>
        </section>

        {gorunen.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-10 text-center text-sm text-white/50">
            {talepler.length === 0 ? (
              <>
                Henüz bir talebin yok.{" "}
                <Link href="/muvekkil/panel" className="font-semibold text-turkuaz underline">
                  İlk talebini oluştur
                </Link>
              </>
            ) : (
              "Bu filtreye uygun görüşme bulunamadı."
            )}
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {gorunen.map((talep) => {
              const acik = acikId === talep.id;
              const degerlendirildi = degerlendirilenIdler.includes(talep.id);
              return (
                <article key={talep.id} className="rounded-xl border border-white/10 bg-gece-yuzey p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <Avatar
                        adSoyad={talep.avukatlar?.ad_soyad ?? talep.hedef_uzmanlik_alani}
                        fotografUrl={talep.avukatlar?.profil_fotografi_url}
                      />
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-white">{talep.avukatlar?.ad_soyad ?? "Eşleşme bekleniyor"}</p>
                        <p className="truncate text-sm text-white/60">{talep.konu}</p>
                        <p className="mt-1 text-xs text-white/40">
                          {talep.hedef_uzmanlik_alani} · {talep.hedef_sehir}
                        </p>
                      </div>
                    </div>
                    <DurumRozeti durum={talep.durum} />
                  </div>

                  <ol className="mt-4 flex items-center gap-2">
                    {adimlar(talep).map((adim, i, liste) => (
                      <li key={adim.ad} className="flex flex-1 items-center gap-2">
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                            adim.iptal
                              ? "bg-red-500/20 text-red-300"
                              : adim.tamam
                                ? "bg-turkuaz text-gece"
                                : "bg-white/10 text-white/40"
                          }`}
                        >
                          {adim.tamam && !adim.iptal ? <IconOnay className="h-3 w-3" /> : i + 1}
                        </span>
                        <span className={`text-[11px] font-medium ${adim.tamam || adim.iptal ? "text-white/70" : "text-white/30"}`}>
                          {adim.ad}
                        </span>
                        {i < liste.length - 1 && <span className="h-px flex-1 bg-white/10" />}
                      </li>
                    ))}
                  </ol>

                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/60">
                    <GorusmeSekliEtiketi deger={talep.gorusme_sekli} />
                    <span className="flex items-center gap-1.5">
                      <IconSaat className="h-3.5 w-3.5 text-white/40" />
                      {tarihFormatla(talep.tarih)}
                    </span>
                    {talep.paket_dakika && (
                      <span>
                        {talep.paket_dakika} dk · {talep.odeme_tutari > 0 ? `${talep.odeme_tutari} TL` : "Ücretsiz deneme"}
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
                    {talep.durum === "kabul" && talep.gorusme_sekli === "goruntulu" && (
                      <VideoGorusmeButonu randevuTalepId={talep.id} paketDakika={talep.paket_dakika} />
                    )}

                    {talep.durum === "tamamlandi" &&
                      (degerlendirildi ? (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-turkuaz">
                          <IconYildiz className="h-3.5 w-3.5" />
                          Değerlendirdin
                        </span>
                      ) : (
                        <button
                          onClick={() => setDegerlendirilecek(talep)}
                          className="flex items-center gap-1.5 rounded-md border border-turkuaz/30 px-4 py-2 text-xs font-bold text-turkuaz transition hover:bg-turkuaz/10"
                        >
                          <IconYildiz className="h-3.5 w-3.5" />
                          Avukatı Değerlendir
                        </button>
                      ))}

                    <button
                      onClick={() => setAcikId(acik ? null : talep.id)}
                      className="ml-auto text-xs font-semibold text-white/50 hover:text-white"
                    >
                      {acik ? "Ayrıntıyı gizle" : "Ayrıntıyı göster"}
                    </button>
                  </div>

                  {acik && (
                    <dl className="mt-4 grid grid-cols-1 gap-3 rounded-lg bg-white/[0.03] p-4 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-xs text-white/40">Talep açıklaması</dt>
                        <dd className="mt-0.5 text-white/80">{talep.aciklama || "—"}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-white/40">Paket ve ödeme</dt>
                        <dd className="mt-0.5 text-white/80">
                          {talep.paket_dakika ? `${talep.paket_dakika} dakika` : "—"} ·{" "}
                          {talep.odeme_tutari > 0 ? `${talep.odeme_tutari} TL` : "Ücretsiz"}
                          {talep.odeme_durumu === "odendi" && " (ödendi)"}
                        </dd>
                      </div>
                      {talep.gorusme_suresi_dakika > 0 && (
                        <div>
                          <dt className="text-xs text-white/40">Gerçekleşen görüşme süresi</dt>
                          <dd className="mt-0.5 text-white/80">{talep.gorusme_suresi_dakika} dakika</dd>
                        </div>
                      )}
                      <div>
                        <dt className="text-xs text-white/40">Talep no</dt>
                        <dd className="mt-0.5 font-mono text-xs text-white/50">{talep.id.slice(0, 8).toUpperCase()}</dd>
                      </div>
                    </dl>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </MuvekkilShell>

      {degerlendirilecek && (
        <Modal baslik="Avukatı Değerlendir" onKapat={() => setDegerlendirilecek(null)}>
          <DegerlendirmeFormu
            talep={degerlendirilecek}
            muvekkilId={profil.id}
            onKapat={() => setDegerlendirilecek(null)}
            onBasarili={() => {
              setDegerlendirilenIdler((onceki) => [...onceki, degerlendirilecek.id]);
              setDegerlendirilecek(null);
            }}
          />
        </Modal>
      )}
    </>
  );
}
