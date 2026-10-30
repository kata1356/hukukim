"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

function saat(iso) {
  return new Date(iso).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

// Giriş yapmış avukat ve müvekkillerin yönetimle yazışabildiği canlı destek penceresi.
// Mesajlar yönetime anında e-posta olarak ulaşır; yanıt gelince pencere anlık güncellenir.
export default function DestekSohbeti() {
  const [kullaniciId, setKullaniciId] = useState(null);
  const [acik, setAcik] = useState(false);
  const [mesajlar, setMesajlar] = useState([]);
  const [metin, setMetin] = useState("");
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [hata, setHata] = useState(null);
  const [okunmamis, setOkunmamis] = useState(false);
  const acikRef = useRef(false);
  const listeRef = useRef(null);

  useEffect(() => {
    acikRef.current = acik;
    if (acik) setOkunmamis(false);
  }, [acik]);

  const ekle = useCallback((yeni) => {
    setMesajlar((onceki) => (onceki.some((m) => m.id === yeni.id) ? onceki : [...onceki, yeni]));
  }, []);

  useEffect(() => {
    let iptalEdildi = false;
    let kanal = null;

    async function baslat() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || iptalEdildi) return;
      setKullaniciId(user.id);

      const { data } = await supabase
        .from("destek_mesajlari")
        .select("id, gonderen, metin, created_at")
        .eq("kullanici_id", user.id)
        .order("created_at", { ascending: true })
        .limit(200);
      if (!iptalEdildi) setMesajlar(data ?? []);

      kanal = supabase
        .channel(`destek-${user.id}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "destek_mesajlari", filter: `kullanici_id=eq.${user.id}` },
          (olay) => {
            ekle(olay.new);
            if (olay.new.gonderen === "admin" && !acikRef.current) setOkunmamis(true);
          }
        )
        .subscribe();
    }

    baslat();
    return () => {
      iptalEdildi = true;
      if (kanal) supabase.removeChannel(kanal);
    };
  }, [ekle]);

  useEffect(() => {
    if (listeRef.current) listeRef.current.scrollTop = listeRef.current.scrollHeight;
  }, [mesajlar, acik]);

  async function gonder(e) {
    e.preventDefault();
    const temiz = metin.trim();
    if (!temiz || gonderiliyor) return;
    setHata(null);
    setGonderiliyor(true);

    const { data: oturum } = await supabase.auth.getSession();
    const yanit = await fetch("/api/destek/mesaj", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${oturum.session?.access_token ?? ""}` },
      body: JSON.stringify({ metin: temiz }),
    }).catch(() => null);
    const sonuc = await yanit?.json().catch(() => ({}));
    setGonderiliyor(false);

    if (!yanit?.ok || !sonuc?.mesaj) {
      setHata(sonuc?.hata ?? "Mesaj gönderilemedi, tekrar dene.");
      return;
    }
    ekle(sonuc.mesaj);
    setMetin("");
  }

  if (!kullaniciId) return null;

  return (
    <div className="fixed bottom-24 right-4 z-40 flex flex-col items-end gap-3 lg:bottom-6 lg:right-6">
      {acik && (
        <div className="flex h-[26rem] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-white/10 bg-gece-yuzey shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 bg-gece px-4 py-3">
            <div>
              <p className="text-sm font-bold text-white">Canlı Destek</p>
              <p className="text-xs text-white/50">Hukukim ekibine yazın, hemen haberdar oluyoruz.</p>
            </div>
            <button onClick={() => setAcik(false)} aria-label="Kapat" className="rounded-full p-1.5 text-white/60 hover:bg-white/10 hover:text-white">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div ref={listeRef} className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-3">
            {mesajlar.length === 0 && (
              <p className="m-auto text-center text-sm text-white/50">
                Merhaba! Bir sorunuz ya da takıldığınız bir yer varsa buraya yazın. En kısa sürede dönüş yapıyoruz.
              </p>
            )}
            {mesajlar.map((m) => {
              const ben = m.gonderen === "kullanici";
              return (
                <div key={m.id} className={`flex max-w-[85%] flex-col gap-0.5 ${ben ? "self-end items-end" : "self-start"}`}>
                  <div
                    className={`whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm ${
                      ben ? "rounded-br-sm bg-turkuaz text-gece" : "rounded-bl-sm border border-white/10 bg-white/5 text-white"
                    }`}
                  >
                    {m.metin}
                  </div>
                  <span className="text-[10px] text-white/40">{ben ? "Sen" : "Hukukim Destek"} · {saat(m.created_at)}</span>
                </div>
              );
            })}
          </div>

          {hata && <p className="px-4 pb-1 text-xs text-red-400">{hata}</p>}

          <form onSubmit={gonder} className="flex items-end gap-2 border-t border-white/10 p-3">
            <textarea
              value={metin}
              onChange={(e) => setMetin(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) gonder(e);
              }}
              rows={1}
              maxLength={1500}
              placeholder="Mesajınızı yazın..."
              className="max-h-24 min-h-10 flex-1 resize-none rounded-xl border border-white/10 bg-gece px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-turkuaz focus:outline-none"
            />
            <button
              type="submit"
              disabled={!metin.trim() || gonderiliyor}
              className="rounded-full bg-turkuaz px-4 py-2.5 text-sm font-bold text-gece transition hover:opacity-90 disabled:opacity-50"
            >
              Gönder
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setAcik((a) => !a)}
        aria-label="Canlı destek"
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-turkuaz text-gece shadow-lg transition hover:scale-105"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
        </svg>
        {okunmamis && <span className="absolute right-0.5 top-0.5 h-3.5 w-3.5 rounded-full border-2 border-gece bg-red-500" />}
      </button>
    </div>
  );
}
