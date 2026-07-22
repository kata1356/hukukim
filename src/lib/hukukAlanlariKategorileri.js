import {
  IconKalkan,
  IconKalp,
  IconUzmanlik,
  IconEv,
  IconBina,
  IconBaro,
  IconCip,
  IconEtiket,
  IconKure,
} from "@/components/icons";

export const HUKUK_ALANLARI_KATEGORILERI = [
  {
    ad: "Ceza Hukuku",
    aciklama: "Soruşturma, kovuşturma ve savunma süreçlerinde destek.",
    Icon: IconKalkan,
    anahtarKelimeler: ["dolandırıcılık", "ceza", "savcılık", "gözaltı"],
  },
  {
    ad: "Aile Hukuku",
    aciklama: "Boşanma, velayet ve nafaka süreçlerinde danışmanlık.",
    Icon: IconKalp,
    anahtarKelimeler: ["boşanma", "velayet", "nafaka", "evlilik"],
  },
  {
    ad: "İş Hukuku",
    aciklama: "İşe iade, kıdem ve ihbar tazminatı süreçleri.",
    Icon: IconUzmanlik,
    anahtarKelimeler: ["işten çıkarılma", "tazminat", "kıdem", "işveren"],
  },
  {
    ad: "Sigorta ve Tazminat Hukuku",
    aciklama: "Trafik kazası ve sigorta tazminat talepleri.",
    Icon: IconKalkan,
    anahtarKelimeler: ["kaza", "tazminat", "sigorta"],
  },
  {
    ad: "Gayrimenkul ve Kira Hukuku",
    aciklama: "Tahliye, kira uyuşmazlığı ve tapu işlemleri.",
    Icon: IconEv,
    anahtarKelimeler: ["kira", "tahliye", "tapu", "ev sahibi"],
  },
  {
    ad: "Ticaret ve Şirketler Hukuku",
    aciklama: "Şirket kuruluşu, ortaklık ve ticari sözleşmeler.",
    Icon: IconBina,
    anahtarKelimeler: ["şirket", "ortaklık", "sözleşme"],
  },
  {
    ad: "İcra ve Borçlar Hukuku",
    aciklama: "Alacak takibi, icra ve borç yapılandırma süreçleri.",
    Icon: IconBaro,
    anahtarKelimeler: ["borç", "icra", "alacak", "haciz"],
  },
  {
    ad: "Bilişim ve Dijital Hukuk",
    aciklama: "Siber suçlar, veri ihlali ve dijital sözleşmeler.",
    Icon: IconCip,
    anahtarKelimeler: ["siber", "veri", "internet", "hesap"],
  },
  {
    ad: "Vergi Hukuku",
    aciklama: "Vergi uyuşmazlıkları ve idari itiraz süreçleri.",
    Icon: IconEtiket,
    anahtarKelimeler: ["vergi", "ceza", "beyanname"],
  },
  {
    ad: "Vatandaşlık ve Göçmenlik Hukuku",
    aciklama: "Oturma izni, vatandaşlık ve yabancılar hukuku.",
    Icon: IconKure,
    anahtarKelimeler: ["oturma izni", "vatandaşlık", "yabancı", "vize"],
  },
];
