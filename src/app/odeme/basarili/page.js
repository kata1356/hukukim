"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { IconOnay } from "@/components/icons";

function IcerikBileseni() {
  const searchParams = useSearchParams();
  const oid = searchParams.get("oid");

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 text-green-400 ring-1 ring-green-500/20">
        <IconOnay className="h-7 w-7" />
      </span>
      <h1 className="text-2xl font-bold text-white">Ödeme Başarılı</h1>
      <p className="max-w-sm text-sm text-white/60">
        Ödemeniz alındı. İşlem numarası: <span className="text-white/80">{oid}</span>
      </p>
      <Link href="/" className="mt-2 rounded-full bg-turkuaz px-5 py-2.5 text-sm font-bold text-gece">
        Ana Sayfaya Dön
      </Link>
    </div>
  );
}

export default function OdemeBasarili() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-gece px-6">
      <Suspense fallback={null}>
        <IcerikBileseni />
      </Suspense>
    </div>
  );
}
