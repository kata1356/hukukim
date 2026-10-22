"use client";

import TelefonDogrulama from "./TelefonDogrulama";

// Telefon numarasını SMS koduyla doğrulamamış avukatın panel kullanımını engeller.
export default function TelefonKapisi({ baslangicTelefon }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-gece-yuzey p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-white">Telefonunu Doğrula</h2>
        <div className="mt-3">
          <TelefonDogrulama baslangicTelefon={baslangicTelefon ?? ""} onTamam={() => window.location.reload()} />
        </div>
      </div>
    </div>
  );
}
