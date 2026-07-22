function baslangicHarfleriAl(adSoyad) {
  if (!adSoyad) return "?";
  const parcalar = adSoyad.trim().split(/\s+/);
  const ilk = parcalar[0]?.[0] ?? "";
  const son = parcalar.length > 1 ? parcalar[parcalar.length - 1][0] : "";
  return (ilk + son).toLocaleUpperCase("tr-TR");
}

export default function Avatar({ adSoyad, fotografUrl, dogrulanmis = false, boyut = "md" }) {
  const boyutSinif =
    boyut === "lg"
      ? "h-16 w-16 text-xl"
      : boyut === "sm"
      ? "h-8 w-8 text-xs"
      : "h-11 w-11 text-sm";

  const halkaSinifi = dogrulanmis
    ? "ring-2 ring-turkuaz"
    : "ring-2 ring-white/20";

  if (fotografUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={fotografUrl}
        alt={adSoyad ?? ""}
        className={`${boyutSinif} shrink-0 rounded-full object-cover shadow-sm ${halkaSinifi}`}
      />
    );
  }

  return (
    <div
      className={`${boyutSinif} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-turkuaz to-turkuaz-koyu font-semibold text-gece shadow-sm ${halkaSinifi}`}
      aria-hidden="true"
    >
      {baslangicHarfleriAl(adSoyad)}
    </div>
  );
}
