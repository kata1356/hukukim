import Link from "next/link";

export default function SozlesmeOnay({ checked, onChange }) {
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
        <Link href="/avukat-sozlesmesi" target="_blank" className="font-semibold text-turkuaz underline">
          Avukat Hizmet Sözleşmesi
        </Link>
        &apos;ni okudum ve kabul ediyorum.
      </span>
    </label>
  );
}
