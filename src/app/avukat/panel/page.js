"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { tarihFormatla } from "@/lib/gorusmeSekli";
import { avukatPayiHesapla } from "@/lib/odemeYardimci";
import PanelHeader from "@/components/PanelHeader";
import Avatar from "@/components/Avatar";
import Spinner from "@/components/Spinner";
import DurumRozeti from "@/components/DurumRozeti";
import DogrulamaRozeti from "@/components/DogrulamaRozeti";
import GorusmeSekliEtiketi from "@/components/GorusmeSekliEtiketi";
import AltMenu from "@/components/AltMenu";
import TelefonDogrulama from "@/components/TelefonDogrulama";
import BelgeYukleme from "@/components/BelgeYukleme";
import { AVUKAT_SEKMELER } from "@/lib/avukatMenu";
import StatKarti from "@/components/StatKarti";
import YildizGosterge from "@/components/YildizGosterge";
import VideoGorusmeButonu from "@/components/VideoGorusmeButonu";
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
  IconYildirim,
  IconKamera,
  IconYildiz,
  IconArti,
} from "@/components/icons";

const BUGUN = () => new Date().toISOString().split("T")[0];

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
  const [fotografYukleniyor, setFotografYukleniyor] = useState(false);
  const [fotografHata, setFotografHata] = useState(null);
  const [tamamlaYukleniyor, setTamamlaYukleniyor] = useState(null);
  const [degerlendirmeler, setDegerlendirmeler] = useState([]);
  const [kapaliGunler, setKapaliGunler] = useState([]);
  const [yeniKapaliTarih, setYeniKapaliTarih] = useState("");
  const [kapatmaYukleniyor, setKapatmaYukleniyor] = useState(false);
  const [kapaliGunHata, setKapaliGunHata] = useState(null);
  const [acmaYukleniyorId, setAcmaYukleniyorId] = useState(null);

  async function gunuKapat(e) {
    e.preventDefault();
    if (!yeniKapaliTarih) return;
    setKapaliGunHata(null);
    setKapatmaYukleniyor(true);

    const { data, error } = await supabase
      .from("avukat_kapali_gunler")
      .insert({ avukat_id: profil.id, tarih: yeniKapaliTarih })
      .select()
      .single();

    if (error) {
      setKapaliGunHata(
        error.code === "23505" ? "Bu gün zaten kapalı." : "Gün kapatılırken bir hata oluştu."
      );
      setKapatmaYukleniyor(false);
      return;
    }

    setKapaliGunler((oncekiler) =>
      [...oncekiler, data].sort((a, b) => a.tarih.localeCompare(b.tarih))
    );
    setYeniKapaliTarih("");
    setKapatmaYukleniyor(false);
  }

  async function gunuAc(id) {
    setAcmaYukleniyorId(id);
    const { error } = await supabase.from("avukat_kapali_gunler").delete().eq("id", id);

    if (!error) {
      setKapaliGunler((oncekiler) => oncekiler.filter((g) => g.id !== id));
    }
    setAcmaYukleniyorId(null);
  }

  async function mesajGorusmesiniTamamla(talepId) {
    setHata(null);
    setTamamlaYukleniyor(talepId);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const yanit = await fetch("/api/talep/tamamla", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ randevuTalepId: talepId }),
    });
    const sonuc = await yanit.json();

    if (!yanit.ok) {
      setHata(sonuc.hata ?? "İşlem tamamlanamadı.");
      setTamamlaYukleniyor(null);
      return;
    }

    setTalepler((oncekiler) =>
      oncekiler.map((t) => (t.id === talepId ? { ...t, durum: "tamamlandi" } : t))
    );
    setTamamlaYukleniyor(null);
  }

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

    const { data: publicUrlData } = supabase.storage
      .from("avukat-fotograflari")
      .getPublicUrl(yol);
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

  async function acikTalepleriGetir(avukatProfili) {
    const { data } = await supabase
      .from("randevu_talepleri")
      .select("*")
      .eq("tur", "genel")
      .is("avukat_id", null)
      .eq("odeme_durumu", "odendi")
      .order("created_at", { ascending: false });

    const uygunAlanlar = avukatProfili.uzmanlik_alanlari ?? [];
    const uygunlar = (data ?? [])
      .filter(
        (t) =>
          t.hedef_sehir === avukatProfili.sehir ||
          uygunAlanlar.includes(t.hedef_uzmanlik_alani)
      )
      .sort((a, b) => (b.acil === a.acil ? 0 : b.acil ? 1 : -1));
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

      const { data: gelenDegerlendirmeler } = await supabase
        .from("degerlendirmeler")
        .select("*")
        .eq("avukat_id", user.id)
        .order("created_at", { ascending: false });

      const { data: kapaliGunlerListesi } = await supabase
        .from("avukat_kapali_gunler")
        .select("*")
        .eq("avukat_id", user.id)
        .order("tarih", { ascending: true });

      await acikTalepleriGetir(avukatProfili);

      if (iptalEdildi) return;
      setProfil(avukatProfili);
      setTalepler(randevuTalepleri ?? []);
      setDegerlendirmeler(gelenDegerlendirmeler ?? []);
      setKapaliGunler(kapaliGunlerListesi ?? []);
      setSayfaYukleniyor(false);
    }

    veriGetir();
    return () => {
      iptalEdildi = true;
    };
  }, [router]);

  useEffect(() => {
    if (!profil?.id) return;

    async function talepleriYenile() {
      const { data } = await supabase
        .from("randevu_talepleri")
        .select("*")
        .eq("avukat_id", profil.id)
        .order("created_at", { ascending: false });
      setTalepler(data ?? []);
    }

    const kanal = supabase
      .channel(`randevu-avukat-${profil.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "randevu_talepleri", filter: `avukat_id=eq.${profil.id}` },
        talepleriYenile
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "randevu_talepleri", filter: "tur=eq.genel" },
        () => acikTalepleriGetir(profil)
      )
      .subscribe();

    return () => supabase.removeChannel(kanal);
  }, [profil]);

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
      <div className="flex min-h-full flex-1 items-center justify-center bg-gece">
        <Spinner className="h-8 w-8 text-white" />
      </div>
    );
  }

  if (process.env.NEXT_PUBLIC_SMS_DOGRULAMA === "1" && !profil.telefon_dogrulandi) {
    return (
      <TelefonDogrulama
        baslangicTelefon={profil.telefon ?? ""}
        onTamam={(telefon) => setProfil((onceki) => ({ ...onceki, telefon, telefon_dogrulandi: true }))}
      />
    );
  }

  const bekleyenSayisi = talepler.filter((t) => t.durum === "bekliyor").length;
  const kabulSayisi = talepler.filter((t) => t.durum === "kabul").length;
  const ortalamaPuan =
    degerlendirmeler.length > 0
      ? degerlendirmeler.reduce((t, d) => t + d.puan, 0) / degerlendirmeler.length
      : 0;

  return (
    <div className="flex min-h-full flex-1 flex-col bg-gece">
      <PanelHeader adSoyad={profil.ad_soyad} panelAdi="Avukat Paneli" panelYolu="/avukat" />

      <nav className="sticky top-14 z-[9] border-b border-white/10 bg-gece">
        <div className="mx-auto flex max-w-5xl gap-6 overflow-x-auto px-4 sm:px-6">
          {[
            { etiket: "Profil", href: "#profil-bilgileri" },
            { etiket: "Açık Havuz", href: "#acik-talepler" },
            { etiket: "Talepler", href: "#talepler" },
            { etiket: "Müsaitlik", href: "#musaitlik" },
            { etiket: "Değerlendirmeler", href: "#degerlendirmeler" },
          ].map(({ etiket, href }) => (
            <a
              key={href}
              href={href}
              className="shrink-0 border-b-2 border-transparent py-3 text-sm font-medium text-white/60 transition hover:border-white/30 hover:text-white"
            >
              {etiket}
            </a>
          ))}
        </div>
      </nav>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8 pb-24 sm:px-6 sm:pb-8">
        {!profil.dogrulanmis && (
          <section className="rounded-lg border-2 border-amber-500 bg-amber-500/10 p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-lg font-bold text-amber-400">
                  {profil.belge_durumu === "incelemede"
                    ? "Belgelerin inceleniyor"
                    : "Hesabın henüz doğrulanmadı"}
                </p>
                <p className="mt-1 text-sm text-white/80">
                  {profil.belge_durumu === "incelemede"
                    ? "Ekibimiz kimlik ve baro kartını kontrol ediyor. Onaylanınca talepler otomatik olarak açılır."
                    : "Doğrulanana kadar talepleri göremez, randevu alamaz ve müvekkillerle iletişime geçemezsin. Kimlik ve baro kartını yükleyerek başla."}
                </p>
              </div>
              {profil.belge_durumu !== "incelemede" && (
                <a
                  href="#kimlik-dogrulama"
                  className="shrink-0 rounded-md bg-amber-500 px-5 py-2.5 text-center text-sm font-bold text-gece transition hover:bg-amber-400"
                >
                  Belgelerimi Yükle
                </a>
              )}
            </div>
          </section>
        )}

        <section id="profil-bilgileri" className="scroll-mt-20 rounded-lg border border-white/10 bg-gece-yuzey p-6 ">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <label className="group relative cursor-pointer">
              <Avatar
                adSoyad={profil.ad_soyad}
                fotografUrl={profil.profil_fotografi_url}
                dogrulanmis={profil.dogrulanmis}
                boyut="lg"
              />
              <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-turkuaz text-gece ring-2 ring-gece-yuzey transition group-hover:scale-110">
                {fotografYukleniyor ? (
                  <Spinner className="h-3.5 w-3.5" />
                ) : (
                  <IconKamera className="h-3.5 w-3.5" />
                )}
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
              <h1 className="text-xl font-semibold text-white">
                {profil.ad_soyad}
              </h1>
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

          {!profil.dogrulanmis && (
            <BelgeYukleme
              profil={profil}
              onGuncel={(alanlar) => setProfil((onceki) => ({ ...onceki, ...alanlar }))}
            />
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
              <span className="text-white/70">
                Baro Sicil No: {profil.baro_sicil_no}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <IconUzmanlik className="mt-0.5 h-4 w-4 shrink-0 text-turkuaz" />
              <span className="text-white/70">
                {(profil.uzmanlik_alanlari ?? []).join(", ")}
              </span>
            </div>
          </div>

          {profil.biyografi && (
            <div className="mt-4 border-t border-white/10 pt-4">
              <span className="text-sm font-semibold text-white">
                Biyografi
              </span>
              <p className="mt-1 text-sm text-white/70">
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

        {profil.dogrulanmis && (<>
        <section id="acik-talepler" className="scroll-mt-20">
          <div className="mb-4 flex items-center gap-3">
            <h2 className="flex items-center gap-2 text-base font-semibold text-white">
              Açık Talepler
            </h2>
            {acikTalepler.length > 0 && (
              <span className="rounded-md bg-turkuaz/15 px-2.5 py-0.5 text-xs font-semibold text-turkuaz">
                {acikTalepler.length} uygun talep
              </span>
            )}
          </div>

          {acikHata && (
            <p className="mb-4 rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-400 ring-1 ring-red-500/20">
              {acikHata}
            </p>
          )}

          {acikTalepler.length === 0 ? (
            <p className="rounded-lg border border-dashed border-white/15 bg-white/[0.02] p-8 text-center text-sm text-white/50">
              Şehrine veya uzmanlık alanlarına uygun açık bir talep yok.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {acikTalepler.map((talep) => (
                <div
                  key={talep.id}
                  className={
                    talep.acil
                      ? "rounded-lg border border-l-4 border-white/10 border-l-red-500 bg-gece-yuzey p-5"
                      : "rounded-lg border border-white/10 bg-gece-yuzey p-5"
                  }
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      {talep.acil && (
                        <span className="mb-1.5 inline-flex items-center gap-1 rounded-md bg-red-500/15 px-2 py-0.5 text-xs font-semibold text-red-400">
                          <IconYildirim className="h-3.5 w-3.5" />
                          ACİL
                        </span>
                      )}
                      <p className="font-semibold text-white">{talep.konu}</p>
                      <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/60">
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
                      className={
                        talep.acil
                          ? "flex shrink-0 items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-60 "
                          : "flex shrink-0 items-center gap-2 rounded-md bg-turkuaz px-4 py-2 text-sm font-bold text-gece transition disabled:opacity-60 "
                      }
                    >
                      {ustlenYukleniyor === talep.id && <Spinner className="h-4 w-4" />}
                      Bu Talebi Üstlen
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/60">
                    <GorusmeSekliEtiketi deger={talep.gorusme_sekli} />
                    <span className="flex items-center gap-1.5">
                      <IconTakvim className="h-4 w-4 text-white/40" />
                      {tarihFormatla(talep.tarih)}
                    </span>
                    {talep.paket_dakika && (
                      <span className="font-semibold text-turkuaz">
                        {talep.paket_dakika} dk
                        {talep.odeme_tutari > 0
                          ? ` · Kazancın: ${avukatPayiHesapla(talep.odeme_tutari)} TL`
                          : " · Ücretsiz (ilk görüşme)"}
                      </span>
                    )}
                  </div>

                  {talep.aciklama && (
                    <p className="mt-3 rounded-lg bg-white/5 p-3 text-sm text-white/70">
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
            <h2 className="text-base font-semibold text-white">
              Gelen Randevu Talepleri
            </h2>
            {bekleyenSayisi > 0 && (
              <span className="rounded-md bg-turkuaz/15 px-2.5 py-0.5 text-xs font-semibold text-turkuaz">
                {bekleyenSayisi} bekliyor
              </span>
            )}
          </div>

          {hata && (
            <p className="mb-4 rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-400 ring-1 ring-red-500/20">
              {hata}
            </p>
          )}

          {talepler.length === 0 ? (
            <p className="rounded-lg border border-dashed border-white/15 bg-white/[0.02] p-8 text-center text-sm text-white/50">
              Henüz bir randevu talebin yok.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {talepler.map((talep) => (
                <div
                  key={talep.id}
                  className="rounded-lg border border-white/10 bg-gece-yuzey p-5 transition hover:border-white/20"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3">
                      <Avatar adSoyad={talep.muvekkil_ad_soyad} />
                      <div>
                        <p className="font-semibold text-white">
                          {talep.muvekkil_ad_soyad}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <DurumRozeti durum={talep.durum} />
                      {talep.gorusme_suresi_dakika > 0 && (
                        <span className="rounded-md bg-green-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-green-400 ring-1 ring-green-500/20">
                          Ödendi
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                    <p>
                      <span className="font-semibold text-white">
                        Konu:{" "}
                      </span>
                      <span className="text-white/70">{talep.konu}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-white/70">
                      <GorusmeSekliEtiketi deger={talep.gorusme_sekli} />
                    </p>
                    <p className="flex items-center gap-1.5 text-white/70">
                      <IconTakvim className="h-4 w-4 text-white/40" />
                      {tarihFormatla(talep.tarih)}
                    </p>
                  </div>

                  {talep.aciklama && (
                    <p className="mt-3 rounded-lg bg-white/[0.03] p-3 text-sm text-white/70">
                      {talep.aciklama}
                    </p>
                  )}

                  {talep.durum === "bekliyor" && (
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={() => talebiGuncelle(talep.id, "kabul")}
                        disabled={islemYukleniyor === talep.id}
                        className="flex items-center gap-2 rounded-md bg-turkuaz px-4 py-2 text-sm font-semibold text-gece transition hover:bg-turkuaz-parlak disabled:opacity-60 "
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
                        className="flex items-center gap-2 rounded-md border border-red-500/30 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-60 "
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

                  {talep.durum === "kabul" && talep.gorusme_sekli === "goruntulu" && (
                    <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
                      <VideoGorusmeButonu randevuTalepId={talep.id} paketDakika={talep.paket_dakika} />
                      <span className="text-xs text-white/40">
                        {talep.paket_dakika} dk paket · görüşme bitince otomatik tamamlanır.
                      </span>
                    </div>
                  )}

                  {talep.durum === "kabul" && talep.gorusme_sekli !== "goruntulu" && (
                    <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
                      <button
                        onClick={() => mesajGorusmesiniTamamla(talep.id)}
                        disabled={tamamlaYukleniyor === talep.id}
                        className="flex items-center gap-1.5 rounded-md bg-turkuaz px-4 py-2 text-sm font-semibold text-gece transition hover:bg-turkuaz-parlak disabled:opacity-60"
                      >
                        {tamamlaYukleniyor === talep.id && <Spinner className="h-4 w-4" />}
                        Görüşmeyi Tamamla
                      </button>
                      <span className="text-xs text-white/40">{talep.paket_dakika} dk paket</span>
                    </div>
                  )}

                  {talep.durum === "tamamlandi" && (
                    <p className="mt-3 text-xs text-white/40">
                      {talep.paket_dakika} dk paket
                      {talep.odeme_tutari > 0 && ` · ${talep.odeme_tutari} TL`}
                      {talep.gorusme_suresi_dakika > 0 && ` · gerçek süre ${talep.gorusme_suresi_dakika} dk`}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        </>)}

        <section id="musaitlik" className="scroll-mt-20">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-white">
            Müsaitlik Takvimi
          </h2>

          <div className="rounded-lg border border-white/10 bg-gece-yuzey p-5 ">
            <p className="text-sm text-white/60">
              Müsait olmadığın günleri işaretle, müvekkiller randevu talebi
              gönderirken bu günleri seçemesin.
            </p>

            <form onSubmit={gunuKapat} className="mt-4 flex flex-wrap items-end gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="kapali-tarih" className="text-sm font-semibold text-white">
                  Tarih
                </label>
                <input
                  id="kapali-tarih"
                  type="date"
                  min={BUGUN()}
                  value={yeniKapaliTarih}
                  onChange={(e) => setYeniKapaliTarih(e.target.value)}
                  className="rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-turkuaz"
                />
              </div>
              <button
                type="submit"
                disabled={!yeniKapaliTarih || kapatmaYukleniyor}
                className="flex items-center gap-1.5 rounded-md bg-turkuaz px-4 py-2.5 text-sm font-bold text-gece transition hover:bg-turkuaz-parlak disabled:opacity-60"
              >
                {kapatmaYukleniyor ? <Spinner className="h-4 w-4" /> : <IconArti className="h-4 w-4" />}
                Bu Günü Kapat
              </button>
            </form>

            {kapaliGunHata && (
              <p className="mt-3 rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-400 ring-1 ring-red-500/20">
                {kapaliGunHata}
              </p>
            )}

            {kapaliGunler.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-4">
                {kapaliGunler.map((gun) => (
                  <span
                    key={gun.id}
                    className="flex items-center gap-2 rounded-md bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/70"
                  >
                    {tarihFormatla(gun.tarih)}
                    <button
                      onClick={() => gunuAc(gun.id)}
                      disabled={acmaYukleniyorId === gun.id}
                      aria-label="Bu günü tekrar aç"
                      className="text-white/40 hover:text-red-400"
                    >
                      {acmaYukleniyorId === gun.id ? <Spinner className="h-3 w-3" /> : "✕"}
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        <section id="degerlendirmeler" className="scroll-mt-20">
          <div className="mb-4 flex items-center gap-3">
            <h2 className="text-base font-semibold text-white">Değerlendirmelerim</h2>
            <YildizGosterge ortalama={ortalamaPuan} sayi={degerlendirmeler.length} />
          </div>

          {degerlendirmeler.length === 0 ? (
            <p className="rounded-lg border border-dashed border-white/15 bg-white/[0.02] p-8 text-center text-sm text-white/50">
              Henüz bir değerlendirme almadın.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {degerlendirmeler.map((d) => (
                <div key={d.id} className="rounded-lg border border-white/10 bg-gece-yuzey p-5 ">
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
      </main>

      <AltMenu sekmeler={AVUKAT_SEKMELER} />
    </div>
  );
}
