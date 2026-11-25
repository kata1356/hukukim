import Link from "next/link";
import YasalSayfaShell from "@/components/YasalSayfaShell";
import { HUKUK_ALANLARI_KATEGORILERI } from "@/lib/hukukAlanlariKategorileri";
import { SATICI_BILGILERI } from "@/lib/saticiBilgileri";

export const metadata = {
  title: "Hukuk Alanları ve Hizmetler",
  description:
    "Hukukim avukat ekibi hukuk alanlarına ve alt kategorilere göre online görüşme hizmeti sunar. Kategoriler, alt kategoriler ve işleyiş.",
};

export default function HukukAlanlari() {
  return (
    <YasalSayfaShell baslik="Hukuk Alanları ve Hizmetler" guncellemeTarihi="25 Kasım 2026">
      <p>
        Hukukim, hukuki görüşme hizmetini baro kayıtlı avukat ekibiyle sunar. Hizmetler aşağıdaki
        kategori ve alt kategorilere göre listelenir. Her hizmet tek seferlik bir görüşme hizmetidir.
      </p>

      <h2>Hizmet Nasıl İşler?</h2>
      <ul>
        <li>
          <strong>Avukat ekibimiz:</strong> Ekibimizdeki avukatların baro sicili ve kimliği
          Hukukim tarafından doğrulanır.
        </li>
        <li>
          <strong>Talep:</strong> Müvekkil hukuk alanını ve alt kategoriyi seçer, konusunu yazar ve
          görüşme süresini belirler.
        </li>
        <li>
          <strong>Ödeme:</strong> Ödeme Hukukim&apos;e iyzico altyapısıyla alınır. Ücret görüşme
          öncesinde net olarak gösterilir.
        </li>
        <li>
          <strong>Görüşme:</strong> Talep, alanında uzman bir avukatımız tarafından üstlenilir ve
          görüşme görüntülü ya da yazılı olarak yapılır.
        </li>
      </ul>

      <h2>Kategoriler ve Alt Kategoriler</h2>
      {HUKUK_ALANLARI_KATEGORILERI.map((kategori) => (
        <div key={kategori.ad}>
          <h3 className="mt-6 text-base font-bold text-white">{kategori.ad}</h3>
          <p>{kategori.aciklama}</p>
          <ul>
            {(kategori.altKategoriler || []).map((alt) => (
              <li key={alt}>{alt}</li>
            ))}
          </ul>
        </div>
      ))}

      <h2>Hizmet Ücretleri</h2>
      <p>
        Görüşme ücreti süreye göre belirlenir ve ödeme öncesinde açıkça gösterilir: 5 dakika 149 TL,
        15 dakika 399 TL, 20 dakika 499 TL ya da 5-60 dakika arası dilediğiniz süre için dakikası
        40 TL. Yeni üyelere ilk 5 dakika deneme görüşmesi ücretsizdir. Her ödeme tek seferliktir.
      </p>

      <h2>Avukatlar İçin</h2>
      <p>
        Avukatlar <Link href="/avukat/kayit">ekibimize başvurabilir</Link>. Koşullar için{" "}
        <Link href="/avukat-sozlesmesi">Avukat Hizmet Sözleşmesi</Link>&apos;ni inceleyebilirsiniz.
      </p>

      <h2>Platform İşletmecisi</h2>
      <ul>
        <li>{SATICI_BILGILERI.markaAdi} · {SATICI_BILGILERI.adSoyad} ({SATICI_BILGILERI.isletmeTuru})</li>
        <li>Vergi Dairesi / No: {SATICI_BILGILERI.vergiDairesi} / {SATICI_BILGILERI.vergiNo}</li>
        <li>{SATICI_BILGILERI.adres}</li>
        <li>{SATICI_BILGILERI.telefon} · {SATICI_BILGILERI.eposta}</li>
      </ul>

      <p>
        <Link href="/avukatlar">Avukatları incele →</Link>
      </p>
    </YasalSayfaShell>
  );
}
