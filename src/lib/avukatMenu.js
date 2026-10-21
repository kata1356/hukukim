import {
  IconEv,
  IconCuzdan,
  IconAyarlar,
  IconListe,
  IconTakvim,
  IconKullanici,
} from "@/components/icons";

// Masaüstü sol menüsü (tümü) ve mobil alt menü (en çok kullanılan 5 sayfa).
export const AVUKAT_MENU = [
  { etiket: "Genel Bakış", href: "/avukat/panel", Icon: IconEv },
  { etiket: "Talepler", href: "/avukat/talepler", Icon: IconListe },
  { etiket: "Takvim", href: "/avukat/takvim", Icon: IconTakvim },
  { etiket: "Kazançlar", href: "/avukat/bakiye", Icon: IconCuzdan },
  { etiket: "Profil", href: "/avukat/profil", Icon: IconKullanici },
  { etiket: "Ayarlar", href: "/avukat/ayarlar", Icon: IconAyarlar },
];

export const AVUKAT_SEKMELER = [
  { etiket: "Panel", href: "/avukat/panel", Icon: IconEv },
  { etiket: "Talepler", href: "/avukat/talepler", Icon: IconListe },
  { etiket: "Takvim", href: "/avukat/takvim", Icon: IconTakvim },
  { etiket: "Kazanç", href: "/avukat/bakiye", Icon: IconCuzdan },
  { etiket: "Profil", href: "/avukat/profil", Icon: IconKullanici },
];
