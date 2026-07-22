-- Admin panelinden yönetilebilen site içeriği: SSS ve Mevzuat
-- Bu dosyayı Supabase projendeki SQL Editor'e yapıştırıp çalıştır.

create table if not exists sss (
  id uuid primary key default gen_random_uuid(),
  soru text not null,
  cevap text not null,
  sira integer not null default 0,
  created_at timestamptz default now()
);

alter table sss enable row level security;

create policy "sss_select_all" on sss
  for select using (true);

create policy "sss_admin_all" on sss
  for all
  using (exists (select 1 from yoneticiler y where y.id = auth.uid()))
  with check (exists (select 1 from yoneticiler y where y.id = auth.uid()));

create table if not exists mevzuat (
  id uuid primary key default gen_random_uuid(),
  ad text not null,
  no text not null,
  kabul_tarihi text not null,
  url text not null,
  sira integer not null default 0,
  created_at timestamptz default now()
);

alter table mevzuat enable row level security;

create policy "mevzuat_select_all" on mevzuat
  for select using (true);

create policy "mevzuat_admin_all" on mevzuat
  for all
  using (exists (select 1 from yoneticiler y where y.id = auth.uid()))
  with check (exists (select 1 from yoneticiler y where y.id = auth.uid()));

-- Mevcut sabit içerikle doldur (site boş kalmasın diye).
-- Tablo zaten doluysa (bu SQL ikinci kez çalıştırılırsa) hiçbir şey
-- eklenmez, satırlar çoğalmaz.
insert into sss (soru, cevap, sira)
select v.soru, v.cevap, v.sira
from (values
  ($$Hukukim nasıl çalışır?$$, $$Müvekkil olarak kaydolur, ihtiyacın olan hukuk alanını seçip bir avukat arar ya da genel bir talep açarsın. Uygun avukatlar talebini görür, ilk yanıt veren avukat talebi üstlenir ve seninle iletişime geçer.$$, 1),
  ($$Avukatlar nasıl doğrulanıyor?$$, $$Her avukat kayıt olurken baro sicil numarasını girer. Ekibimiz bu numarayı kontrol ettikten sonra profil 'Baro Sicili Doğrulanmış' rozeti kazanır. Doğrulanmamış profiller bu rozeti taşımaz.$$, 2),
  ($$Görüşme ücretini nasıl öğrenebilirim?$$, $$Sitedeki ücret tarifesi bölümü genel bilgilendirme amaçlıdır. Kesin görüşme ücreti, avukatınla doğrudan görüşerek netleşir.$$, 3),
  ($$Görüşmeler güvenli mi?$$, $$Hesap bilgilerin ve randevu taleplerin KVKK kapsamında korunur, yalnızca ilgili avukat ve müvekkil talebin detaylarını görebilir.$$, 4),
  ($$Hangi hukuk alanlarında hizmet alabilirim?$$, $$Ceza, aile, iş, sigorta ve tazminat, gayrimenkul ve kira, ticaret, icra ve borçlar, bilişim, vergi, vatandaşlık ve göçmenlik dahil pek çok alanda kayıtlı avukat bulabilirsin.$$, 5),
  ($$Avukatla ne kadar sürede eşleşirim?$$, $$Bu, o an talebini görebilecek uygun ve müsait bir avukat olup olmamasına bağlıdır. Kesin bir süre garanti edemeyiz; acil taleplerde avukatlara öncelikli gösterim yapılır.$$, 6),
  ($$Görüşmem iptal olursa ne olur?$$, $$Avukat bir talebi reddederse durum panelinde 'Reddedildi' olarak görünür ve dilediğin an başka bir avukata talep gönderebilir ya da genel havuza yeni bir talep açabilirsin.$$, 7),
  ($$Ödeme ve iade süreci nasıl işler?$$, $$Görüşme sonrası avukatın girdiği süreye göre ücret hesaplanır ve kayıtlı kartından tahsil edilir. İptal/iade koşulları için ilgili sayfamıza bakabilirsin.$$, 8),
  ($$Hukukim bir hukuk bürosu mudur?$$, $$Hayır. Hukukim bir hukuk bürosu değildir ve doğrudan hukuki danışmanlık sunmaz. Platform, kullanıcılar ile bağımsız avukatlar arasında iletişim kurulmasını sağlar.$$, 9),
  ($$Avukat olarak nasıl başvurabilirim?$$, $$Ana sayfadaki 'Avukat mısınız?' linkinden kayıt olabilirsin. Kayıt sırasında baro sicil numaranı girmen istenir, ekibimiz bunu doğruladıktan sonra profilin doğrulanmış rozeti kazanır.$$, 10)
) as v(soru, cevap, sira)
where not exists (select 1 from sss);

insert into mevzuat (ad, no, kabul_tarihi, url, sira)
select v.ad, v.no, v.kabul_tarihi, v.url, v.sira
from (values
  ($$Türkiye Cumhuriyeti Anayasası$$, $$2709$$, $$7.11.1982$$, $$https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=2709&MevzuatTur=1&MevzuatTertip=5$$, 1),
  ($$Türk Ceza Kanunu$$, $$5237$$, $$26.9.2004$$, $$https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=5237&MevzuatTur=1&MevzuatTertip=5$$, 2),
  ($$Türk Medeni Kanunu$$, $$4721$$, $$22.11.2001$$, $$https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=4721&MevzuatTur=1&MevzuatTertip=5$$, 3),
  ($$Türk Borçlar Kanunu$$, $$6098$$, $$11.1.2011$$, $$https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=6098&MevzuatTur=1&MevzuatTertip=5$$, 4),
  ($$İş Kanunu$$, $$4857$$, $$22.5.2003$$, $$https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=4857&MevzuatTur=1&MevzuatTertip=5$$, 5),
  ($$Tüketicinin Korunması Hakkında Kanun$$, $$6502$$, $$7.11.2013$$, $$https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=6502&MevzuatTur=1&MevzuatTertip=5$$, 6),
  ($$İcra ve İflas Kanunu$$, $$2004$$, $$9.6.1932$$, $$https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=2004&MevzuatTur=1&MevzuatTertip=3$$, 7),
  ($$Ceza Muhakemesi Kanunu$$, $$5271$$, $$4.12.2004$$, $$https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=5271&MevzuatTur=1&MevzuatTertip=5$$, 8),
  ($$Hukuk Muhakemeleri Kanunu$$, $$6100$$, $$12.1.2011$$, $$https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=6100&MevzuatTur=1&MevzuatTertip=5$$, 9)
) as v(ad, no, kabul_tarihi, url, sira)
where not exists (select 1 from mevzuat);

NOTIFY pgrst, 'reload schema';
