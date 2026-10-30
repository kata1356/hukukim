export const SITE_URL = "https://hukukim.com";

// PayTR, ödeme dönüş adreslerini kayıtlı mağaza alan adıyla karşılaştırır. Mağaza alan adı hukukim.com
// olarak güncellenemiyorsa Vercel'de PAYTR_DONUS_ALAN_ADI=https://hukukim.vercel.app tanımlanır;
// next.config.mjs bu alan adına gelen dönüşleri otomatik olarak hukukim.com'a yönlendirir.
export const ODEME_DONUS_ADRESI = (process.env.PAYTR_DONUS_ALAN_ADI || SITE_URL).replace(/\/$/, "");
