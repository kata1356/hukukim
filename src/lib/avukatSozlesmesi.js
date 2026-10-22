// Avukat Hizmet Sözleşmesi metni ve sürümü. Metin değişirse SOZLESME_SURUMU güncellenir;
// sürümü eski olan her avukat, panele girerken yeni sürümü yeniden onaylamak zorundadır.
//
// YAYIN ÖNCESİ YAPILACAKLAR:
//  1) SIRKET alanlarındaki bilgilerin güncel olduğunu kontrol et.
//  2) Metni bir avukata okut (özellikle 7. madde "Ücret ve Hakediş", 8. madde "Platform Dışı
//     İletişim" ve 13. madde "Sorumluluk ve Tazminat"); gerekirse düzelttir.
//  3) Metni değiştirirsen SOZLESME_SURUMU'nu da değiştir.

export const SOZLESME_SURUMU = "2026-10-22.2";
export const SOZLESME_TARIHI = "22 Ekim 2026";

export const SIRKET = {
  unvan: "Ali Eren Ağırman (şahıs işletmesi)",
  adres: "Oruçreis Mah. 566. Sk. No: 62/1 İç Kapı No: 1 Esenler/İstanbul",
  vergiDairesi: "Atışalanı Vergi Dairesi, 0101272783",
  eposta: "hukukimcom@gmail.com",
  mahkeme: "İstanbul",
  hakedisPeriyodu: "haftalık dönemler hâlinde",
  hakedisVadesi: "ilgili haftanın bitiminden sonraki 7 (yedi) iş günü içinde",
};

export const SOZLESME_BOLUMLERI = [
  {
    baslik: "Taraflar ve Tanımlar",
    maddeler: [
      `Bu Avukat Hizmet Sözleşmesi ("Sözleşme"), ${SIRKET.adres} adresinde faaliyet gösteren, ${SIRKET.vergiDairesi} (vergi dairesi, vergi kimlik numarası) kayıtlı ${SIRKET.unvan} ("Platform") ile Platform'a avukat olarak üye olan gerçek kişi ("Avukat") arasında, Avukat'ın elektronik ortamda onay vermesiyle kurulur ve onay anında yürürlüğe girer.`,
      `"Müvekkil", Platform üzerinden hukuki destek talep eden kullanıcıyı; "Talep", Müvekkil'in Platform üzerinden ilettiği hukuki destek isteğini; "Görüşme", Talep kapsamında Platform üzerinden yapılan görüntülü veya yazılı iletişimi; "Paket", Müvekkil'in satın aldığı belirli süreli Görüşme hakkını; "Ücretsiz Deneme", Madde 6'da tanımlanan ilk 5 dakikalık ücretsiz Görüşme'yi; "Ek Süre", Görüşme sırasında Müvekkil'in satın aldığı ilave süreyi; "Hakediş", Avukat'a ait pay'ı ifade eder.`,
    ],
  },
  {
    baslik: "Sözleşmenin Konusu ve Platform'un Rolü",
    maddeler: [
      "Platform, avukatlar ile hukuki destek arayan kişileri bir araya getiren; Talep iletimi, görüntülü ve yazılı görüşme, ödeme ve hakediş altyapısı sunan bir teknoloji ve aracılık platformudur. Platform hukuki hizmet vermez, hukuki görüş bildirmez ve avukatlık sıfatı taşımaz.",
      "Hukuki hizmet, Avukat ile Müvekkil arasında, Avukat'ın bağımsız olarak ve kendi mesleki sorumluluğunda sunulur. Avukat, Platform'un çalışanı, ortağı, temsilcisi veya alt işvereni değildir; aralarında iş, ortaklık ya da vekâlet ilişkisi kurulmaz. Platform, Avukat ile Müvekkil arasındaki hukuki ilişkinin tarafı değildir.",
      "Avukat, hangi Talep'i üstleneceğine, görüşmeyi kabul edip etmeyeceğine ve sunduğu hizmetin içeriğine kendisi karar verir. Platform, Avukat'a talimat veremez ve Avukat'ın mesleki bağımsızlığına müdahale edemez.",
    ],
  },
  {
    baslik: "Üyelik, Doğrulama ve Hesap Güvenliği",
    maddeler: [
      "Avukat, kayıt sırasında doğru, eksiksiz ve güncel bilgi vermeyi taahhüt eder. Bir kişi yalnızca bir hesap açabilir; bir telefon numarası yalnızca bir hesapta kullanılabilir.",
      "Platform, Avukat'tan kimlik belgesinin ön yüzünü, baro kartını ve baro sicil numarasını ister ve bunları doğrulama amacıyla inceler. Doğrulama onaylanmadan Avukat Talep göremez, üstlenemez veya Müvekkil'lerle iletişime geçemez.",
      'Doğrulama rozeti, yalnızca belgelerin Platform tarafından incelendiğini gösterir; Avukat\'ın mesleki yeterliliği, uzmanlığı, başarısı veya hizmet kalitesi konusunda bir garanti veya tavsiye anlamına gelmez.',
      "Avukat, hesap bilgilerinin ve şifresinin gizliliğinden sorumludur; hesabını üçüncü kişilere kullandıramaz, devredemez. Hesabı üzerinden yapılan tüm işlemler Avukat'a ait sayılır. Yetkisiz kullanımdan haberdar olması hâlinde Platform'u derhal bilgilendirir.",
    ],
  },
  {
    baslik: "Avukat'ın Beyan ve Taahhütleri",
    maddeler: [
      "Avukat; geçerli bir baro kaydı bulunduğunu, mesleğini yapmaktan men edilmediğini, baro levhasından silinmediğini, meslekten geçici veya sürekli çıkarma cezası almadığını ve avukatlık sıfatını kullanmasına engel bir durumun bulunmadığını beyan eder.",
      "Avukat; baro kaydında, ruhsatında veya disiplin durumunda meydana gelen her değişikliği (askı, uyarı, ihtar, ihraç, baro değişikliği vb.) derhal ve yazılı olarak Platform'a bildirir. Bildirimde bulunmaması bu Sözleşme'nin esaslı ihlalidir.",
      "Avukat; Avukatlık Kanunu, Türkiye Barolar Birliği Avukatlık Meslek Kuralları, Türk Ceza Kanunu, 6698 sayılı Kişisel Verilerin Korunması Kanunu ve ilgili tüm mevzuata uygun hareket edeceğini taahhüt eder.",
      "Avukat, bir Talep'i üstlenmeden önce menfaat çatışması bulunup bulunmadığını kendisi değerlendirir; menfaat çatışması varsa Talep'i üstlenmez. Avukat, kendisinin yeterli olmadığı veya mevzuata aykırı olacak Talep'leri reddeder.",
      "Avukat, mesleki sorumluluk sigortası yaptırması gerekip gerekmediğini kendisi değerlendirir; Platform bu konuda sorumluluk üstlenmez.",
    ],
  },
  {
    baslik: "Talep, Görüşme ve Süre Kuralları",
    maddeler: [
      "Platform, Müvekkil'in uygun şehir ve uzmanlık alanındaki doğrulanmış avukatlara Talep'i iletir. Talep, ilk üstlenen Avukat'a atanır; Platform, Talep'in belirli bir Avukat'a gideceğini veya belirli sayıda Talep ileteceğini garanti etmez.",
      "Avukat, bir Talep'i kabul ettiğinde Görüşme'ye zamanında katılmayı taahhüt eder. Kabul edilip yapılmayan, geç kalınan veya Avukat'ın kusuruyla gerçekleşemeyen Görüşme'de Müvekkil'e ödediği tutar iade edilir, Avukat'ın Hakediş hakkı doğmaz. Tekrarlayan gelmeme hesabın askıya alınması veya Sözleşme'nin feshi sebebidir.",
      "Görüşme süresi, Platform'un sunucu kayıtlarına göre ölçülür. Süre, iki tarafın Görüşme odasına katılmasıyla başlar ve Paket süresi (varsa satın alınan Ek Süre dahil) dolduğunda Görüşme otomatik olarak sona erer. Avukat, Platform kayıtlarının bu konuda esas olduğunu kabul eder.",
      "Görüşme sırasında Platform ekranında kalınması esastır. Görüşme sırasında başka bir uygulamaya geçilmesi veya sayfadan ayrılınması hâlinde süre işlemeye devam eder.",
      "Avukat, Görüşme'yi Müvekkil'in izni olmadan ve mevzuata aykırı biçimde kaydedemez, ekran görüntüsü alıp paylaşamaz. Platform, Görüşme'nin ses ve görüntü içeriğini kaydetmez.",
      "Teknik bir arıza nedeniyle Görüşme gerçekleştirilemez veya yarıda kalırsa Görüşme ücretsiz olarak yeniden planlanır ya da Müvekkil talep ederse ücret iade edilir; bu hâlde Hakediş buna göre düzeltilir veya geri alınır.",
    ],
  },
  {
    baslik: "Ücretsiz Deneme, Paketler ve Ek Süre",
    maddeler: [
      "Platform, yeni Müvekkil'lere tanıtım amacıyla ilk 5 (beş) dakikalık ücretsiz deneme Görüşme'si sunar. Ücretsiz Deneme, telefon numarası başına yalnızca bir kez ve Paket satın alınmadan kullanılabilir. Platform bu uygulamayı dilediği zaman değiştirebilir veya sona erdirebilir.",
      "Avukat, Ücretsiz Deneme kapsamındaki bir Talep'i üstlenmekle; bu Görüşme'nin ilk 5 dakikası için Müvekkil'den herhangi bir ücret alınmadığını ve bu süre için Hakediş doğmadığını peşinen kabul eder. Avukat, Ücretsiz Deneme için Platform'dan, Müvekkil'den veya üçüncü kişilerden ücret, tazminat veya başka bir menfaat talep edemez.",
      "Ücretsiz Deneme süresi dolduğunda Müvekkil Ek Süre satın almazsa Görüşme sona erer. Avukat, süreyi kendi inisiyatifiyle uzatamaz, ücretsiz devam edemez ve süre bittikten sonra Görüşme'yi sürdürmek için Müvekkil ile Platform dışında anlaşma yapamaz.",
      "Platform; Müvekkil'e 5, 10 ve 15 dakikalık hazır Paketler ile 5 ila 60 dakika arasında kendi seçeceği süre için Paket sunar. Bu Sözleşme'nin imza tarihi itibarıyla hazır Paket fiyatları sırasıyla 200 TL, 349 TL ve 499 TL; kendi süresini seçen Müvekkil için dakika ücreti 40 TL'dir.",
      "Paket süresi dolmak üzereyken Platform, Müvekkil'e Görüşme'ye devam etmesi için Ek Süre satın alma imkânı sunar. Bu Sözleşme'nin imza tarihi itibarıyla Ek Süre, 5 dakika için 200 TL'dir. Ek Süre satın alınmazsa Görüşme süre sonunda sona erer. Satın alınan Ek Süre için de Madde 7'deki Hakediş oranı uygulanır.",
      "Fiyatlar, Paket seçenekleri, Ücretsiz Deneme ve Ek Süre koşulları Platform tarafından değiştirilebilir. Güncel fiyatlar Platform'da ilan edilir; değişiklikler yalnızca değişiklikten sonra oluşturulan Talep'lere uygulanır. Avukat'ın Hakediş oranı Madde 7.1'e göre belirlenir.",
    ],
  },
  {
    baslik: "Ücret ve Hakediş",
    maddeler: [
      "Müvekkil'in ilgili Talep için Platform üzerinden ödediği brüt tutarın %60'ı (yüzde altmışı) Avukat'ın Hakediş'idir; kalan %40'ı Platform'un hizmet, altyapı ve işletme bedelidir. Ödeme kuruluşu ve işlem komisyonları Platform'un payından karşılanır ve Avukat'ın Hakediş'inden düşülmez.",
      "Hakediş, Görüşme tamamlandığında Avukat'ın paneline yansır ve Platform tarafından Avukat'ın Ayarlar sayfasında beyan ettiği IBAN'a " + SIRKET.hakedisPeriyodu + " olarak, " + SIRKET.hakedisVadesi + " havale edilir. Hakediş ödemesi, Müvekkil'in ödemesinin Platform'a başarıyla ulaşmış olmasına bağlıdır.",
      "Avukat, IBAN bilgisinin kendisine ait, doğru ve güncel olmasından sorumludur. Hatalı veya başkasına ait IBAN nedeniyle yapılan ödemelerden Platform sorumlu değildir.",
      "Ücretsiz Deneme için Hakediş doğmaz. Müvekkil'e iade edilen, ödemesi başarısız olan, itiraz edilen (chargeback) veya Avukat'ın kusuruyla gerçekleşemeyen Görüşme'lerde Hakediş doğmaz; daha önce ödenmişse Platform bu tutarı sonraki hakedişlerden mahsup edebilir veya Avukat'tan geri isteyebilir.",
      "Avukat, Platform'dan alacağı tutarlara ilişkin vergi ve diğer yasal yükümlülüklerinden (gelir vergisi, serbest meslek makbuzu veya e-serbest meslek makbuzu düzenleme, KDV, sosyal güvenlik vb.) kendisi sorumludur. Platform, mevzuatın zorunlu kıldığı kesintileri yapmaya ve bildirimleri vermeye yetkilidir.",
      "Avukat, Platform'un sağladığı bu Hakediş düzeni dışında, Platform üzerinden tanıştığı Müvekkil'den aynı hizmet için ayrıca ücret talep edemez veya tahsil edemez.",
    ],
  },
  {
    baslik: "Platform Dışı İletişim ve Dolanma Yasağı",
    maddeler: [
      "Avukat; Platform üzerinden tanıştığı Müvekkil ile ilişkiyi, Platform'un ücret, süre ve Hakediş kurallarını atlamak veya Platform'u devre dışı bırakmak amacıyla Platform dışına (telefon, mesajlaşma uygulaması, e-posta, sosyal medya vb.) taşımayacağını, bu yönde yönlendirmede bulunmayacağını ve Görüşme sırasında kendi iletişim bilgilerini bu amaçla paylaşmayacağını kabul eder.",
      "Platform üzerinden başlayan bir Talep'in devamında, Görüşme tamamlanmadan veya süre dolmadan Müvekkil ile Platform dışında ücret pazarlığı yapmak, Ek Süre satın alınmasını engellemek veya Müvekkil'i Platform dışı ödemeye yönlendirmek bu madde kapsamında ihlal sayılır.",
      "Bu madde, Müvekkil'in kendi iradesiyle ve Platform'u dolanma amacı taşımayan şekilde Avukat ile daha sonra kuracağı bağımsız hukuki ilişkiyi engellemez. Ancak Platform kayıtlarına göre dolanma kastı bulunduğu anlaşılırsa Platform, ilgili Müvekkil için doğmuş olabilecek Platform payını Avukat'tan talep etme, Hakediş'i durdurma, hesabı askıya alma veya Sözleşme'yi feshetme hakkına sahiptir.",
      "Taraflar, Platform'un sunucu kayıtlarının, Görüşme süre bilgilerinin, ödeme kayıtlarının ve Avukat'ın Sözleşme'yi onaylama kaydının bu maddeye ilişkin uyuşmazlıklarda geçerli delil olduğunu kabul eder.",
    ],
  },
  {
    baslik: "Mesleki Sorumluluk, Gizlilik ve Müvekkil Bilgileri",
    maddeler: [
      "Avukat, sunduğu hukuki hizmetin içeriğinden, doğruluğundan ve sonuçlarından kendisi sorumludur. Platform, Avukat'ın verdiği görüşten, Müvekkil'e yaptığı yönlendirmeden veya sunduğu hizmetin sonucundan doğan zararlardan sorumlu tutulamaz.",
      "Avukat, Müvekkil'in kendisine aktardığı tüm bilgilere ilişkin avukatlık sırrına ve gizlilik yükümlülüklerine uyar; bu bilgileri üçüncü kişilerle paylaşmaz, Talep dışındaki amaçlarla (reklam, pazarlama, listeleme, satış vb.) kullanmaz.",
      "Avukat, Platform üzerinden edindiği Müvekkil bilgilerini yalnızca ilgili Talep'in yürütülmesi için kullanır ve işlem sona erdiğinde mevzuattaki saklama yükümlülükleri dışında bu bilgileri korur ve gerektiğinde siler.",
      "Avukat, profilindeki bilgilerin, fotoğrafın ve biyografinin doğru olmasından ve reklam yasağı dahil meslek kurallarına uygun olmasından sorumludur; garanti, sonuç vaadi, haksız rekabet veya yanıltıcı ifadeler kullanmaz. Platform, mevzuata veya bu Sözleşme'ye aykırı gördüğü profil içeriklerini kaldırabilir veya düzeltilmesini isteyebilir.",
    ],
  },
  {
    baslik: "Kişisel Verilerin Korunması",
    maddeler: [
      "Platform, Avukat'ın kimlik, baro, iletişim, ödeme ve kullanım verilerini; üyelik, doğrulama, Görüşme, ödeme, Hakediş, güvenlik ve yasal yükümlülüklerin yerine getirilmesi amaçlarıyla, Platform'un KVKK Aydınlatma Metni'ne uygun olarak işler.",
      "Kimlik ve baro kartı belgeleri yalnızca kimlik ve meslek doğrulaması amacıyla, yetkili Platform personeli tarafından incelenir ve erişimi kısıtlı özel bir alanda saklanır.",
      "Avukat, Müvekkil'in kişisel verilerini kendi hizmeti kapsamında işlerken ayrı bir veri sorumlusu sıfatıyla 6698 sayılı Kanun'a uygun hareket eder ve veri güvenliğine ilişkin gerekli teknik ve idari tedbirleri alır.",
    ],
  },
  {
    baslik: "Fikri Mülkiyet",
    maddeler: [
      "Platform'un adı, logosu, yazılımı, tasarımı ve içerikleri Platform'a aittir; Avukat bunları izinsiz kullanamaz, kopyalayamaz veya ticari amaçla çoğaltamaz.",
      "Avukat, profil bilgilerini ve fotoğrafını Platform'da ve Platform'un tanıtım kanallarında, Avukat'ın aksini bildirmediği sürece, Platform'un hizmeti kapsamında göstermesi için Platform'a süreyle sınırlı, münhasır olmayan ve bedelsiz bir kullanım izni verir. Avukat, hesabını sildiğinde bu izin sona erer.",
    ],
  },
  {
    baslik: "Hesabın Askıya Alınması ve Sözleşme'nin Feshi",
    maddeler: [
      "Platform; Sözleşme'nin ihlali, yanlış veya yanıltıcı bilgi verilmesi, Platform dışı iletişim ve dolanma, tekrarlayan gelmeme, Müvekkil şikâyetleri, baro kaydında olumsuz gelişmeler, hile veya kötüye kullanım şüphesi ya da mevzuata aykırılık hâllerinde Avukat'ın hesabını önceden bildirimle veya acil durumda bildirimsiz olarak geçici olarak askıya alabilir ya da Sözleşme'yi derhal feshedebilir.",
      "Avukat, Sözleşme'yi dilediği zaman hesabını Ayarlar sayfasından sildirerek feshedebilir. Devam eden Görüşme'ler yerine getirilir; fesih tarihine kadar doğmuş ve kesinleşmiş Hakediş'ler, bu Sözleşme'deki mahsup ve geri alma haklarına halel gelmeksizin ödenir.",
      "Platform, yasal yükümlülük veya yetkili merciin talebi hâlinde Avukat'ın ihlalini ilgili baroya veya yetkili makamlara bildirebilir.",
    ],
  },
  {
    baslik: "Sorumluluk ve Tazminat",
    maddeler: [
      "Platform; hizmetin kesintisiz veya hatasız olacağını garanti etmez. Bakım, internet ve altyapı sorunları, üçüncü taraf hizmet sağlayıcıların (ödeme, görüntülü görüşme vb.) kesintileri veya mücbir sebepler nedeniyle yaşanabilecek aksaklıklardan, kasıt veya ağır kusuru bulunmadıkça sorumlu olmaz.",
      "Platform'un bu Sözleşme kapsamındaki sorumluluğu, kasıt ve ağır kusur hâlleri saklı kalmak üzere, zarara yol açan Görüşme için Avukat'a ödenmesi gereken Hakediş tutarıyla sınırlıdır; Platform dolaylı zararlardan, kâr kaybından ve itibar kaybından sorumlu değildir.",
      "Avukat; bu Sözleşme'yi veya mevzuatı ihlali, sunduğu hizmetten doğan talepler veya Müvekkil ve üçüncü kişilerin Platform'a yönelteceği talepler nedeniyle Platform'un uğrayacağı zararları (makul avukatlık ücretleri ve yargılama giderleri dahil) tazmin etmeyi kabul eder.",
    ],
  },
  {
    baslik: "Mücbir Sebep",
    maddeler: [
      "Tarafların kontrolü dışında gelişen doğal afet, savaş, salgın, yasal düzenleme, kamu otoritesi kararı, genel internet veya elektrik kesintisi, siber saldırı gibi mücbir sebepler nedeniyle yükümlülüklerin yerine getirilememesinden taraflar sorumlu tutulamaz.",
    ],
  },
  {
    baslik: "Bildirimler ve Delil Sözleşmesi",
    maddeler: [
      `Platform'un Avukat'a bildirimleri, Avukat'ın kayıtlı e-posta adresine, Platform paneline veya bildirim sistemine yapılır ve gönderildiği anda geçerli sayılır. Avukat'ın Platform'a bildirimleri ${SIRKET.eposta} adresine yapılır. Avukat, kayıtlı iletişim bilgilerini güncel tutmakla yükümlüdür.`,
      "Taraflar; Platform'un elektronik kayıtlarının, sunucu ve log kayıtlarının, ödeme ve Görüşme kayıtlarının ile Avukat'ın bu Sözleşme'yi elektronik ortamda onayladığına dair kayıtların (onay zamanı, sürüm numarası, IP adresi ve tarayıcı bilgisi dahil), 6100 sayılı Hukuk Muhakemeleri Kanunu'nun delil sözleşmesine ilişkin hükmü uyarınca, aksi ispat edilene kadar kesin delil teşkil edeceğini kabul eder.",
    ],
  },
  {
    baslik: "Sözleşme'nin Değiştirilmesi ve Süresi",
    maddeler: [
      "Sözleşme belirsiz süreli olarak yürürlüğe girer. Platform bu Sözleşme'yi güncelleyebilir; güncellenen sürüm Avukat'a panel girişinde sunulur ve onayına sunulur. Yeni sürüm onaylanmadığı sürece Avukat Platform'u kullanmaya devam edemez, yeni Talep üstlenemez; bu durum önceden doğmuş Hakediş'leri etkilemez.",
      "Avukat, Sözleşme'nin her sürümünü onaylamadan önce okuduğunu ve anladığını kabul eder.",
    ],
  },
  {
    baslik: "Çeşitli Hükümler",
    maddeler: [
      "Sözleşme'nin herhangi bir hükmünün geçersiz veya uygulanamaz olması diğer hükümlerin geçerliliğini etkilemez; taraflar geçersiz hükmün yerine, ekonomik amacına en yakın geçerli hükmü uygulamayı kabul eder.",
      "Avukat, bu Sözleşme'den doğan hak ve yükümlülüklerini Platform'un yazılı izni olmadan devredemez. Platform, Sözleşme'yi iştiraklerine veya iş devri hâlinde halef kuruma devredebilir.",
      "Platform'un bir hakkını kullanmaması, o haktan feragat ettiği anlamına gelmez.",
      "Bu Sözleşme, tarafların konuya ilişkin tüm anlaşmasını oluşturur; Platform'un Kullanım Şartları, KVKK Aydınlatma Metni, Gizlilik Politikası ve İptal ve İade Koşulları Sözleşme'nin ayrılmaz parçasıdır. Çelişki hâlinde bu Sözleşme'nin avukata ilişkin hükümleri öncelikli uygulanır.",
    ],
  },
  {
    baslik: "Uygulanacak Hukuk ve Yetkili Mahkeme",
    maddeler: [
      `Bu Sözleşme'ye Türk hukuku uygulanır. Sözleşme'den doğacak uyuşmazlıklarda ${SIRKET.mahkeme} Mahkemeleri ve İcra Daireleri yetkilidir.`,
      "Avukat, bu Sözleşme'nin tüm maddelerini okuduğunu, anladığını ve serbest iradesiyle elektronik ortamda onayladığını kabul ve beyan eder. Onay anı, Sözleşme sürümü ve IP bilgisi kayıt altına alınır.",
    ],
  },
];
