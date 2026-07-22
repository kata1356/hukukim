export default function Honeypot({ value, onChange }) {
  return (
    <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
      <label htmlFor="web_sitesi">Web Siteniz</label>
      <input
        id="web_sitesi"
        name="web_sitesi"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
