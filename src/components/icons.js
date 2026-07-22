function Svg({ children, className = "h-4 w-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function IconTelefon(props) {
  return (
    <Svg {...props}>
      <path d="M6.6 10.8c1.4 2.7 3.6 4.9 6.3 6.3l2.1-2.1c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.4 0 .8-.2 1.1L6.6 10.8Z" />
    </Svg>
  );
}

export function IconKonum(props) {
  return (
    <Svg {...props}>
      <path d="M12 21s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z" />
      <circle cx="12" cy="9" r="2.5" />
    </Svg>
  );
}

export function IconBaro(props) {
  return (
    <Svg {...props}>
      <path d="M12 3v18M3 21h18M5 7l7-4 7 4M4 7h4l-2 5a2 2 0 1 1-2-5ZM16 7h4l-2 5a2 2 0 1 1-2-5Z" />
    </Svg>
  );
}

export function IconUzmanlik(props) {
  return (
    <Svg {...props}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </Svg>
  );
}

export function IconArama(props) {
  return (
    <Svg {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </Svg>
  );
}

export function IconOnay(props) {
  return (
    <Svg {...props}>
      <path d="m5 13 4 4L19 7" />
    </Svg>
  );
}

export function IconRed(props) {
  return (
    <Svg {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Svg>
  );
}

export function IconSaat(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </Svg>
  );
}

export function IconKalkan(props) {
  return (
    <Svg {...props}>
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" />
    </Svg>
  );
}

export function IconTakvim(props) {
  return (
    <Svg {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </Svg>
  );
}

export function IconMesaj(props) {
  return (
    <Svg {...props}>
      <path d="M4 5h16v11H8l-4 4V5Z" />
    </Svg>
  );
}

export function IconVideo(props) {
  return (
    <Svg {...props}>
      <rect x="3" y="6" width="12" height="12" rx="2" />
      <path d="m21 8-6 4 6 4V8Z" />
    </Svg>
  );
}

export function IconYuzYuze(props) {
  return (
    <Svg {...props}>
      <circle cx="9" cy="8" r="3" />
      <path d="M4 20c0-3 2.5-5 5-5s5 2 5 5" />
      <path d="M16 4.5c1.2.4 2 1.6 2 2.9s-.8 2.5-2 2.9M20 20c0-2.4-1.7-4.4-4-4.9" />
    </Svg>
  );
}

export function IconKullanici(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
    </Svg>
  );
}

export function IconEv(props) {
  return (
    <Svg {...props}>
      <path d="M4 10.5 12 4l8 6.5" />
      <path d="M6 9.5V20h12V9.5" />
    </Svg>
  );
}

export function IconListe(props) {
  return (
    <Svg {...props}>
      <path d="M8 6h13M8 12h13M8 18h13" />
      <path d="M3 6h.01M3 12h.01M3 18h.01" />
    </Svg>
  );
}

export function IconYayin(props) {
  return (
    <Svg {...props}>
      <path d="M4 11v2a2 2 0 0 0 2 2h1l3 4v-6M4 11l8-6v14l-8-6ZM17 8a5 5 0 0 1 0 8M20 5a9 9 0 0 1 0 14" />
    </Svg>
  );
}

export function IconYildirim(props) {
  return (
    <Svg {...props}>
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" />
    </Svg>
  );
}

export function IconTerazi(props) {
  return (
    <Svg {...props}>
      <path d="M12 3v18M3 21h18M12 6 5 9l3.5 6a4 4 0 0 0 7 0L19 9l-7-3ZM5 9l3.5 6M19 9l-3.5 6" />
    </Svg>
  );
}

export function IconKvkk(props) {
  return (
    <Svg {...props}>
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 1 1 8 0v3" />
    </Svg>
  );
}

export function IconEtiket(props) {
  return (
    <Svg {...props}>
      <path d="M12 3h6a2 2 0 0 1 2 2v6L11 20l-8-8L12 3Z" />
      <circle cx="15.5" cy="7.5" r="1.5" />
    </Svg>
  );
}

export function IconKitap(props) {
  return (
    <Svg {...props}>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z" />
      <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20" />
    </Svg>
  );
}

export function IconDisLink(props) {
  return (
    <Svg {...props}>
      <path d="M14 4h6v6M20 4 11 13M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" />
    </Svg>
  );
}

export function IconKalp(props) {
  return (
    <Svg {...props}>
      <path d="M12 20s-7-4.4-9.5-9A5 5 0 0 1 12 6a5 5 0 0 1 9.5 5c-2.5 4.6-9.5 9-9.5 9Z" />
    </Svg>
  );
}

export function IconBina(props) {
  return (
    <Svg {...props}>
      <path d="M4 21V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v16M12 21v-9h7a1 1 0 0 1 1 1v8M4 21h16M7 7h1M7 11h1M7 15h1" />
    </Svg>
  );
}

export function IconKure(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 3.5 6 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-6-3.5-9s1-6.5 3.5-9Z" />
    </Svg>
  );
}

export function IconCip(props) {
  return (
    <Svg {...props}>
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
      <path d="M9 3v4M15 3v4M9 17v4M15 17v4M3 9h4M3 15h4M17 9h4M17 15h4" />
    </Svg>
  );
}

export function IconAsagiOk(props) {
  return (
    <Svg {...props}>
      <path d="m6 9 6 6 6-6" />
    </Svg>
  );
}

export function IconKamera(props) {
  return (
    <Svg {...props}>
      <path d="M4 8a2 2 0 0 1 2-2h1l1.5-2h7L17 6h1a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z" />
      <circle cx="12" cy="13" r="3.5" />
    </Svg>
  );
}

export function IconOk(props) {
  return (
    <Svg {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Svg>
  );
}

export function IconMikrofon(props) {
  return (
    <Svg {...props}>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6" />
    </Svg>
  );
}

export function IconTelefonKapat(props) {
  return (
    <Svg {...props}>
      <path d="M3 13c5-4 13-4 18 0l-.3 2.7a1.5 1.5 0 0 1-1.7 1.3l-2.6-.4a1.5 1.5 0 0 1-1.2-1.1l-.4-1.4a10 10 0 0 0-5.6 0l-.4 1.4a1.5 1.5 0 0 1-1.2 1.1l-2.6.4a1.5 1.5 0 0 1-1.7-1.3L3 13Z" />
    </Svg>
  );
}

export function IconYildiz(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={props.className ?? "h-4 w-4"} aria-hidden="true">
      <path d="M12 2.5l2.9 6.1 6.6.7-4.9 4.6 1.3 6.6L12 17.4l-5.9 3.1 1.3-6.6-4.9-4.6 6.6-.7L12 2.5Z" />
    </svg>
  );
}

export function IconOynat(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={props.className ?? "h-4 w-4"} aria-hidden="true">
      <path d="M8 5.5v13l11-6.5-11-6.5Z" />
    </svg>
  );
}

export function IconApple(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={props.className ?? "h-4 w-4"} aria-hidden="true">
      <path d="M16.7 12.4c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9-.7 0-1.8-.9-3-.9-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.2 0 2-1.1 2.8-2.2.7-1 1-2 1.5-3.1-2.6-1.1-3.7-2.6-3.7-3.3ZM14.2 5.1c.6-.8 1.1-1.9 1-3-1 0-2.2.6-2.9 1.5-.6.7-1.1 1.9-1 2.9 1.1.1 2.2-.5 2.9-1.4Z" />
    </svg>
  );
}

export function IconGooglePlay(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={props.className ?? "h-4 w-4"} aria-hidden="true">
      <path d="M4.5 3.6c-.3.2-.5.6-.5 1v14.8c0 .4.2.8.5 1l8.8-8.4-8.8-8.4ZM14.3 12l2.5-2.4-9.3-5.3 6.8 7.7ZM14.3 12l-6.8 7.7 9.3-5.3-2.5-2.4ZM17.8 10.1l-2.5 1.9 2.5 1.9 2.9-1.6c.6-.4.6-1.2 0-1.6l-2.9-1.6Z" />
    </svg>
  );
}

export function IconInstagram(props) {
  return (
    <Svg {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.5 6.5h.01" />
    </Svg>
  );
}

export function IconTwitter(props) {
  return (
    <Svg {...props}>
      <path d="M3 4l7.5 9.5L3.4 20H6l5.8-5.8L16 20h5l-7.8-9.9L20.4 4H18l-5.3 5.3L8.5 4H3Z" />
    </Svg>
  );
}

export function IconPano(props) {
  return (
    <Svg {...props}>
      <rect x="3" y="3" width="8" height="8" rx="1.5" />
      <rect x="13" y="3" width="8" height="5" rx="1.5" />
      <rect x="13" y="10" width="8" height="11" rx="1.5" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" />
    </Svg>
  );
}

export function IconGrup(props) {
  return (
    <Svg {...props}>
      <circle cx="8.5" cy="8" r="3" />
      <circle cx="16" cy="9" r="2.5" />
      <path d="M2.5 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
      <path d="M15 14.8c2.6.3 4.5 2.2 4.5 5.2" />
    </Svg>
  );
}

export function IconZil(props) {
  return (
    <Svg {...props}>
      <path d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </Svg>
  );
}

export function IconMenu(props) {
  return (
    <Svg {...props}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </Svg>
  );
}

export function IconKalem(props) {
  return (
    <Svg {...props}>
      <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5 17v3Z" />
      <path d="m14 6 4 4" />
    </Svg>
  );
}

export function IconArti(props) {
  return (
    <Svg {...props}>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  );
}

export function IconTarih(props) {
  return (
    <Svg {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
      <path d="M9 15h1M14 15h1" />
    </Svg>
  );
}

export function IconGeri(props) {
  return (
    <Svg {...props}>
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </Svg>
  );
}

export function IconTarihce(props) {
  return (
    <Svg {...props}>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
      <path d="M12 8v4l3 2" />
    </Svg>
  );
}

export function IconCikis(props) {
  return (
    <Svg {...props}>
      <path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4" />
      <path d="M14 16l4-4-4-4M18 12H9" />
    </Svg>
  );
}

export function IconLinkedin(props) {
  return (
    <Svg {...props}>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M8 10v7M8 7.5h.01M12.5 17v-4a2.5 2.5 0 0 1 5 0v4M12.5 17v-4.2" />
    </Svg>
  );
}
