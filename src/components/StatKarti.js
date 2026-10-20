export default function StatKarti({ deger, etiket }) {
  return (
    <div className="flex flex-1 flex-col rounded-lg border border-white/10 bg-gece-yuzey px-4 py-3">
      <span className="text-xs font-medium text-white/50">{etiket}</span>
      <span className="mt-1 font-heading text-2xl font-semibold text-white">{deger}</span>
    </div>
  );
}
