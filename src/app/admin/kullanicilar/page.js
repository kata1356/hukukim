"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import AdminShell from "@/components/AdminShell";
import Avatar from "@/components/Avatar";
import Spinner from "@/components/Spinner";
import { IconArama, IconKonum, IconTelefon, IconRed, IconKalem } from "@/components/icons";

export default function AdminKullanicilar() {
  const [yukleniyor, setYukleniyor] = useState(true);
  const [muvekkiller, setMuvekkiller] = useState([]);
  const [aramaMetni, setAramaMetni] = useState("");
  const [islemYukleniyor, setIslemYukleniyor] = useState(null);
  const [hata, setHata] = useState(null);

  useEffect(() => {
    let iptalEdildi = false;

    async function veriGetir() {
      const { data } = await supabase
        .from("muvekkiller")
        .select("*")
        .order("created_at", { ascending: false });

      if (!iptalEdildi) {
        setMuvekkiller(data ?? []);
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
    if (!arama) return muvekkiller;
    return muvekkiller.filter((m) =>
      [m.ad_soyad, m.sehir, m.email, m.telefon].join(" ").toLocaleLowerCase("tr-TR").includes(arama)
    );
  }, [muvekkiller, aramaMetni]);

  async function hesabiKaldir(muvekkil) {
    if (!confirm(`${muvekkil.ad_soyad} adlı müvekkilin hesabını kaldırmak istediğine emin misin?`)) return;

    setHata(null);
    setIslemYukleniyor(muvekkil.id);

    const { error } = await supabase.from("muvekkiller").delete().eq("id", muvekkil.id);

    if (error) {
      setHata("Hesap kaldırılırken bir hata oluştu.");
      setIslemYukleniyor(null);
      return;
    }

    setMuvekkiller((oncekiler) => oncekiler.filter((m) => m.id !== muvekkil.id));
    setIslemYukleniyor(null);
  }

  return (
    <AdminShell baslik="Kullanıcılar" aciklama="Kayıtlı müvekkilleri görüntüle ve yönet.">
      <div className="relative mb-5 max-w-md">
        <IconArama className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
        <input
          type="text"
          value={aramaMetni}
          onChange={(e) => setAramaMetni(e.target.value)}
          placeholder="İsim, şehir, e-posta veya telefon ara..."
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
          Aramanla eşleşen kullanıcı bulunamadı.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-yonetim-kenar">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-yonetim-kutu-acik/50">
                <tr>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-white/40">Müvekkil</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-white/40">Şehir</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-white/40">Telefon</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-white/40">Kayıt Tarihi</th>
                  <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-white/40">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-yonetim-kenar">
                {filtrelenmisListe.map((muvekkil) => (
                  <tr key={muvekkil.id} className="bg-yonetim-kutu">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar adSoyad={muvekkil.ad_soyad} boyut="sm" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">{muvekkil.ad_soyad}</p>
                          <p className="truncate text-xs text-white/40">{muvekkil.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-1 text-sm text-white/60">
                        <IconKonum className="h-3.5 w-3.5" />
                        {muvekkil.sehir || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-1 text-sm text-white/60">
                        <IconTelefon className="h-3.5 w-3.5" />
                        {muvekkil.telefon || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-white/60">
                      {new Date(muvekkil.created_at).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/kullanicilar/${muvekkil.id}`}
                          className="flex items-center gap-1.5 rounded-full border border-yonetim-kenar px-3 py-1.5 text-xs font-semibold text-white/60 transition hover:bg-white/5"
                        >
                          <IconKalem className="h-3.5 w-3.5" />
                          Detay
                        </Link>
                        <button
                          onClick={() => hesabiKaldir(muvekkil)}
                          disabled={islemYukleniyor === muvekkil.id}
                          className="flex items-center gap-1.5 rounded-full border border-red-500/30 px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                        >
                          {islemYukleniyor === muvekkil.id ? (
                            <Spinner className="h-3.5 w-3.5" />
                          ) : (
                            <IconRed className="h-3.5 w-3.5" />
                          )}
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
