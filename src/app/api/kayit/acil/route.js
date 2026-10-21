import { NextResponse } from "next/server";

// Doğrulamasız "hızlı kayıt" kaldırıldı: tüm hesaplar e-posta doğrulamasıyla (/api/kayit) açılır.
// Bu uç nokta bilerek kapalı tutulur; eski istemcilerin hesap açmasını engeller.
export async function POST() {
  return NextResponse.json(
    { hata: { message: "Hızlı kayıt kapatıldı. Lütfen e-posta doğrulamalı normal kayıt oluştur." } },
    { status: 410 }
  );
}
