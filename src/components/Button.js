import Spinner from "./Spinner";

export default function Button({
  children,
  yukleniyor = false,
  variant = "dolu",
  className = "",
  type = "button",
  ...rest
}) {
  const temel =
    "flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition duration-150 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100";
  const varyant =
    variant === "dolu"
      ? "bg-turkuaz text-gece shadow-sm hover:bg-turkuaz-parlak hover:shadow-md hover:-translate-y-0.5"
      : variant === "acil"
      ? "bg-red-600 text-white shadow-sm hover:bg-red-700 hover:shadow-md hover:-translate-y-0.5"
      : "border-2 border-white/20 text-white hover:border-white/40 hover:bg-white/5 hover:-translate-y-0.5";

  return (
    <button
      type={type}
      disabled={yukleniyor || rest.disabled}
      className={`${temel} ${varyant} ${className}`}
      {...rest}
    >
      {yukleniyor && <Spinner className="h-4 w-4" />}
      {yukleniyor ? "Yükleniyor..." : children}
    </button>
  );
}
