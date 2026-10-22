import { IconEv, IconArama, IconCuzdan, IconAyarlar } from "@/components/icons";

// Masaüstü sol menüsü ve mobil alt menü aynı öğeleri kullanır.
export const MUVEKKIL_SEKMELER = [
  { etiket: "Ana Sayfa", href: "/muvekkil/panel", Icon: IconEv },
  { etiket: "Avukatlar", href: "/avukatlar", Icon: IconArama },
  { etiket: "Ödemeler", href: "/muvekkil/bakiye", Icon: IconCuzdan },
  { etiket: "Ayarlar", href: "/muvekkil/ayarlar", Icon: IconAyarlar },
];
