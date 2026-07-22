"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AdminShell from "@/components/AdminShell";
import TextField from "@/components/TextField";
import Button from "@/components/Button";
import Spinner from "@/components/Spinner";
import { IconArti, IconKalem, IconRed } from "@/components/icons";

export default function AdminSss() {
  const [yukleniyor, setYukleniyor] = useState(true);
  const [liste, setListe] = useState([]);
  const [yeniForm, setYeniForm] = useState({ soru: "", cevap: "" });
  const [ekleniyor, setEkleniyor] = useState(false);
  const [duzenlenenId, setDuzenlenenId] = useState(null);
  const [duzenleForm, setDuzenleForm] = useState({ soru: "", cevap: "" });
  const [islemYukleniyor, setIslemYukleniyor] = useState(null);
  const [hata, setHata] = useState(null);

  async function listeyiGetir() {
    const { data } = await supabase.from("sss").select("*").order("sira", { ascending: true });
    setListe(data ?? []);
    setYukleniyor(false);
  }

  useEffect(() => {
    let iptalEdildi = false;

    async function ilkYukleme() {
      const { data } = await supabase.from("sss").select("*").order("sira", { ascending: true });
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

  async function yeniSoruEkle(e) {
    e.preventDefault();
    setHata(null);
    setEkleniyor(true);

    const yeniSira = liste.length > 0 ? Math.max(...liste.map((s) => s.sira)) + 1 : 1;

    const { error } = await supabase.from("sss").insert({
      soru: yeniForm.soru,
      cevap: yeniForm.cevap,
      sira: yeniSira,
    });

    if (error) {
      setHata("Eklenirken bir hata oluştu.");
      setEkleniyor(false);
      return;
    }

    setYeniForm({ soru: "", cevap: "" });
    setEkleniyor(false);
    await listeyiGetir();
  }

  function duzenlemeyeBasla(ogeler) {
    setDuzenlenenId(ogeler.id);
    setDuzenleForm({ soru: ogeler.soru, cevap: ogeler.cevap });
  }

  async function duzenlemeKaydet(id) {
    setIslemYukleniyor(id);
    const { error } = await supabase
      .from("sss")
      .update({ soru: duzenleForm.soru, cevap: duzenleForm.cevap })
      .eq("id", id);

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
    if (!confirm("Bu soruyu silmek istediğine emin misin?")) return;
    setIslemYukleniyor(id);
    const { error } = await supabase.from("sss").delete().eq("id", id);

    if (error) {
      setHata("Silinirken bir hata oluştu.");
      setIslemYukleniyor(null);
      return;
    }

    setListe((oncekiler) => oncekiler.filter((s) => s.id !== id));
    setIslemYukleniyor(null);
  }

  return (
    <AdminShell baslik="SSS Yönetimi" aciklama="Ana sayfadaki Sıkça Sorulan Sorular bölümünü buradan düzenle.">
      <form
        onSubmit={yeniSoruEkle}
        className="mb-6 flex flex-col gap-4 rounded-xl border border-yonetim-kenar bg-yonetim-kutu p-5"
      >
        <h2 className="text-sm font-bold text-white">Yeni Soru Ekle</h2>
        <TextField
          label="Soru"
          id="yeni-soru"
          required
          value={yeniForm.soru}
          onChange={(e) => setYeniForm((o) => ({ ...o, soru: e.target.value }))}
        />
        <TextField
          label="Cevap"
          id="yeni-cevap"
          as="textarea"
          rows={3}
          required
          value={yeniForm.cevap}
          onChange={(e) => setYeniForm((o) => ({ ...o, cevap: e.target.value }))}
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
          {liste.map((ogeler) => (
            <div key={ogeler.id} className="rounded-xl border border-yonetim-kenar bg-yonetim-kutu p-5">
              {duzenlenenId === ogeler.id ? (
                <div className="flex flex-col gap-3">
                  <TextField
                    label="Soru"
                    id={`soru-${ogeler.id}`}
                    value={duzenleForm.soru}
                    onChange={(e) => setDuzenleForm((o) => ({ ...o, soru: e.target.value }))}
                  />
                  <TextField
                    label="Cevap"
                    id={`cevap-${ogeler.id}`}
                    as="textarea"
                    rows={3}
                    value={duzenleForm.cevap}
                    onChange={(e) => setDuzenleForm((o) => ({ ...o, cevap: e.target.value }))}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => duzenlemeKaydet(ogeler.id)}
                      disabled={islemYukleniyor === ogeler.id}
                      className="flex items-center gap-1.5 rounded-full bg-vurgu px-4 py-2 text-xs font-bold text-yonetim disabled:opacity-60"
                    >
                      {islemYukleniyor === ogeler.id && <Spinner className="h-3.5 w-3.5" />}
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
                    <p className="font-semibold text-white">{ogeler.soru}</p>
                    <p className="mt-1.5 text-sm text-white/60">{ogeler.cevap}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => duzenlemeyeBasla(ogeler)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-yonetim-kenar text-white/60 hover:bg-white/5"
                    >
                      <IconKalem className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => sil(ogeler.id)}
                      disabled={islemYukleniyor === ogeler.id}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-red-500/30 text-red-400 hover:bg-red-500/10 disabled:opacity-60"
                    >
                      {islemYukleniyor === ogeler.id ? <Spinner className="h-3.5 w-3.5" /> : <IconRed className="h-3.5 w-3.5" />}
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
