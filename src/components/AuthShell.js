import Link from "next/link";

export default function AuthShell({ baslik, altBaslik, genis = false, children }) {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-gradient-to-b from-lacivert/[0.03] to-white">
      <header className="border-b border-lacivert/10 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center px-6 py-5">
          <Link href="/" className="text-2xl font-bold text-lacivert">
            Hukuk<span className="text-altin">im</span>
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-start justify-center px-4 py-10 sm:py-14">
        <div
          className={`w-full ${
            genis ? "max-w-2xl" : "max-w-md"
          } rounded-2xl border border-lacivert/10 bg-white p-6 shadow-lg shadow-lacivert/5 sm:p-8`}
        >
          <h1 className="text-2xl font-bold text-lacivert">{baslik}</h1>
          {altBaslik && (
            <p className="mt-1 text-sm text-lacivert/60">{altBaslik}</p>
          )}
          <div className="mt-6">{children}</div>
        </div>
      </main>
    </div>
  );
}
