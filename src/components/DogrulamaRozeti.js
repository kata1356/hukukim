import { IconKalkan, IconSaat } from "./icons";

export default function DogrulamaRozeti({ dogrulanmis }) {
  if (dogrulanmis) {
    return (
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-400 ring-1 ring-green-500/20">
        <IconKalkan className="h-3.5 w-3.5" />
        Baro Sicili Doğrulanmış
      </span>
    );
  }

  return (
    <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-white/50 ring-1 ring-white/10">
      <IconSaat className="h-3.5 w-3.5" />
      Doğrulanmamış
    </span>
  );
}
