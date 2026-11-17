import Link from "next/link";
import YasalSayfaShell from "@/components/YasalSayfaShell";
import { HUKUK_ALANLARI_KATEGORILERI } from "@/lib/hukukAlanlariKategorileri";
import { SATICI_BILGILERI } from "@/lib/saticiBilgileri";

export const metadata = {
  title: "Hukuk Alanları ve Pazar Yeri",
  description:
    "Hukukim pazar yerinde bağımsız avukatlar (satıcılar) hukuk alanlarına ve alt kategorilere göre görüşme hizmeti sunar. Kategoriler, alt kategoriler ve işleyiş.",
};

export default function HukukAlanlari() {
  return (
    <YasalSayfaShell baslik="Hukuk Alanları ve Pazar Yeri İşleyişi" guncellemeTarihi="16 Kasım 2026">
      <p>
        Hukukim, bağımsız avukatların (satıcılar) hukuki görüşme hizmetlerini müvekkillere (alıcılar)
        sunduğu bir pazar yeri platformudur. Hizmetler aşağıdaki kategori ve alt kategorilere göre
        listelenir. Her hizmet, ilgili avukatın verdiği tek seferlik bir görüşme hizmetidir.
      </p>

      <h2>Pazar Yeri Nasıl İşler?</h2>
      <ul>
        <li>
          <strong>Satıcı (Avukat):</strong> Baro sicil numarasıyla başvurur, kimlik ve belgeleri
          platform tarafından doğrulanır, hukuk alanlarını seçer ve hizmet verir.
        </li>
        <li>
          <strong>Alıcı (Müvekkil):</strong> Kategori ve alt kategoriye göre avukat bulur, görüşme
          süresini seçer ve ödemeyi yapar.
        </li>
        <li>
          <strong>Ödeme:</strong> Ödeme iyzico altyapısıyla alınır. Tutar görüşme tamamlanana kadar
          platform güvencesinde tutulur, görüşme tamamlandıktan sonra avukatın hakedişi hesaplanır.
        </li>
        <li>
          <strong>Komisyon:</strong> Tutarın %60&apos;ı hizmeti veren avukata, %40&apos;ı platform
          hizmet bedeline aittir.
        </li>
        <li>
          <strong>Sorumluluk:</strong> Hukuki hizmeti avukat verir. Hukukim hukuki hizmet vermez,
          aracı platform olarak eşleşme, ödeme ve hakediş altyapısını sağlar.
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
        Avukatlar <Link href="/avukat/kayit">satıcı başvurusu</Link> yapabilir. Koşullar için{" "}
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
