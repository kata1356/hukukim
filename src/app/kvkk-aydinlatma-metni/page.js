import YasalSayfaShell from "@/components/YasalSayfaShell";
import { SATICI_BILGILERI } from "@/lib/saticiBilgileri";

export const metadata = { title: "KVKK Aydınlatma Metni", description: "6698 sayılı KVKK kapsamında kişisel verilerin işlenmesi hakkında aydınlatma." };

export default function KvkkAydinlatmaMetni() {
  return (
    <YasalSayfaShell baslik="KVKK Aydınlatma Metni" guncellemeTarihi="23 Kasım 2026">
      <p>
        Bu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu
        (&quot;KVKK&quot;) uyarınca, Hukukim platformunu (&quot;Platform&quot;)
        kullanan avukat ve müvekkillerin kişisel verilerinin işlenmesine
        ilişkin olarak veri sorumlusu sıfatıyla aydınlatma yükümlülüğümüzü
        yerine getirmek amacıyla hazırlanmıştır.
      </p>

      <h2>1. Veri Sorumlusu</h2>
      <p>
        {SATICI_BILGILERI.adSoyad} ({SATICI_BILGILERI.markaAdi},{" "}
        {SATICI_BILGILERI.isletmeTuru})
        <br />
        Adres: {SATICI_BILGILERI.adres}
        <br />
        E-posta: {SATICI_BILGILERI.eposta}
      </p>

      <h2>2. İşlenen Kişisel Veriler</h2>
      <ul>
        <li>Kimlik bilgileri: ad soyad</li>
        <li>İletişim bilgileri: e-posta adresi, telefon numarası (SMS koduyla doğrulanır)</li>
        <li>Konum bilgisi: şehir</li>
        <li>
          Avukatlar için ayrıca: baro sicil numarası, uzmanlık alanları,
          biyografi, kimlik belgesi ve baro kartı görüntüsü (doğrulama amacıyla
          yüklenir), hakediş ödemesi için IBAN
        </li>
        <li>Talep bilgileri: konu, açıklama, görüşme şekli, tarih ve süre</li>
        <li>
          İşlem bilgileri: ödeme tutarı, sipariş numarası, ödeme durumu ve
          iade kayıtları. Kart bilgilerin Hukukim tarafından saklanmaz; ödeme
          kuruluşu iyzico tarafından işlenir.
        </li>
        <li>
          Görüşme katılım kaydı: görüşme numarası, görüşmeye giriş zamanı,
          süre ve katılımcının rolü (avukat/müvekkil). Görüşmelerin ses ve
          görüntüsü kaydedilmez.
        </li>
        <li>Şikayet kayıtları: şikayet kategorisi, açıklaması ve yönetici notu</li>
        <li>Destek yazışmaları ve platform içi mesajlar</li>
        <li>
          İşlem güvenliği bilgileri: IP adresi, oturum ve işlem günlükleri,
          cihaz ve tarayıcı bilgisi
        </li>
      </ul>

      <h2>3. İşleme Amaçları</h2>
      <ul>
        <li>Hesabının oluşturulması, telefon ve kimlik doğrulaması</li>
        <li>Avukat ile müvekkil arasında eşleşme sağlanması ve görüşmenin yapılması</li>
        <li>Ödemelerin alınması, iadelerin yapılması ve avukat hakedişlerinin ödenmesi</li>
        <li>Avukat profillerinin baro sicili üzerinden doğrulanması</li>
        <li>Şikayet, itiraz ve uyuşmazlıkların incelenmesi; görüşmenin gerçekleştiğinin ispatı</li>
        <li>Dolandırıcılık, kötüye kullanım ve platform dışına yönlendirmenin önlenmesi</li>
        <li>Destek taleplerinin yanıtlanması ve bildirim gönderilmesi</li>
        <li>Fatura, vergi ve diğer yasal yükümlülüklerin yerine getirilmesi</li>
      </ul>

      <h2>4. Hukuki Sebep</h2>
      <p>
        Kişisel verilerin KVKK madde 5/2 uyarınca; sözleşmenin kurulması ve
        ifası için gerekli olması, hukuki yükümlülüğün yerine getirilmesi,
        bir hakkın tesisi, kullanılması veya korunması için zorunlu olması ve
        temel hak ve özgürlüklerine zarar vermemek kaydıyla meşru menfaatimiz
        sebeplerine dayanılarak işlenir. Bu kapsamda olmayan işlemeler için
        açık rızan alınır.
      </p>

      <h2>5. Aktarım</h2>
      <p>
        Randevu talebine konu bilgiler (ad, telefon vb.) yalnızca eşleştiğin
        avukat veya müvekkille paylaşılır. Bunun dışında verilerin
        aktarılması, hizmetin sunulması için çalıştığımız hizmet
        sağlayıcılarla ve yasal zorunluluk halinde yetkili kurum ve
        kuruluşlarla sınırlıdır:
      </p>
      <ul>
        <li>Supabase: veri altyapısı ve kimlik doğrulama</li>
        <li>iyzico: kart ödemelerinin alınması ve iadeler</li>
        <li>Daily.co: görüntülü görüşme altyapısı</li>
        <li>Netgsm: SMS doğrulama kodlarının gönderilmesi</li>
        <li>Vercel: uygulamanın barındırılması</li>
      </ul>
      <p>
        Bu hizmet sağlayıcılardan bir kısmının sunucuları yurt dışında
        bulunabilir; bu durumda aktarım KVKK madde 9&apos;da öngörülen şartlara
        uygun olarak yapılır.
      </p>

      <h2>6. Saklama Süreleri</h2>
      <ul>
        <li>Hesap bilgilerin, hesabın açık olduğu süre boyunca saklanır; hesabını sildiğinde kaldırılır.</li>
        <li>
          Fatura, ödeme ve hakediş kayıtları, ilgili vergi ve ticaret
          mevzuatında öngörülen süreler boyunca saklanır.
        </li>
        <li>
          Görüşme katılım kayıtları ve kapanmış şikayet kayıtları, olası
          uyuşmazlıklara karşı en fazla 24 ay saklanır, sonra silinir. Açık
          bir şikayet bulunuyorsa süreç kapanana kadar tutulur.
        </li>
        <li>Görüşmelerin ses ve görüntüsü kaydedilmediği için saklanacak bir görüşme kaydı yoktur.</li>
      </ul>
      <p>
        Saklama süresi dolan veriler silinir, yok edilir veya anonim hale
        getirilir.
      </p>

      <h2>7. Haklarınız</h2>
      <p>
        KVKK madde 11 uyarınca; kişisel verilerinin işlenip işlenmediğini
        öğrenme, işlenmişse buna ilişkin bilgi talep etme, işlenme amacını ve
        amacına uygun kullanılıp kullanılmadığını öğrenme, yurt içinde veya
        yurt dışında aktarıldığı üçüncü kişileri bilme, eksik veya yanlış
        işlenmişse düzeltilmesini isteme, KVKK madde 7 çerçevesinde silinmesini
        veya yok edilmesini isteme, bu işlemlerin aktarılan üçüncü kişilere
        bildirilmesini isteme, işlenen verilerin analiz edilmesi suretiyle
        aleyhine bir sonucun ortaya çıkmasına itiraz etme ve kanuna aykırı
        işleme nedeniyle zarara uğraman halinde zararın giderilmesini talep
        etme haklarına sahipsin.
      </p>

      <h2>8. Başvuru</h2>
      <p>
        Haklarına ilişkin taleplerini {SATICI_BILGILERI.eposta} adresine
        yazarak ya da Platform üzerindeki destek bölümünden iletebilirsin.
        Başvurular en geç 30 gün içinde yanıtlanır.
      </p>
    </YasalSayfaShell>
  );
}
