export default function StatKarti({ deger, etiket }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-lacivert/10 bg-white py-4 text-center shadow-sm shadow-lacivert/5">
      <span className="text-2xl font-bold text-lacivert">{deger}</span>
      <span className="mt-1 text-xs font-semibold uppercase tracking-wide text-lacivert/50">
        {etiket}
      </span>
    </div>
  );
}
