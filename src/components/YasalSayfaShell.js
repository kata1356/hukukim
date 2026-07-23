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

      <footer className="border-t border-white/10 py-8 text-center">
        <p className="text-xs text-white/40">
          © {new Date().getFullYear()} Hukukim. Tüm hakları saklıdır.
        </p>
      </footer>
    </div>
  );
}
