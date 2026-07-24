"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Modal from "./Modal";
import Spinner from "./Spinner";
import { IconRed } from "./icons";

const ONAY_METNI = "HESABIMI SİL";

export default function HesapSilButonu({ onKapat }) {
  const router = useRouter();
  const [modalAcik, setModalAcik] = useState(false);
  const [onayMetni, setOnayMetni] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [hata, setHata] = useState(null);

  async function hesabiSil() {
    setHata(null);
    setYukleniyor(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const yanit = await fetch("/api/hesap/sil", {
      method: "POST",
      headers: { Authorization: `Bearer ${session?.access_token}` },
    });

    if (!yanit.ok) {
      const sonuc = await yanit.json().catch(() => ({}));
      setHata(sonuc.hata ?? "Hesap silinirken bir hata oluştu.");
      setYukleniyor(false);
      return;
    }

    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <>
      <button
        onClick={() => {
          setModalAcik(true);
          if (onKapat) onKapat();
        }}
        className="flex items-center gap-1.5 text-xs font-medium text-white/30 transition hover:text-red-400"
      >
        <IconRed className="h-3 w-3" />
        Hesabımı kalıcı olarak sil
      </button>

      {modalAcik && (
        <Modal
          baslik="Hesabını Silmek Üzeresin"
          onKapat={() => {
            setModalAcik(false);
            setOnayMetni("");
            setHata(null);
          }}
        >
          <div className="flex flex-col gap-4">
            <p className="text-sm text-white/70">
              Hesabını silersen profilin, randevu taleplerin ve tüm kişisel
              verilerin KVKK kapsamında sistemden kaldırılır. Bu işlem geri
              alınamaz. Devam etmek için aşağıya{" "}
              <span className="font-bold text-white">{ONAY_METNI}</span>{" "}
              yaz.
            </p>
            <input
              type="text"
              value={onayMetni}
              onChange={(e) => setOnayMetni(e.target.value)}
              placeholder={ONAY_METNI}
              className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/30"
            />

            {hata && (
              <p className="rounded-lg bg-red-500/10 px-4 py-2.5 text-sm text-red-400 ring-1 ring-red-500/20">
                {hata}
              </p>
            )}

            <button
              onClick={hesabiSil}
              disabled={onayMetni !== ONAY_METNI || yukleniyor}
              className="flex items-center justify-center gap-2 rounded-full bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {yukleniyor && <Spinner className="h-4 w-4" />}
              Hesabımı Kalıcı Olarak Sil
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
