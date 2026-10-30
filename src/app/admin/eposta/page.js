"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AdminShell from "@/components/AdminShell";
import Spinner from "@/components/Spinner";

const TURLER = {
  belge_hatirlat: "Belge hatırlatma",
  destek_yanit: "Destek yanıtı",
  destek_takip: "Destek takibi",
  admin_bildirim: "Yönetici bildirimi",
  talep_bildirimi: "Talep bildirimi",
  diger: "Diğer",
};

const TESLIM = {
  delivered: { etiket: "Teslim edildi", sinif: "text-green-400" },
  opened: { etiket: "Açıldı", sinif: "text-green-400" },
  clicked: { etiket: "Tıklandı", sinif: "text-green-400" },
  sent: { etiket: "Gönderildi, teslim bekleniyor", sinif: "text-amber-400" },
  delivery_delayed: { etiket: "Teslimat gecikti", sinif: "text-amber-400" },
  bounced: { etiket: "Geri döndü (adres hatalı olabilir)", sinif: "text-red-400" },
  complained: { etiket: "Spam olarak işaretlendi", sinif: "text-red-400" },
};

function zaman(iso) {
  return new Date(iso).toLocaleString("tr-TR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default function AdminEposta() {
  const [yukleniyor, setYukleniyor] = useState(true);
  const [kayitlar, setKayitlar] = useState([]);
  const [tabloYok, setTabloYok] = useState(false);
  const [kontrolEdiliyor, setKontrolEdiliyor] = useState(false);
  const [hata, setHata] = useState(null);

  const yukle = useCallback(async () => {
    const { data, error } = await supabase
      .from("eposta_kayitlari")
      .select("id, alici_email, tur, konu, durum, resend_id, teslim_durumu, hata, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) {
      setTabloYok(true);
    } else {
      setKayitlar(data ?? []);
    }
    setYukleniyor(false);
  }, []);

  useEffect(() => {
    yukle();
  }, [yukle]);

  async function teslimKontrol() {
    setHata(null);
    setKontrolEdiliyor(true);
    const idler = kayitlar
      .filter((k) => k.resend_id && k.teslim_durumu !== "delivered" && k.teslim_durumu !== "bounced")
      .slice(0, 30)
      .map((k) => k.id);
    if (idler.length === 0) {
      setKontrolEdiliyor(false);
      return;
    }
    const { data: oturum } = await supabase.auth.getSession();
    const yanit = await fetch("/api/admin/eposta-durum", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${oturum.session?.access_token ?? ""}` },
      body: JSON.stringify({ idler }),
    }).catch(() => null);
    const sonuc = await yanit?.json().catch(() => ({}));
    setKontrolEdiliyor(false);
    if (!yanit?.ok) {
      setHata(sonuc?.hata ?? "Teslim durumu alınamadı.");
      return;
    }
    await yukle();
  }

  return (
    <AdminShell baslik="Gönderilen E-postalar" aciklama="Sistemin gönderdiği son 200 e-posta: kime, ne zaman, teslim edildi mi.">
      {yukleniyor ? (
        <Spinner className="h-6 w-6 text-vurgu" />
      ) : tabloYok ? (
        <p className="rounded-xl border border-dashed border-yonetim-kenar p-8 text-center text-sm text-white/60">
          Kayıt tablosu henüz kurulmamış. supabase-eposta-kayit.sql dosyasını SQL Editor'de çalıştırın.
        </p>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <button
              onClick={teslimKontrol}
              disabled={kontrolEdiliyor}
              className="rounded-full bg-vurgu px-4 py-2.5 text-sm font-bold text-yonetim transition hover:opacity-90 disabled:opacity-50"
            >
              {kontrolEdiliyor ? "Kontrol ediliyor..." : "Teslim durumunu kontrol et"}
            </button>
            <p className="text-xs text-white/50">
              Teslim durumu e-posta servisinden sorulur; gönderimden birkaç dakika sonra "Teslim edildi" olur.
            </p>
          </div>
          {hata && <p className="mb-4 rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-400">{hata}</p>}

          {kayitlar.length === 0 ? (
            <p className="rounded-xl border border-dashed border-yonetim-kenar p-8 text-center text-sm text-white/40">
              Henüz kayıtlı bir e-posta yok. Bu sayfa, kayıt kurulduktan sonra gönderilen e-postaları gösterir.
            </p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-yonetim-kenar">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-yonetim-kutu-acik/50">
                    <tr>
                      {["Zaman", "Tür", "Alıcı", "Konu", "Sonuç"].map((b) => (
                        <th key={b} className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-white/40">{b}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-yonetim-kenar">
                    {kayitlar.map((k) => {
                      const teslim = TESLIM[k.teslim_durumu];
                      return (
                        <tr key={k.id} className="bg-yonetim-kutu align-top">
                          <td className="whitespace-nowrap px-4 py-3 text-xs text-white/60">{zaman(k.created_at)}</td>
                          <td className="px-4 py-3 text-xs text-white/70">{TURLER[k.tur] ?? k.tur}</td>
                          <td className="px-4 py-3 text-sm text-white">{k.alici_email}</td>
                          <td className="max-w-xs px-4 py-3 text-xs text-white/60">{k.konu}</td>
                          <td className="px-4 py-3 text-xs">
                            {k.durum === "hata" ? (
                              <span className="text-red-400">Gönderilemedi{k.hata ? `: ${k.hata}` : ""}</span>
                            ) : k.durum === "atlandi" ? (
                              <span className="text-amber-400">Gönderilmedi ({k.hata})</span>
                            ) : teslim ? (
                              <span className={teslim.sinif}>{teslim.etiket}</span>
                            ) : (
                              <span className="text-white/60">Gönderildi</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </AdminShell>
  );
}
