"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AdminShell from "@/components/AdminShell";
import Avatar from "@/components/Avatar";
import Spinner from "@/components/Spinner";
import { IconArti, IconRed } from "@/components/icons";

export default function AdminYoneticiler() {
  const [yukleniyor, setYukleniyor] = useState(true);
  const [yoneticiler, setYoneticiler] = useState([]);
  const [benimId, setBenimId] = useState(null);
  const [email, setEmail] = useState("");
  const [ekleniyor, setEkleniyor] = useState(false);
  const [islemYukleniyor, setIslemYukleniyor] = useState(null);
  const [hata, setHata] = useState(null);
  const [basari, setBasari] = useState(null);

  async function listeyiGetir() {
    const { data } = await supabase.from("yoneticiler").select("*").order("created_at", { ascending: true });
    setYoneticiler(data ?? []);
  }

  useEffect(() => {
    let iptalEdildi = false;

    async function veriGetir() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!iptalEdildi) setBenimId(user?.id ?? null);

      const { data } = await supabase.from("yoneticiler").select("*").order("created_at", { ascending: true });
      if (!iptalEdildi) {
        setYoneticiler(data ?? []);
        setYukleniyor(false);
      }
    }

    veriGetir();
    return () => {
      iptalEdildi = true;
    };
  }, []);

  async function yetkiliIstek(url, method, govde) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const yanit = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify(govde),
    });

    const sonuc = await yanit.json();
    return { tamam: yanit.ok, sonuc };
  }

  async function yoneticiEkle(e) {
    e.preventDefault();
    setHata(null);
    setBasari(null);
    setEkleniyor(true);

    const { tamam, sonuc } = await yetkiliIstek("/api/admin/yoneticiler", "POST", { email });

    if (!tamam) {
      setHata(sonuc.hata ?? "Yönetici eklenirken bir hata oluştu.");
      setEkleniyor(false);
      return;
    }

    setEmail("");
    setBasari("Yönetici başarıyla eklendi.");
    await listeyiGetir();
    setEkleniyor(false);
  }

  async function yoneticiKaldir(hedef) {
    if (!confirm(`${hedef.ad_soyad} adlı kişinin yönetici yetkisini kaldırmak istediğine emin misin?`)) return;

    setHata(null);
    setBasari(null);
    setIslemYukleniyor(hedef.id);

    const { tamam, sonuc } = await yetkiliIstek("/api/admin/yoneticiler", "DELETE", { id: hedef.id });

    if (!tamam) {
      setHata(sonuc.hata ?? "Yönetici kaldırılırken bir hata oluştu.");
      setIslemYukleniyor(null);
      return;
    }

    setYoneticiler((oncekiler) => oncekiler.filter((y) => y.id !== hedef.id));
    setIslemYukleniyor(null);
  }

  return (
    <AdminShell baslik="Yöneticiler" aciklama="Yönetim paneline kimlerin erişebileceğini yönet.">
      <form
        onSubmit={yoneticiEkle}
        className="mb-6 flex flex-col gap-3 rounded-xl border border-yonetim-kenar bg-yonetim-kutu p-5 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label htmlFor="yeni-yonetici-email" className="mb-1.5 block text-sm font-semibold text-white">
            Yeni Yönetici Ekle
          </label>
          <input
            id="yeni-yonetici-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Zaten kayıtlı bir avukat/müvekkil e-postası..."
            className="w-full rounded-lg border border-yonetim-kenar bg-yonetim py-2.5 px-4 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-vurgu focus:ring-2 focus:ring-vurgu/30"
          />
        </div>
        <button
          type="submit"
          disabled={ekleniyor}
          className="flex items-center justify-center gap-1.5 rounded-full bg-vurgu px-5 py-2.5 text-sm font-bold text-yonetim transition hover:opacity-90 disabled:opacity-50"
        >
          {ekleniyor ? <Spinner className="h-4 w-4" /> : <IconArti className="h-4 w-4" />}
          Ekle
        </button>
      </form>

      {hata && (
        <p className="mb-4 rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-400 ring-1 ring-red-500/20">
          {hata}
        </p>
      )}
      {basari && (
        <p className="mb-4 rounded-lg bg-green-500/10 px-4 py-2.5 text-sm text-green-400 ring-1 ring-green-500/20">
          {basari}
        </p>
      )}

      {yukleniyor ? (
        <p className="text-sm text-white/40">Yükleniyor...</p>
      ) : (
        <div className="flex flex-col gap-3">
          {yoneticiler.map((y) => (
            <div
              key={y.id}
              className="flex items-center gap-3 rounded-xl border border-yonetim-kenar bg-yonetim-kutu p-4"
            >
              <Avatar adSoyad={y.ad_soyad} boyut="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {y.ad_soyad}
                  {y.id === benimId && (
                    <span className="ml-2 rounded-full bg-vurgu/15 px-2 py-0.5 text-[10px] font-bold text-vurgu">
                      SEN
                    </span>
                  )}
                </p>
                <p className="truncate text-xs text-white/40">{y.email}</p>
              </div>
              {y.id !== benimId && (
                <button
                  onClick={() => yoneticiKaldir(y)}
                  disabled={islemYukleniyor === y.id}
                  className="flex shrink-0 items-center gap-1.5 rounded-full border border-red-500/30 px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                >
                  {islemYukleniyor === y.id ? <Spinner className="h-3.5 w-3.5" /> : <IconRed className="h-3.5 w-3.5" />}
                  Yetkiyi Kaldır
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
