import Link from "next/link";
import {
  IconKalkan,
  IconKullanici,
  IconOk,
  IconBaro,
  IconKvkk,
  IconTelefon,
  IconArama,
  IconTakvim,
} from "@/components/icons";
import { UZMANLIK_ALANLARI } from "@/lib/uzmanlikAlanlari";

const ONE_CIKAN_ALANLAR = UZMANLIK_ALANLARI.slice(0, 6);

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

const GUVEN_ROZETLERI = [
  { Icon: IconBaro, metin: "Baro sicil doğrulamalı" },
  { Icon: IconKvkk, metin: "KVKK uyumlu" },
  { Icon: IconTelefon, metin: "Mobilde de sorunsuz" },
];

export default function AnaSayfa() {
  return (
    <div className="flex min-h-full flex-1 flex-col overflow-x-hidden bg-white">
      <div className="bg-lacivert py-2 text-center text-xs font-semibold text-white sm:text-sm">
        Kayıt tamamen ücretsiz · Baro sicil doğrulamalı avukatlarla dakikalar içinde tanış
      </div>

      <header className="sticky top-0 z-20 border-b border-lacivert/10 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <span className="text-2xl font-bold text-lacivert">
            Hukuk<span className="text-altin">im</span>
          </span>

          <nav className="hidden items-center gap-8 text-sm font-semibold text-lacivert/70 md:flex">
            <a href="#nasil-calisir" className="transition hover:text-lacivert">
              Nasıl Çalışır
            </a>
            <Link href="/avukat/kayit" className="transition hover:text-lacivert">
              Avukat mısınız?
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/giris"
              className="rounded-full px-4 py-2 text-sm font-semibold text-lacivert transition hover:bg-lacivert/5"
            >
              Giriş Yap
            </Link>
            <a
              href="#basla"
              className="hidden rounded-full bg-lacivert px-4 py-2 text-sm font-semibold text-white transition hover:bg-lacivert-koyu sm:inline-block"
            >
              Ücretsiz Kaydol
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative isolate overflow-hidden">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-gradient-to-b from-lacivert/[0.06] via-white to-white"
          />
          <div
            aria-hidden="true"
            className="absolute -top-40 left-1/2 -z-10 h-[32rem] w-[32rem] -translate-x-[70%] rounded-full bg-lacivert/10 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="absolute -top-24 right-0 -z-10 h-96 w-96 translate-x-1/3 rounded-full bg-altin/20 blur-3xl"
          />

          <div className="mx-auto flex max-w-6xl flex-col items-center px-6 pb-20 pt-20 text-center sm:pt-28">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-lacivert shadow-sm ring-1 ring-lacivert/10">
              <IconKalkan className="h-4 w-4 text-altin-koyu" />
              Türkiye&apos;nin avukat-müvekkil buluşma platformu
            </span>

            <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-tight text-lacivert sm:text-6xl">
              Doğru avukatı bulmanın{" "}
              <span className="relative inline-block whitespace-nowrap text-altin-koyu">
                en kolay yolu
                <svg
                  aria-hidden="true"
                  viewBox="0 0 300 20"
                  className="absolute -bottom-2 left-0 h-3 w-full text-altin"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M2 14C60 4 240 4 298 14"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base text-lacivert/60 sm:text-lg">
              Hukukim, Türkiye&apos;nin dört bir yanındaki avukatları ihtiyacı olan
              müvekkillerle saniyeler içinde buluşturur.
            </p>

            <div className="mt-8 flex max-w-full flex-wrap items-center justify-center gap-2">
              {ONE_CIKAN_ALANLAR.map((alan) => (
                <Link
                  key={alan}
                  href="/muvekkil/kayit"
                  className="rounded-full border border-lacivert/10 bg-white px-3.5 py-1.5 text-xs font-semibold text-lacivert/70 shadow-sm transition hover:border-altin/50 hover:text-lacivert"
                >
                  {alan}
                </Link>
              ))}
            </div>

            <div id="basla" className="mt-10 grid w-full max-w-3xl scroll-mt-24 grid-cols-1 gap-6 sm:grid-cols-2">
              <Link
                href="/avukat/kayit"
                className="group relative flex flex-col items-center gap-4 overflow-hidden rounded-3xl border border-lacivert/10 bg-white p-8 shadow-lg shadow-lacivert/5 transition duration-300 hover:-translate-y-1.5 hover:rotate-[-0.5deg] hover:shadow-2xl hover:shadow-lacivert/15"
              >
                <span className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-lacivert/5 transition group-hover:scale-125" />
                <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-lacivert to-lacivert-koyu text-altin shadow-md transition group-hover:scale-110 group-hover:rotate-3">
                  <IconKalkan className="h-7 w-7" />
                </span>
                <span className="relative text-xl font-bold text-lacivert">Avukatım</span>
                <span className="relative text-sm text-lacivert/60">
                  Profilini oluştur, müvekkillerden randevu talebi al.
                </span>
                <span className="relative mt-2 flex items-center gap-1.5 rounded-full bg-lacivert px-5 py-2.5 text-sm font-semibold text-white transition group-hover:bg-altin group-hover:text-lacivert">
                  Avukat Olarak Devam Et
                  <IconOk className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>

              <Link
                href="/muvekkil/kayit"
                className="group relative flex flex-col items-center gap-4 overflow-hidden rounded-3xl border border-lacivert/10 bg-white p-8 shadow-lg shadow-lacivert/5 transition duration-300 hover:-translate-y-1.5 hover:rotate-[0.5deg] hover:shadow-2xl hover:shadow-lacivert/15"
              >
                <span className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-altin/10 transition group-hover:scale-125" />
                <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-altin to-altin-koyu text-lacivert shadow-md transition group-hover:scale-110 group-hover:rotate-3">
                  <IconKullanici className="h-7 w-7" />
                </span>
                <span className="relative text-xl font-bold text-lacivert">Müvekkilim</span>
                <span className="relative text-sm text-lacivert/60">
                  Uzman avukatları bul, kolayca randevu talebi gönder.
                </span>
                <span className="relative mt-2 flex items-center gap-1.5 rounded-full bg-lacivert px-5 py-2.5 text-sm font-semibold text-white transition group-hover:bg-altin group-hover:text-lacivert">
                  Müvekkil Olarak Devam Et
                  <IconOk className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
              {GUVEN_ROZETLERI.map(({ Icon, metin }) => (
                <span
                  key={metin}
                  className="inline-flex items-center gap-2 rounded-full bg-lacivert/5 px-4 py-2 text-xs font-semibold text-lacivert/70"
                >
                  <Icon className="h-4 w-4 text-altin-koyu" />
                  {metin}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section
          id="nasil-calisir"
          className="relative scroll-mt-20 border-t border-lacivert/10 bg-lacivert/[0.02] px-6 py-20"
        >
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-2xl font-bold text-lacivert sm:text-3xl">
              Nasıl Çalışır
            </h2>
            <div className="relative mt-14 grid grid-cols-1 gap-12 sm:grid-cols-3">
              <div
                aria-hidden="true"
                className="absolute left-0 right-0 top-6 hidden border-t-2 border-dashed border-altin/40 sm:block"
              />
              {ADIMLAR.map((adim, i) => (
                <div key={adim.baslik} className="relative flex flex-col items-center text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-base font-bold text-lacivert shadow-md ring-4 ring-lacivert/[0.03]">
                    {i + 1}
                  </span>
                  <span className="mt-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-lacivert to-lacivert-koyu text-altin shadow-sm">
                    <adim.Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-base font-bold text-lacivert">
                    {adim.baslik}
                  </h3>
                  <p className="mt-2 max-w-xs text-sm text-lacivert/60">{adim.aciklama}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-20">
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br from-lacivert to-lacivert-koyu px-8 py-14 text-center shadow-xl">
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  "radial-gradient(circle, #ffffff 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-altin/20 blur-3xl"
            />

            <h2 className="relative text-2xl font-bold text-white sm:text-3xl">
              Hemen ücretsiz kaydol, doğru avukata bir adım kal
            </h2>
            <p className="relative mx-auto mt-3 max-w-md text-sm text-white/70">
              Kayıt olmak tamamen ücretsiz, dakikalar içinde tamamlanır.
            </p>
            <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/avukat/kayit"
                className="w-full rounded-full bg-altin px-6 py-3 text-sm font-bold text-lacivert transition hover:-translate-y-0.5 hover:shadow-lg sm:w-auto"
              >
                Avukat Olarak Kaydol
              </Link>
              <Link
                href="/muvekkil/kayit"
                className="w-full rounded-full border-2 border-white/30 px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:border-white sm:w-auto"
              >
                Müvekkil Olarak Kaydol
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-lacivert/10 py-8 text-center">
        <p className="text-xs text-lacivert/50">
          © {new Date().getFullYear()} Hukukim. Tüm hakları saklıdır.
        </p>
      </footer>
    </div>
  );
}
