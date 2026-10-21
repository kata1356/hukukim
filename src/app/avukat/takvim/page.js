"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { tarihFormatla } from "@/lib/gorusmeSekli";
import { useAvukatProfili } from "@/lib/useAvukatProfili";
import AvukatShell from "@/components/AvukatShell";
import Spinner from "@/components/Spinner";
import { IconArti } from "@/components/icons";

const BUGUN = () => new Date().toISOString().split("T")[0];

export default function AvukatTakvim() {
  const { profil, yukleniyor } = useAvukatProfili();
  const [kapaliGunler, setKapaliGunler] = useState([]);
  const [yeniKapaliTarih, setYeniKapaliTarih] = useState("");
  const [kapatmaYukleniyor, setKapatmaYukleniyor] = useState(false);
  const [acmaYukleniyorId, setAcmaYukleniyorId] = useState(null);
  const [hata, setHata] = useState(null);

  useEffect(() => {
    if (!profil?.id) return;
    supabase
      .from("avukat_kapali_gunler")
      .select("*")
      .eq("avukat_id", profil.id)
      .order("tarih", { ascending: true })
      .then(({ data }) => setKapaliGunler(data ?? []));
  }, [profil?.id]);

  async function gunuKapat(e) {
    e.preventDefault();
    if (!yeniKapaliTarih) return;
    setHata(null);
    setKapatmaYukleniyor(true);

    const { data, error } = await supabase
      .from("avukat_kapali_gunler")
      .insert({ avukat_id: profil.id, tarih: yeniKapaliTarih })
      .select()
      .single();

    if (error) {
      setHata(error.code === "23505" ? "Bu gün zaten kapalı." : "Gün kapatılırken bir hata oluştu.");
      setKapatmaYukleniyor(false);
      return;
    }

    setKapaliGunler((oncekiler) => [...oncekiler, data].sort((a, b) => a.tarih.localeCompare(b.tarih)));
    setYeniKapaliTarih("");
    setKapatmaYukleniyor(false);
  }

  async function gunuAc(id) {
    setAcmaYukleniyorId(id);
    const { error } = await supabase.from("avukat_kapali_gunler").delete().eq("id", id);
    if (!error) setKapaliGunler((oncekiler) => oncekiler.filter((g) => g.id !== id));
    setAcmaYukleniyorId(null);
  }

  if (yukleniyor) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-gece">
        <Spinner className="h-8 w-8 text-white" />
      </div>
    );
  }

  const gelecekGunler = kapaliGunler.filter((g) => g.tarih >= BUGUN());
  const gecmisGunler = kapaliGunler.filter((g) => g.tarih < BUGUN());

  return (
    <AvukatShell
      profil={profil}
      baslik="Müsaitlik Takvimi"
      aciklama="Müsait olmadığın günleri kapat, müvekkiller o günlere talep gönderemesin."
    >
      <section className="rounded-xl border border-white/10 bg-gece-yuzey p-5 sm:p-6">
        <form onSubmit={gunuKapat} className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="kapali-tarih" className="text-sm font-semibold text-white">
              Kapatılacak tarih
            </label>
            <input
              id="kapali-tarih"
              type="date"
              min={BUGUN()}
              value={yeniKapaliTarih}
              onChange={(e) => setYeniKapaliTarih(e.target.value)}
              className="rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-turkuaz"
            />
          </div>
          <button
            type="submit"
            disabled={!yeniKapaliTarih || kapatmaYukleniyor}
            className="flex items-center gap-1.5 rounded-md bg-turkuaz px-4 py-2.5 text-sm font-bold text-gece transition hover:bg-turkuaz-parlak disabled:opacity-60"
          >
            {kapatmaYukleniyor ? <Spinner className="h-4 w-4" /> : <IconArti className="h-4 w-4" />}
            Bu Günü Kapat
          </button>
        </form>

        {hata && (
          <p className="mt-3 rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-400 ring-1 ring-red-500/20">{hata}</p>
        )}
      </section>

      <section className="rounded-xl border border-white/10 bg-gece-yuzey p-5 sm:p-6">
        <h2 className="text-sm font-bold text-white">Kapalı günler</h2>
        {gelecekGunler.length === 0 ? (
          <p className="mt-3 text-sm text-white/50">Şu an kapalı bir günün yok, tüm günler müsait görünüyor.</p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {gelecekGunler.map((gun) => (
              <span
                key={gun.id}
                className="flex items-center gap-2 rounded-md bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/70"
              >
                {tarihFormatla(gun.tarih)}
                <button
                  onClick={() => gunuAc(gun.id)}
                  disabled={acmaYukleniyorId === gun.id}
                  aria-label="Bu günü tekrar aç"
                  className="text-white/40 hover:text-red-400"
                >
                  {acmaYukleniyorId === gun.id ? <Spinner className="h-3 w-3" /> : "✕"}
                </button>
              </span>
            ))}
          </div>
        )}
        {gecmisGunler.length > 0 && (
          <p className="mt-4 border-t border-white/10 pt-3 text-xs text-white/30">
            {gecmisGunler.length} geçmiş kapalı gün kayıtlı.
          </p>
        )}
      </section>
    </AvukatShell>
  );
}
