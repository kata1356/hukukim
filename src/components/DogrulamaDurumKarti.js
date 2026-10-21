import Link from "next/link";

// Doğrulanmamış avukata, durumunu ve bir sonraki adımı gösterir.
export default function DogrulamaDurumKarti({ profil }) {
  const incelemede = profil.belge_durumu === "incelemede";
  const reddedildi = profil.belge_durumu === "reddedildi";

  return (
    <section className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-lg font-bold text-amber-400">
            {incelemede
              ? "Belgelerin inceleniyor"
              : reddedildi
                ? "Belgelerin onaylanmadı"
                : "Hesabın henüz doğrulanmadı"}
          </p>
          <p className="mt-1 text-sm text-white/80">
            {incelemede
              ? "Ekibimiz kimlik ve baro kartını kontrol ediyor. Onaylanınca talepler otomatik olarak açılır."
              : reddedildi
                ? `${profil.belge_notu ? `${profil.belge_notu} ` : ""}Belgelerini yeniden yükleyebilirsin.`
                : "Doğrulanana kadar talepleri göremez, randevu alamaz ve müvekkillerle iletişime geçemezsin. Kimlik ve baro kartını yükleyerek başla."}
          </p>
        </div>
        {!incelemede && (
          <Link
            href="/avukat/profil#kimlik-dogrulama"
            className="shrink-0 rounded-md bg-amber-500 px-5 py-2.5 text-center text-sm font-bold text-gece transition hover:bg-amber-400"
          >
            Belgelerimi Yükle
          </Link>
        )}
      </div>
    </section>
  );
}
