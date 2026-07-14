function baslangicHarfleriAl(adSoyad) {
  if (!adSoyad) return "?";
  const parcalar = adSoyad.trim().split(/\s+/);
  const ilk = parcalar[0]?.[0] ?? "";
  const son = parcalar.length > 1 ? parcalar[parcalar.length - 1][0] : "";
  return (ilk + son).toLocaleUpperCase("tr-TR");
}

export default function Avatar({ adSoyad, boyut = "md" }) {
  const boyutSinif =
    boyut === "lg"
      ? "h-16 w-16 text-xl"
      : boyut === "sm"
      ? "h-8 w-8 text-xs"
      : "h-11 w-11 text-sm";

  return (
    <div
      className={`${boyutSinif} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-lacivert to-lacivert-koyu font-semibold text-altin shadow-sm ring-2 ring-white`}
      aria-hidden="true"
    >
      {baslangicHarfleriAl(adSoyad)}
    </div>
  );
}
