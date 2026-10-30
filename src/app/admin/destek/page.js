"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AdminShell from "@/components/AdminShell";
import Spinner from "@/components/Spinner";

function zaman(iso) {
  return new Date(iso).toLocaleString("tr-TR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default function AdminDestek() {
  return (
    <Suspense fallback={null}>
      <DestekIcerik />
    </Suspense>
  );
}

function DestekIcerik() {
  const secilenParam = useSearchParams().get("kullanici");
  const [yukleniyor, setYukleniyor] = useState(true);
  const [mesajlar, setMesajlar] = useState([]);
  const [isimler, setIsimler] = useState({});
  const [secili, setSecili] = useState(secilenParam);
  const [metin, setMetin] = useState("");
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [hata, setHata] = useState(null);
  const listeRef = useRef(null);

  const isimleriGetir = useCallback(async (idler) => {
    const eksik = idler.filter((id) => !isimler[id]);
    if (eksik.length === 0) return;
    const [{ data: avukatlar }, { data: muvekkiller }] = await Promise.all([
      supabase.from("avukatlar").select("id, ad_soyad, email, telefon").in("id", eksik),
      supabase.from("muvekkiller").select("id, ad_soyad, email, telefon").in("id", eksik),
    ]);
    setIsimler((onceki) => {
      const yeni = { ...onceki };
      (avukatlar ?? []).forEach((a) => (yeni[a.id] = { ...a, rol: "Avukat" }));
      (muvekkiller ?? []).forEach((m) => (yeni[m.id] = { ...m, rol: "Müvekkil" }));
      return yeni;
    });
  }, [isimler]);

  useEffect(() => {
    let iptalEdildi = false;

    async function yukle() {
      const { data } = await supabase
        .from("destek_mesajlari")
        .select("id, kullanici_id, gonderen, metin, okundu, created_at")
        .order("created_at", { ascending: true })
        .limit(1000);
      if (iptalEdildi) return;
      setMesajlar(data ?? []);
      await isimleriGetir([...new Set((data ?? []).map((m) => m.kullanici_id))]);
      setYukleniyor(false);
    }

    yukle();

    const kanal = supabase
      .channel("admin-destek")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "destek_mesajlari" }, async (olay) => {
        setMesajlar((onceki) => (onceki.some((m) => m.id === olay.new.id) ? onceki : [...onceki, olay.new]));
        await isimleriGetir([olay.new.kullanici_id]);
      })
      .subscribe();

    return () => {
      iptalEdildi = true;
      supabase.removeChannel(kanal);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const konusmalar = useMemo(() => {
    const harita = new Map();
    for (const m of mesajlar) {
      const k = harita.get(m.kullanici_id) ?? { id: m.kullanici_id, mesajlar: [], okunmamis: 0, son: m.created_at };
      k.mesajlar.push(m);
      k.son = m.created_at;
      if (m.gonderen === "kullanici" && !m.okundu) k.okunmamis += 1;
      harita.set(m.kullanici_id, k);
    }
    return [...harita.values()].sort((a, b) => new Date(b.son) - new Date(a.son));
  }, [mesajlar]);

  const aktif = konusmalar.find((k) => k.id === secili) ?? null;

  useEffect(() => {
    if (listeRef.current) listeRef.current.scrollTop = listeRef.current.scrollHeight;
  }, [aktif?.mesajlar.length, secili]);

  // Konuşma açılınca kullanıcının mesajları okundu sayılır.
  useEffect(() => {
    if (!aktif || aktif.okunmamis === 0) return;
    supabase
      .from("destek_mesajlari")
      .update({ okundu: true })
      .eq("kullanici_id", aktif.id)
      .eq("gonderen", "kullanici")
      .eq("okundu", false)
      .then(() =>
        setMesajlar((onceki) =>
          onceki.map((m) => (m.kullanici_id === aktif.id && m.gonderen === "kullanici" ? { ...m, okundu: true } : m))
        )
      );
  }, [aktif]);

  async function yanitla(e) {
    e.preventDefault();
    const temiz = metin.trim();
    if (!temiz || !aktif || gonderiliyor) return;
    setHata(null);
    setGonderiliyor(true);

    const { data: oturum } = await supabase.auth.getSession();
    const yanit = await fetch("/api/admin/destek-yanit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${oturum.session?.access_token ?? ""}` },
      body: JSON.stringify({ kullaniciId: aktif.id, metin: temiz }),
    }).catch(() => null);
    const sonuc = await yanit?.json().catch(() => ({}));
    setGonderiliyor(false);

    if (!yanit?.ok || !sonuc?.mesaj) {
      setHata(sonuc?.hata ?? "Yanıt gönderilemedi.");
      return;
    }
    setMesajlar((onceki) => (onceki.some((m) => m.id === sonuc.mesaj.id) ? onceki : [...onceki, sonuc.mesaj]));
    setMetin("");
  }

  return (
    <AdminShell baslik="Canlı Destek" aciklama="Avukat ve müvekkillerden gelen mesajlar anında burada görünür.">
      {yukleniyor ? (
        <Spinner className="h-6 w-6 text-vurgu" />
      ) : (
        <div className="grid min-h-[32rem] grid-cols-1 gap-4 lg:grid-cols-[20rem_1fr]">
          <div className="flex max-h-[70vh] flex-col gap-1 overflow-y-auto rounded-xl border border-yonetim-kenar bg-yonetim-kutu p-2">
            {konusmalar.length === 0 && <p className="p-4 text-sm text-white/50">Henüz destek mesajı yok.</p>}
            {konusmalar.map((k) => {
              const kisi = isimler[k.id];
              const son = k.mesajlar[k.mesajlar.length - 1];
              return (
                <button
                  key={k.id}
                  onClick={() => setSecili(k.id)}
                  className={`flex flex-col gap-0.5 rounded-lg px-3 py-2.5 text-left transition ${
                    secili === k.id ? "bg-vurgu/10" : "hover:bg-white/5"
                  }`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-white">{kisi?.ad_soyad ?? "Kullanıcı"}</span>
                    {k.okunmamis > 0 && (
                      <span className="rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-bold text-white">{k.okunmamis}</span>
                    )}
                  </span>
                  <span className="text-xs text-white/40">{kisi?.rol ?? "—"} · {zaman(k.son)}</span>
                  <span className="truncate text-xs text-white/60">{son.gonderen === "admin" ? "Sen: " : ""}{son.metin}</span>
                </button>
              );
            })}
          </div>

          <div className="flex max-h-[70vh] min-h-[24rem] flex-col rounded-xl border border-yonetim-kenar bg-yonetim-kutu">
            {!aktif ? (
              <p className="m-auto text-sm text-white/50">Soldan bir konuşma seçin.</p>
            ) : (
              <>
                <div className="border-b border-yonetim-kenar px-4 py-3">
                  <p className="text-sm font-bold text-white">{isimler[aktif.id]?.ad_soyad ?? "Kullanıcı"}</p>
                  <p className="text-xs text-white/50">
                    {isimler[aktif.id]?.rol} · {isimler[aktif.id]?.email ?? "—"}
                    {isimler[aktif.id]?.telefon ? ` · ${isimler[aktif.id].telefon}` : ""}
                  </p>
                </div>
                <div ref={listeRef} className="flex flex-1 flex-col gap-2 overflow-y-auto px-4 py-3">
                  {aktif.mesajlar.map((m) => {
                    const ben = m.gonderen === "admin";
                    return (
                      <div key={m.id} className={`flex max-w-[80%] flex-col gap-0.5 ${ben ? "self-end items-end" : "self-start"}`}>
                        <div
                          className={`whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm ${
                            ben ? "rounded-br-sm bg-vurgu text-yonetim" : "rounded-bl-sm border border-white/10 bg-white/5 text-white"
                          }`}
                        >
                          {m.metin}
                        </div>
                        <span className="text-[10px] text-white/40">{zaman(m.created_at)}</span>
                      </div>
                    );
                  })}
                </div>
                {hata && <p className="px-4 pb-1 text-xs text-red-400">{hata}</p>}
                <form onSubmit={yanitla} className="flex items-end gap-2 border-t border-yonetim-kenar p-3">
                  <textarea
                    value={metin}
                    onChange={(e) => setMetin(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) yanitla(e);
                    }}
                    rows={2}
                    maxLength={1500}
                    placeholder="Yanıtınızı yazın (Enter ile gönderilir)..."
                    className="max-h-28 flex-1 resize-none rounded-xl border border-yonetim-kenar bg-yonetim px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-vurgu focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!metin.trim() || gonderiliyor}
                    className="rounded-full bg-vurgu px-5 py-2.5 text-sm font-bold text-yonetim transition hover:opacity-90 disabled:opacity-50"
                  >
                    Yanıtla
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </AdminShell>
  );
}
