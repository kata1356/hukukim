"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import PanelHeader from "@/components/PanelHeader";
import Avatar from "@/components/Avatar";
import Spinner from "@/components/Spinner";
import Modal from "@/components/Modal";
import GenelTalepFormu from "@/components/GenelTalepFormu";
import DurumRozeti from "@/components/DurumRozeti";
import GorusmeSekliEtiketi from "@/components/GorusmeSekliEtiketi";
import AltMenu from "@/components/AltMenu";
import StatKarti from "@/components/StatKarti";
import DegerlendirmeFormu from "@/components/DegerlendirmeFormu";
import VideoGorusmeButonu from "@/components/VideoGorusmeButonu";
import { tarihFormatla } from "@/lib/gorusmeSekli";
import { MUVEKKIL_SEKMELER } from "@/lib/muvekkilMenu";
import {
  IconOnay,
  IconYayin,
  IconYildiz,
  IconYildirim,
} from "@/components/icons";

function sureFormatla(saniye) {
  const dk = Math.floor(saniye / 60);
  const sn = saniye % 60;
  return `${String(dk).padStart(2, "0")}:${String(sn).padStart(2, "0")}`;
}

const BEKLEME_IPUCLARI = [
  "Görüşmeye başlamadan önce anlatmak istediklerini kısaca not al, zamanını verimli kullan.",
  "Elindeki belgeleri (sözleşme, tebligat, fatura vb.) yanında bulundur, avukatın işine yarayabilir.",
  "Telefon numaran avukatla asla paylaşılmaz, gizliliğin platform tarafından korunur.",
  "Görüşme bitince avukatını değerlendirmeyi unutma, diğer müvekkillere yol gösterir.",
  "Paket sürene 1 dakika kalınca ekranda uyarı çıkar, aniden kesilme diye endişelenme.",
  "Bu görüşme seninle ilgilenecek ilk uygun avukata anında iletiliyor.",
];

function BeklemeIpuclari() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const zamanlayici = setInterval(() => {
      setIndex((onceki) => (onceki + 1) % BEKLEME_IPUCLARI.length);
    }, 4500);
    return () => clearInterval(zamanlayici);
  }, []);

  return (
    <div className="flex w-full flex-col gap-3 sm:w-64 sm:shrink-0 sm:border-l sm:border-white/10 sm:pl-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-white/30">Beklerken</p>
      <p key={index} className="animate-[fade-in_0.4s_ease-out] text-sm leading-relaxed text-white/70">
        {BEKLEME_IPUCLARI[index]}
      </p>
      <div className="flex gap-1.5">
        {BEKLEME_IPUCLARI.map((_, i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i === index ? "bg-turkuaz" : "bg-white/10"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function MuvekkilPanel() {
  const router = useRouter();

  const [sayfaYukleniyor, setSayfaYukleniyor] = useState(true);
  const [profil, setProfil] = useState(null);
  const [genelTalepAcik, setGenelTalepAcik] = useState(false);
  const [basariMesaji, setBasariMesaji] = useState(() => {
    if (typeof window === "undefined") return null;
    const sonuc = new URLSearchParams(window.location.search).get("odeme");
    return sonuc === "basarili" ? "Ödemen alındı, talebin avukatlara gönderildi." : null;
  });
  const [odemeHatasi, setOdemeHatasi] = useState(() => {
    if (typeof window === "undefined") return null;
    const sonuc = new URLSearchParams(window.location.search).get("odeme");
    return sonuc === "basarisiz" ? "Ödeme tamamlanamadı, tekrar deneyebilirsin." : null;
  });
  const [gonderilenTalepler, setGonderilenTalepler] = useState([]);
  const [degerlendirilenIdler, setDegerlendirilenIdler] = useState([]);
  const [degerlendirilecekTalep, setDegerlendirilecekTalep] = useState(null);
  const [videoTalepId, setVideoTalepId] = useState(() => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get("video");
  });
  const [aktifBeklemeTalepId, setAktifBeklemeTalepId] = useState(() => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get("talep");
  });
  const [beklemeSaniye, setBeklemeSaniye] = useState(0);
  const [eslesmeTalep, setEslesmeTalep] = useState(null);
  const [iptalEdiliyor, setIptalEdiliyor] = useState(false);
  const [talepSekmesi, setTalepSekmesi] = useState("aktif");

  const otomatikDegerlendirmeGosterilenlerRef = useRef(new Set());
  const eslesmeGosterilenlerRef = useRef(new Set());
  const aktifBeklemeTalepIdRef = useRef(aktifBeklemeTalepId);

  useEffect(() => {
    aktifBeklemeTalepIdRef.current = aktifBeklemeTalepId;
  }, [aktifBeklemeTalepId]);

  async function gonderilenTalepleriGetir(kullaniciId) {
    const { data } = await supabase
      .from("randevu_talepleri")
      .select("*, avukatlar(ad_soyad, profil_fotografi_url)")
      .eq("muvekkil_id", kullaniciId)
      .order("created_at", { ascending: false });
    setGonderilenTalepler(data ?? []);

    const beklenenId = aktifBeklemeTalepIdRef.current;
    if (beklenenId) {
      const eslesen = (data ?? []).find(
        (t) => t.id === beklenenId && t.durum === "kabul" && !eslesmeGosterilenlerRef.current.has(t.id)
      );
      if (eslesen) {
        eslesmeGosterilenlerRef.current.add(eslesen.id);
        setEslesmeTalep(eslesen);
      }
    }

    const { data: degerlendirmeler } = await supabase
      .from("degerlendirmeler")
      .select("randevu_talep_id")
      .eq("muvekkil_id", kullaniciId);
    const degerlendirilenIdListesi = (degerlendirmeler ?? []).map((d) => d.randevu_talep_id);
    setDegerlendirilenIdler(degerlendirilenIdListesi);

    const degerlendirilmemisTamamlanan = (data ?? []).find(
      (t) =>
        t.durum === "tamamlandi" &&
        !degerlendirilenIdListesi.includes(t.id) &&
        !otomatikDegerlendirmeGosterilenlerRef.current.has(t.id)
    );

    if (degerlendirilmemisTamamlanan) {
      otomatikDegerlendirmeGosterilenlerRef.current.add(degerlendirilmemisTamamlanan.id);
      setDegerlendirilecekTalep(degerlendirilmemisTamamlanan);
    }
  }

  function degerlendirmeBasarili() {
    setDegerlendirilenIdler((oncekiler) => [...oncekiler, degerlendirilecekTalep.id]);
    setDegerlendirilecekTalep(null);
    setBasariMesaji("Değerlendirmen için teşekkürler.");
  }

  useEffect(() => {
    let iptalEdildi = false;

    async function veriGetir() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/giris");
        return;
      }

      const { data: muvekkilProfili } = await supabase
        .from("muvekkiller")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (!muvekkilProfili) {
        router.push("/giris");
        return;
      }

      await gonderilenTalepleriGetir(user.id);

      if (iptalEdildi) return;
      setProfil(muvekkilProfili);
      setSayfaYukleniyor(false);
    }

    veriGetir();
    return () => {
      iptalEdildi = true;
    };
  }, [router]);

  useEffect(() => {
    if (!profil?.id) return;

    const kanal = supabase
      .channel(`randevu-muvekkil-${profil.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "randevu_talepleri", filter: `muvekkil_id=eq.${profil.id}` },
        () => gonderilenTalepleriGetir(profil.id)
      )
      .subscribe();

    return () => supabase.removeChannel(kanal);
  }, [profil?.id]);

  useEffect(() => {
    if (
      window.location.search.includes("video=") ||
      window.location.search.includes("odeme=") ||
      window.location.search.includes("talep=")
    ) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  async function genelTalepBasarili(talepId) {
    setGenelTalepAcik(false);
    setAktifBeklemeTalepId(talepId);
    if (profil?.id) await gonderilenTalepleriGetir(profil.id);
  }

  async function talebiIptalEt(talepId) {
    setIptalEdiliyor(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const yanit = await fetch("/api/talep/iptal-et", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ randevuTalepId: talepId }),
      });
      if (yanit.ok) {
        setAktifBeklemeTalepId(null);
        if (profil?.id) await gonderilenTalepleriGetir(profil.id);
      }
    } finally {
      setIptalEdiliyor(false);
    }
  }

  function eslesmeyiGorusmeyeBaslat() {
    if (eslesmeTalep?.gorusme_sekli === "goruntulu") {
      setVideoTalepId(eslesmeTalep.id);
    }
    setAktifBeklemeTalepId(null);
    setEslesmeTalep(null);
  }

  useEffect(() => {
    if (!aktifBeklemeTalepId) return;

    const baslangic = Date.now();
    const zamanlayici = setInterval(() => {
      setBeklemeSaniye(Math.floor((Date.now() - baslangic) / 1000));
    }, 1000);

    return () => clearInterval(zamanlayici);
  }, [aktifBeklemeTalepId]);

  if (sayfaYukleniyor) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-gece">
        <Spinner className="h-8 w-8 text-white" />
      </div>
    );
  }

  const bekleyenSayisi = gonderilenTalepler.filter((t) => t.durum === "bekliyor").length;
  const onaylananSayisi = gonderilenTalepler.filter((t) => t.durum === "kabul").length;
  const odemeTamamMi = (t) => t.odeme_durumu === "odendi" || t.odeme_durumu === "muaf";
  const ilkGorusmeMi = !gonderilenTalepler.some(
    (t) => t.odeme_durumu === "odendi" || (t.odeme_durumu === "muaf" && t.durum !== "iptal")
  );
  const aktifDurumlar = ["bekliyor", "kabul"];
  const aktifTalepler = gonderilenTalepler.filter((t) => aktifDurumlar.includes(t.durum));
  const gecmisTalepler = gonderilenTalepler.filter((t) => !aktifDurumlar.includes(t.durum));
  const gosterilenTalepler = talepSekmesi === "aktif" ? aktifTalepler : gecmisTalepler;
  const beklenenTalep = gonderilenTalepler.find(
    (t) => t.id === aktifBeklemeTalepId && t.durum === "bekliyor" && odemeTamamMi(t)
  );

  return (
    <div className="flex min-h-full flex-1 flex-col bg-gece">
      <PanelHeader adSoyad={profil.ad_soyad} panelAdi="Müvekkil Paneli" panelYolu="/muvekkil" />

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 pb-24 sm:px-6 sm:pb-8">
        <div>
          <h1 className="text-xl font-semibold text-white">
            Merhaba, {profil.ad_soyad.split(" ")[0]}
          </h1>
        </div>

        {beklenenTalep && (
          <div className="relative overflow-hidden rounded-lg border border-white/10 bg-gece-yuzey p-6 sm:p-8">
            <button
              onClick={() => setAktifBeklemeTalepId(null)}
              aria-label="Kapat"
              className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full text-white/40 transition hover:bg-white/5 hover:text-white"
            >
              ✕
            </button>

            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-center">
              <div className="flex flex-col items-center gap-4 text-center">
                <Spinner className="h-8 w-8 text-turkuaz" />

                <div>
                  <p className="text-xl font-semibold text-white">Avukat aranıyor</p>
                  <p className="mt-1 font-mono text-sm text-turkuaz">{sureFormatla(beklemeSaniye)}</p>
                </div>

                <p className="max-w-sm text-sm text-white/60">
                  <strong className="text-white/80">{beklenenTalep.hedef_sehir}</strong> ·{" "}
                  {beklenenTalep.hedef_uzmanlik_alani} alanında uygun avukatlara bildirim gönderildi.
                  Bir avukat kabul eder etmez burada bilgilendirileceksin.
                </p>

                {beklenenTalep.paket_dakika && (
                  <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-white/70">
                    <IconYayin className="h-3.5 w-3.5 text-turkuaz" />
                    {beklenenTalep.paket_dakika} dk paket
                    {beklenenTalep.odeme_tutari > 0 ? ` · ${beklenenTalep.odeme_tutari} TL` : " · Ücretsiz"}
                  </div>
                )}

                <button
                  onClick={() => talebiIptalEt(beklenenTalep.id)}
                  disabled={iptalEdiliyor}
                  className="mt-2 text-xs font-semibold text-white/40 underline transition hover:text-white/70 disabled:opacity-50"
                >
                  {iptalEdiliyor
                    ? "İptal ediliyor..."
                    : beklenenTalep.odeme_tutari > 0
                    ? "Talebi İptal Et ve Ücreti İade Al"
                    : "Talebi İptal Et"}
                </button>
              </div>

              <BeklemeIpuclari />
            </div>
          </div>
        )}

        {eslesmeTalep && (
          <div className="relative flex flex-col items-center gap-4 overflow-hidden rounded-lg border border-white/10 border-l-4 border-l-green-500 bg-gece-yuzey p-6 text-center sm:p-8">
            <button
              onClick={() => {
                setAktifBeklemeTalepId(null);
                setEslesmeTalep(null);
              }}
              aria-label="Kapat"
              className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full text-white/40 transition hover:bg-white/5 hover:text-white"
            >
              ✕
            </button>

            <Avatar
              adSoyad={eslesmeTalep.avukatlar?.ad_soyad}
              fotografUrl={eslesmeTalep.avukatlar?.profil_fotografi_url}
              boyut="lg"
            />

            <div>
              <p className="text-xl font-semibold text-white">Eşleşme Bulundu!</p>
              <p className="mt-1 text-sm text-white/70">
                <strong className="text-green-400">{eslesmeTalep.avukatlar?.ad_soyad ?? "Bir avukat"}</strong>{" "}
                talebini kabul etti.
              </p>
            </div>

            <button
              onClick={eslesmeyiGorusmeyeBaslat}
              className="flex items-center gap-2 rounded-md bg-green-500 px-6 py-3 text-sm font-bold text-gece transition hover:bg-green-400 "
            >
              {eslesmeTalep.gorusme_sekli === "goruntulu" ? "Görüşmeye Başla" : "Tamam"}
            </button>
          </div>
        )}

        <div className="rounded-lg border border-white/10 bg-gece-yuzey p-6">
          <h2 className="text-base font-semibold text-white">
            {ilkGorusmeMi ? "İlk 5 dakika ücretsiz deneme" : "Avukata mı ihtiyacın var?"}
          </h2>
          <p className="mt-1 text-sm text-white/60">
            Şehrini ve konunu seç, ilk kabul eden avukatla görüşmen hemen başlasın.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => setGenelTalepAcik(true)}
              className="flex items-center justify-center gap-2 rounded-md bg-turkuaz px-5 py-2.5 text-sm font-semibold text-gece transition hover:bg-turkuaz-parlak"
            >
              Avukatla Görüş
            </button>
            <Link
              href="/acil-avukat"
              className="flex items-center justify-center gap-2 rounded-md border border-white/15 px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/5"
            >
              <IconYildirim className="h-4 w-4 text-red-400" />
              Acil Avukat
            </Link>
          </div>
        </div>

        {gonderilenTalepler.length > 0 && (
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <StatKarti deger={gonderilenTalepler.length} etiket="Gönderilen" />
            <StatKarti deger={bekleyenSayisi} etiket="Bekleyen" />
            <StatKarti deger={onaylananSayisi} etiket="Onaylanan" />
          </div>
        )}

        {basariMesaji && (
          <p className="flex items-start gap-2 rounded-lg bg-green-500/10 px-4 py-2.5 text-sm text-green-400 ring-1 ring-green-500/20">
            <IconOnay className="mt-0.5 h-4 w-4 shrink-0" />
            {basariMesaji}
          </p>
        )}

        {odemeHatasi && (
          <p className="rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-400 ring-1 ring-red-500/20">
            {odemeHatasi}
          </p>
        )}

        <section id="taleplerim" className="scroll-mt-20">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-white">Taleplerim</h2>
            <div className="flex rounded-full bg-white/5 p-1 text-xs font-semibold">
              {[
                { anahtar: "aktif", etiket: "Aktif", sayi: aktifTalepler.length },
                { anahtar: "gecmis", etiket: "Geçmiş", sayi: gecmisTalepler.length },
              ].map(({ anahtar, etiket, sayi }) => (
                <button
                  key={anahtar}
                  onClick={() => setTalepSekmesi(anahtar)}
                  className={`rounded-full px-4 py-1.5 transition ${
                    talepSekmesi === anahtar ? "bg-white/10 text-white" : "text-white/60 hover:text-white"
                  }`}
                >
                  {etiket} ({sayi})
                </button>
              ))}
            </div>
          </div>

          {gosterilenTalepler.length === 0 ? (
            <p className="rounded-lg border border-dashed border-white/15 bg-white/[0.02] p-8 text-center text-sm text-white/50">
              {gonderilenTalepler.length === 0
                ? "Henüz bir talep göndermedin."
                : talepSekmesi === "aktif"
                ? "Şu an aktif talebin yok."
                : "Geçmiş talebin yok."}
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {gosterilenTalepler.map((talep) => {
                const havuzdaBekliyor = talep.durum === "bekliyor" && !talep.avukatlar;
                return (
                  <div
                    key={talep.id}
                    className="rounded-lg border border-white/10 bg-gece-yuzey p-5 "
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <Avatar
                          adSoyad={talep.avukatlar?.ad_soyad ?? talep.hedef_uzmanlik_alani}
                          fotografUrl={talep.avukatlar?.profil_fotografi_url}
                        />
                        <div>
                          <p className="font-semibold text-white">
                            {talep.avukatlar?.ad_soyad ?? "Eşleşme Bekleniyor"}
                          </p>
                          <p className="text-sm text-white/60">{talep.konu}</p>
                          {havuzdaBekliyor && (
                            <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-turkuaz">
                              <IconYayin className="h-3.5 w-3.5" />
                              {talep.hedef_sehir} · {talep.hedef_uzmanlik_alani} havuzunda bekliyor
                            </p>
                          )}
                        </div>
                      </div>
                      <DurumRozeti durum={talep.durum} />
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/60">
                      <GorusmeSekliEtiketi deger={talep.gorusme_sekli} />
                      <span>{tarihFormatla(talep.tarih)}</span>
                      {talep.paket_dakika && (
                        <span>
                          {talep.paket_dakika} dk paket · {talep.odeme_tutari > 0 ? `${talep.odeme_tutari} TL` : "Ücretsiz"}
                        </span>
                      )}
                    </div>

                    {(talep.durum === "kabul" || talep.durum === "tamamlandi") && (
                      <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-white/10 pt-3">
                        {talep.durum === "kabul" && talep.gorusme_sekli === "goruntulu" && (
                          <VideoGorusmeButonu
                            randevuTalepId={talep.id}
                            paketDakika={talep.paket_dakika}
                            otomatikAc={talep.id === videoTalepId}
                          />
                        )}

                        {talep.durum === "tamamlandi" &&
                          (degerlendirilenIdler.includes(talep.id) ? (
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-turkuaz">
                              <IconYildiz className="h-3.5 w-3.5" />
                              Değerlendirdin
                            </span>
                          ) : (
                            <button
                              onClick={() => setDegerlendirilecekTalep(talep)}
                              className="flex items-center gap-1.5 rounded-md border border-turkuaz/30 px-4 py-2 text-xs font-bold text-turkuaz transition hover:bg-turkuaz/10"
                            >
                              <IconYildiz className="h-3.5 w-3.5" />
                              Avukatı Değerlendir
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {genelTalepAcik && (
        <Modal baslik="Avukatla Görüş" onKapat={() => setGenelTalepAcik(false)}>
          <GenelTalepFormu
            muvekkilProfil={profil}
            ilkGorusmeMi={ilkGorusmeMi}
            onKapat={() => setGenelTalepAcik(false)}
            onBasarili={genelTalepBasarili}
          />
        </Modal>
      )}

      {degerlendirilecekTalep && (
        <Modal baslik="Avukatı Değerlendir" onKapat={() => setDegerlendirilecekTalep(null)}>
          <DegerlendirmeFormu
            talep={degerlendirilecekTalep}
            muvekkilId={profil.id}
            onKapat={() => setDegerlendirilecekTalep(null)}
            onBasarili={degerlendirmeBasarili}
          />
        </Modal>
      )}

      <AltMenu sekmeler={MUVEKKIL_SEKMELER} />
    </div>
  );
}
