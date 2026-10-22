import {
  IconEv,
  IconArama,
  IconCuzdan,
  IconAyarlar,
  IconListe,
  IconMesaj,
} from "@/components/icons";

// Masaüstü sol menüsü (tümü).
export const MUVEKKIL_MENU = [
  { etiket: "Genel Bakış", href: "/muvekkil/panel", Icon: IconEv },
  { etiket: "Görüşmelerim", href: "/muvekkil/gorusmelerim", Icon: IconListe },
  { etiket: "Avukat Bul", href: "/avukatlar", Icon: IconArama },
  { etiket: "Ödemelerim", href: "/muvekkil/bakiye", Icon: IconCuzdan },
  { etiket: "Yardım", href: "/muvekkil/yardim", Icon: IconMesaj },
  { etiket: "Ayarlar", href: "/muvekkil/ayarlar", Icon: IconAyarlar },
];

// Mobil alt menü (en çok kullanılan 5 sayfa).
export const MUVEKKIL_SEKMELER = [
  { etiket: "Ana Sayfa", href: "/muvekkil/panel", Icon: IconEv },
  { etiket: "Görüşmeler", href: "/muvekkil/gorusmelerim", Icon: IconListe },
  { etiket: "Avukatlar", href: "/avukatlar", Icon: IconArama },
  { etiket: "Ödemeler", href: "/muvekkil/bakiye", Icon: IconCuzdan },
  { etiket: "Ayarlar", href: "/muvekkil/ayarlar", Icon: IconAyarlar },
];
