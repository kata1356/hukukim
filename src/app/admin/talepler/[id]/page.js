"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import AdminShell from "@/components/AdminShell";
import DurumRozeti from "@/components/DurumRozeti";
import TextField from "@/components/TextField";
import Button from "@/components/Button";
import Spinner from "@/components/Spinner";
import { GORUSME_SEKILLERI } from "@/lib/gorusmeSekli";
import { IconGeri, IconYildirim } from "@/components/icons";

export default function AdminTalepDetay() {
  const { id } = useParams();
  const router = useRouter();

  const [yukleniyor, setYukleniyor] = useState(true);
  const [talep, setTalep] = useState(null);
  const [form, setForm] = useState(null);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [hata, setHata] = useState(null);
  const [basari, setBasari] = useState(null);

  useEffect(() => {
    let iptalEdildi = false;

    async function veriGetir() {
      const { data } = await supabase
        .from("randevu_talepleri")
        .select("*, avukatlar(ad_soyad, email)")
        .eq("id", id)
        .maybeSingle();
      if (iptalEdildi) return;

      if (!data) {
        router.replace("/admin/talepler");
        return;
      }

      setTalep(data);
      setForm({
        konu: data.konu ?? "",
        aciklama: data.aciklama ?? "",
        gorusme_sekli: data.gorusme_sekli ?? "goruntulu",
        tarih: data.tarih ?? "",
        durum: data.durum ?? "bekliyor",
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

  async function kaydet(e) {
    e.preventDefault();
    setHata(null);
    setBasari(null);
    setKaydediliyor(true);

    const { error } = await supabase.from("randevu_talepleri").update(form).eq("id", id);

    if (error) {
      setHata("Kaydedilirken bir hata oluştu.");
      setKaydediliyor(false);
      return;
    }

    setTalep((onceki) => ({ ...onceki, ...form }));
    setBasari("Değişiklikler kaydedildi.");
    setKaydediliyor(false);
  }

  if (yukleniyor) {
    return (
      <AdminShell baslik="Talep Detayı">
        <Spinner className="h-6 w-6 text-vurgu" />
      </AdminShell>
    );
  }

  return (
    <AdminShell baslik={talep.konu || talep.hedef_uzmanlik_alani} aciklama={`Müvekkil: ${talep.muvekkil_ad_soyad}`}>
      <Link href="/admin/talepler" className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-white/50 hover:text-white">
        <IconGeri className="h-4 w-4" />
        Taleplere Dön
      </Link>

      <div className="mb-6 grid grid-cols-1 gap-4 rounded-xl border border-yonetim-kenar bg-yonetim-kutu p-5 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-white/40">Müvekkil</p>
          <p className="mt-1 text-sm text-white">{talep.muvekkil_ad_soyad}</p>
          <p className="text-xs text-white/40">{talep.muvekkil_telefon}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-white/40">Avukat</p>
          <p className="mt-1 text-sm text-white">{talep.avukatlar?.ad_soyad ?? "Henüz atanmadı"}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-white/40">Tür</p>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-white">
            {talep.tur === "genel" ? "Genel Havuz" : "Direkt"}
            {talep.acil && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">
                <IconYildirim className="h-3 w-3" />
                ACİL
              </span>
            )}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-white/40">Hedef</p>
          <p className="mt-1 text-sm text-white">{talep.hedef_sehir || "—"} · {talep.hedef_uzmanlik_alani || "—"}</p>
        </div>
      </div>

      <form onSubmit={kaydet} className="flex max-w-2xl flex-col gap-5 rounded-xl border border-yonetim-kenar bg-yonetim-kutu p-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-white">Durum</span>
          <DurumRozeti durum={form.durum} />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {["bekliyor", "kabul", "red"].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => alanGuncelle("durum", d)}
              className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                form.durum === d ? "bg-vurgu text-yonetim" : "border border-yonetim-kenar text-white/60 hover:bg-white/5"
              }`}
            >
              {d === "bekliyor" ? "Bekliyor" : d === "kabul" ? "Kabul Edildi" : "Reddedildi"}
            </button>
          ))}
        </div>

        <TextField label="Konu" id="konu" value={form.konu} onChange={(e) => alanGuncelle("konu", e.target.value)} />

        <TextField
          label="Açıklama"
          id="aciklama"
          as="textarea"
          rows={4}
          value={form.aciklama}
          onChange={(e) => alanGuncelle("aciklama", e.target.value)}
        />

        <TextField
          label="Görüşme Şekli"
          id="gorusme_sekli"
          as="select"
          value={form.gorusme_sekli}
          onChange={(e) => alanGuncelle("gorusme_sekli", e.target.value)}
        >
          {GORUSME_SEKILLERI.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </TextField>

        <TextField
          label="Tarih"
          id="tarih"
          type="date"
          value={form.tarih}
          onChange={(e) => alanGuncelle("tarih", e.target.value)}
        />

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
