"use client";

import { useEffect, useRef, useState } from "react";
import DailyIframe from "@daily-co/daily-js";
import { supabase } from "@/lib/supabaseClient";
import Modal from "./Modal";
import Spinner from "./Spinner";
import { GORUSME_PAKETLERI } from "@/lib/odemeYardimci";
import { IconVideo, IconTelefonKapat, IconKvkk, IconEtiket } from "./icons";

const EK_SURE_PAKETI = GORUSME_PAKETLERI[0];
const EK_SURE_POLL_MS = 3000;
const EK_SURE_POLL_SURE_MS = 3 * 60 * 1000;

function sureFormatla(saniye) {
  const dk = Math.floor(saniye / 60);
  const sn = saniye % 60;
  return `${String(dk).padStart(2, "0")}:${String(sn).padStart(2, "0")}`;
}

export default function VideoGorusmeButonu({ randevuTalepId, paketDakika, otomatikAc }) {
  const [onayAcik, setOnayAcik] = useState(false);
  const [onayVerildi, setOnayVerildi] = useState(false);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [odaUrl, setOdaUrl] = useState(null);
  const [hata, setHata] = useState(null);
  const [gecenSaniye, setGecenSaniye] = useState(0);
  const [sonlandirmaOnayAcik, setSonlandirmaOnayAcik] = useState(false);
  const [sonlandiriliyor, setSonlandiriliyor] = useState(false);
  const [gorusmeBasladi, setGorusmeBasladi] = useState(false);
  const [sureDoldu, setSureDoldu] = useState(false);
  const [ekSaniye, setEkSaniye] = useState(0);
  const [ekSureYukleniyor, setEkSureYukleniyor] = useState(false);
  const [ekSureMesaji, setEkSureMesaji] = useState(null);
  const baslangicRef = useRef(null);
  const iframeRef = useRef(null);
  const callFrameRef = useRef(null);
  const bittiCagrildiRef = useRef(false);
  const gorusmeBasladiRef = useRef(false);
  const otomatikAcildiRef = useRef(false);
  const sureDolduRef = useRef(false);
  const bilinenPaketDakikaRef = useRef(Number(paketDakika || 0));
  const ekSurePollRef = useRef(null);
  const ekSureYukleniyorRef = useRef(false);

  function ekSureYukleniyorAyarla(deger) {
    ekSureYukleniyorRef.current = deger;
    setEkSureYukleniyor(deger);
  }

  const paketSaniye = Number(paketDakika || 0) * 60 + ekSaniye;

  useEffect(() => {
    if (otomatikAc && !otomatikAcildiRef.current) {
      otomatikAcildiRef.current = true;
      setOnayAcik(true);
    }
  }, [otomatikAc]);

  useEffect(() => {
    if (!odaUrl || !gorusmeBasladi || sonlandiriliyor) return;

    const zamanlayici = setInterval(() => {
      const saniye = Math.floor((Date.now() - baslangicRef.current) / 1000);
      setGecenSaniye(saniye);

      if (paketSaniye > 0 && saniye >= paketSaniye && !sureDolduRef.current && !ekSureYukleniyorRef.current) {
        sureDolduRef.current = true;
        setSureDoldu(true);
        if (callFrameRef.current) {
          callFrameRef.current.leave();
        } else {
          gorusmeBitince();
        }
      }
    }, 1000);

    return () => clearInterval(zamanlayici);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [odaUrl, gorusmeBasladi, sonlandiriliyor, paketSaniye]);

  useEffect(() => {
    if (!odaUrl || !iframeRef.current) return;

    bittiCagrildiRef.current = false;
    gorusmeBasladiRef.current = false;
    sureDolduRef.current = false;
    ekSureYukleniyorRef.current = false;
    baslangicRef.current = null;
    bilinenPaketDakikaRef.current = Number(paketDakika || 0);
    setGorusmeBasladi(false);
    setGecenSaniye(0);
    setSureDoldu(false);
    setEkSaniye(0);
    setEkSureMesaji(null);

    const callFrame = DailyIframe.wrap(iframeRef.current);
    callFrameRef.current = callFrame;
    callFrame.join({ url: odaUrl });
    callFrame.on("left-meeting", gorusmeBitince);
    callFrame.on("joined-meeting", katilimcilariKontrolEt);
    callFrame.on("participant-joined", katilimcilariKontrolEt);
    callFrame.on("participant-left", katilimcilariKontrolEt);
    callFrame.on("participant-updated", katilimcilariKontrolEt);

    return () => {
      callFrame.off("left-meeting", gorusmeBitince);
      callFrame.off("joined-meeting", katilimcilariKontrolEt);
      callFrame.off("participant-joined", katilimcilariKontrolEt);
      callFrame.off("participant-left", katilimcilariKontrolEt);
      callFrame.off("participant-updated", katilimcilariKontrolEt);
      callFrame.destroy();
      callFrameRef.current = null;
      clearInterval(ekSurePollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [odaUrl]);

  function katilimcilariKontrolEt() {
    if (!callFrameRef.current) return;

    const durum = callFrameRef.current.meetingState();
    if (durum !== "joined-meeting") return;

    const katilimcilar = callFrameRef.current.participants();
    const sayi = katilimcilar ? Object.keys(katilimcilar).length : 0;

    if (!gorusmeBasladiRef.current && sayi >= 2) {
      gorusmeBasladiRef.current = true;
      baslangicRef.current = Date.now();
      setGecenSaniye(0);
      setGorusmeBasladi(true);
    }
  }

  async function gorusmeyiTamamla(saniyeGecti) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    await fetch("/api/talep/tamamla", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ randevuTalepId, gorusmeSuresiSaniye: saniyeGecti }),
    });
  }

  function gorusmeBitince() {
    if (bittiCagrildiRef.current) return;
    bittiCagrildiRef.current = true;
    setOdaUrl(null);
    setSonlandirmaOnayAcik(false);
    setSonlandiriliyor(false);
    setGorusmeBasladi(false);
    clearInterval(ekSurePollRef.current);

    if (baslangicRef.current) {
      const saniyeGecti = Math.floor((Date.now() - baslangicRef.current) / 1000);
      gorusmeyiTamamla(saniyeGecti);
    }
  }

  async function ekSureSatinAl() {
    ekSureYukleniyorAyarla(true);
    setEkSureMesaji(null);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const yanit = await fetch("/api/talep/ek-sure", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ randevuTalepId }),
    });
    const sonuc = await yanit.json();

    if (!yanit.ok) {
      setEkSureMesaji(sonuc.hata ?? "Ek süre alınamadı.");
      ekSureYukleniyorAyarla(false);
      return;
    }

    window.open(`https://www.paytr.com/odeme/guvenli/${sonuc.token}`, "_blank");
    setEkSureMesaji("Açılan sekmede ödemeni tamamla, onaylanınca süre otomatik eklenecek.");

    const baslangicZamani = Date.now();
    ekSurePollRef.current = setInterval(async () => {
      if (Date.now() - baslangicZamani > EK_SURE_POLL_SURE_MS) {
        clearInterval(ekSurePollRef.current);
        ekSureYukleniyorAyarla(false);
        setEkSureMesaji("Ödeme onayı gelmedi. Tamamladıysan birazdan otomatik yansıyacaktır.");
        return;
      }

      const { data } = await supabase
        .from("randevu_talepleri")
        .select("paket_dakika")
        .eq("id", randevuTalepId)
        .maybeSingle();

      const yeniDakika = Number(data?.paket_dakika || 0);
      if (yeniDakika > bilinenPaketDakikaRef.current) {
        const farkDakika = yeniDakika - bilinenPaketDakikaRef.current;
        bilinenPaketDakikaRef.current = yeniDakika;
        setEkSaniye((onceki) => onceki + farkDakika * 60);
        setEkSureMesaji(`+${farkDakika} dakika eklendi!`);
        ekSureYukleniyorAyarla(false);
        clearInterval(ekSurePollRef.current);
      }
    }, EK_SURE_POLL_MS);
  }

  async function gorusmeyeKatil() {
    setHata(null);
    setYukleniyor(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const yanit = await fetch("/api/video/katil", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({ randevuTalepId }),
    });
    const sonuc = await yanit.json();

    if (!yanit.ok) {
      setHata(sonuc.hata ?? "Görüşmeye katılırken bir hata oluştu.");
      setYukleniyor(false);
      return;
    }

    setOdaUrl(sonuc.odaUrl);
    setYukleniyor(false);
  }

  function sonlandirmayiOnayla() {
    setSonlandiriliyor(true);
    if (callFrameRef.current) {
      callFrameRef.current.leave();
    } else {
      gorusmeBitince();
    }
  }

  const kalanSaniye = Math.max(0, paketSaniye - gecenSaniye);
  const sureUyari = paketSaniye > 0 && kalanSaniye > 0 && kalanSaniye <= 60;
  const ekSureGosterilsin = paketSaniye > 0 && kalanSaniye > 0 && kalanSaniye <= 30;

  const baslikMetni = sureDoldu
    ? "Paket Süresi Doldu, Görüşme Sonlandırılıyor..."
    : sonlandiriliyor
    ? "Görüşme Sonlandırılıyor..."
    : gorusmeBasladi
    ? `Görüntülü Görüşme · ${sureFormatla(gecenSaniye)}`
    : "Görüntülü Görüşme · Diğer taraf bekleniyor...";

  return (
    <>
      <button
        onClick={() => setOnayAcik(true)}
        className="flex items-center gap-1.5 rounded-full bg-turkuaz px-4 py-2 text-xs font-bold text-gece transition hover:bg-turkuaz-parlak"
      >
        <IconVideo className="h-3.5 w-3.5" />
        Görüşmeye Katıl
      </button>

      {hata && <p className="w-full text-xs text-red-400">{hata}</p>}

      {onayAcik && (
        <Modal baslik="Görüşmeye Başlamadan Önce" onKapat={() => setOnayAcik(false)}>
          <div className="flex flex-col gap-4">
            {paketDakika > 0 && (
              <p className="rounded-lg bg-turkuaz/10 px-4 py-3 text-sm text-turkuaz">
                Bu görüşme <strong>{paketDakika} dakikalık</strong> pakete tabidir. Süre
                dolunca görüşme otomatik sona erer.
              </p>
            )}

            <p className="flex items-start gap-2 rounded-lg bg-white/5 px-4 py-3 text-sm text-white/70">
              <IconVideo className="mt-0.5 h-4 w-4 shrink-0 text-turkuaz" />
              Sağlıklı bir görüşme için internet bağlantının stabil olduğundan
              emin ol ve sessiz bir ortamda katıl.
            </p>

            <label className="flex items-start gap-2.5 text-sm text-white/70">
              <input
                type="checkbox"
                checked={onayVerildi}
                onChange={(e) => setOnayVerildi(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 bg-white/5 text-turkuaz focus:ring-turkuaz/40"
              />
              <span>
                <a href="/kvkk-aydinlatma-metni" target="_blank" className="font-semibold text-turkuaz underline">
                  KVKK Aydınlatma Metni
                </a>
                &apos;ni okudum, görüşmenin kayda alınmadığını ve yalnızca
                taraflar arasında gerçekleştiğini biliyorum.
              </span>
            </label>

            <button
              onClick={() => {
                setOnayAcik(false);
                gorusmeyeKatil();
              }}
              disabled={!onayVerildi || yukleniyor}
              className="flex items-center justify-center gap-2 rounded-full bg-turkuaz px-5 py-3 text-sm font-bold text-gece transition hover:bg-turkuaz-parlak disabled:cursor-not-allowed disabled:opacity-50"
            >
              {yukleniyor && <Spinner className="h-4 w-4" />}
              <IconKvkk className="h-4 w-4" />
              Görüşmeye Başla
            </button>
          </div>
        </Modal>
      )}

      {odaUrl && (
        <Modal baslik={baslikMetni} onKapat={() => setSonlandirmaOnayAcik(true)}>
          <div className="relative overflow-hidden rounded-xl bg-black">
            <iframe
              ref={iframeRef}
              title="Görüntülü Görüşme"
              allow="camera; microphone; fullscreen; display-capture; autoplay"
              style={{ width: "100%", height: "70vh", border: "none" }}
            />

            {(sonlandirmaOnayAcik || sonlandiriliyor) && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 bg-black/85 p-6 text-center">
                {sonlandiriliyor ? (
                  <>
                    <Spinner className="h-8 w-8 text-white" />
                    <p className="text-lg font-bold text-white">
                      {sureDoldu ? "Paket Süresi Doldu" : "Görüşme Sonlandırılıyor..."}
                    </p>
                    <p className="text-sm text-white/60">
                      {sureDoldu ? "Görüşme bu yüzden sona eriyor." : "Lütfen bekle."}
                    </p>
                  </>
                ) : (
                  <>
                    <IconTelefonKapat className="h-8 w-8 text-red-500" />
                    <p className="text-lg font-bold text-white">Görüşmeyi Sonlandır</p>
                    <p className="max-w-xs text-sm text-white/60">
                      Görüşmeyi sonlandırmak üzeresin.
                    </p>
                    <div className="flex w-full max-w-xs gap-3">
                      <button
                        onClick={() => setSonlandirmaOnayAcik(false)}
                        className="flex-1 rounded-full border-2 border-white/20 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-white/40"
                      >
                        Vazgeç
                      </button>
                      <button
                        onClick={sonlandirmayiOnayla}
                        className="flex-1 rounded-full bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
                      >
                        Evet, Sonlandır
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {paketSaniye > 0 && (
            <div
              className={`mt-4 flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold ${
                sureUyari ? "bg-red-500/10 text-red-400" : "bg-white/5 text-white/70"
              }`}
            >
              <span>Kalan Süre</span>
              <span>{sureFormatla(kalanSaniye)}</span>
            </div>
          )}

          {ekSureGosterilsin && (
            <div className="mt-3 flex flex-col gap-2 rounded-xl border border-red-500/30 bg-red-500/[0.06] p-4">
              <p className="text-center text-sm font-semibold text-red-400">
                Süren doluyor! Görüşmeye devam etmek için ek süre alabilirsin.
              </p>
              <button
                onClick={ekSureSatinAl}
                disabled={ekSureYukleniyor}
                className="flex items-center justify-center gap-2 rounded-full bg-turkuaz px-4 py-2.5 text-sm font-bold text-gece transition hover:bg-turkuaz-parlak disabled:opacity-60"
              >
                {ekSureYukleniyor ? <Spinner className="h-4 w-4" /> : <IconEtiket className="h-4 w-4" />}
                +{EK_SURE_PAKETI.dakika} Dakika Al ({EK_SURE_PAKETI.tutar} TL)
              </button>
              {ekSureMesaji && <p className="text-center text-xs text-white/60">{ekSureMesaji}</p>}
            </div>
          )}

          <button
            onClick={() => setSonlandirmaOnayAcik(true)}
            disabled={sonlandiriliyor}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-60"
          >
            <IconTelefonKapat className="h-4 w-4" />
            Görüşmeyi Sonlandır
          </button>
        </Modal>
      )}
    </>
  );
}
