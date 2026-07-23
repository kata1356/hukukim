import { IconYildiz } from "./icons";

export default function YildizGosterge({ ortalama, sayi }) {
  if (!sayi) {
    return <span className="text-xs text-white/30">Henüz değerlendirme yok</span>;
  }

  const doluYildiz = Math.round(ortalama);

  return (
    <span className="flex items-center gap-1">
      <span className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <IconYildiz key={i} className={`h-3.5 w-3.5 ${i < doluYildiz ? "text-turkuaz" : "text-white/15"}`} />
        ))}
      </span>
      <span className="text-xs font-semibold text-white/60">
        {ortalama.toFixed(1)} ({sayi})
      </span>
    </span>
  );
}
