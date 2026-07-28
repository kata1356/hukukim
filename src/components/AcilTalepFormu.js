"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { SEHIRLER } from "@/lib/sehirler";
import { UZMANLIK_ALANLARI } from "@/lib/uzmanlikAlanlari";
import { GORUSME_PAKETLERI } from "@/lib/odemeYardimci";
import TextField from "./TextField";
import Button from "./Button";
import Modal from "./Modal";
import { IconYildirim } from "./icons";

export default function AcilTalepFormu({ muvekkilProfil, ilkGorusmeMi, onBasarili }) {
  const [form, setForm] = useState({
    sehir: muvekkilProfil.sehir ?? "",
    uzmanlikAlani: "",
    aciklama: "",
    paketDakika: GORUSME_PAKETLERI[0].dakika,
  });
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState(null);
  const [odemeToken, setOdemeToken] = useState(null);

  function alanGuncelle(alan, deger) {
    setForm((onceki) => ({ ...onceki, [alan]: deger }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setHata(null);
    setYukleniyor(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const yanit = await fetch("/api/talep/olustur", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify({
        hedefSehir: form.sehir,
        hedefUzmanlikAlani: form.uzmanlikAlani,
        konu: `Acil: ${form.uzmanlikAlani}`,
        aciklama: form.aciklama,
        gorusmeSekli: "goruntulu",
        paketDakika: form.paketDakika,
        acil: true,
      }),
    });
    const sonuc = await yanit.json();

    if (!yanit.ok) {
      setHata(sonuc.hata ?? "Talep oluşturulamadı.");
      setYukleniyor(false);
      return;
    }

    setYukleniyor(false);

    if (sonuc.ucretsiz) {
      onBasarili(sonuc.talepId);
      return;
    }

    setOdemeToken(sonuc.token);
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="flex items-start gap-2 rounded-xl bg-red-500/10 p-3 text-sm text-red-400 ring-1 ring-red-500/20">
          <IconYildirim className="mt-0.5 h-4 w-4 shrink-0" />
          Talebin, şehrine ve uzmanlık alanına uygun tüm avukatlara ACİL olarak
          gösterilir. İlk kabul eden avukatla görüşmen hemen başlar.
        </p>

        {ilkGorusmeMi && (
          <p className="rounded-lg bg-turkuaz/10 px-4 py-2.5 text-sm font-semibold text-turkuaz">
            İlk görüşmen tamamen ücretsiz!
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            label="Şehir"
            id="acilSehir"
            as="select"
            required
            value={form.sehir}
            onChange={(e) => alanGuncelle("sehir", e.target.value)}
          >
            <option value="" disabled>
              Şehir seç
            </option>
            {SEHIRLER.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </TextField>

          <TextField
            label="Uzmanlık Alanı"
            id="acilUzmanlik"
            as="select"
            required
            value={form.uzmanlikAlani}
            onChange={(e) => alanGuncelle("uzmanlikAlani", e.target.value)}
          >
            <option value="" disabled>
              Alan seç
            </option>
            {UZMANLIK_ALANLARI.map((alan) => (
              <option key={alan} value={alan}>
                {alan}
              </option>
            ))}
          </TextField>
        </div>

        <TextField
          label="Ne oldu? Kısaca anlat"
          id="acilAciklama"
          as="textarea"
          rows={4}
          required
          value={form.aciklama}
          onChange={(e) => alanGuncelle("aciklama", e.target.value)}
          placeholder="Durumunu birkaç cümleyle özetle, avukatlar bunu görecek."
        />

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-white">Görüşme Paketi</span>
          <div className="grid grid-cols-3 gap-2">
            {GORUSME_PAKETLERI.map((paket) => (
              <button
                key={paket.dakika}
                type="button"
                onClick={() => alanGuncelle("paketDakika", paket.dakika)}
                className={`flex flex-col items-center gap-1 rounded-xl border p-3 transition ${
                  form.paketDakika === paket.dakika
                    ? "border-turkuaz bg-turkuaz/10"
                    : "border-white/15 bg-white/5 hover:border-white/30"
                }`}
              >
                <span className="text-sm font-bold text-white">{paket.dakika} dk</span>
                <span className="text-xs text-white/60">
                  {ilkGorusmeMi ? "Ücretsiz" : `${paket.tutar} TL`}
                </span>
              </button>
            ))}
          </div>
        </div>

        {hata && (
          <p className="rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-400 ring-1 ring-red-500/20">
            {hata}
          </p>
        )}

        <Button type="submit" variant="acil" yukleniyor={yukleniyor}>
          <IconYildirim className="h-4 w-4" />
          {ilkGorusmeMi ? "Ücretsiz Acil Talebi Gönder" : "Öde ve Acil Talebi Gönder"}
        </Button>
      </form>

      {odemeToken && (
        <Modal baslik="Görüşme Paketi Ödemesi" onKapat={() => setOdemeToken(null)}>
          <div className="overflow-hidden rounded-xl bg-white">
            <iframe
              src={`https://www.paytr.com/odeme/guvenli/${odemeToken}`}
              title="PayTR Ödeme"
              style={{ width: "100%", height: "600px", border: "none" }}
            />
          </div>
        </Modal>
      )}
    </>
  );
}
