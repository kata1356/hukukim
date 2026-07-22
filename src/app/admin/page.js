"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import AdminShell from "@/components/AdminShell";
import Avatar from "@/components/Avatar";
import { TABLO_ADLARI, kimlikOzeti, degisenAlanlar } from "@/lib/denetim";
import {
  IconGrup,
  IconTerazi,
  IconSaat,
  IconOnay,
  IconRed,
  IconYildirim,
  IconYayin,
  IconKalem,
  IconOk,
} from "@/components/icons";

function zamanOnce(tarih) {
  const saniyeFarki = Math.max(0, (Date.now() - new Date(tarih).getTime()) / 1000);
  if (saniyeFarki < 60) return "az önce";
  const dakika = Math.floor(saniyeFarki / 60);
  if (dakika < 60) return `${dakika} dakika önce`;
  const saat = Math.floor(dakika / 60);
  if (saat < 24) return `${saat} saat önce`;
  const gun = Math.floor(saat / 24);
  return `${gun} gün önce`;
}

function KpiKarti({ deger, etiket, Icon, ton = "notr" }) {
  const tonSiniflari = {
    notr: "text-vurgu bg-vurgu/10",
    kritik: "text-amber-400 bg-amber-500/10",
    acil: "text-red-400 bg-red-500/10",
    olumlu: "text-green-400 bg-green-500/10",
  };

  return (
    <div className="rounded-xl border border-yonetim-kenar bg-yonetim-kutu p-4">
      <span className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg ${tonSiniflari[ton]}`}>
        <Icon className="h-4 w-4" />
      </span>
      <p className="text-xs font-semibold uppercase tracking-wide text-white/40">{etiket}</p>
      <p className="mt-1 text-2xl font-extrabold text-white">{deger}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [yukleniyor, setYukleniyor] = useState(true);
  const [istatistik, setIstatistik] = useState(null);
  const [grafik, setGrafik] = useState([]);
  const [aktiviteler, setAktiviteler] = useState([]);
  const [dogrulamaBekleyenler, setDogrulamaBekleyenler] = useState([]);

  useEffect(() => {
    let iptalEdildi = false;

    async function veriGetir() {
      const onDortGunOnce = new Date();
      onDortGunOnce.setDate(onDortGunOnce.getDate() - 13);
      onDortGunOnce.setHours(0, 0, 0, 0);

      const bugunBaslangic = new Date();
      bugunBaslangic.setHours(0, 0, 0, 0);

      const [
        { count: avukatSayisi },
        { count: dogrulanmamisSayisi },
        { count: muvekkilSayisi },
        { count: bekleyenTalepSayisi },
        { count: kabulTalepSayisi },
        { count: redTalepSayisi },
        { count: bugunkuTalepSayisi },
        { count: acilTalepSayisi },
        { data: bekleyenAvukatlar },
        { data: sonAvukatlar },
        { data: sonMuvekkiller },
        { data: sonTalepler },
        { data: sonDenetimler },
        { data: grafikTalepleri },
      ] = await Promise.all([
        supabase.from("avukatlar").select("*", { count: "exact", head: true }),
        supabase.from("avukatlar").select("*", { count: "exact", head: true }).eq("dogrulanmis", false),
        supabase.from("muvekkiller").select("*", { count: "exact", head: true }),
        supabase.from("randevu_talepleri").select("*", { count: "exact", head: true }).eq("durum", "bekliyor"),
        supabase.from("randevu_talepleri").select("*", { count: "exact", head: true }).eq("durum", "kabul"),
        supabase.from("randevu_talepleri").select("*", { count: "exact", head: true }).eq("durum", "red"),
        supabase.from("randevu_talepleri").select("*", { count: "exact", head: true }).gte("created_at", bugunBaslangic.toISOString()),
        supabase.from("randevu_talepleri").select("*", { count: "exact", head: true }).eq("acil", true).eq("durum", "bekliyor"),
        supabase.from("avukatlar").select("*").eq("dogrulanmis", false).order("created_at", { ascending: false }).limit(6),
        supabase.from("avukatlar").select("id, ad_soyad, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("muvekkiller").select("id, ad_soyad, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("randevu_talepleri").select("id, konu, hedef_uzmanlik_alani, muvekkil_ad_soyad, acil, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("denetim_kayitlari").select("*").order("created_at", { ascending: false }).limit(8),
        supabase.from("randevu_talepleri").select("created_at").gte("created_at", onDortGunOnce.toISOString()),
      ]);

      if (iptalEdildi) return;

      setIstatistik({
        avukatSayisi: avukatSayisi ?? 0,
        dogrulanmamisSayisi: dogrulanmamisSayisi ?? 0,
        muvekkilSayisi: muvekkilSayisi ?? 0,
        bekleyenTalepSayisi: bekleyenTalepSayisi ?? 0,
        kabulTalepSayisi: kabulTalepSayisi ?? 0,
        redTalepSayisi: redTalepSayisi ?? 0,
        bugunkuTalepSayisi: bugunkuTalepSayisi ?? 0,
        acilTalepSayisi: acilTalepSayisi ?? 0,
      });

      setDogrulamaBekleyenler(bekleyenAvukatlar ?? []);

      const gunler = [];
      for (let i = 0; i < 14; i++) {
        const gun = new Date(onDortGunOnce);
        gun.setDate(gun.getDate() + i);
        gunler.push({ anahtar: gun.toISOString().slice(0, 10), etiket: gun.toLocaleDateString("tr-TR", { day: "numeric", month: "short" }), sayi: 0 });
      }
      (grafikTalepleri ?? []).forEach((t) => {
        const anahtar = t.created_at.slice(0, 10);
        const gun = gunler.find((g) => g.anahtar === anahtar);
        if (gun) gun.sayi += 1;
      });
      setGrafik(gunler);

      const akisOgeleri = [
        ...(sonAvukatlar ?? []).map((a) => ({
          zaman: a.created_at,
          Icon: IconTerazi,
          baslik: `Yeni avukat başvurusu: ${a.ad_soyad}`,
          altBaslik: "Onay bekliyor",
        })),
        ...(sonMuvekkiller ?? []).map((m) => ({
          zaman: m.created_at,
          Icon: IconGrup,
          baslik: `Yeni müvekkil kaydı: ${m.ad_soyad}`,
          altBaslik: "Kayıt tamamlandı",
        })),
        ...(sonTalepler ?? []).map((t) => ({
          zaman: t.created_at,
          Icon: t.acil ? IconYildirim : IconYayin,
          baslik: `Yeni talep: ${t.konu || t.hedef_uzmanlik_alani}`,
          altBaslik: `${t.muvekkil_ad_soyad}${t.acil ? " · Acil" : ""}`,
        })),
        ...(sonDenetimler ?? []).map((d) => {
          const kimlik =
            d.islem === "sil" ? kimlikOzeti(d.onceki_veri, d.hedef_tablo) : kimlikOzeti(d.yeni_veri, d.hedef_tablo);
          const degisimSayisi = d.islem === "guncelle" ? degisenAlanlar(d.onceki_veri, d.yeni_veri).length : 0;
          const islemEtiketi = d.islem === "ekle" ? "eklendi" : d.islem === "sil" ? "silindi" : "güncellendi";
          return {
            zaman: d.created_at,
            Icon: IconKalem,
            baslik: `${TABLO_ADLARI[d.hedef_tablo] ?? d.hedef_tablo}${kimlik ? ` · ${kimlik}` : ""} ${islemEtiketi}`,
            altBaslik: `${d.yonetici_adi}${degisimSayisi ? ` · ${degisimSayisi} alan değişti` : ""}`,
          };
        }),
      ]
        .sort((a, b) => new Date(b.zaman) - new Date(a.zaman))
        .slice(0, 8);

      setAktiviteler(akisOgeleri);
      setYukleniyor(false);
    }

    veriGetir();
    return () => {
      iptalEdildi = true;
    };
  }, []);

  if (yukleniyor) {
    return (
      <AdminShell baslik="Panel" aciklama="Platformun genel durumuna hızlı bakış.">
        <p className="text-sm text-white/40">Yükleniyor...</p>
      </AdminShell>
    );
  }

  const grafikMax = Math.max(1, ...grafik.map((g) => g.sayi));

  return (
    <AdminShell baslik="Panel" aciklama="Platformun genel durumuna hızlı bakış.">
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
          <KpiKarti deger={istatistik.muvekkilSayisi} etiket="Toplam Müvekkil" Icon={IconGrup} />
          <KpiKarti deger={istatistik.avukatSayisi} etiket="Toplam Avukat" Icon={IconTerazi} />
          <KpiKarti
            deger={istatistik.dogrulanmamisSayisi}
            etiket="Doğrulama Bekleyen"
            Icon={IconSaat}
            ton={istatistik.dogrulanmamisSayisi > 0 ? "kritik" : "notr"}
          />
          <KpiKarti
            deger={istatistik.acilTalepSayisi}
            etiket="Acil Bekleyen Talep"
            Icon={IconYildirim}
            ton={istatistik.acilTalepSayisi > 0 ? "acil" : "notr"}
          />
          <KpiKarti deger={istatistik.bekleyenTalepSayisi} etiket="Bekleyen Talep" Icon={IconYayin} />
          <KpiKarti deger={istatistik.kabulTalepSayisi} etiket="Kabul Edilen Talep" Icon={IconOnay} ton="olumlu" />
          <KpiKarti deger={istatistik.redTalepSayisi} etiket="Reddedilen Talep" Icon={IconRed} />
          <KpiKarti deger={istatistik.bugunkuTalepSayisi} etiket="Bugün Gelen Talep" Icon={IconOk} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="rounded-2xl border border-yonetim-kenar bg-yonetim-kutu p-6 lg:col-span-8">
            <h2 className="font-bold text-white">Son 14 Günlük Talep Hacmi</h2>
            <p className="text-sm text-white/40">Günlük gönderilen randevu talebi sayısı.</p>

            <div className="mt-6 flex h-52 items-end justify-between gap-1.5">
              {grafik.map((gun) => (
                <div key={gun.anahtar} className="group relative flex flex-1 flex-col items-center">
                  {gun.sayi > 0 && (
                    <span className="mb-1 text-[10px] font-bold text-white/50 opacity-0 transition group-hover:opacity-100">
                      {gun.sayi}
                    </span>
                  )}
                  <div
                    className="w-full rounded-t bg-vurgu/70 transition group-hover:bg-vurgu"
                    style={{ height: `${Math.max(4, (gun.sayi / grafikMax) * 100)}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[10px] font-semibold uppercase tracking-wide text-white/30">
              <span>{grafik[0]?.etiket}</span>
              <span>{grafik[Math.floor(grafik.length / 2)]?.etiket}</span>
              <span>Bugün</span>
            </div>
          </div>

          <div className="flex flex-col rounded-2xl border border-yonetim-kenar bg-yonetim-kutu lg:col-span-4">
            <div className="border-b border-yonetim-kenar p-5">
              <h2 className="font-bold text-white">Sistemde Neler Oluyor?</h2>
            </div>
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5" style={{ maxHeight: "22rem" }}>
              {aktiviteler.length === 0 ? (
                <p className="text-sm text-white/40">Henüz bir aktivite yok.</p>
              ) : (
                aktiviteler.map((a, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-vurgu/10 text-vurgu">
                      <a.Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm text-white">{a.baslik}</p>
                      <p className="truncate text-xs text-white/40">
                        {zamanOnce(a.zaman)} · {a.altBaslik}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-yonetim-kenar bg-yonetim-kutu">
          <div className="flex items-center justify-between border-b border-yonetim-kenar p-5">
            <h2 className="font-bold text-white">Doğrulama Bekleyen Avukatlar</h2>
            <Link href="/admin/avukatlar" className="text-xs font-semibold text-vurgu hover:underline">
              Tümünü Gör
            </Link>
          </div>

          {dogrulamaBekleyenler.length === 0 ? (
            <p className="flex items-center gap-2 p-5 text-sm text-white/40">
              <IconOk className="h-4 w-4" />
              Bekleyen doğrulama yok.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-yonetim-kutu-acik/50">
                  <tr>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-white/40">Avukat</th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-white/40">Şehir</th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-white/40">Kayıt Tarihi</th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-white/40">Durum</th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-white/40">Aksiyon</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-yonetim-kenar">
                  {dogrulamaBekleyenler.map((avukat) => (
                    <tr key={avukat.id}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar adSoyad={avukat.ad_soyad} fotografUrl={avukat.profil_fotografi_url} boyut="sm" />
                          <span className="text-sm font-semibold text-white">{avukat.ad_soyad}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-white/60">{avukat.sehir || "—"}</td>
                      <td className="px-5 py-3.5 text-sm text-white/60">
                        {new Date(avukat.created_at).toLocaleDateString("tr-TR")}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-400">
                          İncelemede
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <Link href={`/admin/avukatlar/${avukat.id}`} className="text-xs font-bold text-vurgu hover:underline">
                          Detay
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
