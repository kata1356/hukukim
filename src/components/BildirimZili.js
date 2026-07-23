"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { IconZil } from "./icons";

function zamanFormatla(tarih) {
  const fark = Date.now() - new Date(tarih).getTime();
  const dakika = Math.floor(fark / 60000);
  if (dakika < 1) return "az önce";
  if (dakika < 60) return `${dakika} dk önce`;
  const saat = Math.floor(dakika / 60);
  if (saat < 24) return `${saat} sa önce`;
  return `${Math.floor(saat / 24)} gün önce`;
}

export default function BildirimZili() {
  const router = useRouter();
  const [acik, setAcik] = useState(false);
  const [bildirimler, setBildirimler] = useState([]);
  const kutuRef = useRef(null);

  useEffect(() => {
    let kanal;

    async function baslat() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("bildirimler")
        .select("*")
        .eq("kullanici_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      setBildirimler(data ?? []);

      kanal = supabase
        .channel(`bildirimler-${user.id}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "bildirimler", filter: `kullanici_id=eq.${user.id}` },
          (payload) => {
            setBildirimler((oncekiler) => [payload.new, ...oncekiler]);
          }
        )
        .subscribe();
    }

    baslat();
    return () => {
      if (kanal) supabase.removeChannel(kanal);
    };
  }, []);

  useEffect(() => {
    function disariTiklandi(e) {
      if (kutuRef.current && !kutuRef.current.contains(e.target)) setAcik(false);
    }
    document.addEventListener("mousedown", disariTiklandi);
    return () => document.removeEventListener("mousedown", disariTiklandi);
  }, []);

  const okunmamisSayisi = bildirimler.filter((b) => !b.okundu).length;

  async function bildirimeTikla(bildirim) {
    if (!bildirim.okundu) {
      await supabase.from("bildirimler").update({ okundu: true }).eq("id", bildirim.id);
      setBildirimler((oncekiler) =>
        oncekiler.map((b) => (b.id === bildirim.id ? { ...b, okundu: true } : b))
      );
    }
    setAcik(false);
    if (bildirim.link) router.push(bildirim.link);
  }

  return (
    <div className="relative" ref={kutuRef}>
      <button
        onClick={() => setAcik((onceki) => !onceki)}
        aria-label="Bildirimler"
        className="relative rounded-full p-2 text-white/60 transition hover:bg-white/5 hover:text-turkuaz"
      >
        <IconZil className="h-5 w-5" />
        {okunmamisSayisi > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {okunmamisSayisi > 9 ? "9+" : okunmamisSayisi}
          </span>
        )}
      </button>

      {acik && (
        <div className="absolute right-0 top-full z-30 mt-2 max-h-96 w-80 overflow-y-auto rounded-2xl border border-white/10 bg-gece-yuzey shadow-xl">
          <div className="border-b border-white/10 px-4 py-3">
            <p className="text-sm font-bold text-white">Bildirimler</p>
          </div>

          {bildirimler.length === 0 ? (
            <p className="p-6 text-center text-sm text-white/40">Henüz bir bildirimin yok.</p>
          ) : (
            <div className="flex flex-col divide-y divide-white/5">
              {bildirimler.map((b) => (
                <button
                  key={b.id}
                  onClick={() => bildirimeTikla(b)}
                  className={`flex flex-col gap-0.5 px-4 py-3 text-left transition hover:bg-white/5 ${
                    !b.okundu ? "bg-turkuaz/[0.04]" : ""
                  }`}
                >
                  <span className="flex items-center gap-2 text-sm font-semibold text-white">
                    {!b.okundu && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-turkuaz" />}
                    {b.baslik}
                  </span>
                  {b.mesaj && <span className="line-clamp-2 text-xs text-white/60">{b.mesaj}</span>}
                  <span className="mt-0.5 text-[11px] text-white/30">{zamanFormatla(b.created_at)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
