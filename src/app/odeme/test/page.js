"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AdminShell from "@/components/AdminShell";
import TextField from "@/components/TextField";
import Button from "@/components/Button";

export default function OdemeTest() {
  const [form, setForm] = useState({ adSoyad: "", email: "", telefon: "", tutar: "1" });
  const [token, setToken] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState(null);

  function alanGuncelle(alan, deger) {
    setForm((onceki) => ({ ...onceki, [alan]: deger }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setHata(null);
    setYukleniyor(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const yanit = await fetch("/api/odeme/baslat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify(form),
    });
    const sonuc = await yanit.json();

    if (!yanit.ok) {
      setHata(sonuc.hata ?? "Ödeme başlatılamadı.");
      setYukleniyor(false);
      return;
    }

    setToken(sonuc.token);
    setYukleniyor(false);
  }

  return (
    <AdminShell baslik="PayTR Test Ödemesi" aciklama="Gerçek bir tahsilat yapmaz, entegrasyonu doğrulamak içindir.">
      {!token ? (
        <form onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-5 rounded-2xl border border-yonetim-kenar bg-yonetim-kutu p-6">
          <TextField
            label="Ad Soyad"
            id="adSoyad"
            required
            value={form.adSoyad}
            onChange={(e) => alanGuncelle("adSoyad", e.target.value)}
            placeholder="Test Kullanıcı"
          />
          <TextField
            label="E-posta"
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => alanGuncelle("email", e.target.value)}
            placeholder="test@ornek.com"
          />
          <TextField
            label="Telefon"
            id="telefon"
            type="tel"
            required
            value={form.telefon}
            onChange={(e) => alanGuncelle("telefon", e.target.value)}
            placeholder="05XX XXX XX XX"
          />
          <TextField
            label="Tutar (TL)"
            id="tutar"
            type="number"
            min="1"
            step="0.01"
            required
            value={form.tutar}
            onChange={(e) => alanGuncelle("tutar", e.target.value)}
          />

          {hata && (
            <p className="rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-400 ring-1 ring-red-500/20">{hata}</p>
          )}

          <Button type="submit" yukleniyor={yukleniyor}>
            Test Ödemesi Başlat
          </Button>
        </form>
      ) : (
        <div className="max-w-lg overflow-hidden rounded-2xl border border-yonetim-kenar bg-white">
          <iframe
            src={`https://www.paytr.com/odeme/guvenli/${token}`}
            title="PayTR Ödeme"
            style={{ width: "100%", height: "640px", border: "none" }}
          />
        </div>
      )}
    </AdminShell>
  );
}
