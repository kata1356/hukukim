"use client";

export default function AltMenu({ sekmeler }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-lacivert/10 bg-white/95 backdrop-blur sm:hidden">
      <div className="flex items-stretch justify-around">
        {sekmeler.map(({ etiket, href, Icon }) => (
          <a
            key={etiket}
            href={href}
            className="flex flex-1 flex-col items-center gap-1 py-2.5 text-lacivert/50 transition hover:text-lacivert"
          >
            <Icon className="h-5 w-5" />
            <span className="text-[11px] font-semibold">{etiket}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}
