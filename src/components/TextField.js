export default function TextField({
  label,
  id,
  as = "input",
  children,
  ...rest
}) {
  const inputClasses =
    "w-full rounded-lg border border-lacivert/20 bg-white px-4 py-2.5 text-sm text-lacivert placeholder:text-lacivert/40 outline-none transition focus:border-altin focus:ring-2 focus:ring-altin/30";

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-lacivert">
        {label}
      </label>
      {as === "textarea" ? (
        <textarea id={id} className={inputClasses} {...rest} />
      ) : as === "select" ? (
        <select id={id} className={inputClasses} {...rest}>
          {children}
        </select>
      ) : (
        <input id={id} className={inputClasses} {...rest} />
      )}
    </div>
  );
}
