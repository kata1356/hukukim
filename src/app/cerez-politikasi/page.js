import YasalSayfaShell from "@/components/YasalSayfaShell";

export const metadata = {
  title: "Çerez Politikası",
  description: "Hukukim'de kullanılan çerezler ve benzeri teknolojiler hakkında bilgilendirme.",
};

export default function CerezPolitikasi() {
  return (
    <YasalSayfaShell baslik="Çerez Politikası" guncellemeTarihi="18 Kasım 2026">
      <p>
        Bu politika, Hukukim web sitesinde çerezlerin ve benzeri tarayıcı
        depolama teknolojilerinin neden ve nasıl kullanıldığını açıklar.
        Çerezler, ziyaret ettiğin sitenin tarayıcına kaydettiği küçük metin
        dosyalarıdır.
      </p>

      <h2>1. Kullandığımız Çerezler</h2>
      <p>
        Hukukim yalnızca hizmetin çalışması için zorunlu olan çerezleri ve
        tarayıcı depolamasını kullanır. Pazarlama veya reklam amaçlı çerez
        kullanmayız.
      </p>
      <ul>
        <li>
          <strong>Oturum bilgisi (zorunlu):</strong> Giriş yaptığında hesabını
          tanımak ve oturumunu açık tutmak için kimlik doğrulama altyapımızın
          (Supabase) tarayıcıda sakladığı bilgidir. Çıkış yaptığında silinir.
        </li>
        <li>
          <strong>Tercih bilgisi (zorunlu):</strong> Bu bilgilendirmeyi
          kapattığını hatırlamak için tarayıcıda saklanan basit bir ayardır.
        </li>
        <li>
          <strong>Ödeme sayfası (üçüncü taraf):</strong> Kart ödemesi sırasında
          iyzico, ödemenin güvenliği ve doğrulaması için kendi çerezlerini
          kullanabilir. Bu çerezler iyzico tarafından yönetilir; kart
          bilgilerin Hukukim tarafından saklanmaz.
        </li>
        <li>
          <strong>Ziyaret istatistikleri:</strong> Sitenin performansını
          anlamak için Vercel Analytics kullanılır. Bu hizmet çerez
          kullanmadan, ziyaretçiyi kişisel olarak tanımlamayan toplu veriler
          üretir.
        </li>
      </ul>

      <h2>2. Çerezleri Nasıl Yönetebilirsin?</h2>
      <p>
        Tarayıcı ayarlarından çerezleri silebilir veya engelleyebilirsin.
        Zorunlu çerezleri engellersen giriş yapmak gibi bazı özellikler
        çalışmayabilir.
      </p>

      <h2>3. Değişiklikler</h2>
      <p>
        Yeni bir çerez veya izleme teknolojisi kullanmaya başlarsak bu
        politikayı günceller, gerekli olduğunda onayını alırız.
      </p>

      <h2>4. İletişim</h2>
      <p>
        Çerezlerle ilgili sorular için İletişim sayfamızdan bize ulaşabilirsin.
        Kişisel verilerin işlenmesi hakkında ayrıntılı bilgiyi Gizlilik
        Politikamızda ve KVKK Aydınlatma Metnimizde bulabilirsin.
      </p>
    </YasalSayfaShell>
  );
}
