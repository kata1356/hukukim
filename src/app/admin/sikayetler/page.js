"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { SIKAYET_DURUMLARI, kategoriEtiketi } from "@/lib/sikayetKategorileri";
import AdminShell from "@/components/AdminShell";
import Button from "@/components/Button";

const FILTRELER = [{ deger: "hepsi", etiket: "Hepsi" }, ...SIKAYET_DURUMLARI];

const DURUM_SINIFI = {
  acik: "bg-red-500/10 text-red-400",
  incelemede: "bg-amber-500/10 text-amber-400",
  cozuldu: "bg-green-500/10 text-green-400",
  reddedildi: "bg-white/10 text-white/60",
};

function tarihSaat(tarih) {
  return new Date(tarih).toLocaleString("tr-TR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function SikayetKarti({ sikayet, onGuncellendi }) {
  const talep = sikayet.randevu_talepleri;
  const muvekkilAdi = talep?.muvekkil_ad_soyad ?? "Bilinmiyor";
  const avukatAdi = talep?.avukatlar?.ad_soyad ?? "Bilinmiyor";
  const edenAdi = sikayet.sikayet_eden_rol === "avukat" ? avukatAdi : muvekkilAdi;

  const [durum, setDurum] = useState(sikayet.durum);
  const [not, setNot] = useState(sikayet.admin_notu ?? "");
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [mesaj, setMesaj] = useState(null);

  async function kaydet() {
    setKaydediliyor(true);
    setMesaj(null);
    const { error } = await supabase
      .from("sikayetler")
      .update({ durum, admin_notu: not.trim() || null, guncellendi_at: new Date().toISOString() })
      .eq("id", sikayet.id);
    setKaydediliyor(false);
    if (error) {
      setMesaj({ tur: "hata", metin: "Kaydedilemedi." });
      return;
    }
    setMesaj({ tur: "ok", metin: "Kaydedildi." });
    onGuncellendi(sikayet.id, { durum, admin_notu: not.trim() || null });
  }

  return (
    <div className="rounded-xl border border-yonetim-kenar bg-yonetim-kutu p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-white">
            {edenAdi} <span className="text-xs font-normal text-white/40">({sikayet.sikayet_eden_rol === "avukat" ? "Avukat" : "Müvekkil"} şikayet etti)</span>
          </p>
          <p className="mt-0.5 text-xs text-white/40">{tarihSaat(sikayet.created_at)}</p>
        </div>
        <span className={`rounded-md px-2.5 py-1 text-xs font-medium ${DURUM_SINIFI[sikayet.durum]}`}>
          {SIKAYET_DURUMLARI.find((d) => d.deger === sikayet.durum)?.etiket}
        </span>
      </div>

      <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-white/40">{kategoriEtiketi(sikayet.kategori)}</p>
      <p className="mt-1.5 whitespace-pre-wrap rounded-lg bg-white/5 p-3 text-sm text-white/80">{sikayet.aciklama}</p>

      <dl className="mt-4 grid grid-cols-1 gap-3 rounded-lg bg-white/[0.03] p-3 text-xs sm:grid-cols-2">
        <div className="sm:col-span-2">
          <dt className="text-white/40">Görüşme kimliği</dt>
          <dd className="mt-0.5 break-all font-mono text-white/70">{sikayet.randevu_talep_id}</dd>
        </div>
        <div>
          <dt className="text-white/40">Müvekkil</dt>
          <dd className="mt-0.5 text-white/70">{muvekkilAdi}</dd>
        </div>
        <div>
          <dt className="text-white/40">Avukat</dt>
          <dd className="mt-0.5 text-white/70">{avukatAdi}</dd>
        </div>
        <div>
          <dt className="text-white/40">Görüşme tarihi / durumu</dt>
          <dd className="mt-0.5 text-white/70">
            {talep?.tarih ?? "—"} · {talep?.durum ?? "—"}
            {talep?.gorusme_suresi_dakika > 0 && ` · gerçek süre ${talep.gorusme_suresi_dakika} dk`}
          </dd>
        </div>
        <div>
          <dt className="text-white/40">Konu</dt>
          <dd className="mt-0.5 text-white/70">{talep?.konu || "—"}</dd>
        </div>
      </dl>

      <Link
        href={`/admin/talepler/${sikayet.randevu_talep_id}`}
        className="mt-3 inline-block text-xs font-semibold text-vurgu hover:underline"
      >
        Görüşme / talep detayını aç
      </Link>

      <div className="mt-4 flex flex-col gap-3 border-t border-yonetim-kenar pt-4">
        <div className="flex flex-wrap gap-2">
          {SIKAYET_DURUMLARI.map((d) => (
            <button
              key={d.deger}
              type="button"
              onClick={() => setDurum(d.deger)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                durum === d.deger ? "bg-vurgu text-yonetim" : "border border-yonetim-kenar text-white/60 hover:bg-white/5"
              }`}
            >
              {d.etiket}
            </button>
          ))}
        </div>
        <textarea
          value={not}
          onChange={(e) => setNot(e.target.value)}
          rows={2}
          placeholder="Yönetici notu (kullanıcıya gösterilmez)"
          className="w-full rounded-lg border border-yonetim-kenar bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-vurgu"
        />
        <div className="flex items-center gap-3">
          <Button type="button" onClick={kaydet} yukleniyor={kaydediliyor} className="w-auto">
            Kaydet
          </Button>
          {mesaj && <span className={`text-xs ${mesaj.tur === "ok" ? "text-green-400" : "text-red-400"}`}>{mesaj.metin}</span>}
        </div>
      </div>
    </div>
  );
}

export default function AdminSikayetler() {
  const [yukleniyor, setYukleniyor] = useState(true);
  const [sikayetler, setSikayetler] = useState([]);
  const [filtre, setFiltre] = useState("hepsi");
  const [hata, setHata] = useState(null);

  useEffect(() => {
    let iptalEdildi = false;

    async function veriGetir() {
      const { data, error } = await supabase
        .from("sikayetler")
        .select(
          "*, randevu_talepleri(konu, tarih, durum, gorusme_suresi_dakika, muvekkil_ad_soyad, avukatlar(ad_soyad))"
        )
        .order("created_at", { ascending: false });

      if (iptalEdildi) return;
      if (error) setHata("Şikayetler yüklenemedi. supabase-sikayet.sql dosyasını çalıştırdığından emin ol.");
      setSikayetler(data ?? []);
      setYukleniyor(false);
    }

    veriGetir();
    return () => {
      iptalEdildi = true;
    };
  }, []);

  const gorunen = useMemo(
    () => (filtre === "hepsi" ? sikayetler : sikayetler.filter((s) => s.durum === filtre)),
    [sikayetler, filtre]
  );

  function guncellendi(id, alanlar) {
    setSikayetler((onceki) => onceki.map((s) => (s.id === id ? { ...s, ...alanlar } : s)));
  }

  const acikSayisi = sikayetler.filter((s) => s.durum === "acik").length;

  return (
    <AdminShell
      baslik="Şikayetler"
      aciklama={`Müvekkil ve avukatların görüşme bazlı şikayetleri. Açık: ${acikSayisi}`}
    >
      <div className="mb-5 flex flex-wrap gap-2">
        {FILTRELER.map(({ deger, etiket }) => (
          <button
            key={deger}
            onClick={() => setFiltre(deger)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              filtre === deger ? "bg-vurgu text-yonetim" : "border border-yonetim-kenar text-white/60 hover:bg-white/5"
            }`}
          >
            {etiket}
          </button>
        ))}
      </div>

      {hata && <p className="mb-5 rounded-xl border border-red-500/30 bg-red-500/[0.04] p-4 text-sm text-red-400">{hata}</p>}

      {yukleniyor ? (
        <p className="text-sm text-white/40">Yükleniyor...</p>
      ) : gorunen.length === 0 ? (
        <p className="rounded-xl border border-dashed border-yonetim-kenar p-8 text-center text-sm text-white/40">
          Bu filtreyle eşleşen şikayet yok.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {gorunen.map((s) => (
            <SikayetKarti key={s.id} sikayet={s} onGuncellendi={guncellendi} />
          ))}
        </div>
      )}
    </AdminShell>
  );
}
