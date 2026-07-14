export default function KvkkOnay({ checked, onChange }) {
  return (
    <label className="flex items-start gap-3 text-sm text-lacivert/80">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        required
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-lacivert/30 text-altin focus:ring-altin/50"
      />
      <span>
        6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında
        kişisel verilerimin işlenmesine açık rıza gösteriyorum.
      </span>
    </label>
  );
}
