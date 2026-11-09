import YasalSayfaShell from "@/components/YasalSayfaShell";
import { SATICI_BILGILERI } from "@/lib/saticiBilgileri";

export const metadata = {
  title: "Hakkımızda",
  description:
    "Hukukim, müvekkilleri doğrulanmış avukatlarla online ve acil hukuki görüşme için buluşturan bir platformdur.",
};

export default function Hakkimizda() {
  return (
    <YasalSayfaShell baslik="Hakkımızda" guncellemeTarihi="9 Kasım 2026">
      <p>
        Hukukim, hukuki desteğe ihtiyaç duyan kişileri kimliği ve ruhsatı
        doğrulanmış avukatlarla hızlı, şeffaf ve güvenli biçimde buluşturan bir
        online platformdur.
      </p>

      <h2>Ne Yapıyoruz?</h2>
      <ul>
        <li>Müvekkiller hukuki sorunlarını platforma iletir.</li>
        <li>
          Alanında uzman avukatlar talebi inceler ve görüntülü ya da yazılı
          görüşme için randevu oluşturur.
        </li>
        <li>
          &quot;Acil Avukat&quot; özelliğiyle ivedi durumlarda hızlıca bir
          avukata ulaşılabilir.
        </li>
        <li>
          Ücretler görüşme öncesinde net olarak gösterilir; ödeme güvenli ödeme
          altyapısı (iyzico) üzerinden alınır.
        </li>
      </ul>

      <h2>Değerlerimiz</h2>
      <ul>
        <li>Güven: Avukatlar yayına alınmadan önce doğrulanır.</li>
        <li>Gizlilik: Kişisel veriler KVKK kapsamında korunur.</li>
        <li>Şeffaflık: Fiyat, iptal ve iade koşulları açıkça belirtilir.</li>
      </ul>

      <h2>İşletme Bilgileri</h2>
      <ul>
        <li>Marka adı: {SATICI_BILGILERI.markaAdi}</li>
        <li>İşletme türü: {SATICI_BILGILERI.isletmeTuru}</li>
        <li>Telefon: {SATICI_BILGILERI.telefon}</li>
        <li>E-posta: {SATICI_BILGILERI.eposta}</li>
        <li>Adres: {SATICI_BILGILERI.adres}</li>
      </ul>

      <p>
        Hukukim bir hukuk bürosu değildir; bağımsız avukatlarla müvekkilleri
        buluşturan bir aracı platformdur. Detaylar için{" "}
        <a href="/kullanim-sartlari">Kullanım Şartları</a> ve{" "}
        <a href="/iletisim">İletişim</a> sayfalarına bakabilirsin.
      </p>
    </YasalSayfaShell>
  );
}
