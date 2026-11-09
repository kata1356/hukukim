import Link from "next/link";
import Logo from "./Logo";

export default function YasalSayfaShell({ baslik, guncellemeTarihi, children }) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-gece">
      <header className="border-b border-white/10 bg-gece/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center px-6 py-5">
          <Link href="/">
            <Logo className="h-7" />
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-14">
        <h1 className="text-3xl font-bold text-white">{baslik}</h1>
        <p className="mt-2 text-xs text-white/40">
          Son güncelleme: {guncellemeTarihi}
        </p>
        <div className="prose prose-invert prose-sm mt-8 max-w-none text-sm leading-relaxed text-white/70 [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-white [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mt-1">
          {children}
        </div>
      </main>

      <footer className="border-t border-white/10 px-6 py-8 text-center">
        <ul className="mx-auto flex max-w-3xl flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-white/50">
          <li><Link href="/hakkimizda" className="hover:text-white">Hakkımızda</Link></li>
          <li><Link href="/kullanim-sartlari" className="hover:text-white">Kullanım Şartları</Link></li>
          <li><Link href="/gizlilik-politikasi" className="hover:text-white">Gizlilik Politikası</Link></li>
          <li><Link href="/kvkk-aydinlatma-metni" className="hover:text-white">KVKK Aydınlatma Metni</Link></li>
          <li><Link href="/mesafeli-satis-sozlesmesi" className="hover:text-white">Mesafeli Satış Sözleşmesi</Link></li>
          <li><Link href="/iptal-iade-kosullari" className="hover:text-white">Teslimat, İptal ve İade Şartları</Link></li>
          <li><Link href="/iletisim" className="hover:text-white">İletişim</Link></li>
        </ul>
        <div className="mt-5 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/iyzico-logo-band-white.png"
            alt="iyzico ile Öde. Mastercard, Visa, American Express ve Troy ile ödeme kabul edilir."
            className="h-8 w-auto max-w-full opacity-90"
          />
        </div>
        <p className="mt-5 text-xs text-white/40">
          © {new Date().getFullYear()} Hukukim. Tüm hakları saklıdır.
        </p>
      </footer>
    </div>
  );
}
