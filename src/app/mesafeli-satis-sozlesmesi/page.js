import YasalSayfaShell from "@/components/YasalSayfaShell";
import { SATICI_BILGILERI } from "@/lib/saticiBilgileri";

export const metadata = { title: "Mesafeli Satış Sözleşmesi" };

export default function MesafeliSatisSozlesmesi() {
  return (
    <YasalSayfaShell baslik="Mesafeli Satış Sözleşmesi" guncellemeTarihi="21 Temmuz 2026">
      <p>
        Bu sözleşme, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve
        Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince, Hukukim
        (&quot;Platform&quot;) üzerinden elektronik ortamda satın alınan
        avukat görüşmesi/randevu hizmetlerine ilişkin tarafların hak ve
        yükümlülüklerini düzenler.

      </p>

      <h2>1. Taraflar</h2>
      <p>
        <strong>Satıcı:</strong> {SATICI_BILGILERI.adSoyad} ({SATICI_BILGILERI.markaAdi})
        <br />
        İşletme Türü: {SATICI_BILGILERI.isletmeTuru}
        <br />
        Vergi Dairesi / No: {SATICI_BILGILERI.vergiDairesi} / {SATICI_BILGILERI.vergiNo}
        <br />
        Adres: {SATICI_BILGILERI.adres}
        <br />
        Telefon: {SATICI_BILGILERI.telefon}
        <br />
        E-posta: {SATICI_BILGILERI.eposta}
      </p>
      <p>
        <strong>Alıcı:</strong> Platform üzerinden randevu/ödeme işlemini
        gerçekleştiren, kayıt sırasında bilgilerini paylaşan müvekkil.
      </p>

      <h2>2. Sözleşmenin Konusu</h2>
      <p>
        İşbu sözleşmenin konusu, Alıcı&apos;nın Platform üzerinden elektronik
        ortamda sipariş verdiği, bir avukatla gerçekleştirilecek görüntülü,
        yüz yüze ya da yazılı danışmanlık görüşmesi hizmetinin satışı ve
        ifasına ilişkin olarak tarafların hak ve yükümlülüklerinin
        belirlenmesidir. Hukukim bir hukuk bürosu değildir; hizmeti bizzat
        avukat verir, Platform avukat ile müvekkili buluşturan ve ödeme
        tahsilatını aracı ödeme kuruluşu üzerinden ileten teknoloji
        sağlayıcısıdır.
      </p>

      <h2>3. Hizmetin Temel Niteliği, Fiyatı ve Ödeme Şekli</h2>
      <p>
        Hizmetin süresi, türü (görüntülü/yüz yüze/mesaj) ve bedeli, randevu
        oluşturulmadan önce Alıcı&apos;ya Platform üzerinden açıkça gösterilir
        ve ödeme Alıcı&apos;nın onayı ile tahsil edilir. Ödemeler, anlaşmalı
        ödeme kuruluşu (iyzico/PayTR) altyapısı üzerinden, kredi/banka kartı
        ile alınır. Kart bilgileri Hukukim sunucularında saklanmaz.
      </p>

      <h2>4. İfa Şekli</h2>
      <p>
        Hizmet, randevu tarih ve saatinde, seçilen görüşme şekline göre
        (görüntülü arama, yüz yüze buluşma bilgisi ya da mesajlaşma) ifa
        edilir. Hizmet fiziksel bir ürün olmadığından kargo/teslimat söz
        konusu değildir.
      </p>

      <h2>5. Cayma Hakkı</h2>
      <p>
        Alıcı, hizmetin ifasına (görüşmenin fiilen başlamasına) kadar, herhangi
        bir gerekçe göstermeksizin ve cezai şart ödemeksizin sözleşmeden
        cayma hakkına sahiptir. Cayma hakkının kullanım şartları ve süreleri{" "}
        <a href="/iptal-iade-kosullari">İptal ve İade Koşulları</a> sayfasında
        detaylandırılmıştır.
      </p>

      <h2>6. Cayma Hakkının Kullanılamayacağı Haller</h2>
      <p>
        Mesafeli Sözleşmeler Yönetmeliği&apos;nin 15. maddesi uyarınca,
        Alıcı&apos;nın onayı ile hizmetin ifasına başlanmış olması halinde
        (görüşme fiilen başladıysa) cayma hakkı kullanılamaz.
      </p>

      <h2>7. Uyuşmazlıkların Çözümü</h2>
      <p>
        İşbu sözleşmeden doğan uyuşmazlıklarda, Ticaret Bakanlığı&apos;nca
        her yıl belirlenen parasal sınırlar dahilinde Alıcı&apos;nın
        yerleşim yerindeki Tüketici Hakem Heyetleri, bu sınırları aşan
        uyuşmazlıklarda ise Tüketici Mahkemeleri yetkilidir.
      </p>

      <h2>8. Yürürlük</h2>
      <p>
        Alıcı, Platform üzerinden ödeme adımını onayladığında işbu
        sözleşmenin tüm koşullarını kabul etmiş sayılır.
      </p>
    </YasalSayfaShell>
  );
}
