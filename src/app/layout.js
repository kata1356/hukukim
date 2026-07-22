import { Sora, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700"],
});

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin", "latin-ext"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin", "latin-ext"],
  weight: ["500"],
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Hukukim | Avukat ve Müvekkil Buluşma Platformu",
    template: "%s | Hukukim",
  },
  description:
    "Hukukim, Türkiye'de avukatları müvekkillerle buluşturan güvenilir platform.",
  openGraph: {
    title: "Hukukim | Avukat ve Müvekkil Buluşma Platformu",
    description:
      "Hukukim, Türkiye'de avukatları müvekkillerle buluşturan güvenilir platform.",
    url: SITE_URL,
    siteName: "Hukukim",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hukukim | Avukat ve Müvekkil Buluşma Platformu",
    description:
      "Hukukim, Türkiye'de avukatları müvekkillerle buluşturan güvenilir platform.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="tr"
      className={`${sora.variable} ${hankenGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
