export default function Logo({ className = "h-7" }) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-2 ${className}`}
      aria-label="Hukukim"
      role="img"
    >
      <svg viewBox="0 0 32 32" className="h-full w-auto shrink-0" aria-hidden="true">
        <rect width="32" height="32" rx="7" fill="#22D3EE" />
        <path
          d="M16 5v21M7 27h18M16 8.5 9 12.5l3.4 6.6a4 4 0 0 0 7.2 0l3.4-6.6L16 8.5ZM9 12.5l3.4 6.6M23 12.5l-3.4 6.6"
          stroke="#0A0F1D"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      <span
        className="font-bold leading-none tracking-tight text-white"
        style={{ fontFamily: "var(--font-sora), sans-serif", fontSize: "1.35rem" }}
      >
        Hukuk<span className="text-turkuaz">im</span>
      </span>
    </span>
  );
}
