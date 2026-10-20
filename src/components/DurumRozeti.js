const DURUM_AYARLARI = {
  bekliyor: { metin: "Bekliyor", sinif: "bg-amber-500/10 text-amber-400", nokta: "bg-amber-400" },
  kabul: { metin: "Kabul Edildi", sinif: "bg-green-500/10 text-green-400", nokta: "bg-green-400" },
  red: { metin: "Reddedildi", sinif: "bg-red-500/10 text-red-400", nokta: "bg-red-400" },
  tamamlandi: { metin: "Tamamlandı", sinif: "bg-white/10 text-white/70", nokta: "bg-white/60" },
  iptal: { metin: "İptal Edildi", sinif: "bg-white/5 text-white/50", nokta: "bg-white/40" },
};

export default function DurumRozeti({ durum }) {
  const ayar = DURUM_AYARLARI[durum];
  if (!ayar) return null;

  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ${ayar.sinif}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${ayar.nokta}`} />
      {ayar.metin}
    </span>
  );
}
