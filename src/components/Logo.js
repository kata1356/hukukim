import Image from "next/image";

export default function Logo({ className = "h-7" }) {
  return (
    <span className={`inline-flex w-fit items-center rounded-lg bg-white px-2.5 py-1 shadow-sm ${className}`}>
      <Image
        src="/logo-wordmark.png"
        alt="Hukukim"
        width={1234}
        height={226}
        priority
        className="h-full w-auto object-contain"
      />
    </span>
  );
}
