import YasalSayfaShell from "@/components/YasalSayfaShell";

export const metadata = { title: "İptal ve İade Koşulları" };

export default function IptalIadeKosullari() {
  return (
    <YasalSayfaShell baslik="İptal ve İade Koşulları" guncellemeTarihi="21 Temmuz 2026">
      <p>
        Bu sayfa, Hukukim üzerinden ücretli bir avukat görüşmesi/randevusu için
        yapılan ödemelerin iptal ve iade koşullarını açıklar.
      </p>

      <h2>1. Görüşme Öncesi İptal</h2>
      <p>
        Randevu saatinden en az 2 (iki) saat önce iptal edilen görüşmelerde
        ödenen ücret, ödeme yapılan yönteme tam olarak iade edilir.
      </p>

      <h2>2. Son Dakika İptali</h2>
      <p>
        Randevu saatine 2 saatten az kala yapılan iptallerde, avukatın o
        saatte başka bir randevu alamamış olması nedeniyle ücret iade
        edilmez.
      </p>

      <h2>3. Görüşme Başladıktan Sonra</h2>
      <p>
        6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli
        Sözleşmeler Yönetmeliği uyarınca, hizmetin ifasına (görüşmenin
        başlamasına) müvekkilin onayıyla başlanmış olması halinde cayma hakkı
        kullanılamaz ve ödenen ücret iade edilmez.
      </p>

      <h2>4. Avukat Kaynaklı İptal / Gelmeme</h2>
      <p>
        Avukatın randevuyu iptal etmesi ya da randevuya katılmaması
        durumunda, müvekkile ödediği ücretin tamamı iade edilir.
      </p>

      <h2>5. Teknik Sorunlar</h2>
      <p>
        Görüşmenin platform kaynaklı teknik bir arıza nedeniyle
        gerçekleştirilememesi halinde, görüşme ücretsiz olarak yeniden
        planlanır ya da talep edilirse ücret iade edilir.
      </p>

      <h2>6. İade Süreci</h2>
      <p>
        Onaylanan iadeler, ödemenin yapıldığı kart/hesaba genellikle 3-10 iş
        günü içinde yansır; bu süre bankanıza bağlı olarak değişebilir.
      </p>

      <h2>7. İade Talebi Nasıl Yapılır?</h2>
      <p>
        İade talebini randevu bilgilerinle birlikte{" "}
        <a href="/iletisim">iletişim</a> sayfasındaki e-posta adresine
        göndererek iletebilirsin.
      </p>
    </YasalSayfaShell>
  );
}
