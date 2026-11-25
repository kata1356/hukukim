import { Sora, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import CerezBilgilendirme from "@/components/CerezBilgilendirme";
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
    default: "Hukukim | Online Hukuki Görüşme",
    template: "%s | Hukukim",
  },
  description:
    "Hukukim, Türkiye'de doğrulanmış avukat ekibiyle online hukuki görüşme hizmeti sunar.",
  openGraph: {
    title: "Hukukim | Online Hukuki Görüşme",
    description:
      "Hukukim, Türkiye'de doğrulanmış avukat ekibiyle online hukuki görüşme hizmeti sunar.",
    url: SITE_URL,
    siteName: "Hukukim",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hukukim | Online Hukuki Görüşme",
    description:
      "Hukukim, Türkiye'de doğrulanmış avukat ekibiyle online hukuki görüşme hizmeti sunar.",
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
        <CerezBilgilendirme />
        <Analytics />
      </body>
    </html>
  );
}
