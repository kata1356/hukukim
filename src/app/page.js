import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import {
  IconKalkan,
  IconKullanici,
  IconOk,
  IconBaro,
  IconKvkk,
  IconTelefon,
  IconArama,
  IconTakvim,
  IconYildirim,
  IconEtiket,
  IconKonum,
  IconOnay,
  IconMikrofon,
  IconTelefonKapat,
  IconKamera,
  IconOynat,
  IconVideo,
  IconTerazi,
  IconMesaj,
  IconInstagram,
  IconTwitter,
  IconLinkedin,
  IconYildiz,
  IconApple,
  IconGooglePlay,
} from "@/components/icons";
import { HUKUK_ALANLARI_KATEGORILERI } from "@/lib/hukukAlanlariKategorileri";
import { supabase } from "@/lib/supabaseClient";
import SssAkordeon from "@/components/SssAkordeon";
import OneCikanAvukatlar from "@/components/OneCikanAvukatlar";

export const revalidate = 60;

const UCAN_KARTLAR = [
  { metin: "Avukat bulundu", Icon: IconOnay, konum: "left-[-2rem] top-6 sm:left-[-4.5rem]", gecikme: "0s" },
  { metin: "Görüşme başladı", Icon: IconVideo, konum: "right-[-1rem] top-16 sm:right-[-3.5rem]", gecikme: "0.6s" },
  { metin: "Baro doğrulandı", Icon: IconBaro, konum: "left-[-1.5rem] bottom-10 sm:left-[-4rem]", gecikme: "1.2s" },
];

const GUVEN_SERIDI = [
  { Icon: IconBaro, metin: "Baro sicil doğrulamalı" },
  { Icon: IconKvkk, metin: "KVKK uyumlu" },
  { Icon: IconYildirim, metin: "Hızlı avukat eşleşmesi" },
  { Icon: IconTelefon, metin: "Mobilde de sorunsuz" },
];

const ADIMLAR = [
  {
    baslik: "Kaydol",
    aciklama: "Avukat ya da müvekkil olarak birkaç dakikada hesabını oluştur.",
    Icon: IconKullanici,
  },
  {
    baslik: "Uygun Avukatı Bul",
    aciklama: "Şehre ve uzmanlık alanına göre arama yaparak sana uygun avukatı bul.",
    Icon: IconArama,
  },
  {
    baslik: "Randevu Al",
    aciklama: "Görüşme şeklini seçip talebini gönder, avukat onayladığında görüşmen netleşsin.",
    Icon: IconTakvim,
  },
];

const GUVENLIK_ADIMLARI = [
  {
    no: "01",
    baslik: "Doğrulanmış Kimlik",
    aciklama: "Her avukat baro sicil numarasıyla kayıt olur, ekibimiz kontrol etmeden doğrulama rozeti verilmez.",
  },
  {
    no: "02",
    baslik: "Yetkilendirilmiş Erişim",
    aciklama: "Randevu talebinin detaylarını yalnızca ilgili avukat ve müvekkil görebilir.",
  },
  {
    no: "03",
    baslik: "Şeffaf Süreç",
    aciklama: "Gönderdiğin ve aldığın tüm talepleri, durumlarını panelinden her an takip edersin.",
  },
];

const OZELLIK_LISTESI = [
  {
    Icon: IconVideo,
    baslik: "HD Görüntülü Görüşme",
    aciklama: "Avukatınla yüksek kaliteli, kesintisiz görüntülü görüşme yap.",
  },
  {
    Icon: IconTakvim,
    baslik: "Kolay Randevu Yönetimi",
    aciklama: "Uygun tarihi seç, talebini gönder, onayı panelinden takip et.",
  },
  {
    Icon: IconKvkk,
    baslik: "Güvenli ve Gizli Süreç",
    aciklama: "Tüm bilgilerin KVKK kapsamında korunur, yalnızca taraflar erişebilir.",
  },
];

const YORUMLAR = [
  {
    isim: "Elif Y.",
    sehir: "İstanbul",
    yorum:
      "İhtiyacım olan hukuk alanını seçtim, kısa sürede doğrulanmış bir avukatla eşleştim. Süreç çok pratikti.",
  },
  {
    isim: "Mehmet K.",
    sehir: "Ankara",
    yorum:
      "Randevu talebimi gönderdikten sonra avukatım hızlıca dönüş yaptı, panelden süreci takip edebilmek işimi kolaylaştırdı.",
  },
  {
    isim: "Ayşe D.",
    sehir: "İzmir",
    yorum:
      "Baro sicil doğrulama rozeti güven verdi. Arayüz sade ve anlaşılır, mobilde de sorunsuz kullanıyorum.",
  },
];

const AVUKAT_FAYDALARI = [
  "Yeni müvekkillere kolayca ulaş",
  "Kendi çalışma saatlerini sen belirle",
  "Baro doğrulama rozetiyle güven kazan",
  "Gelen talepleri tek panelden yönet",
];

export default async function AnaSayfa() {
  const { data: sssListesi } = await supabase
    .from("sss")
    .select("*")
    .order("sira", { ascending: true });

  return (
    <div className="flex min-h-full flex-1 flex-col overflow-x-hidden bg-gece text-white">
      <div className="bg-gece-yuzey py-2 text-center text-xs font-semibold text-turkuaz sm:text-sm">
        Kayıt tamamen ücretsiz · Baro sicil doğrulamalı avukatlarla dakikalar içinde tanış
      </div>

      <SiteHeader />

      <main className="flex-1">
        <section className="relative isolate overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-gradient-to-b from-turkuaz/[0.08] via-gece to-gece"
          />
          <div
            aria-hidden="true"
            className="absolute -top-40 left-1/2 -z-10 h-[32rem] w-[32rem] -translate-x-[70%] rounded-full bg-turkuaz/10 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute -top-24 right-0 -z-10 h-96 w-96 translate-x-1/3 rounded-full bg-turkuaz/10 blur-3xl"
          />

          <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-6 pb-20 pt-16 sm:pt-24 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
              <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-xs font-bold text-white ring-1 ring-white/10">
                <IconKalkan className="h-4 w-4 text-turkuaz" />
                Türkiye&apos;nin avukat-müvekkil buluşma platformu
              </span>

              <h1 className="max-w-xl text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-6xl">
                Aradığınız Avukatla{" "}
                <span className="text-turkuaz">Dakikalar İçinde</span> Görüşün
              </h1>

              <p className="mt-6 max-w-lg text-base text-white/60 sm:text-lg">
                Hukuki sorununuzu seçin, doğrulanmış avukatlarla eşleşin, güvenli
                görüşmenizi hemen başlatın.
              </p>

              <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <a
                  href="#basla"
                  className="flex items-center justify-center gap-1.5 rounded-full bg-turkuaz px-6 py-3.5 text-sm font-bold text-gece transition hover:-translate-y-0.5 hover:bg-turkuaz-parlak hover:shadow-lg hover:shadow-turkuaz/20"
                >
                  Ücretsiz Başla
                  <IconOk className="h-4 w-4" />
                </a>
                <a
                  href="#nasil-calisir"
                  className="flex items-center justify-center gap-1.5 rounded-full border-2 border-white/15 px-6 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:border-white/40"
                >
                  Nasıl Çalışır?
                </a>
              </div>

              <Link
                href="/acil-avukat"
                className="group mt-6 flex w-full max-w-lg items-center gap-4 rounded-2xl bg-gradient-to-r from-red-600 to-red-500 p-4 text-left shadow-lg shadow-red-600/10 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                <span className="relative flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-full bg-white shadow-inner">
                  <IconYildirim className="h-5 w-5 animate-pulse text-red-600" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white">Acil mi? Hemen avukat arayın</p>
                  <p className="text-xs text-white/80">Şehrini ve konunu seç, uygun avukatlar sana ulaşsın.</p>
                </div>
                <IconOk className="hidden h-4 w-4 shrink-0 text-white transition group-hover:translate-x-1 sm:block" />
              </Link>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-2.5 lg:justify-start">
                {GUVEN_SERIDI.map(({ Icon, metin }) => (
                  <span
                    key={metin}
                    className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3.5 py-2 text-xs font-semibold text-white/70 ring-1 ring-white/10"
                  >
                    <Icon className="h-3.5 w-3.5 text-turkuaz" />
                    {metin}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative mx-auto flex w-full max-w-xs items-center justify-center">
              {UCAN_KARTLAR.map(({ metin, Icon, konum, gecikme }) => (
                <span
                  key={metin}
                  aria-hidden="true"
                  style={{ animationDelay: gecikme }}
                  className={`animate-yuzen absolute z-10 hidden items-center gap-1.5 rounded-full bg-gece-yuzey px-3 py-1.5 text-xs font-semibold text-white shadow-lg ring-1 ring-white/10 sm:flex ${konum}`}
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-turkuaz/15 text-turkuaz">
                    <Icon className="h-3 w-3" />
                  </span>
                  {metin}
                </span>
              ))}

              <div className="relative aspect-[9/19] w-full max-w-[280px] overflow-hidden rounded-[2.5rem] border-4 border-white/10 bg-gradient-to-b from-gece-yuzey to-gece shadow-2xl shadow-turkuaz/10">
                <div className="absolute left-1/2 top-2 h-5 w-24 -translate-x-1/2 rounded-full bg-black/60" />

                <div className="flex h-full flex-col items-center justify-between px-4 pb-8 pt-12">
                  <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] font-semibold text-white/50 ring-1 ring-white/10">
                    Görüşme başlıyor · 00:14
                  </span>

                  <div className="flex flex-col items-center gap-3">
                    <span className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-turkuaz to-turkuaz-koyu text-gece shadow-lg shadow-turkuaz/30">
                      <IconKullanici className="h-11 w-11" />
                    </span>
                    <p className="text-sm font-bold text-white">Av. Aylin Sarı</p>
                    <p className="text-xs text-white/50">Aile Hukuku · İstanbul</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/10">
                      <IconMikrofon className="h-4 w-4" />
                    </span>
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white shadow-lg shadow-red-600/30">
                      <IconTelefonKapat className="h-5 w-5" />
                    </span>
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/10">
                      <IconKamera className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="basla" className="scroll-mt-24 border-t border-gece-kenar bg-gece-yuzey/40 px-6 py-20">
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Nasıl Başlamak İstersiniz?</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/60">
              Avukat ya da müvekkil olarak birkaç saniyede hesabını oluştur.
            </p>

            <div className="mt-10 grid w-full grid-cols-1 gap-6 sm:grid-cols-2">
              <Link
                href="/avukat/kayit"
                className="group relative flex flex-col items-center gap-4 overflow-hidden rounded-3xl border border-white/10 bg-gece-yuzey p-8 shadow-lg transition duration-300 hover:-translate-y-1.5 hover:border-turkuaz/40"
              >
                <span className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-turkuaz/10 transition group-hover:scale-125" />
                <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-turkuaz to-turkuaz-koyu text-gece shadow-md transition group-hover:scale-110 group-hover:rotate-3">
                  <IconKalkan className="h-7 w-7" />
                </span>
                <span className="relative text-xl font-bold text-white">Avukatım</span>
                <span className="relative text-sm text-white/60">
                  Profilini oluştur, müvekkillerden randevu talebi al.
                </span>
                <span className="relative mt-2 flex items-center gap-1.5 rounded-full bg-turkuaz px-5 py-2.5 text-sm font-semibold text-gece transition group-hover:bg-turkuaz-parlak">
                  Avukat Olarak Devam Et
                  <IconOk className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>

              <Link
                href="/muvekkil/kayit"
                className="group relative flex flex-col items-center gap-4 overflow-hidden rounded-3xl border border-white/10 bg-gece-yuzey p-8 shadow-lg transition duration-300 hover:-translate-y-1.5 hover:border-turkuaz/40"
              >
                <span className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-turkuaz/10 transition group-hover:scale-125" />
                <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-white/20 to-white/5 text-turkuaz shadow-md ring-1 ring-white/10 transition group-hover:scale-110 group-hover:rotate-3">
                  <IconKullanici className="h-7 w-7" />
                </span>
                <span className="relative text-xl font-bold text-white">Müvekkilim</span>
                <span className="relative text-sm text-white/60">
                  Uzman avukatları bul, kolayca randevu talebi gönder.
                </span>
                <span className="relative mt-2 flex items-center gap-1.5 rounded-full bg-white/10 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/10 transition group-hover:bg-turkuaz group-hover:text-gece">
                  Müvekkil Olarak Devam Et
                  <IconOk className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            </div>
          </div>
        </section>

        <section id="nasil-calisir" className="relative scroll-mt-20 border-t border-gece-kenar px-6 py-20">
          <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-turkuaz/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-turkuaz">
                Nasıl Çalışır
              </span>
              <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
                Basit 3 Adımda Hukuki Çözüm
              </h2>
              <p className="mt-3 max-w-md text-sm text-white/60">
                Karmaşık süreçlere gerek yok. Üç adımda ihtiyacın olan avukatla görüşmeye başla.
              </p>

              <div className="mt-10 flex flex-col gap-8">
                {ADIMLAR.map((adim, i) => (
                  <div key={adim.baslik} className="flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-turkuaz to-turkuaz-koyu text-gece font-bold shadow-sm">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="flex items-center gap-2 text-base font-bold text-white">
                        <adim.Icon className="h-4 w-4 text-turkuaz" />
                        {adim.baslik}
                      </h3>
                      <p className="mt-1 text-sm text-white/60">{adim.aciklama}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative aspect-video w-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-gece-yuzey to-gece shadow-xl">
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-[0.08]"
                style={{
                  backgroundImage: "radial-gradient(circle, #22D3EE 1px, transparent 1px)",
                  backgroundSize: "18px 18px",
                }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-turkuaz text-gece shadow-lg shadow-turkuaz/30 transition hover:scale-105">
                  <IconOynat className="ml-1 h-6 w-6" />
                </span>
                <p className="text-sm font-semibold text-white/70">Nasıl çalıştığını izle</p>
              </div>
            </div>
          </div>
        </section>

        <section id="hukuk-alanlari" className="scroll-mt-20 border-t border-gece-kenar bg-gece-yuzey/40 px-6 py-20">
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Hangi Konuda Desteğe İhtiyacınız Var?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/60">
              Alanını seç ya da hukuki sorununu yaz, o konuda kayıtlı avukatlarla hemen eşleş.
            </p>

            <Link
              href="/avukatlar"
              className="group mx-auto mt-8 flex max-w-xl items-center gap-3 rounded-full border border-white/10 bg-gece px-5 py-4 text-left shadow-sm transition hover:border-turkuaz/40"
            >
              <IconArama className="h-4 w-4 shrink-0 text-white/40" />
              <span className="flex-1 truncate text-sm text-white/40">
                Hukuki sorununuzu yazın (örn. kira anlaşmazlığı, boşanma...)
              </span>
              <span className="hidden shrink-0 rounded-full bg-turkuaz px-4 py-2 text-xs font-bold text-gece transition group-hover:bg-turkuaz-parlak sm:block">
                Avukat Bul
              </span>
            </Link>

            <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {HUKUK_ALANLARI_KATEGORILERI.map(({ ad, Icon }) => (
                <Link
                  key={ad}
                  href="/muvekkil/kayit"
                  className="group flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-gece p-5 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-turkuaz/40"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-turkuaz/10 text-turkuaz transition group-hover:bg-turkuaz group-hover:text-gece">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="text-sm font-bold text-white">{ad}</p>
                </Link>
              ))}

              <Link
                href="/avukatlar"
                className="group flex flex-col items-center justify-center gap-2 rounded-2xl bg-turkuaz p-5 text-center text-gece transition hover:-translate-y-0.5 hover:bg-turkuaz-parlak"
              >
                <IconArama className="h-6 w-6" />
                <p className="text-sm font-bold">Tümünü Gör</p>
              </Link>
            </div>
          </div>
        </section>

        <section id="akilli-eslesme" className="relative scroll-mt-20 overflow-hidden border-t border-gece-kenar px-6 py-20">
          <div
            aria-hidden="true"
            className="absolute -right-32 top-1/2 -z-10 h-96 w-96 -translate-y-1/2 rounded-full bg-turkuaz/10 blur-3xl"
          />
          <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-turkuaz/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-turkuaz">
                Yapay Zeka Destekli
              </span>
              <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
                Akıllı Eşleşme
              </h2>
              <p className="mt-3 max-w-md text-sm text-white/60">
                Sorununu birkaç cümleyle anlat, sana en uygun uzmanlık alanına
                sahip doğrulanmış avukatları önceliklendirerek önerelim.
              </p>
              <a
                href="#basla"
                className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-turkuaz px-5 py-3 text-sm font-bold text-gece transition hover:-translate-y-0.5 hover:bg-turkuaz-parlak"
              >
                Hemen Dene
                <IconOk className="h-4 w-4" />
              </a>
            </div>

            <div className="rounded-3xl border border-white/10 bg-gece-yuzey p-6 shadow-xl">
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-gece px-4 py-3 text-sm text-white/50">
                <IconMesaj className="h-4 w-4 text-turkuaz" />
                &quot;Kiracım evi tahliye etmiyor, ne yapmalıyım?&quot;
              </div>

              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-white/40">
                Önerilen Eşleşme
              </p>

              <div className="mt-3 flex items-center gap-4 rounded-2xl bg-gece p-4 ring-1 ring-turkuaz/30">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-turkuaz to-turkuaz-koyu text-gece font-bold">
                  <IconKullanici className="h-6 w-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-white">Av. Deniz Kara</p>
                  <p className="text-xs text-white/50">Gayrimenkul ve Kira Hukuku</p>
                </div>
                <span className="shrink-0 rounded-full bg-turkuaz/15 px-3 py-1 text-xs font-bold text-turkuaz">
                  %96 Uyum
                </span>
              </div>
            </div>
          </div>
        </section>

        <OneCikanAvukatlar />

        <section id="guvenlik" className="scroll-mt-20 border-t border-gece-kenar bg-gece-yuzey/40 px-6 py-20">
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Görüşmeniz Size Özel
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/60">
              Kullanıcı bilgilerinin korunması ve şeffaf süreçler Hukukim&apos;in
              temel önceliklerindendir.
            </p>

            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {GUVENLIK_ADIMLARI.map(({ no, baslik, aciklama }) => (
                <div
                  key={no}
                  className="rounded-2xl border border-white/10 bg-gece p-6 text-left shadow-sm"
                >
                  <span className="text-3xl font-extrabold text-turkuaz/40">{no}</span>
                  <p className="mt-3 font-bold text-white">{baslik}</p>
                  <p className="mt-2 text-sm text-white/60">{aciklama}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="scroll-mt-20 border-t border-gece-kenar px-6 py-20">
          <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="relative order-2 aspect-[4/3] w-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-gece-yuzey to-gece shadow-xl lg:order-1">
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-[0.08]"
                style={{
                  backgroundImage: "radial-gradient(circle, #22D3EE 1px, transparent 1px)",
                  backgroundSize: "18px 18px",
                }}
              />
              <div className="absolute inset-6 flex flex-col justify-between rounded-2xl border border-white/10 bg-gece/60 p-5">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  <span className="h-2.5 w-2.5 rounded-full bg-turkuaz" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                </div>
                <div className="flex items-center justify-center gap-6">
                  <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-turkuaz to-turkuaz-koyu text-gece shadow-lg shadow-turkuaz/20">
                    <IconVideo className="h-8 w-8" />
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-white/40">
                  <span>Görüşme süresi 04:32</span>
                  <span className="flex items-center gap-1 text-turkuaz">
                    <IconKvkk className="h-3.5 w-3.5" />
                    Uçtan uca güvenli
                  </span>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Görüşmeden Ödemeye Tüm Süreç Tek Yerde
              </h2>
              <div className="mt-8 flex flex-col gap-6">
                {OZELLIK_LISTESI.map(({ Icon, baslik, aciklama }) => (
                  <div key={baslik} className="flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-turkuaz/10 text-turkuaz">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-bold text-white">{baslik}</p>
                      <p className="mt-1 text-sm text-white/60">{aciklama}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-6 flex items-start gap-2 rounded-xl bg-white/5 px-4 py-3 text-xs leading-relaxed text-white/40">
                <IconOnay className="mt-0.5 h-4 w-4 shrink-0 text-turkuaz" />
                Görüntülü görüşme ve ödeme altyapımız şu an geliştirme aşamasındadır,
                yakında aktif olacaktır.
              </p>
            </div>
          </div>
        </section>

        <section className="scroll-mt-20 border-t border-gece-kenar bg-gece-yuzey/40 px-6 py-20">
          <div className="mx-auto max-w-6xl text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Kullanıcılarımız Ne Diyor?</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/60">
              Hukukim&apos;i deneyen kullanıcıların paylaştığı örnek geri bildirimler.
            </p>

            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
              {YORUMLAR.map(({ isim, sehir, yorum }) => (
                <div
                  key={isim}
                  className="flex flex-col items-start gap-4 rounded-2xl border border-white/10 bg-gece p-6 text-left shadow-sm"
                >
                  <div className="flex items-center gap-1 text-turkuaz">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <IconYildiz key={i} className="h-4 w-4" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-white/70">&quot;{yorum}&quot;</p>
                  <div className="mt-auto flex items-center gap-3 pt-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-turkuaz to-turkuaz-koyu text-xs font-bold text-gece">
                      {isim
                        .split(" ")
                        .map((p) => p[0])
                        .join("")}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-white">{isim}</p>
                      <p className="text-xs text-white/40">{sehir}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="fiyatlandirma" className="scroll-mt-20 border-t border-gece-kenar px-6 py-20">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Avukatlık Ücret Tarifesi
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/60">
              Şeffaf, önceden bilinen bir görüşme ücretlendirmesi.
            </p>

            <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-turkuaz bg-gece-yuzey p-8 shadow-md">
                <span className="rounded-full bg-turkuaz/15 px-3 py-1 text-xs font-bold text-turkuaz">
                  Yeni Üyelere Özel
                </span>
                <p className="mt-2 text-4xl font-extrabold text-white">
                  Ücretsiz
                </p>
                <p className="text-sm text-white/60">İlk randevu talebin</p>
              </div>

              <div className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-gece-yuzey p-8 shadow-sm">
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-bold text-white/60">
                  Sonraki Randevular
                </span>
                <p className="mt-2 text-4xl font-extrabold text-white">
                  199 TL
                  <span className="text-base font-semibold text-white/50"> / görüşme</span>
                </p>
                <p className="text-sm text-white/60">Avukat kabul edince ödenir</p>
              </div>
            </div>

            <p className="mx-auto mt-8 flex max-w-xl items-start gap-2 rounded-xl bg-gece-yuzey px-5 py-4 text-left text-xs leading-relaxed text-white/40 shadow-sm">
              <IconOnay className="mt-0.5 h-4 w-4 shrink-0 text-turkuaz" />
              Ödeme, avukat randevu talebini kabul ettikten sonra güvenli
              ödeme altyapımız (PayTR) üzerinden alınır. Talebin reddedilir ya
              da avukat katılmazsa ücret tahsil edilmez.
            </p>
          </div>
        </section>

        <section className="scroll-mt-20 border-t border-gece-kenar bg-gece-yuzey/40 px-6 py-20">
          <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-turkuaz/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-turkuaz">
                Avukat mısınız?
              </span>
              <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl">
                Müvekkillerinize Dijitalde Ulaşın
              </h2>
              <p className="mt-3 max-w-md text-sm text-white/60">
                Profilini oluştur, baro sicilinle doğrulan, sana uygun taleplerle
                eşleş.
              </p>

              <ul className="mt-6 flex flex-col gap-3">
                {AVUKAT_FAYDALARI.map((fayda) => (
                  <li key={fayda} className="flex items-center gap-2.5 text-sm text-white/70">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-turkuaz/15 text-turkuaz">
                      <IconOnay className="h-3 w-3" />
                    </span>
                    {fayda}
                  </li>
                ))}
              </ul>

              <Link
                href="/avukat/kayit"
                className="mt-8 inline-flex items-center gap-1.5 rounded-full bg-turkuaz px-6 py-3 text-sm font-bold text-gece transition hover:-translate-y-0.5 hover:bg-turkuaz-parlak"
              >
                Avukat Olarak Başvur
                <IconOk className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 flex items-center gap-3 rounded-2xl border border-white/10 bg-gece p-5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-turkuaz/10 text-turkuaz">
                  <IconTerazi className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-bold text-white">Avukat Paneli</p>
                  <p className="text-xs text-white/50">Gelen talepleri tek yerden yönet</p>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-white/10 bg-gece p-6 text-center">
                <span className="font-heading text-2xl font-bold text-white">Baro</span>
                <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-white/40">
                  Sicil Doğrulama
                </span>
              </div>
              <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-white/10 bg-gece p-6 text-center">
                <span className="font-heading text-2xl font-bold text-white">Panel</span>
                <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-white/40">
                  Talep Takibi
                </span>
              </div>
            </div>
          </div>
        </section>

        <section
          id="sss"
          className="scroll-mt-20 border-t border-gece-kenar px-6 py-20"
        >
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Sıkça Sorulan Sorular
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-white/60">
              Aklına takılan bir şey varsa cevabı muhtemelen burada.
            </p>

            <div className="mt-10">
              <SssAkordeon liste={sssListesi ?? []} />
            </div>
          </div>
        </section>

        <section className="px-6 py-20">
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br from-gece-yuzey to-gece px-8 py-14 text-center shadow-xl ring-1 ring-white/10">
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage: "radial-gradient(circle, #22D3EE 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-turkuaz/20 blur-3xl"
            />

            <h2 className="relative text-2xl font-bold text-white sm:text-3xl">
              Hukuki Sorunlarınızı Bugün Çözün
            </h2>
            <p className="relative mx-auto mt-3 max-w-md text-sm text-white/60">
              Kayıt olmak tamamen ücretsiz, dakikalar içinde tamamlanır.
            </p>

            <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/avukat/kayit"
                className="w-full rounded-full bg-turkuaz px-6 py-3 text-sm font-bold text-gece transition hover:-translate-y-0.5 hover:bg-turkuaz-parlak hover:shadow-lg sm:w-auto"
              >
                Avukat Olarak Kaydol
              </Link>
              <Link
                href="/muvekkil/kayit"
                className="w-full rounded-full border-2 border-white/20 px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:border-white/50 sm:w-auto"
              >
                Müvekkil Olarak Kaydol
              </Link>
            </div>

            <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <span className="flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-xs font-semibold text-white/70">
                <IconApple className="h-4 w-4" />
                App Store · Yakında
              </span>
              <span className="flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-xs font-semibold text-white/70">
                <IconGooglePlay className="h-4 w-4" />
                Google Play · Yakında
              </span>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gece-yuzey px-6 py-14 text-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 sm:grid-cols-5">
          <div className="col-span-2">
            <span className="text-xl font-bold">
              Hukuk<span className="text-turkuaz">im</span>
            </span>
            <p className="mt-3 max-w-xs text-sm text-white/50">
              Avukat ve müvekkilleri güvenli, hızlı ve şeffaf şekilde buluşturan
              dijital hukuk platformu.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/60 ring-1 ring-white/10 transition hover:text-turkuaz">
                <IconInstagram className="h-4 w-4" />
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/60 ring-1 ring-white/10 transition hover:text-turkuaz">
                <IconTwitter className="h-4 w-4" />
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-white/60 ring-1 ring-white/10 transition hover:text-turkuaz">
                <IconLinkedin className="h-4 w-4" />
              </span>
            </div>
          </div>

          <div>
            <p className="text-sm font-bold text-white/90">Hizmetler</p>
            <ul className="mt-4 flex flex-col gap-2 text-sm text-white/50">
              <li><a href="#hukuk-alanlari" className="hover:text-white">Hukuk Alanları</a></li>
              <li><Link href="/avukatlar" className="hover:text-white">Avukatlarımız</Link></li>
              <li><Link href="/mevzuat" className="hover:text-white">Mevzuat</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-bold text-white/90">Avukatlar İçin</p>
            <ul className="mt-4 flex flex-col gap-2 text-sm text-white/50">
              <li><Link href="/avukat/kayit" className="hover:text-white">Avukat Başvurusu</Link></li>
              <li><Link href="/giris" className="hover:text-white">Avukat Girişi</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-bold text-white/90">Yasal</p>
            <ul className="mt-4 flex flex-col gap-2 text-sm text-white/50">
              <li><Link href="/kullanim-sartlari" className="hover:text-white">Kullanım Şartları</Link></li>
              <li><Link href="/gizlilik-politikasi" className="hover:text-white">Gizlilik Politikası</Link></li>
              <li><Link href="/kvkk-aydinlatma-metni" className="hover:text-white">KVKK Aydınlatma Metni</Link></li>
              <li><Link href="/mesafeli-satis-sozlesmesi" className="hover:text-white">Mesafeli Satış Sözleşmesi</Link></li>
              <li><Link href="/iptal-iade-kosullari" className="hover:text-white">İptal ve İade Koşulları</Link></li>
              <li><Link href="/iletisim" className="hover:text-white">İletişim</Link></li>
            </ul>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-6xl border-t border-white/10 pt-6 text-center text-xs text-white/30">
          © {new Date().getFullYear()} Hukukim. Tüm hakları saklıdır.
        </div>
      </footer>
    </div>
  );
}
