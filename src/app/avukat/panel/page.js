"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { tarihFormatla } from "@/lib/gorusmeSekli";
import PanelHeader from "@/components/PanelHeader";
import Avatar from "@/components/Avatar";
import Spinner from "@/components/Spinner";
import DurumRozeti from "@/components/DurumRozeti";
import GorusmeSekliEtiketi from "@/components/GorusmeSekliEtiketi";
import AltMenu from "@/components/AltMenu";
import StatKarti from "@/components/StatKarti";
import {
  IconTelefon,
  IconKonum,
  IconBaro,
  IconUzmanlik,
  IconOnay,
  IconRed,
  IconTakvim,
  IconEv,
  IconListe,
  IconYayin,
} from "@/components/icons";

export default function AvukatPanel() {
  const router = useRouter();

  const [sayfaYukleniyor, setSayfaYukleniyor] = useState(true);
  const [profil, setProfil] = useState(null);
  const [talepler, setTalepler] = useState([]);
  const [acikTalepler, setAcikTalepler] = useState([]);
  const [islemYukleniyor, setIslemYukleniyor] = useState(null);
  const [ustlenYukleniyor, setUstlenYukleniyor] = useState(null);
  const [hata, setHata] = useState(null);
  const [acikHata, setAcikHata] = useState(null);

  async function acikTalepleriGetir(avukatProfili) {
    const { data } = await supabase
      .from("randevu_talepleri")
      .select("*")
      .eq("tur", "genel")
      .is("avukat_id", null)
      .order("created_at", { ascending: false });

    const uygunAlanlar = avukatProfili.uzmanlik_alanlari ?? [];
    const uygunlar = (data ?? []).filter(
      (t) =>
        t.hedef_sehir === avukatProfili.sehir ||
        uygunAlanlar.includes(t.hedef_uzmanlik_alani)
    );
    setAcikTalepler(uygunlar);
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

      const { data: avukatProfili } = await supabase
        .from("avukatlar")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (!avukatProfili) {
        router.push("/giris");
        return;
      }

      const { data: randevuTalepleri } = await supabase
        .from("randevu_talepleri")
        .select("*")
        .eq("avukat_id", user.id)
        .order("created_at", { ascending: false });

      await acikTalepleriGetir(avukatProfili);

      if (iptalEdildi) return;
      setProfil(avukatProfili);
      setTalepler(randevuTalepleri ?? []);
      setSayfaYukleniyor(false);
    }

    veriGetir();
    return () => {
      iptalEdildi = true;
    };
  }, [router]);

  async function talebiUstlen(talepId) {
    setAcikHata(null);
    setUstlenYukleniyor(talepId);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("randevu_talepleri")
      .update({ avukat_id: user.id, durum: "kabul" })
      .eq("id", talepId)
      .is("avukat_id", null)
      .select();

    if (error) {
      setAcikHata("Talep üstlenilirken bir hata oluştu, lütfen tekrar dene.");
      setUstlenYukleniyor(null);
      return;
    }

    if (!data || data.length === 0) {
      setAcikHata("Bu talep senden önce başka bir avukat tarafından üstlenildi.");
      setAcikTalepler((oncekiler) => oncekiler.filter((t) => t.id !== talepId));
      setUstlenYukleniyor(null);
      return;
    }

    setAcikTalepler((oncekiler) => oncekiler.filter((t) => t.id !== talepId));
    setTalepler((oncekiler) => [data[0], ...oncekiler]);
    setUstlenYukleniyor(null);
  }

  async function talebiGuncelle(talepId, durum) {
    setHata(null);
    setIslemYukleniyor(talepId);

    const { error } = await supabase
      .from("randevu_talepleri")
      .update({ durum })
      .eq("id", talepId);

    if (error) {
      setHata("Talep güncellenirken bir hata oluştu, lütfen tekrar dene.");
      setIslemYukleniyor(null);
      return;
    }

    setTalepler((oncekiler) =>
      oncekiler.map((t) => (t.id === talepId ? { ...t, durum } : t))
    );
    setIslemYukleniyor(null);
  }

  if (sayfaYukleniyor) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center">
        <Spinner className="h-8 w-8 text-lacivert" />
      </div>
    );
  }

  const bekleyenSayisi = talepler.filter((t) => t.durum === "bekliyor").length;
  const kabulSayisi = talepler.filter((t) => t.durum === "kabul").length;

  return (
    <div className="flex min-h-full flex-1 flex-col bg-zinc-50">
      <PanelHeader adSoyad={profil.ad_soyad} panelAdi="Avukat Paneli" />

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8 pb-24 sm:px-6 sm:pb-8">
        <section id="profil-bilgileri" className="scroll-mt-20 rounded-2xl border border-lacivert/10 bg-white p-6 shadow-sm shadow-lacivert/5">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Avatar adSoyad={profil.ad_soyad} boyut="lg" />
            <div className="flex-1">
              <h1 className="text-xl font-bold text-lacivert">
                {profil.ad_soyad}
              </h1>
              <p className="text-sm text-lacivert/60">{profil.email}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <IconTelefon className="h-4 w-4 shrink-0 text-altin-koyu" />
              <span className="text-lacivert/70">{profil.telefon}</span>
            </div>
            <div className="flex items-center gap-2">
              <IconKonum className="h-4 w-4 shrink-0 text-altin-koyu" />
              <span className="text-lacivert/70">{profil.sehir}</span>
            </div>
            <div className="flex items-center gap-2">
              <IconBaro className="h-4 w-4 shrink-0 text-altin-koyu" />
              <span className="text-lacivert/70">
                Baro Sicil No: {profil.baro_sicil_no}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <IconUzmanlik className="mt-0.5 h-4 w-4 shrink-0 text-altin-koyu" />
              <span className="text-lacivert/70">
                {(profil.uzmanlik_alanlari ?? []).join(", ")}
              </span>
            </div>
          </div>

          {profil.biyografi && (
            <div className="mt-4 border-t border-lacivert/10 pt-4">
              <span className="text-sm font-semibold text-lacivert">
                Biyografi
              </span>
              <p className="mt-1 text-sm text-lacivert/70">
                {profil.biyografi}
              </p>
            </div>
          )}
        </section>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <StatKarti deger={talepler.length} etiket="Toplam Talep" />
          <StatKarti deger={bekleyenSayisi} etiket="Bekleyen" />
          <StatKarti deger={kabulSayisi} etiket="Kabul Edilen" />
          <StatKarti deger={acikTalepler.length} etiket="Açık Havuz" />
        </section>

        <section id="acik-talepler" className="scroll-mt-20">
          <div className="mb-4 flex items-center gap-3">
            <h2 className="flex items-center gap-2 text-lg font-bold text-lacivert">
              <IconYayin className="h-5 w-5 text-altin-koyu" />
              Açık Talepler
            </h2>
            {acikTalepler.length > 0 && (
              <span className="rounded-full bg-altin/15 px-2.5 py-0.5 text-xs font-semibold text-altin-koyu">
                {acikTalepler.length} uygun talep
              </span>
            )}
          </div>

          {acikHata && (
            <p className="mb-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">
              {acikHata}
            </p>
          )}

          {acikTalepler.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-lacivert/20 bg-white p-8 text-center text-sm text-lacivert/60">
              Şehrine veya uzmanlık alanlarına uygun açık bir talep yok.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {acikTalepler.map((talep) => (
                <div
                  key={talep.id}
                  className="rounded-2xl border border-altin/30 bg-altin/[0.04] p-5 shadow-sm shadow-lacivert/5"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold text-lacivert">{talep.konu}</p>
                      <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-lacivert/60">
                        <span className="flex items-center gap-1">
                          <IconKonum className="h-3.5 w-3.5" />
                          {talep.hedef_sehir}
                        </span>
                        <span className="flex items-center gap-1">
                          <IconUzmanlik className="h-3.5 w-3.5" />
                          {talep.hedef_uzmanlik_alani}
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={() => talebiUstlen(talep.id)}
                      disabled={ustlenYukleniyor === talep.id}
                      className="flex shrink-0 items-center gap-2 rounded-full bg-altin px-4 py-2 text-sm font-bold text-lacivert shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60 disabled:hover:translate-y-0"
                    >
                      {ustlenYukleniyor === talep.id && <Spinner className="h-4 w-4" />}
                      Bu Talebi Üstlen
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-lacivert/60">
                    <GorusmeSekliEtiketi deger={talep.gorusme_sekli} />
                    <span className="flex items-center gap-1.5">
                      <IconTakvim className="h-4 w-4 text-lacivert/50" />
                      {tarihFormatla(talep.tarih)}
                    </span>
                  </div>

                  {talep.aciklama && (
                    <p className="mt-3 rounded-lg bg-white p-3 text-sm text-lacivert/70">
                      {talep.aciklama}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section id="talepler" className="scroll-mt-20">
          <div className="mb-4 flex items-center gap-3">
            <h2 className="text-lg font-bold text-lacivert">
              Gelen Randevu Talepleri
            </h2>
            {bekleyenSayisi > 0 && (
              <span className="rounded-full bg-altin/15 px-2.5 py-0.5 text-xs font-semibold text-altin-koyu">
                {bekleyenSayisi} bekliyor
              </span>
            )}
          </div>

          {hata && (
            <p className="mb-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">
              {hata}
            </p>
          )}

          {talepler.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-lacivert/20 bg-white p-8 text-center text-sm text-lacivert/60">
              Henüz bir randevu talebin yok.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {talepler.map((talep) => (
                <div
                  key={talep.id}
                  className="rounded-2xl border border-lacivert/10 bg-white p-5 shadow-sm shadow-lacivert/5 transition hover:shadow-md"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                      <Avatar adSoyad={talep.muvekkil_ad_soyad} />
                      <div>
                        <p className="font-semibold text-lacivert">
                          {talep.muvekkil_ad_soyad}
                        </p>
                        <p className="flex items-center gap-1.5 text-sm text-lacivert/60">
                          <IconTelefon className="h-3.5 w-3.5" />
                          {talep.muvekkil_telefon}
                        </p>
                      </div>
                    </div>
                    <DurumRozeti durum={talep.durum} />
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                    <p>
                      <span className="font-semibold text-lacivert">
                        Konu:{" "}
                      </span>
                      <span className="text-lacivert/70">{talep.konu}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-lacivert/70">
                      <GorusmeSekliEtiketi deger={talep.gorusme_sekli} />
                    </p>
                    <p className="flex items-center gap-1.5 text-lacivert/70">
                      <IconTakvim className="h-4 w-4 text-lacivert/50" />
                      {tarihFormatla(talep.tarih)}
                    </p>
                  </div>

                  {talep.aciklama && (
                    <p className="mt-3 rounded-lg bg-lacivert/[0.03] p-3 text-sm text-lacivert/70">
                      {talep.aciklama}
                    </p>
                  )}

                  {talep.durum === "bekliyor" && (
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={() => talebiGuncelle(talep.id, "kabul")}
                        disabled={islemYukleniyor === talep.id}
                        className="flex items-center gap-2 rounded-full bg-lacivert px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-lacivert-koyu hover:shadow-md disabled:opacity-60 disabled:hover:translate-y-0"
                      >
                        {islemYukleniyor === talep.id ? (
                          <Spinner className="h-4 w-4" />
                        ) : (
                          <IconOnay className="h-4 w-4" />
                        )}
                        Kabul Et
                      </button>
                      <button
                        onClick={() => talebiGuncelle(talep.id, "red")}
                        disabled={islemYukleniyor === talep.id}
                        className="flex items-center gap-2 rounded-full border-2 border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:-translate-y-0.5 hover:bg-red-50 disabled:opacity-60 disabled:hover:translate-y-0"
                      >
                        {islemYukleniyor === talep.id ? (
                          <Spinner className="h-4 w-4" />
                        ) : (
                          <IconRed className="h-4 w-4" />
                        )}
                        Reddet
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <AltMenu
        sekmeler={[
          { etiket: "Profil", href: "#profil-bilgileri", Icon: IconEv },
          { etiket: "Açık Havuz", href: "#acik-talepler", Icon: IconYayin },
          { etiket: "Talepler", href: "#talepler", Icon: IconListe },
        ]}
      />
    </div>
  );
}
