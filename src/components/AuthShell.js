import Link from "next/link";
import Logo from "./Logo";

export default function AuthShell({ baslik, altBaslik, genis = false, children }) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-gradient-to-b from-turkuaz/[0.06] to-gece">
      <header className="border-b border-white/10 bg-gece/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center px-6 py-5">
          <Link href="/">
            <Logo className="h-8" />
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-start justify-center px-4 py-10 sm:py-14">
        <div
          className={`w-full ${
            genis ? "max-w-2xl" : "max-w-md"
          } rounded-2xl border border-white/10 bg-gece-yuzey p-6 shadow-lg sm:p-8`}
        >
          <h1 className="text-2xl font-bold text-white">{baslik}</h1>
          {altBaslik && (
            <p className="mt-1 text-sm text-white/60">{altBaslik}</p>
          )}
          <div className="mt-6">{children}</div>
        </div>
      </main>
    </div>
  );
}
