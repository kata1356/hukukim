"use client";

// iyzico ödeme formunu (sunucudan gelen script/HTML parçası) kendi çerçevesi içinde gösterir.
// Çerçeve sayesinde ödeme sonrası yönlendirme yalnızca bu çerçeveyi etkiler; sayfa (ör. görüşme
// ekranı) yerinde kalır.
export default function IyzicoOdemeFormu({ icerik, baslik = "Ödeme", className, style }) {
  const belge = `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>html,body{margin:0;padding:0;background:#fff}</style></head><body><div id="iyzipay-checkout-form" class="responsive"></div>${icerik}</body></html>`;

  return <iframe srcDoc={belge} title={baslik} className={className} style={{ border: "none", ...style }} />;
}
