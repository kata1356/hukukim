import YasalSayfaShell from "@/components/YasalSayfaShell";

export const metadata = { title: "Kullanım Şartları", description: "Hukukim platformunun kullanım koşulları." };

export default function KullanimSartlari() {
  return (
    <YasalSayfaShell baslik="Kullanım Şartları" guncellemeTarihi="16 Temmuz 2026">
      <p>
        Hukukim&apos;i kullanarak aşağıdaki şartları kabul etmiş olursun.
      </p>

      <h2>1. Platformun Niteliği</h2>
      <p>
        Hukukim bir hukuk bürosu değildir ve doğrudan hukuki danışmanlık
        sunmaz. Platform, hukuki desteğe ihtiyaç duyan kullanıcılar ile
        bağımsız avukatlar arasında iletişim kurulmasını sağlayan bir
        aracı teknoloji platformudur.

      </p>

      <h2>2. Hesap Sorumluluğu</h2>
      <p>
        Kayıt sırasında verdiğin bilgilerin doğru olduğunu beyan edersin.
        Avukat hesapları için baro sicil numarasının doğruluğu senin
        sorumluluğundadır; yanlış beyan hesabının kapatılmasına yol açabilir.
      </p>

      <h2>3. Randevu Talepleri</h2>
      <p>
        Platform üzerinden gönderilen randevu talepleri bir sözleşme teklifi
        niteliğinde değildir. Avukat ile müvekkil arasındaki nihai
        vekalet/hizmet ilişkisi, taraflar arasında ayrıca kurulur.
      </p>

      <h2>4. Ücretlendirme</h2>
      <p>
        Ücretli görüşmelerin bedeli, randevu oluşturulmadan önce Türk Lirası
        (TL) cinsinden ve vergiler dahil olarak gösterilir. Ödemeler iyzico
        altyapısı üzerinden kredi/banka kartı ile alınır; onayın olmadan hiçbir
        ücret tahsil edilmez. Ödeme, iptal ve iade süreçleri için{" "}
        <a href="/mesafeli-satis-sozlesmesi">Mesafeli Satış Sözleşmesi</a> ve{" "}
        <a href="/iptal-iade-kosullari">İptal ve İade Koşulları</a> geçerlidir.
      </p>

      <h2>5. Sorumluluğun Sınırlandırılması</h2>
      <p>
        Hukukim, avukatlar tarafından verilen hukuki hizmetin içeriğinden,
        kalitesinden veya sonucundan sorumlu değildir.
      </p>

      <h2>6. Değişiklikler</h2>
      <p>
        Bu şartlar zaman zaman güncellenebilir. Güncel sürüm her zaman bu
        sayfada yayınlanır.
      </p>
    </YasalSayfaShell>
  );
}
