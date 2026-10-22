import { SITE_URL } from "@/lib/site";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin", "/avukat/panel", "/avukat/talepler", "/avukat/takvim", "/avukat/profil", "/avukat/bakiye", "/avukat/ayarlar","/muvekkil/panel", "/muvekkil/gorusmelerim", "/muvekkil/bakiye", "/muvekkil/ayarlar", "/muvekkil/yardim","/sifre-sifirla"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
