import YasalSayfaShell from "@/components/YasalSayfaShell";
import { SATICI_BILGILERI } from "@/lib/saticiBilgileri";

export const metadata = { title: "İletişim" };

export default function Iletisim() {
  return (
    <YasalSayfaShell baslik="İletişim" guncellemeTarihi="21 Temmuz 2026">
      <p>
        Hukukim ile ilgili sorularınız, talepleriniz ya da destek ihtiyaçlarınız
        için aşağıdaki kanallardan bize ulaşabilirsiniz.
      </p>

      <h2>İşletme Bilgileri</h2>
      <ul>
        <li>İşletme türü: {SATICI_BILGILERI.isletmeTuru}</li>
        <li>Yetkili: {SATICI_BILGILERI.adSoyad}</li>
        <li>Marka adı: {SATICI_BILGILERI.markaAdi}</li>
        <li>Vergi dairesi: {SATICI_BILGILERI.vergiDairesi}</li>
        <li>Vergi/TC kimlik no: {SATICI_BILGILERI.vergiNo}</li>
      </ul>

      <h2>İletişim Bilgileri</h2>
      <ul>
        <li>Telefon: {SATICI_BILGILERI.telefon}</li>
        <li>E-posta: {SATICI_BILGILERI.eposta}</li>
        <li>Adres: {SATICI_BILGILERI.adres}</li>
      </ul>

      <h2>Destek Süreleri</h2>
      <p>
        E-posta taleplerine genellikle 1-2 iş günü içinde dönüş yapılır. Acil
        hukuki destek ihtiyacı için sitedeki &quot;Acil Avukat&quot; özelliğini
        kullanabilirsin.
      </p>
    </YasalSayfaShell>
  );
}
