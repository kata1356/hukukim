import { IconVideo, IconYuzYuze, IconMesaj } from "./icons";
import { gorusmeSekliEtiket } from "@/lib/gorusmeSekli";

const IKONLAR = {
  goruntulu: IconVideo,
  yuz_yuze: IconYuzYuze,
  mesaj: IconMesaj,
};

export default function GorusmeSekliEtiketi({ deger }) {
  const Icon = IKONLAR[deger] ?? IconMesaj;
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon className="h-4 w-4 text-white/40" />
      {gorusmeSekliEtiket(deger)}
    </span>
  );
}
