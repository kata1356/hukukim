"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import PanelHeader from "@/components/PanelHeader";
import Avatar from "@/components/Avatar";
import Spinner from "@/components/Spinner";
import Modal from "@/components/Modal";
import RandevuFormu from "@/components/RandevuFormu";
import GenelTalepFormu from "@/components/GenelTalepFormu";
import DurumRozeti from "@/components/DurumRozeti";
import DogrulamaRozeti from "@/components/DogrulamaRozeti";
import GorusmeSekliEtiketi from "@/components/GorusmeSekliEtiketi";
import AltMenu from "@/components/AltMenu";
import StatKarti from "@/components/StatKarti";
import HesapSilButonu from "@/components/HesapSilButonu";
import { tarihFormatla } from "@/lib/gorusmeSekli";
import {
  IconArama,
  IconKonum,
  IconOnay,
  IconOk,
  IconEv,
  IconListe,
  IconYayin,
  IconEtiket,
} from "@/components/icons";

const ODEME_ROZETLERI = {
  odendi: { metin: "Ödendi", sinif: "bg-green-500/10 text-green-400 ring-1 ring-green-500/20" },
  muaf: { metin: "Ücretsiz (İlk Görüşme)", sinif: "bg-turkuaz/15 text-turkuaz ring-1 ring-turkuaz/20" },
};

export default function MuvekkilPanel() {
  const router = useRouter();

  const [sayfaYukleniyor, setSayfaYukleniyor] = useState(true);
  const [profil, setProfil] = useState(null);
  const [avukatlar, setAvukatlar] = useState([]);
  const [aramaMetni, setAramaMetni] = useState("");
  const [seciliAvukat, setSeciliAvukat] = useState(null);
  const [genelTalepAcik, setGenelTalepAcik] = useState(false);
  const [basariMesaji, setBasariMesaji] = useState(() => {
    if (typeof window === "undefined") return null;
    const odemeSonucu = new URLSearchParams(window.location.search).get("odeme");
    return odemeSonucu === "basarili" ? "Ödemen alındı, randevun onaylandı." : null;
  });
  const [gonderilenTalepler, setGonderilenTalepler] = useState([]);

  const [odemeToken, setOdemeToken] = useState(null);
  const [odemeYukleniyorId, setOdemeYukleniyorId] = useState(null);
  const [odemeHatasi, setOdemeHatasi] = useState(() => {
    if (typeof window === "undefined") return null;
    const odemeSonucu = new URLSearchParams(window.location.search).get("odeme");
    return odemeSonucu === "basarisiz" ? "Ödeme tamamlanamadı, tekrar deneyebilirsin." : null;
  });

  async function odemeBaslat(talepId) {
    setOdemeHatasi(null);
    setOdemeYukleniyorId(talepId);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const yanit = await fetch("/api/odeme/randevu-ode", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ randevuTalepId: talepId }),
    });
    const sonuc = await yanit.json();

    if (!yanit.ok) {
      setOdemeHatasi(sonuc.hata ?? "Ödeme başlatılamadı.");
      setOdemeYukleniyorId(null);
      return;
    }

    setOdemeToken(sonuc.token);
    setOdemeYukleniyorId(null);
  }

  async function gonderilenTalepleriGetir(kullaniciId) {
    const { data } = await supabase
      .from("randevu_talepleri")
      .select("*, avukatlar(ad_soyad, profil_fotografi_url)")
      .eq("muvekkil_id", kullaniciId)
      .order("created_at", { ascending: false });
    setGonderilenTalepler(data ?? []);
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

      const { data: avukatListesi } = await supabase
        .from("avukatlar")
        .select("*")
        .order("ad_soyad", { ascending: true });

      await gonderilenTalepleriGetir(user.id);

      if (iptalEdildi) return;
      setProfil(muvekkilProfili);
      setAvukatlar(avukatListesi ?? []);
      setSayfaYukleniyor(false);
    }

    veriGetir();
    return () => {
      iptalEdildi = true;
    };
  }, [router]);

  useEffect(() => {
    if (window.location.search.includes("odeme=")) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  const filtrelenmisAvukatlar = useMemo(() => {
    const arama = aramaMetni.trim().toLocaleLowerCase("tr-TR");
    if (!arama) return avukatlar;
    return avukatlar.filter((a) => {
      const metin = [a.ad_soyad, a.sehir, ...(a.uzmanlik_alanlari ?? [])]
        .join(" ")
        .toLocaleLowerCase("tr-TR");
      return metin.includes(arama);
    });
  }, [avukatlar, aramaMetni]);

  async function talepBasarili() {
    setSeciliAvukat(null);
    setBasariMesaji("Randevu talebin gönderildi, aşağıdaki \"Gönderdiğim Talepler\" listesinde görebilirsin.");
    if (profil?.id) await gonderilenTalepleriGetir(profil.id);
  }

  async function genelTalepBasarili() {
    setGenelTalepAcik(false);
    setBasariMesaji("Talebin yayınlandı, uygun avukatlara gösterilecek. İlk yanıt veren avukat talebini üstlenecek.");
    if (profil?.id) await gonderilenTalepleriGetir(profil.id);
  }

  if (sayfaYukleniyor) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-gece">
        <Spinner className="h-8 w-8 text-white" />
      </div>
    );
  }

  const bekleyenSayisi = gonderilenTalepler.filter((t) => t.durum === "bekliyor").length;
  const onaylananSayisi = gonderilenTalepler.filter((t) => t.durum === "kabul").length;

  return (
    <div className="flex min-h-full flex-1 flex-col bg-gece">
      <PanelHeader adSoyad={profil.ad_soyad} panelAdi="Müvekkil Paneli" />

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 pb-24 sm:px-6 sm:pb-8">
        <div>
          <h1 className="text-xl font-bold text-white">
            Merhaba, {profil.ad_soyad}
          </h1>
          <p className="mt-1 text-sm text-white/60">
            Uzmanlık alanına, şehrine veya ada göre avukat ara.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <StatKarti deger={gonderilenTalepler.length} etiket="Gönderilen" />
          <StatKarti deger={bekleyenSayisi} etiket="Bekleyen" />
          <StatKarti deger={onaylananSayisi} etiket="Onaylanan" />
        </div>

        <div className="flex flex-col items-center gap-4 rounded-2xl border border-turkuaz/20 bg-gece-yuzey p-6 text-center shadow-md sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h2 className="text-lg font-bold text-white">
              İhtiyacını anlat, avukatlar sana ulaşsın
            </h2>
            <p className="mt-1 text-sm text-white/60">
              Şehrini ve uzmanlık alanını seç, tek bir avukat aramana gerek
              kalmadan uygun avukatlar talebini görsün.
            </p>
          </div>
          <button
            onClick={() => setGenelTalepAcik(true)}
            className="flex shrink-0 items-center gap-2 rounded-full bg-turkuaz px-5 py-2.5 text-sm font-bold text-gece shadow-sm transition hover:-translate-y-0.5 hover:bg-turkuaz-parlak hover:shadow-md"
          >
            <IconYayin className="h-4 w-4" />
            Genel Talep Oluştur
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold text-white/30">
          <span className="h-px flex-1 bg-white/10" />
          VEYA KENDİN ARA
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <div id="ara" className="scroll-mt-20 relative">
          <IconArama className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={aramaMetni}
            onChange={(e) => setAramaMetni(e.target.value)}
            placeholder="Ör. Ankara, Aile Hukuku, Ayşe Yılmaz..."
            className="w-full rounded-lg border border-white/15 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-turkuaz focus:ring-2 focus:ring-turkuaz/30"
          />
        </div>

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

        {filtrelenmisAvukatlar.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-center text-sm text-white/50">
            Aramanla eşleşen avukat bulunamadı.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filtrelenmisAvukatlar.map((avukat) => (
              <div
                key={avukat.id}
                className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-gece-yuzey p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-white/20"
              >
                <div className="flex items-start gap-3">
                  <Avatar
                    adSoyad={avukat.ad_soyad}
                    fotografUrl={avukat.profil_fotografi_url}
                    dogrulanmis={avukat.dogrulanmis}
                  />
                  <div>
                    <p className="font-semibold text-white">
                      {avukat.ad_soyad}
                    </p>
                    <p className="flex items-center gap-1 text-sm text-white/60">
                      <IconKonum className="h-3.5 w-3.5" />
                      {avukat.sehir}
                    </p>
                    <div className="mt-1.5">
                      <DogrulamaRozeti dogrulanmis={avukat.dogrulanmis} />
                    </div>
                  </div>
                </div>

                {avukat.uzmanlik_alanlari?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {avukat.uzmanlik_alanlari.map((alan) => (
                      <span
                        key={alan}
                        className="rounded-full bg-white/5 px-2.5 py-1 text-xs font-medium text-white/70"
                      >
                        {alan}
                      </span>
                    ))}
                  </div>
                )}

                {avukat.biyografi && (
                  <p className="line-clamp-3 text-sm text-white/60">
                    {avukat.biyografi}
                  </p>
                )}

                <button
                  onClick={() => setSeciliAvukat(avukat)}
                  className="mt-auto flex items-center justify-center gap-1.5 rounded-full bg-turkuaz px-4 py-2 text-sm font-semibold text-gece shadow-sm transition hover:bg-turkuaz-parlak hover:shadow-md"
                >
                  Randevu Talebi Gönder
                  <IconOk className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <section id="taleplerim" className="scroll-mt-20">
          <h2 className="mb-4 text-lg font-bold text-white">
            Gönderdiğim Talepler
          </h2>

          {gonderilenTalepler.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-center text-sm text-white/50">
              Henüz bir randevu talebi göndermedin.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {gonderilenTalepler.map((talep) => {
                const genelHavuzda = talep.tur === "genel" && !talep.avukatlar;
                return (
                  <div
                    key={talep.id}
                    className="rounded-2xl border border-white/10 bg-gece-yuzey p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <Avatar
                          adSoyad={talep.avukatlar?.ad_soyad ?? talep.hedef_uzmanlik_alani}
                          fotografUrl={talep.avukatlar?.profil_fotografi_url}
                        />
                        <div>
                          <p className="font-semibold text-white">
                            {talep.avukatlar?.ad_soyad ?? "Genel Talep"}
                          </p>
                          <p className="text-sm text-white/60">{talep.konu}</p>
                          {genelHavuzda && (
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
                    </div>

                    {(talep.durum === "kabul" || talep.durum === "tamamlandi") && (
                      <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-white/10 pt-3">
                        {talep.durum === "kabul" && !talep.gorusme_suresi_dakika && (
                          <span className="text-xs text-white/40">
                            Görüşme sonrası avukat ücreti belirleyecek.
                          </span>
                        )}

                        {talep.gorusme_suresi_dakika && (
                          <span className="text-xs text-white/40">
                            Görüşme süresi: {talep.gorusme_suresi_dakika} dk
                          </span>
                        )}

                        {talep.gorusme_suresi_dakika && talep.odeme_durumu === "gerekli" && (
                          <button
                            onClick={() => odemeBaslat(talep.id)}
                            disabled={odemeYukleniyorId === talep.id}
                            className="flex items-center gap-1.5 rounded-full bg-turkuaz px-4 py-2 text-xs font-bold text-gece transition hover:bg-turkuaz-parlak disabled:opacity-60"
                          >
                            {odemeYukleniyorId === talep.id ? (
                              <Spinner className="h-3.5 w-3.5" />
                            ) : (
                              <IconEtiket className="h-3.5 w-3.5" />
                            )}
                            Ödeme Yap ({talep.odeme_tutari} TL)
                          </button>
                        )}

                        {talep.odeme_durumu !== "gerekli" && (
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${ODEME_ROZETLERI[talep.odeme_durumu]?.sinif ?? ""}`}
                          >
                            {ODEME_ROZETLERI[talep.odeme_durumu]?.metin}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <HesapSilButonu />
      </main>

      {seciliAvukat && (
        <Modal baslik="Randevu Talebi" onKapat={() => setSeciliAvukat(null)}>
          <RandevuFormu
            avukat={seciliAvukat}
            muvekkilProfil={profil}
            onKapat={() => setSeciliAvukat(null)}
            onBasarili={talepBasarili}
          />
        </Modal>
      )}

      {genelTalepAcik && (
        <Modal baslik="Genel Talep Oluştur" onKapat={() => setGenelTalepAcik(false)}>
          <GenelTalepFormu
            muvekkilProfil={profil}
            onKapat={() => setGenelTalepAcik(false)}
            onBasarili={genelTalepBasarili}
          />
        </Modal>
      )}

      {odemeToken && (
        <Modal baslik="Randevu Ödemesi" onKapat={() => setOdemeToken(null)}>
          <div className="overflow-hidden rounded-xl bg-white">
            <iframe
              src={`https://www.paytr.com/odeme/guvenli/${odemeToken}`}
              title="PayTR Ödeme"
              style={{ width: "100%", height: "600px", border: "none" }}
            />
          </div>
        </Modal>
      )}

      <AltMenu
        sekmeler={[
          { etiket: "Ara", href: "#ara", Icon: IconEv },
          { etiket: "Taleplerim", href: "#taleplerim", Icon: IconListe },
        ]}
      />
    </div>
  );
}
