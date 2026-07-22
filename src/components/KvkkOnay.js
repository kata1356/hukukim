export default function KvkkOnay({ checked, onChange }) {
  return (
    <label className="flex items-start gap-3 text-sm text-white/70">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        required
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-white/5 text-turkuaz focus:ring-turkuaz/40"
      />
      <span>
        6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında
        kişisel verilerimin işlenmesine açık rıza gösteriyorum.
      </span>
    </label>
  );
}
