// Avukat Hizmet Sözleşmesi metni ve sürümü. Metin değişirse SOZLESME_SURUMU güncellenir;
// sürümü eski olan her avukat, panele girerken yeni sürümü yeniden onaylamak zorundadır.
//
// ÖNEMLİ: Bu metin taslaktır. Yayından önce bir avukat tarafından gözden geçirilmeli,
// [köşeli parantez] içindeki alanlar şirket bilgileriyle doldurulmalıdır.

export const SOZLESME_SURUMU = "2026-10-22";
export const SOZLESME_TARIHI = "22 Ekim 2026";

export const SOZLESME_BOLUMLERI = [
  {
    baslik: "1. Taraflar",
    paragraflar: [
      "Bu sözleşme, Hukukim platformunu işleten [Şirket Unvanı] (\"Platform\") ile Platform'a avukat olarak üye olan kişi (\"Avukat\") arasında, Avukat'ın elektronik ortamda onay vermesiyle kurulur.",
    ],
  },
  {
    baslik: "2. Sözleşmenin Konusu",
    paragraflar: [
      "Platform, avukatlar ile hukuki destek arayan kişileri (\"Müvekkil\") bir araya getiren, görüntülü ve yazılı görüşme ile ödeme altyapısı sunan bir teknoloji platformudur.",
      "Platform hukuki hizmet vermez, hukuki görüş bildirmez ve avukatlık sıfatı taşımaz. Hukuki hizmet, Avukat ile Müvekkil arasında, Avukat'ın kendi sorumluluğunda sunulur. Platform, tarafların arasındaki hukuki ilişkinin tarafı değildir.",
    ],
  },
  {
    baslik: "3. Avukat'ın Beyan ve Taahhütleri",
    paragraflar: [
      "Avukat, aşağıdakileri beyan ve taahhüt eder:",
    ],
    liste: [
      "Geçerli bir baro kaydı bulunduğunu; mesleğini yapmaktan men edilmediğini, baro levhasından silinmediğini ve askıya alınmadığını.",
      "Kayıt sırasında verdiği ad, soyad, baro sicil numarası, kimlik ve baro kartı bilgilerinin doğru ve güncel olduğunu; bu belgelerin Platform tarafından doğrulama amacıyla incelenmesini kabul ettiğini.",
      "Bilgilerinde veya baro kaydında oluşan her değişikliği (askı, ihraç, ihtar, baro değişikliği vb.) derhal Platform'a bildireceğini.",
      "Avukatlık Kanunu, Türkiye Barolar Birliği Avukatlık Meslek Kuralları ve ilgili tüm mevzuata uygun hareket edeceğini.",
    ],
  },
  {
    baslik: "4. Mesleki Sorumluluk ve Gizlilik",
    paragraflar: [
      "Avukat, sunduğu hukuki hizmetin içeriğinden ve sonuçlarından kendisi sorumludur. Platform, Avukat'ın verdiği görüş veya hizmetten doğan zararlardan sorumlu tutulamaz.",
      "Avukat, Müvekkil'in kendisine aktardığı her bilgiye ilişkin avukatlık sırrını ve kişisel verilerin korunmasına ilişkin yükümlülükleri (6698 sayılı KVKK) yerine getirmeyi, görüşmeleri izinsiz kaydetmemeyi ve üçüncü kişilerle paylaşmamayı taahhüt eder.",
      "Avukat, Platform üzerindeki profilini ve iletişimini reklam yasağına ve meslek kurallarına uygun şekilde yönetir; garanti, sonuç vaadi veya haksız rekabet niteliğinde ifadeler kullanmaz.",
    ],
  },
  {
    baslik: "5. Görüşmeler ve Platform Dışı İletişim",
    paragraflar: [
      "Platform üzerinden gelen talepler, görüşme süreleri ve ücretler Platform'da belirtilen paket ve kurallara göre yürütülür. Görüşme süresi Platform'un kayıtlarına göre belirlenir.",
      "Avukat, Platform üzerinden tanıştığı Müvekkil ile görüşmeyi, ücretli süreyi atlamak veya Platform'u devre dışı bırakmak amacıyla Platform dışına (telefon, mesajlaşma uygulaması, e-posta vb.) taşımayacağını, bu yönde yönlendirmede bulunmayacağını kabul eder. Görüşme boyunca Platform ekranında kalmayı taahhüt eder.",
      "Bu madde, Müvekkil'in kendi iradesiyle ve Platform'daki görüşme tamamlandıktan sonra kuracağı, Platform'u dolanma amacı taşımayan hukuki ilişkileri engellemez; ancak Platform üzerinden başlayan hizmetin ücret ve süre kurallarının atlatılması yasaktır.",
    ],
  },
  {
    baslik: "6. Ücret ve Hakediş",
    paragraflar: [
      "Müvekkil'in ödediği görüşme ücretinin %60'ı Avukat'ın hakedişidir; kalan kısım Platform'un hizmet ve altyapı bedelidir. Ücretsiz deneme görüşmeleri için hakediş doğmaz; görüşme sırasında Müvekkil'in satın aldığı ek süre için hakediş doğar.",
      "Hakedişler, Avukat'ın Ayarlar sayfasına girdiği IBAN'a periyodik olarak havale edilir. Avukat, IBAN bilgisinin kendisine ait ve doğru olmasından sorumludur.",
      "Gelir vergisi, serbest meslek makbuzu/e-SMM düzenleme ve diğer vergisel yükümlülükler Avukat'a aittir.",
      "İade edilen veya Platform'un teknik hatası nedeniyle yapılamayan görüşmelere ilişkin hakediş, iade koşullarına göre düzeltilebilir.",
    ],
  },
  {
    baslik: "7. Hesabın Askıya Alınması ve Fesih",
    paragraflar: [
      "Platform; sözleşme ihlali, hatalı veya yanıltıcı bilgi, Müvekkil şikâyetleri, baro kaydındaki olumsuz gelişmeler veya mevzuata aykırılık hâlinde Avukat'ın hesabını geçici olarak askıya alabilir ya da sözleşmeyi feshedebilir.",
      "Avukat, hesabını dilediği zaman Ayarlar sayfasından silebilir. Devam eden görüşmeler ve doğmuş hakedişler sözleşme sona ermiş olsa da yerine getirilir.",
    ],
  },
  {
    baslik: "8. Kişisel Veriler",
    paragraflar: [
      "Avukat'ın kimlik ve baro kartı belgeleri yalnızca kimlik ve meslek doğrulaması amacıyla, yetkili Platform personeli tarafından incelenir ve özel bir alanda saklanır. Kişisel veriler, Platform'un KVKK Aydınlatma Metni'ne uygun olarak işlenir.",
    ],
  },
  {
    baslik: "9. Sorumluluğun Sınırı",
    paragraflar: [
      "Platform, hizmetin kesintisiz veya hatasız olacağını garanti etmez; bakım, üçüncü taraf hizmet (ödeme, görüntülü görüşme) sağlayıcıları veya mücbir sebepler nedeniyle yaşanabilecek kesintilerden, kasıt veya ağır kusuru bulunmadıkça sorumlu olmaz.",
    ],
  },
  {
    baslik: "10. Değişiklikler",
    paragraflar: [
      "Platform bu sözleşmeyi güncelleyebilir. Güncelleme hâlinde Avukat, panele girerken yeni sürümü onaylamaya yönlendirilir; onay verilmedikçe Platform üzerinden talep alınamaz.",
    ],
  },
  {
    baslik: "11. Uygulanacak Hukuk ve Yetkili Mahkeme",
    paragraflar: [
      "Bu sözleşmeye Türk hukuku uygulanır. Uyuşmazlıklarda [Şehir] Mahkemeleri ve İcra Daireleri yetkilidir.",
      "Avukat, bu sözleşmenin tüm maddelerini okuduğunu ve elektronik ortamda onayladığını kabul eder. Onay anı, sürümü ve IP bilgisi kayıt altına alınır.",
    ],
  },
];
