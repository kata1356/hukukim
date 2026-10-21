"use client";

import { useState } from "react";
import {
  GORUSME_PAKETLERI,
  OZEL_DAKIKA_EN_AZ,
  OZEL_DAKIKA_EN_FAZLA,
  paketHesapla,
} from "@/lib/odemeYardimci";

const KUTU = "flex flex-col items-center gap-1 rounded-lg border p-3 transition";

function kutuRengi(secili) {
  return secili ? "border-turkuaz bg-turkuaz/10" : "border-white/15 bg-white/5 hover:border-white/30";
}

export default function PaketSecici({ dakika, onDegis, ucretsiz }) {
  const [ozelAcik, setOzelAcik] = useState(false);
  const [ozelMetin, setOzelMetin] = useState("");

  const ozelPaket = ozelAcik ? paketHesapla(ozelMetin) : null;

  function ozelDegisti(metin) {
    const temiz = metin.replace(/\D/g, "").slice(0, 2);
    setOzelMetin(temiz);
    onDegis(Number(temiz) || 0);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-white">Görüşme Süresi</span>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {GORUSME_PAKETLERI.map((paket) => (
          <button
            key={paket.dakika}
            type="button"
            onClick={() => {
              setOzelAcik(false);
              onDegis(paket.dakika);
            }}
            className={`${KUTU} ${kutuRengi(!ozelAcik && dakika === paket.dakika)}`}
          >
            <span className="text-sm font-bold text-white">{paket.dakika} dk</span>
            <span className="text-xs text-white/60">{ucretsiz ? "Ücretsiz" : `${paket.tutar} TL`}</span>
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            setOzelAcik(true);
            onDegis(Number(ozelMetin) || 0);
          }}
          className={`${KUTU} ${kutuRengi(ozelAcik)}`}
        >
          <span className="text-sm font-bold text-white">Kendin seç</span>
          <span className="text-xs text-white/60">Dakika gir</span>
        </button>
      </div>

      {ozelAcik && (
        <div className="mt-1 flex items-center gap-3 rounded-lg border border-white/15 bg-white/5 px-3 py-2.5">
          <input
            type="text"
            inputMode="numeric"
            value={ozelMetin}
            onChange={(e) => ozelDegisti(e.target.value)}
            placeholder={`${OZEL_DAKIKA_EN_AZ}-${OZEL_DAKIKA_EN_FAZLA}`}
            aria-label="Görüşme süresi (dakika)"
            className="w-20 rounded-md border border-white/20 bg-transparent px-3 py-1.5 text-sm text-white focus:border-turkuaz focus:outline-none"
          />
          <span className="text-sm text-white/70">dakika</span>
          <span className="ml-auto text-sm font-semibold text-turkuaz">
            {ozelPaket
              ? ucretsiz
                ? "Ücretsiz"
                : `${ozelPaket.tutar} TL`
              : `${OZEL_DAKIKA_EN_AZ}-${OZEL_DAKIKA_EN_FAZLA} dk arası`}
          </span>
        </div>
      )}
    </div>
  );
}
