"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import AdminShell from "@/components/AdminShell";
import Avatar from "@/components/Avatar";
import DogrulamaRozeti from "@/components/DogrulamaRozeti";
import Spinner from "@/components/Spinner";
import { IconArama, IconKonum, IconOnay, IconRed, IconKalem } from "@/components/icons";

export default function AdminAvukatlar() {
  const [yukleniyor, setYukleniyor] = useState(true);
  const [avukatlar, setAvukatlar] = useState([]);
  const [aramaMetni, setAramaMetni] = useState("");
  const [islemYukleniyor, setIslemYukleniyor] = useState(null);
  const [hata, setHata] = useState(null);

  useEffect(() => {
    let iptalEdildi = false;

    async function veriGetir() {
      const { data } = await supabase
        .from("avukatlar")
        .select("*")
        .order("dogrulanmis", { ascending: true })
        .order("created_at", { ascending: false });

      if (!iptalEdildi) {
        setAvukatlar(data ?? []);
        setYukleniyor(false);
      }
    }

    veriGetir();
    return () => {
      iptalEdildi = true;
    };
  }, []);

  const filtrelenmisListe = useMemo(() => {
    const arama = aramaMetni.trim().toLocaleLowerCase("tr-TR");
    if (!arama) return avukatlar;
    return avukatlar.filter((a) => {
      const metin = [a.ad_soyad, a.sehir, a.email, a.baro_sicil_no, ...(a.uzmanlik_alanlari ?? [])]
        .join(" ")
        .toLocaleLowerCase("tr-TR");
      return metin.includes(arama);
    });
  }, [avukatlar, aramaMetni]);

  async function dogrulamaDegistir(avukat) {
    setHata(null);
    setIslemYukleniyor(avukat.id);

    const { error } = await supabase
      .from("avukatlar")
      .update({ dogrulanmis: !avukat.dogrulanmis })
      .eq("id", avukat.id);

    if (error) {
      setHata("Doğrulama durumu güncellenirken bir hata oluştu.");
      setIslemYukleniyor(null);
      return;
    }

    setAvukatlar((oncekiler) =>
      oncekiler.map((a) => (a.id === avukat.id ? { ...a, dogrulanmis: !avukat.dogrulanmis } : a))
    );
    setIslemYukleniyor(null);
  }

  async function hesabiKaldir(avukat) {
    if (!confirm(`${avukat.ad_soyad} adlı avukatın profilini kaldırmak istediğine emin misin?`)) return;

    setHata(null);
    setIslemYukleniyor(avukat.id);

    const { error } = await supabase.from("avukatlar").delete().eq("id", avukat.id);

    if (error) {
      setHata("Hesap kaldırılırken bir hata oluştu.");
      setIslemYukleniyor(null);
      return;
    }

    setAvukatlar((oncekiler) => oncekiler.filter((a) => a.id !== avukat.id));
    setIslemYukleniyor(null);
  }

  return (
    <AdminShell baslik="Avukatlar" aciklama="Baro sicil doğrulamasını yönet, hesapları görüntüle.">
      <div className="relative mb-5 max-w-md">
        <IconArama className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          value={aramaMetni}
          onChange={(e) => setAramaMetni(e.target.value)}
          placeholder="İsim, şehir, e-posta veya baro no ara..."
          className="w-full rounded-lg border border-yonetim-kenar bg-yonetim-kutu py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-vurgu focus:ring-2 focus:ring-vurgu/30"
        />
      </div>

      {hata && (
        <p className="mb-4 rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-400 ring-1 ring-red-500/20">
          {hata}
        </p>
      )}

      {yukleniyor ? (
        <p className="text-sm text-white/40">Yükleniyor...</p>
      ) : filtrelenmisListe.length === 0 ? (
        <p className="rounded-xl border border-dashed border-yonetim-kenar p-8 text-center text-sm text-white/40">
          Aramanla eşleşen avukat bulunamadı.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-yonetim-kenar">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-yonetim-kutu-acik/50">
                <tr>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-white/40">Avukat</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-white/40">Şehir</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-white/40">Baro Sicil No</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-white/40">Durum</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-white/40">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-yonetim-kenar">
                {filtrelenmisListe.map((avukat) => (
                  <tr key={avukat.id} className="bg-yonetim-kutu">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar adSoyad={avukat.ad_soyad} fotografUrl={avukat.profil_fotografi_url} boyut="sm" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">{avukat.ad_soyad}</p>
                          <p className="truncate text-xs text-white/40">{avukat.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-1 text-sm text-white/60">
                        <IconKonum className="h-3.5 w-3.5" />
                        {avukat.sehir || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-white/60">{avukat.baro_sicil_no || "—"}</td>
                    <td className="px-5 py-3.5">
                      <DogrulamaRozeti dogrulanmis={avukat.dogrulanmis} />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/avukatlar/${avukat.id}`}
                          className="flex items-center gap-1.5 rounded-full border border-yonetim-kenar px-3 py-1.5 text-xs font-semibold text-white/60 transition hover:bg-white/5"
                        >
                          <IconKalem className="h-3.5 w-3.5" />
                          Detay
                        </Link>
                        <button
                          onClick={() => dogrulamaDegistir(avukat)}
                          disabled={islemYukleniyor === avukat.id}
                          className={
                            avukat.dogrulanmis
                              ? "flex items-center gap-1.5 rounded-full border border-yonetim-kenar px-3 py-1.5 text-xs font-semibold text-white/60 transition hover:bg-white/5 disabled:opacity-50"
                              : "flex items-center gap-1.5 rounded-full bg-vurgu px-3 py-1.5 text-xs font-bold text-yonetim transition hover:opacity-90 disabled:opacity-50"
                          }
                        >
                          {islemYukleniyor === avukat.id ? (
                            <Spinner className="h-3.5 w-3.5" />
                          ) : avukat.dogrulanmis ? (
                            <IconRed className="h-3.5 w-3.5" />
                          ) : (
                            <IconOnay className="h-3.5 w-3.5" />
                          )}
                          {avukat.dogrulanmis ? "Doğrulamayı Kaldır" : "Doğrula"}
                        </button>
                        <button
                          onClick={() => hesabiKaldir(avukat)}
                          disabled={islemYukleniyor === avukat.id}
                          className="flex items-center gap-1.5 rounded-full border border-red-500/30 px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                        >
                          <IconRed className="h-3.5 w-3.5" />
                          Kaldır
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
