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

export function IconOk(props) {
  return (
    <Svg {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Svg>
  );
}
