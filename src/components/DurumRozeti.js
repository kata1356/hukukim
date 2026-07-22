import { IconOnay, IconRed, IconSaat } from "./icons";

const DURUM_AYARLARI = {
  bekliyor: { metin: "Bekliyor", sinif: "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20", Icon: IconSaat },
  kabul: { metin: "Kabul Edildi", sinif: "bg-green-500/10 text-green-400 ring-1 ring-green-500/20", Icon: IconOnay },
  red: { metin: "Reddedildi", sinif: "bg-red-500/10 text-red-400 ring-1 ring-red-500/20", Icon: IconRed },
  tamamlandi: { metin: "Tamamlandı", sinif: "bg-turkuaz/15 text-turkuaz ring-1 ring-turkuaz/20", Icon: IconOnay },
};

export default function DurumRozeti({ durum }) {
  const ayar = DURUM_AYARLARI[durum];
  if (!ayar) return null;
  const { Icon } = ayar;

  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${ayar.sinif}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {ayar.metin}
    </span>
  );
}
