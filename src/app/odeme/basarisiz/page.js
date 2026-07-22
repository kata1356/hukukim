"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { IconRed } from "@/components/icons";

function IcerikBileseni() {
  const searchParams = useSearchParams();
  const oid = searchParams.get("oid");

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-400 ring-1 ring-red-500/20">
        <IconRed className="h-7 w-7" />
      </span>
      <h1 className="text-2xl font-bold text-white">Ödeme Başarısız</h1>
      <p className="max-w-sm text-sm text-white/60">
        Ödeme tamamlanamadı. İşlem numarası: <span className="text-white/80">{oid}</span>
      </p>
      <Link href="/odeme/test" className="mt-2 rounded-full bg-turkuaz px-5 py-2.5 text-sm font-bold text-gece">
        Tekrar Dene
      </Link>
    </div>
  );
}

export default function OdemeBasarisiz() {
  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-gece px-6">
      <Suspense fallback={null}>
        <IcerikBileseni />
      </Suspense>
    </div>
  );
}
