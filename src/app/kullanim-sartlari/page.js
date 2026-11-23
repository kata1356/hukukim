import YasalSayfaShell from "@/components/YasalSayfaShell";

export const metadata = { title: "Kullanım Şartları", description: "Hukukim platformunun kullanım koşulları." };

export default function KullanimSartlari() {
  return (
    <YasalSayfaShell baslik="Kullanım Şartları" guncellemeTarihi="23 Kasım 2026">
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

      <h2>5. Görüşmeler ve Gizlilik</h2>
      <p>
        Görüşmelerin görüntü ve sesi Hukukim tarafından kaydedilmez; yalnızca
        görüşmeye katılım bilgisi (giriş zamanı, süre) tutulur. Taraflar,
        görüşmeyi karşı tarafın açık izni olmadan kaydedemez, kopyalayamaz
        veya üçüncü kişilerle paylaşamaz. Avukat ile müvekkil arasındaki
        görüşme içeriği, avukatlık mesleğinin gizlilik kurallarına tabidir.
      </p>

      <h2>6. Platform Dışı İletişim ve Yasaklı Kullanım</h2>
      <p>
        Platform üzerinden tanıştığın avukat veya müvekkille, ücretli
        görüşmeyi Platform dışına taşımak, ödemeyi Platform dışında almak veya
        yapmak, sahte bilgi vermek, hukuka aykırı amaçlarla ya da başkalarını
        rahatsız etmek için kullanmak yasaktır. İhlal halinde hesap
        askıya alınabilir veya kapatılabilir.
      </p>

      <h2>7. Şikayet</h2>
      <p>
        Görüşmeyle ilgili bir sorun yaşarsan (görüşmeye gelinmemesi, uygunsuz
        davranış, hizmetin amacına uygun verilmemesi, teknik sorun vb.)
        panelindeki görüşme kaydından &quot;Şikayet Et&quot; ile bildirim
        yapabilirsin. Şikayetler yönetim ekibimizce incelenir; gerekirse
        ödeme iade edilir veya hesaplara işlem uygulanır.
      </p>

      <h2>8. Sorumluluğun Sınırlandırılması</h2>
      <p>
        Hukukim, avukatlar tarafından verilen hukuki hizmetin içeriğinden,
        kalitesinden veya sonucundan sorumlu değildir.
      </p>

      <h2>9. Değişiklikler</h2>
      <p>
        Bu şartlar zaman zaman güncellenebilir. Güncel sürüm her zaman bu
        sayfada yayınlanır.
      </p>
    </YasalSayfaShell>
  );
}
