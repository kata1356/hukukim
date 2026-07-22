export default function StatKarti({ deger, etiket }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-white/10 bg-gece-yuzey py-4 text-center shadow-sm">
      <span className="font-heading text-2xl font-bold text-white">{deger}</span>
      <span className="mt-1 font-mono text-[11px] font-medium uppercase tracking-wider text-white/40">
        {etiket}
      </span>
    </div>
  );
}
