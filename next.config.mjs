/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // www.hukukim.com tek adrese toplanır (Google girişi ve SEO için).
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.hukukim.com" }],
        destination: "https://hukukim.com/:path*",
        permanent: true,
      },
      // PayTR dönüş adresi hukukim.vercel.app ise (bkz. src/lib/site.js), kullanıcı ödeme sonrası
      // oturumunun bulunduğu hukukim.com'a aktarılır. Sorgu parametreleri korunur.
      {
        source: "/odeme/:path*",
        has: [{ type: "host", value: "hukukim.vercel.app" }],
        destination: "https://hukukim.com/odeme/:path*",
        permanent: false,
      },
      {
        source: "/muvekkil/panel",
        has: [{ type: "host", value: "hukukim.vercel.app" }],
        destination: "https://hukukim.com/muvekkil/panel",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
