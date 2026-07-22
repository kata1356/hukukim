export default function TextField({
  label,
  id,
  as = "input",
  children,
  ...rest
}) {
  const inputClasses =
    "w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-turkuaz focus:ring-2 focus:ring-turkuaz/30";

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-white">
        {label}
      </label>
      {as === "textarea" ? (
        <textarea id={id} className={inputClasses} {...rest} />
      ) : as === "select" ? (
        <select id={id} className={`${inputClasses} [&>option]:bg-gece-yuzey [&>option]:text-white`} {...rest}>
          {children}
        </select>
      ) : (
        <input id={id} className={inputClasses} {...rest} />
      )}
    </div>
  );
}
