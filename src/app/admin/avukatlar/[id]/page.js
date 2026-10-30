"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import AdminShell from "@/components/AdminShell";
import Avatar from "@/components/Avatar";
import DogrulamaRozeti from "@/components/DogrulamaRozeti";
import TextField from "@/components/TextField";
import Button from "@/components/Button";
import Spinner from "@/components/Spinner";
import { SEHIRLER } from "@/lib/sehirler";
import { UZMANLIK_ALANLARI } from "@/lib/uzmanlikAlanlari";
import { IconGeri, IconOnay, IconRed } from "@/components/icons";

export default function AdminAvukatDetay() {
  const { id } = useParams();
  const router = useRouter();

  const [yukleniyor, setYukleniyor] = useState(true);
  const [avukat, setAvukat] = useState(null);
  const [form, setForm] = useState(null);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [hata, setHata] = useState(null);
  const [basari, setBasari] = useState(null);
  const [belgeLinkleri, setBelgeLinkleri] = useState({});
  const [redNotu, setRedNotu] = useState("");

  useEffect(() => {
    let iptalEdildi = false;

    async function veriGetir() {
      const { data } = await supabase.from("avukatlar").select("*").eq("id", id).maybeSingle();
      if (iptalEdildi) return;

      if (!data) {
        router.replace("/admin/avukatlar");
        return;
      }

      setAvukat(data);
      setForm({
        ad_soyad: data.ad_soyad ?? "",
        telefon: data.telefon ?? "",
        sehir: data.sehir ?? "",
        baro_sicil_no: data.baro_sicil_no ?? "",
        biyografi: data.biyografi ?? "",
        uzmanlik_alanlari: data.uzmanlik_alanlari ?? [],
      });
      setYukleniyor(false);
    }

    veriGetir();
    return () => {
      iptalEdildi = true;
    };
  }, [id, router]);

  function alanGuncelle(alan, deger) {
    setForm((onceki) => ({ ...onceki, [alan]: deger }));
  }

  function uzmanlikDegistir(alan) {
    setForm((onceki) => ({
      ...onceki,
      uzmanlik_alanlari: onceki.uzmanlik_alanlari.includes(alan)
        ? onceki.uzmanlik_alanlari.filter((a) => a !== alan)
        : [...onceki.uzmanlik_alanlari, alan],
    }));
  }

  async function kaydet(e) {
    e.preventDefault();
    setHata(null);
    setBasari(null);
    setKaydediliyor(true);

    const { error } = await supabase.from("avukatlar").update(form).eq("id", id);

    if (error) {
      setHata("Kaydedilirken bir hata oluştu.");
      setKaydediliyor(false);
      return;
    }

    setAvukat((onceki) => ({ ...onceki, ...form }));
    setBasari("Değişiklikler kaydedildi.");
    setKaydediliyor(false);
  }

  const kimlikYolu = avukat?.kimlik_belge_yolu;
  const baroKartiYolu = avukat?.baro_karti_yolu;

  useEffect(() => {
    let iptalEdildi = false;

    async function linkleriGetir() {
      const yollar = { kimlik: kimlikYolu, baro: baroKartiYolu };
      const sonuc = {};
      for (const [anahtar, yol] of Object.entries(yollar)) {
        if (!yol) continue;
        const { data } = await supabase.storage.from("avukat-belgeleri").createSignedUrl(yol, 600);
        if (data) sonuc[anahtar] = data.signedUrl;
      }
      if (!iptalEdildi) setBelgeLinkleri(sonuc);
    }

    linkleriGetir();
    return () => {
      iptalEdildi = true;
    };
  }, [kimlikYolu, baroKartiYolu]);

  async function belgeKarariVer(onay) {
    setHata(null);
    const alanlar = onay
      ? { belge_durumu: "onaylandi", belge_notu: null, dogrulanmis: true }
      : { belge_durumu: "reddedildi", belge_notu: redNotu.trim() || null, dogrulanmis: false };
    const { error } = await supabase.from("avukatlar").update(alanlar).eq("id", id);
    if (error) {
      setHata("Belge kararı kaydedilemedi.");
      return;
    }
    setAvukat((onceki) => ({ ...onceki, ...alanlar }));
    setRedNotu("");
  }

  async function belgeHatirlat() {
    setHata(null);
    setBasari(null);
    const { data: oturum } = await supabase.auth.getSession();
    const yanit = await fetch("/api/admin/belge-hatirlat", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${oturum.session?.access_token ?? ""}` },
      body: JSON.stringify({ avukatId: id }),
    }).catch(() => null);
    const sonuc = await yanit?.json().catch(() => ({}));
    if (!yanit?.ok) {
      setHata(sonuc?.hata ?? "Hatırlatma e-postası gönderilemedi.");
      return;
    }
    setBasari(`Hatırlatma e-postası ${avukat.email} adresine gönderildi. Teslim durumunu Gönderilen E-postalar sayfasından izleyebilirsiniz.`);
  }

  async function dogrulamaDegistir() {
    setHata(null);

    // Veritabanı da bunu zorunlu kılar: belge onaylanmadan avukat doğrulanamaz.
    if (!avukat.dogrulanmis && (avukat.belge_durumu !== "onaylandi" || !avukat.kimlik_belge_yolu || !avukat.baro_karti_yolu)) {
      setHata("Kimlik ve baro kartı yüklenip onaylanmadan avukat doğrulanamaz. Aşağıdaki Kimlik Belgeleri bölümünden belgeleri inceleyip onaylayın.");
      return;
    }
    const { error } = await supabase.from("avukatlar").update({ dogrulanmis: !avukat.dogrulanmis }).eq("id", id);
    if (error) {
      setHata("Doğrulama durumu güncellenirken bir hata oluştu.");
      return;
    }
    setAvukat((onceki) => ({ ...onceki, dogrulanmis: !onceki.dogrulanmis }));
  }

  if (yukleniyor) {
    return (
      <AdminShell baslik="Avukat Detayı">
        <Spinner className="h-6 w-6 text-vurgu" />
      </AdminShell>
    );
  }

  return (
    <AdminShell baslik={avukat.ad_soyad} aciklama={avukat.email}>
      <Link href="/admin/avukatlar" className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-white/50 hover:text-white">
        <IconGeri className="h-4 w-4" />
        Avukatlara Dön
      </Link>

      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl border border-yonetim-kenar bg-yonetim-kutu p-5">
        <Avatar adSoyad={avukat.ad_soyad} fotografUrl={avukat.profil_fotografi_url} boyut="lg" dogrulanmis={avukat.dogrulanmis} />
        <div className="flex-1">
          <p className="font-bold text-white">{avukat.ad_soyad}</p>
          <p className="text-sm text-white/50">{avukat.email}</p>
          <div className="mt-1.5">
            <DogrulamaRozeti dogrulanmis={avukat.dogrulanmis} />
          </div>
        </div>
        <button
          onClick={dogrulamaDegistir}
          className={
            avukat.dogrulanmis
              ? "flex items-center gap-1.5 rounded-full border border-yonetim-kenar px-4 py-2 text-sm font-semibold text-white/60 transition hover:bg-white/5"
              : "flex items-center gap-1.5 rounded-full bg-vurgu px-4 py-2 text-sm font-bold text-yonetim transition hover:opacity-90"
          }
        >
          {avukat.dogrulanmis ? <IconRed className="h-4 w-4" /> : <IconOnay className="h-4 w-4" />}
          {avukat.dogrulanmis ? "Doğrulamayı Kaldır" : "Doğrula"}
        </button>
      </div>

      <section className="mb-6 max-w-2xl rounded-xl border border-yonetim-kenar bg-yonetim-kutu p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-white">Kimlik Belgeleri</h2>
          <span className="text-xs font-semibold text-white/60">
            Durum: {{ yok: "Yüklenmedi", incelemede: "İncelemede", onaylandi: "Onaylandı", reddedildi: "Reddedildi" }[avukat.belge_durumu ?? "yok"]}          </span>
        </div>

        {avukat.kimlik_belge_yolu || avukat.baro_karti_yolu ? (
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            {belgeLinkleri.kimlik && (
              <a href={belgeLinkleri.kimlik} target="_blank" rel="noreferrer" className="font-semibold text-vurgu underline">
                Kimliği aç
              </a>
            )}
            {belgeLinkleri.baro && (
              <a href={belgeLinkleri.baro} target="_blank" rel="noreferrer" className="font-semibold text-vurgu underline">
                Baro kartını aç
              </a>
            )}
          </div>
        ) : (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <p className="text-sm text-white/50">Henüz belge yüklenmedi.</p>
            <button
              onClick={belgeHatirlat}
              className="rounded-full bg-vurgu px-4 py-1.5 text-xs font-bold text-yonetim transition hover:opacity-90"
            >
              Belge hatırlatma e-postası gönder
            </button>
          </div>
        )}

        {avukat.belge_durumu === "incelemede" && (
          <div className="mt-4 flex flex-col gap-3 border-t border-yonetim-kenar pt-4">
            <p className="text-xs text-white/50">
              Kimlikteki ad soyadı, baro kartındaki sicil no ({avukat.baro_sicil_no}) ve profil bilgileriyle eşleştir.
            </p>
            <input
              value={redNotu}
              onChange={(e) => setRedNotu(e.target.value)}
              placeholder="Ret gerekçesi (avukata gösterilir)"
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-vurgu"
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => belgeKarariVer(true)}
                className="rounded-md bg-vurgu px-4 py-2 text-sm font-bold text-yonetim hover:opacity-90"
              >
                Onayla ve Doğrula
              </button>
              <button
                type="button"
                onClick={() => belgeKarariVer(false)}
                className="rounded-md border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/10"
              >
                Reddet
              </button>
            </div>
          </div>
        )}
      </section>

      <form onSubmit={kaydet} className="flex max-w-2xl flex-col gap-5 rounded-xl border border-yonetim-kenar bg-yonetim-kutu p-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <TextField
            label="Ad Soyad"
            id="ad_soyad"
            value={form.ad_soyad}
            onChange={(e) => alanGuncelle("ad_soyad", e.target.value)}
          />
          <TextField
            label="Telefon"
            id="telefon"
            value={form.telefon}
            onChange={(e) => alanGuncelle("telefon", e.target.value)}
          />
          <TextField label="Şehir" id="sehir" as="select" value={form.sehir} onChange={(e) => alanGuncelle("sehir", e.target.value)}>
            <option value="" disabled>
              Şehir seç
            </option>
            {SEHIRLER.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </TextField>
          <TextField
            label="Baro Sicil No"
            id="baro_sicil_no"
            value={form.baro_sicil_no}
            onChange={(e) => alanGuncelle("baro_sicil_no", e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-white">Uzmanlık Alanları</span>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg border border-yonetim-kenar p-4 sm:grid-cols-3">
            {UZMANLIK_ALANLARI.map((alan) => (
              <label key={alan} className="flex items-center gap-2 text-sm text-white/70">
                <input
                  type="checkbox"
                  checked={form.uzmanlik_alanlari.includes(alan)}
                  onChange={() => uzmanlikDegistir(alan)}
                  className="h-4 w-4 shrink-0 rounded border-white/20 bg-white/5 text-vurgu focus:ring-vurgu/40"
                />
                {alan}
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <TextField
            label="Biyografi"
            id="biyografi"
            as="textarea"
            rows={4}
            minLength={100}
            value={form.biyografi}
            onChange={(e) => alanGuncelle("biyografi", e.target.value)}
          />
          <p className={`text-xs ${form.biyografi.length < 100 ? "text-white/40" : "text-vurgu"}`}>
            En az 100 karakter önerilir · şu an {form.biyografi.length}
          </p>
        </div>

        {hata && (
          <p className="rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-400 ring-1 ring-red-500/20">{hata}</p>
        )}
        {basari && (
          <p className="rounded-lg bg-green-500/10 px-4 py-2.5 text-sm text-green-400 ring-1 ring-green-500/20">{basari}</p>
        )}

        <Button type="submit" yukleniyor={kaydediliyor} className="w-auto self-start">
          Değişiklikleri Kaydet
        </Button>
      </form>
    </AdminShell>
  );
}
