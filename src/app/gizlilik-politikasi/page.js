import Link from "next/link";
import YasalSayfaShell from "@/components/YasalSayfaShell";

export const metadata = { title: "Gizlilik Politikası", description: "Hukukim'in kişisel verileri nasıl işlediği ve koruduğu." };

export default function GizlilikPolitikasi() {
  return (
    <YasalSayfaShell baslik="Gizlilik Politikası" guncellemeTarihi="23 Kasım 2026">
      <p>
        Bu gizlilik politikası, Hukukim platformunu kullanırken bilgilerinin
        nasıl toplandığını, kullanıldığını ve korunduğunu açıklar.
      </p>

      <h2>1. Topladığımız Bilgiler</h2>
      <p>
        Kayıt sırasında verdiğin ad soyad, e-posta, telefon, şehir bilgileri
        ile avukat hesapları için baro sicil numarası ve uzmanlık alanları
        toplanır. Ayrıca gönderdiğin veya aldığın randevu talepleri sistemde
        saklanır.
      </p>

      <p>
        Görüntülü görüşme için tarayıcın kamera ve mikrofon izni ister; bu
        izinler yalnızca avukatınla yaptığın görüşme sırasında kullanılır.
        Görüşmelerin görüntü ve sesi Hukukim tarafından kaydedilmez. Yalnızca
        görüşmenin gerçekleştiğini gösteren katılım bilgisi (görüşme numarası,
        giriş zamanı, süre ve katılımcının rolü) tutulur. Bu kayıtlar, şikayet
        ve itirazların incelenmesi içindir ve KVKK Aydınlatma Metni&apos;nde
        belirtilen sürelerle saklanır. Görüşmeyi sen de karşı tarafın izni
        olmadan kaydetmemelisin.
      </p>
      <p>
        Mobil uygulamada ayrıca, yalnızca ilgili özelliği kullandığında ve izin
        verdiğinde şu bilgiler işlenir: görüntülü görüşme için kamera ve
        mikrofon erişimi, bildirim gönderebilmek için cihaz bildirim kodu
        (push token), profil fotoğrafı ve yüklediğin belgeler. Hesabına hızlı
        girmen için cihazın Face ID / parmak izi özelliği yalnızca cihaz
        üzerinde kullanılır; biyometrik veri Hukukim&apos;e iletilmez.
      </p>
      <p>
        Ayrıca profil fotoğrafın, avukatlar için kimlik ve baro kartı
        görüntüsü, hakediş için IBAN ve güvenlik amacıyla IP adresi ile oturum
        kayıtları işlenir.
      </p>

      <h2>2. Bilgilerin Kullanımı</h2>
      <p>
        Bilgilerin yalnızca hesabını yönetmek, avukat-müvekkil eşleşmesi
        sağlamak ve platformun düzgün çalışmasını sağlamak amacıyla
        kullanılır. Pazarlama amacıyla üçüncü taraflarla paylaşılmaz.
      </p>

      <h2>Hizmet Sağlayıcılar</h2>
      <p>
        Hizmetin sunulabilmesi için sınırlı ölçüde şu hizmet sağlayıcılardan
        yararlanırız: veri altyapısı ve kimlik doğrulama için Supabase, kart
        ödemeleri için iyzico (kart bilgilerin Hukukim tarafından saklanmaz),
        görüntülü görüşme için Daily.co, SMS doğrulama kodları için Netgsm,
        mobil bildirimler için Expo, barındırma için Vercel. Bu sağlayıcılar verileri yalnızca hizmeti sunmak amacıyla işler.
      </p>

      <h2>3. Veri Güvenliği</h2>
      <p>
        Verilerin, yetkisiz erişime karşı korunmak üzere şifreli bağlantılar
        ve erişim kısıtlamaları (satır bazlı güvenlik kuralları) ile
        saklanır. Randevu taleplerine yalnızca ilgili avukat ve müvekkil
        erişebilir.
      </p>

      <h2>4. Çerezler</h2>
      <p>
        Platform, oturumunu açık tutmak için teknik olarak zorunlu çerezler
        kullanır. Detaylar için <Link href="/cerez-politikasi">Çerez Politikamıza</Link> bakabilirsin.
      </p>

      <h2>5. Haklarınız</h2>
      <p>
        Kişisel verilerinle ilgili haklarını KVKK Aydınlatma Metni&apos;nde
        bulabilirsin.
      </p>

      <h2>Hesabın ve Verilerin Silinmesi</h2>
      <p>
        Hesabını istediğin zaman kalıcı olarak silebilirsin. Ayarlar
        sayfasındaki &quot;Hesabımı kalıcı olarak sil&quot; seçeneğini kullan;
        mobil uygulamada aynı seçenek Profil sayfasının (avukatlar için Avukat
        Paneli&apos;nin) en altında bulunur. Silme işlemiyle profilin ve
        kişisel verilerin sistemden kaldırılır. Devam eden bir talebin ya da
        avukatlar için ödenmemiş bir kazancın varsa, bunlar tamamlanana kadar
        silme yapılamaz. Yardım için: destek@hukukim.com
      </p>

      <h2>6. Değişiklikler</h2>
      <p>
        Bu politika zaman zaman güncellenebilir. Güncel sürüm her zaman bu
        sayfada yayınlanır.
      </p>
    </YasalSayfaShell>
  );
}
