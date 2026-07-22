"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AdminShell from "@/components/AdminShell";
import TextField from "@/components/TextField";
import Button from "@/components/Button";
import Spinner from "@/components/Spinner";
import { IconArti, IconKalem, IconRed } from "@/components/icons";

const BOS_FORM = { ad: "", no: "", kabul_tarihi: "", url: "" };

export default function AdminMevzuat() {
  const [yukleniyor, setYukleniyor] = useState(true);
  const [liste, setListe] = useState([]);
  const [yeniForm, setYeniForm] = useState(BOS_FORM);
  const [ekleniyor, setEkleniyor] = useState(false);
  const [duzenlenenId, setDuzenlenenId] = useState(null);
  const [duzenleForm, setDuzenleForm] = useState(BOS_FORM);
  const [islemYukleniyor, setIslemYukleniyor] = useState(null);
  const [hata, setHata] = useState(null);

  async function listeyiGetir() {
    const { data } = await supabase.from("mevzuat").select("*").order("sira", { ascending: true });
    setListe(data ?? []);
    setYukleniyor(false);
  }

  useEffect(() => {
    let iptalEdildi = false;

    async function ilkYukleme() {
      const { data } = await supabase.from("mevzuat").select("*").order("sira", { ascending: true });
      if (!iptalEdildi) {
        setListe(data ?? []);
        setYukleniyor(false);
      }
    }

    ilkYukleme();
    return () => {
      iptalEdildi = true;
    };
  }, []);

  async function yeniKanunEkle(e) {
    e.preventDefault();
    setHata(null);
    setEkleniyor(true);

    const yeniSira = liste.length > 0 ? Math.max(...liste.map((k) => k.sira)) + 1 : 1;

    const { error } = await supabase.from("mevzuat").insert({ ...yeniForm, sira: yeniSira });

    if (error) {
      setHata("Eklenirken bir hata oluştu.");
      setEkleniyor(false);
      return;
    }

    setYeniForm(BOS_FORM);
    setEkleniyor(false);
    await listeyiGetir();
  }

  function duzenlemeyeBasla(kanun) {
    setDuzenlenenId(kanun.id);
    setDuzenleForm({ ad: kanun.ad, no: kanun.no, kabul_tarihi: kanun.kabul_tarihi, url: kanun.url });
  }

  async function duzenlemeKaydet(id) {
    setIslemYukleniyor(id);
    const { error } = await supabase.from("mevzuat").update(duzenleForm).eq("id", id);

    if (error) {
      setHata("Güncellenirken bir hata oluştu.");
      setIslemYukleniyor(null);
      return;
    }

    setDuzenlenenId(null);
    setIslemYukleniyor(null);
    await listeyiGetir();
  }

  async function sil(id) {
    if (!confirm("Bu kanunu silmek istediğine emin misin?")) return;
    setIslemYukleniyor(id);
    const { error } = await supabase.from("mevzuat").delete().eq("id", id);

    if (error) {
      setHata("Silinirken bir hata oluştu.");
      setIslemYukleniyor(null);
      return;
    }

    setListe((oncekiler) => oncekiler.filter((k) => k.id !== id));
    setIslemYukleniyor(null);
  }

  return (
    <AdminShell baslik="Mevzuat Yönetimi" aciklama="Mevzuat sayfasındaki kanun listesini buradan düzenle.">
      <form
        onSubmit={yeniKanunEkle}
        className="mb-6 flex flex-col gap-4 rounded-xl border border-yonetim-kenar bg-yonetim-kutu p-5"
      >
        <h2 className="text-sm font-bold text-white">Yeni Kanun Ekle</h2>
        <TextField
          label="Kanun Adı"
          id="yeni-ad"
          required
          value={yeniForm.ad}
          onChange={(e) => setYeniForm((o) => ({ ...o, ad: e.target.value }))}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            label="Kanun No"
            id="yeni-no"
            required
            value={yeniForm.no}
            onChange={(e) => setYeniForm((o) => ({ ...o, no: e.target.value }))}
          />
          <TextField
            label="Kabul Tarihi"
            id="yeni-tarih"
            required
            placeholder="gg.aa.yyyy"
            value={yeniForm.kabul_tarihi}
            onChange={(e) => setYeniForm((o) => ({ ...o, kabul_tarihi: e.target.value }))}
          />
        </div>
        <TextField
          label="mevzuat.gov.tr Linki"
          id="yeni-url"
          required
          value={yeniForm.url}
          onChange={(e) => setYeniForm((o) => ({ ...o, url: e.target.value }))}
        />
        <Button type="submit" yukleniyor={ekleniyor} className="w-auto self-start">
          <IconArti className="h-4 w-4" />
          Ekle
        </Button>
      </form>

      {hata && (
        <p className="mb-4 rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-400 ring-1 ring-red-500/20">{hata}</p>
      )}

      {yukleniyor ? (
        <Spinner className="h-6 w-6 text-vurgu" />
      ) : (
        <div className="flex flex-col gap-3">
          {liste.map((kanun) => (
            <div key={kanun.id} className="rounded-xl border border-yonetim-kenar bg-yonetim-kutu p-5">
              {duzenlenenId === kanun.id ? (
                <div className="flex flex-col gap-3">
                  <TextField
                    label="Kanun Adı"
                    id={`ad-${kanun.id}`}
                    value={duzenleForm.ad}
                    onChange={(e) => setDuzenleForm((o) => ({ ...o, ad: e.target.value }))}
                  />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <TextField
                      label="Kanun No"
                      id={`no-${kanun.id}`}
                      value={duzenleForm.no}
                      onChange={(e) => setDuzenleForm((o) => ({ ...o, no: e.target.value }))}
                    />
                    <TextField
                      label="Kabul Tarihi"
                      id={`tarih-${kanun.id}`}
                      value={duzenleForm.kabul_tarihi}
                      onChange={(e) => setDuzenleForm((o) => ({ ...o, kabul_tarihi: e.target.value }))}
                    />
                  </div>
                  <TextField
                    label="mevzuat.gov.tr Linki"
                    id={`url-${kanun.id}`}
                    value={duzenleForm.url}
                    onChange={(e) => setDuzenleForm((o) => ({ ...o, url: e.target.value }))}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => duzenlemeKaydet(kanun.id)}
                      disabled={islemYukleniyor === kanun.id}
                      className="flex items-center gap-1.5 rounded-full bg-vurgu px-4 py-2 text-xs font-bold text-yonetim disabled:opacity-60"
                    >
                      {islemYukleniyor === kanun.id && <Spinner className="h-3.5 w-3.5" />}
                      Kaydet
                    </button>
                    <button
                      onClick={() => setDuzenlenenId(null)}
                      className="rounded-full border border-yonetim-kenar px-4 py-2 text-xs font-semibold text-white/60 hover:bg-white/5"
                    >
                      Vazgeç
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-white">{kanun.ad}</p>
                    <p className="mt-1.5 text-sm text-white/60">
                      No: {kanun.no} · Kabul: {kanun.kabul_tarihi}
                    </p>
                    <a
                      href={kanun.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block text-sm text-turkuaz hover:underline"
                    >
                      {kanun.url}
                    </a>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => duzenlemeyeBasla(kanun)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-yonetim-kenar text-white/60 hover:bg-white/5"
                    >
                      <IconKalem className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => sil(kanun.id)}
                      disabled={islemYukleniyor === kanun.id}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-red-500/30 text-red-400 hover:bg-red-500/10 disabled:opacity-60"
                    >
                      {islemYukleniyor === kanun.id ? <Spinner className="h-3.5 w-3.5" /> : <IconRed className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
