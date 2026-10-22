"use client";

import Link from "next/link";
import { useMuvekkilProfili } from "@/lib/useMuvekkilProfili";
import MuvekkilShell from "@/components/MuvekkilShell";
import SssAkordeon from "@/components/SssAkordeon";
import Spinner from "@/components/Spinner";
import { IconMesaj, IconKvkk, IconCuzdan } from "@/components/icons";

const DESTEK_EPOSTA = "hukukimcom@gmail.com";

const SORULAR = [
  {
    soru: "İlk 5 dakika gerçekten ücretsiz mi?",
    cevap:
      "Evet. Yeni üyeler için ilk 5 dakikalık görüşme, paket almadan ve ücretsiz sunulur. Telefon numarası başına bir kez kullanılabilir. Süre dolduğunda isteğe bağlı olarak ek süre satın alabilirsin.",
  },
  {
    soru: "Hangi paketler var, fiyatlar nedir?",
    cevap:
      "5 dakika 200 TL, 10 dakika 349 TL, 15 dakika 499 TL. Dilersen 5 ile 60 dakika arasında kendi süreni seçebilirsin, dakikası 40 TL. Fiyat talebi göndermeden önce ekranda görünür.",
  },
  {
    soru: "Görüşme süresi dolunca ne olur?",
    cevap:
      "Süre bitmeden son 30 saniyede sade bir uyarı çıkar ve +5 dakika (200 TL) ek süre alabilirsin. Ek süre almazsan görüşme süre sonunda otomatik sona erer. Süre sunucuda takip edildiği için sayfayı yenilemek süreyi sıfırlamaz.",
  },
  {
    soru: "Avukat bulunamazsa veya vazgeçersem ücret iade edilir mi?",
    cevap:
      "Talebin henüz bir avukatla eşleşmeden iptal edilirse ya da süre aşımına uğrarsa ödediğin ücret iade edilir. Ayrıntılar için İptal ve İade Koşulları sayfasına bakabilirsin.",
  },
  {
    soru: "Avukatlar gerçekten avukat mı?",
    cevap:
      "Her avukat baro sicil numarası, kimlik ve baro kartıyla kayıt olur. Ekibimiz belgeleri kontrol etmeden doğrulama rozeti verilmez ve talepler doğrulanmamış avukatlara iletilmez.",
  },
  {
    soru: "Görüşmelerim kaydediliyor mu?",
    cevap:
      "Hayır. Görüntülü görüşmeler platform tarafından kaydedilmez ve yalnızca sen ve avukatın arasında gerçekleşir. Bilgilerin KVKK kapsamında korunur.",
  },
  {
    soru: "Görüşme sırasında başka uygulamaya geçebilir miyim?",
    cevap:
      "Görüşmenin tamamını bu ekranda yapman gerekir; süre ekranda işler. Görüşmeyi platform dışına taşımak Kullanım Şartları'na aykırıdır. Teknik bir sorun yaşarsan bize yazabilirsin.",
  },
  {
    soru: "Neden telefon numarası doğrulanıyor?",
    cevap:
      "Hesabını güvende tutmak ve ücretsiz denemenin kötüye kullanılmasını önlemek için telefon numaran SMS koduyla doğrulanır. Bir numara yalnızca bir hesapta kullanılabilir.",
  },
  {
    soru: "Teknik bir sorun yaşadım, ne yapmalıyım?",
    cevap:
      "Görüşme platform kaynaklı bir arıza nedeniyle yapılamazsa ücretsiz yeniden planlanır ya da talep edersen ücret iade edilir. Sorunun kısa bir açıklamasıyla bize e-posta gönder.",
  },
  {
    soru: "Hesabımı nasıl silerim?",
    cevap: "Ayarlar sayfasının en altındaki hesabı silme bağlantısını kullanabilirsin. Silme işlemi geri alınamaz.",
  },
];

export default function MuvekkilYardim() {
  const { profil, yukleniyor } = useMuvekkilProfili();

  if (yukleniyor) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-gece">
        <Spinner className="h-8 w-8 text-white" />
      </div>
    );
  }

  return (
    <MuvekkilShell profil={profil} baslik="Yardım Merkezi" aciklama="Sık sorulan sorular ve bize ulaşma yolları.">
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <a
          href={`mailto:${DESTEK_EPOSTA}`}
          className="flex flex-col gap-2 rounded-xl border border-white/10 bg-gece-yuzey p-5 transition hover:border-turkuaz/40"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-turkuaz/10 text-turkuaz">
            <IconMesaj className="h-5 w-5" />
          </span>
          <p className="font-semibold text-white">Bize yaz</p>
          <p className="text-sm text-white/50">{DESTEK_EPOSTA}</p>
        </a>
        <Link
          href="/iptal-iade-kosullari"
          className="flex flex-col gap-2 rounded-xl border border-white/10 bg-gece-yuzey p-5 transition hover:border-turkuaz/40"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-turkuaz/10 text-turkuaz">
            <IconCuzdan className="h-5 w-5" />
          </span>
          <p className="font-semibold text-white">İptal ve iade</p>
          <p className="text-sm text-white/50">Ödeme ve iade koşulları</p>
        </Link>
        <Link
          href="/kvkk-aydinlatma-metni"
          className="flex flex-col gap-2 rounded-xl border border-white/10 bg-gece-yuzey p-5 transition hover:border-turkuaz/40"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-turkuaz/10 text-turkuaz">
            <IconKvkk className="h-5 w-5" />
          </span>
          <p className="font-semibold text-white">Gizlilik ve KVKK</p>
          <p className="text-sm text-white/50">Verilerin nasıl korunuyor?</p>
        </Link>
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold text-white">Sık sorulan sorular</h2>
        <SssAkordeon liste={SORULAR} />
      </section>

      <p className="rounded-xl bg-gece-yuzey px-4 py-3 text-xs leading-relaxed text-white/40">
        Hukukim bir hukuki görüş vermez; avukat ve müvekkili bir araya getiren bir platformdur. Hukuki hizmet, avukatın
        kendi sorumluluğunda sunulur.
      </p>
    </MuvekkilShell>
  );
}
