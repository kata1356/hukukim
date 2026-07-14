import { IconOnay, IconRed, IconSaat } from "./icons";

const DURUM_AYARLARI = {
  bekliyor: { metin: "Bekliyor", sinif: "bg-amber-50 text-amber-700", Icon: IconSaat },
  kabul: { metin: "Kabul Edildi", sinif: "bg-green-50 text-green-700", Icon: IconOnay },
  red: { metin: "Reddedildi", sinif: "bg-red-50 text-red-700", Icon: IconRed },
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
