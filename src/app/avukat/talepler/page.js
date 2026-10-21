"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { tarihFormatla } from "@/lib/gorusmeSekli";
import { avukatPayiHesapla } from "@/lib/odemeYardimci";
import { useAvukatProfili } from "@/lib/useAvukatProfili";
import { useAvukatTalepleri } from "@/lib/useAvukatTalepleri";
import AvukatShell from "@/components/AvukatShell";
import Avatar from "@/components/Avatar";
import Spinner from "@/components/Spinner";
import DurumRozeti from "@/components/DurumRozeti";
import GorusmeSekliEtiketi from "@/components/GorusmeSekliEtiketi";
import VideoGorusmeButonu from "@/components/VideoGorusmeButonu";
import TalepOzetiAI from "@/components/TalepOzetiAI";
import GorusmeOzetiAI from "@/components/GorusmeOzetiAI";
import DogrulamaDurumKarti from "@/components/DogrulamaDurumKarti";
import { IconKonum, IconUzmanlik, IconOnay, IconRed, IconTakvim, IconYildirim } from "@/components/icons";

const FILTRELER = [
  { anahtar: "hepsi", etiket: "Tümü" },
  { anahtar: "bekliyor", etiket: "Bekleyen" },
  { anahtar: "kabul", etiket: "Kabul edilen" },
  { anahtar: "tamamlandi", etiket: "Tamamlanan" },
];

export default function AvukatTalepler() {
  const { profil, yukleniyor } = useAvukatProfili();
  const { talepler, setTalepler, acikTalepler, setAcikTalepler } = useAvukatTalepleri(profil);

  const [sekme, setSekme] = useState("havuz");
  const [filtre, setFiltre] = useState("hepsi");
  const [islemYukleniyor, setIslemYukleniyor] = useState(null);
  const [ustlenYukleniyor, setUstlenYukleniyor] = useState(null);
  const [tamamlaYukleniyor, setTamamlaYukleniyor] = useState(null);
  const [hata, setHata] = useState(null);

  async function talebiUstlen(talepId) {
    setHata(null);
    setUstlenYukleniyor(talepId);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("randevu_talepleri")
      .update({ avukat_id: user.id, durum: "kabul" })
      .eq("id", talepId)
      .is("avukat_id", null)
      .select();

    if (error) {
      setHata("Talep üstlenilirken bir hata oluştu, lütfen tekrar dene.");
      setUstlenYukleniyor(null);
      return;
    }

    if (!data || data.length === 0) {
      setHata("Bu talep senden önce başka bir avukat tarafından üstlenildi.");
      setAcikTalepler((oncekiler) => oncekiler.filter((t) => t.id !== talepId));
      setUstlenYukleniyor(null);
      return;
    }

    setAcikTalepler((oncekiler) => oncekiler.filter((t) => t.id !== talepId));
    setTalepler((oncekiler) => [data[0], ...oncekiler]);
    setUstlenYukleniyor(null);
    setSekme("taleplerim");
  }

  async function talebiGuncelle(talepId, durum) {
    setHata(null);
    setIslemYukleniyor(talepId);

    const { error } = await supabase.from("randevu_talepleri").update({ durum }).eq("id", talepId);

    if (error) {
      setHata("Talep güncellenirken bir hata oluştu, lütfen tekrar dene.");
      setIslemYukleniyor(null);
      return;
    }

    setTalepler((oncekiler) => oncekiler.map((t) => (t.id === talepId ? { ...t, durum } : t)));
    setIslemYukleniyor(null);
  }

  async function mesajGorusmesiniTamamla(talepId) {
    setHata(null);
    setTamamlaYukleniyor(talepId);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const yanit = await fetch("/api/talep/tamamla", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ randevuTalepId: talepId }),
    });
    const sonuc = await yanit.json();

    if (!yanit.ok) {
      setHata(typeof sonuc.hata === "string" ? sonuc.hata : "İşlem tamamlanamadı.");
      setTamamlaYukleniyor(null);
      return;
    }

    setTalepler((oncekiler) => oncekiler.map((t) => (t.id === talepId ? { ...t, durum: "tamamlandi" } : t)));
    setTamamlaYukleniyor(null);
  }

  if (yukleniyor) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-gece">
        <Spinner className="h-8 w-8 text-white" />
      </div>
    );
  }

  const bekleyenSayisi = talepler.filter((t) => t.durum === "bekliyor").length;
  const gorunenTalepler = talepler.filter((t) => filtre === "hepsi" || t.durum === filtre);

  return (
    <AvukatShell
      profil={profil}
      rozetler={{ "/avukat/talepler": bekleyenSayisi + acikTalepler.length }}
      baslik="Talepler"
      aciklama="Şehrine ve uzmanlığına uygun açık talepler ile senin üstlendiğin görüşmeler."
    >
      {!profil.dogrulanmis ? (
        <DogrulamaDurumKarti profil={profil} />
      ) : (
        <>
          <div className="flex gap-1 rounded-lg bg-white/5 p-1 sm:w-fit">
            {[
              { anahtar: "havuz", etiket: "Açık Havuz", sayi: acikTalepler.length },
              { anahtar: "taleplerim", etiket: "Taleplerim", sayi: bekleyenSayisi },
            ].map(({ anahtar, etiket, sayi }) => (
              <button
                key={anahtar}
                onClick={() => setSekme(anahtar)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition sm:flex-none ${
                  sekme === anahtar ? "bg-gece-yuzey text-white shadow-sm" : "text-white/50 hover:text-white"
                }`}
              >
                {etiket}
                {sayi > 0 && (
                  <span className="rounded-full bg-turkuaz px-2 py-0.5 text-[11px] font-bold text-gece">{sayi}</span>
                )}
              </button>
            ))}
          </div>

          {hata && (
            <p className="rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-400 ring-1 ring-red-500/20">{hata}</p>
          )}

          {sekme === "havuz" && (
            <section className="flex flex-col gap-4">
              {acikTalepler.length === 0 ? (
                <p className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-10 text-center text-sm text-white/50">
                  Şehrine veya uzmanlık alanlarına uygun açık bir talep yok. Yeni talep gelince burada belirir.
                </p>
              ) : (
                acikTalepler.map((talep) => (
                  <div
                    key={talep.id}
                    className={`rounded-xl border bg-gece-yuzey p-5 ${
                      talep.acil ? "border-red-500/40" : "border-white/10"
                    }`}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        {talep.acil && (
                          <span className="mb-1.5 inline-flex items-center gap-1 rounded-md bg-red-500/15 px-2 py-0.5 text-xs font-semibold text-red-400">
                            <IconYildirim className="h-3.5 w-3.5" />
                            ACİL
                          </span>
                        )}
                        <p className="font-semibold text-white">{talep.konu}</p>
                        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/60">
                          <span className="flex items-center gap-1">
                            <IconKonum className="h-3.5 w-3.5" />
                            {talep.hedef_sehir}
                          </span>
                          <span className="flex items-center gap-1">
                            <IconUzmanlik className="h-3.5 w-3.5" />
                            {talep.hedef_uzmanlik_alani}
                          </span>
                        </p>
                      </div>
                      <button
                        onClick={() => talebiUstlen(talep.id)}
                        disabled={ustlenYukleniyor === talep.id}
                        className={`flex shrink-0 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-bold transition disabled:opacity-60 ${
                          talep.acil
                            ? "bg-red-600 text-white hover:bg-red-700"
                            : "bg-turkuaz text-gece hover:bg-turkuaz-parlak"
                        }`}
                      >
                        {ustlenYukleniyor === talep.id && <Spinner className="h-4 w-4" />}
                        Bu Talebi Üstlen
                      </button>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/60">
                      <GorusmeSekliEtiketi deger={talep.gorusme_sekli} />
                      <span className="flex items-center gap-1.5">
                        <IconTakvim className="h-4 w-4 text-white/40" />
                        {tarihFormatla(talep.tarih)}
                      </span>
                      {talep.paket_dakika && (
                        <span className="font-semibold text-turkuaz">
                          {talep.paket_dakika} dk
                          {talep.odeme_tutari > 0
                            ? ` · Kazancın: ${avukatPayiHesapla(talep.odeme_tutari)} TL`
                            : " · Ücretsiz deneme (ek süre alınırsa kazanırsın)"}
                        </span>
                      )}
                    </div>

                    {talep.aciklama && (
                      <p className="mt-3 rounded-lg bg-white/5 p-3 text-sm text-white/70">{talep.aciklama}</p>
                    )}

                    <TalepOzetiAI talepId={talep.id} />
                  </div>
                ))
              )}
            </section>
          )}

          {sekme === "taleplerim" && (
            <section className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                {FILTRELER.map(({ anahtar, etiket }) => (
                  <button
                    key={anahtar}
                    onClick={() => setFiltre(anahtar)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                      filtre === anahtar
                        ? "bg-turkuaz text-gece"
                        : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {etiket}
                  </button>
                ))}
              </div>

              {gorunenTalepler.length === 0 ? (
                <p className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-10 text-center text-sm text-white/50">
                  Bu filtrede talep yok.
                </p>
              ) : (
                gorunenTalepler.map((talep) => (
                  <div
                    key={talep.id}
                    className="rounded-xl border border-white/10 bg-gece-yuzey p-5 transition hover:border-white/20"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex items-start gap-3">
                        <Avatar adSoyad={talep.muvekkil_ad_soyad} />
                        <div>
                          <p className="font-semibold text-white">{talep.muvekkil_ad_soyad}</p>
                          <p className="text-xs text-white/40">{tarihFormatla(talep.tarih)}</p>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col items-start gap-1.5 sm:items-end">
                        <DurumRozeti durum={talep.durum} />
                        {talep.gorusme_suresi_dakika > 0 && (
                          <span className="rounded-md bg-green-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-green-400 ring-1 ring-green-500/20">
                            Ödendi
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                      <p>
                        <span className="font-semibold text-white">Konu: </span>
                        <span className="text-white/70">{talep.konu}</span>
                      </p>
                      <p className="flex items-center gap-1.5 text-white/70">
                        <GorusmeSekliEtiketi deger={talep.gorusme_sekli} />
                      </p>
                    </div>

                    {talep.aciklama && (
                      <p className="mt-3 rounded-lg bg-white/[0.03] p-3 text-sm text-white/70">{talep.aciklama}</p>
                    )}

                    {(talep.durum === "bekliyor" || talep.durum === "kabul") && <TalepOzetiAI talepId={talep.id} />}

                    {talep.durum === "bekliyor" && (
                      <div className="mt-4 flex gap-3">
                        <button
                          onClick={() => talebiGuncelle(talep.id, "kabul")}
                          disabled={islemYukleniyor === talep.id}
                          className="flex items-center gap-2 rounded-md bg-turkuaz px-4 py-2 text-sm font-semibold text-gece transition hover:bg-turkuaz-parlak disabled:opacity-60"
                        >
                          {islemYukleniyor === talep.id ? <Spinner className="h-4 w-4" /> : <IconOnay className="h-4 w-4" />}
                          Kabul Et
                        </button>
                        <button
                          onClick={() => talebiGuncelle(talep.id, "red")}
                          disabled={islemYukleniyor === talep.id}
                          className="flex items-center gap-2 rounded-md border border-red-500/30 px-4 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-60"
                        >
                          {islemYukleniyor === talep.id ? <Spinner className="h-4 w-4" /> : <IconRed className="h-4 w-4" />}
                          Reddet
                        </button>
                      </div>
                    )}

                    {talep.durum === "kabul" && talep.gorusme_sekli === "goruntulu" && (
                      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
                        <VideoGorusmeButonu randevuTalepId={talep.id} paketDakika={talep.paket_dakika} />
                        <span className="text-xs text-white/40">
                          {talep.paket_dakika} dk paket · görüşme bitince otomatik tamamlanır.
                        </span>
                      </div>
                    )}

                    {talep.durum === "kabul" && talep.gorusme_sekli !== "goruntulu" && (
                      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
                        <button
                          onClick={() => mesajGorusmesiniTamamla(talep.id)}
                          disabled={tamamlaYukleniyor === talep.id}
                          className="flex items-center gap-1.5 rounded-md bg-turkuaz px-4 py-2 text-sm font-semibold text-gece transition hover:bg-turkuaz-parlak disabled:opacity-60"
                        >
                          {tamamlaYukleniyor === talep.id && <Spinner className="h-4 w-4" />}
                          Görüşmeyi Tamamla
                        </button>
                        <span className="text-xs text-white/40">{talep.paket_dakika} dk paket</span>
                      </div>
                    )}

                    {talep.durum === "tamamlandi" && (
                      <>
                        <p className="mt-3 text-xs text-white/40">
                          {talep.paket_dakika} dk paket
                          {talep.odeme_tutari > 0 && ` · ${talep.odeme_tutari} TL`}
                          {talep.gorusme_suresi_dakika > 0 && ` · gerçek süre ${talep.gorusme_suresi_dakika} dk`}
                        </p>
                        <GorusmeOzetiAI talepId={talep.id} />
                      </>
                    )}
                  </div>
                ))
              )}
            </section>
          )}
        </>
      )}
    </AvukatShell>
  );
}
