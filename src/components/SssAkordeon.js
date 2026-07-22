"use client";

import { useState } from "react";
import { IconAsagiOk } from "./icons";

export default function SssAkordeon({ liste }) {
  const [acikIndex, setAcikIndex] = useState(null);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-3">
      {liste.map((ogeler, i) => {
        const acik = acikIndex === i;
        return (
          <div key={ogeler.soru} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
            <button
              onClick={() => setAcikIndex(acik ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="text-sm font-semibold text-white">{ogeler.soru}</span>
              <IconAsagiOk className={`h-4 w-4 shrink-0 text-white/50 transition-transform ${acik ? "rotate-180" : ""}`} />
            </button>
            {acik && <p className="px-5 pb-4 text-sm leading-relaxed text-white/60">{ogeler.cevap}</p>}
          </div>
        );
      })}
    </div>
  );
}
