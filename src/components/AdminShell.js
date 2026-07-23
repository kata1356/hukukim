"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import Spinner from "./Spinner";
import BildirimZili from "./BildirimZili";
import Logo from "./Logo";
import {
  IconPano,
  IconGrup,
  IconTerazi,
  IconYayin,
  IconCikis,
  IconKalkan,
  IconTarihce,
  IconEtiket,
  IconKitap,
  IconYildiz,
} from "./icons";

const MENU = [
  { etiket: "Panel", href: "/admin", Icon: IconPano },
  { etiket: "Avukatlar", href: "/admin/avukatlar", Icon: IconTerazi },
  { etiket: "Kullanıcılar", href: "/admin/kullanicilar", Icon: IconGrup },
  { etiket: "Talepler", href: "/admin/talepler", Icon: IconYayin },
  { etiket: "Değerlendirmeler", href: "/admin/degerlendirmeler", Icon: IconYildiz },
  { etiket: "SSS", href: "/admin/icerik/sss", Icon: IconEtiket },
  { etiket: "Mevzuat", href: "/admin/icerik/mevzuat", Icon: IconKitap },
  { etiket: "Yöneticiler", href: "/admin/yoneticiler", Icon: IconKalkan },
  { etiket: "Denetim Kaydı", href: "/admin/denetim", Icon: IconTarihce },
  { etiket: "Ödeme Testi", href: "/odeme/test", Icon: IconEtiket },
];

export default function AdminShell({ baslik, aciklama, children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [durum, setDurum] = useState("kontrol");
  const [yonetici, setYonetici] = useState(null);

  useEffect(() => {
    let iptalEdildi = false;

    async function kontrolEt() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!iptalEdildi) router.replace("/admin/giris");
        return;
      }

      const { data: yoneticiKaydi } = await supabase
        .from("yoneticiler")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (iptalEdildi) return;

      if (!yoneticiKaydi) {
        setDurum("yetkisiz");
        return;
      }

      setYonetici(yoneticiKaydi);
      setDurum("yetkili");
    }

    kontrolEt();
    return () => {
      iptalEdildi = true;
    };
  }, [router]);

  async function cikisYap() {
    await supabase.auth.signOut();
    router.push("/admin/giris");
  }

  if (durum === "kontrol") {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-yonetim">
        <Spinner className="h-8 w-8 text-vurgu" />
      </div>
    );
  }

  if (durum === "yetkisiz") {
    return (
      <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-3 bg-yonetim px-6 text-center">
        <p className="text-lg font-bold text-white">Bu hesabın yönetici yetkisi yok</p>
        <p className="max-w-sm text-sm text-white/50">
          Yönetici paneline erişmek için hesabının &quot;yoneticiler&quot; tablosunda kayıtlı olması gerekir.
        </p>
        <button
          onClick={cikisYap}
          className="mt-2 rounded-full bg-vurgu px-5 py-2.5 text-sm font-bold text-yonetim"
        >
          Çıkış Yap
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 bg-yonetim-dusuk">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-yonetim-kenar bg-yonetim-dusuk px-4 py-6 lg:flex">
        <div className="mb-8 flex items-center gap-2.5 px-2">
          <Logo className="h-7" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40">Yönetim</span>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {MENU.map(({ etiket, href, Icon }) => {
            const aktif = href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-semibold transition ${
                  aktif
                    ? "bg-vurgu/10 text-vurgu"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {etiket}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-yonetim-kenar pt-4">
          <p className="truncate px-2 text-sm font-semibold text-white">{yonetici?.ad_soyad}</p>
          <p className="truncate px-2 text-xs text-white/40">{yonetici?.email}</p>
          <button
            onClick={cikisYap}
            className="mt-3 flex w-full items-center gap-2 rounded-lg px-3.5 py-2.5 text-sm font-semibold text-white/60 transition hover:bg-white/5 hover:text-white"
          >
            <IconCikis className="h-4 w-4" />
            Çıkış Yap
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-yonetim-kenar bg-yonetim/90 px-6 py-4 backdrop-blur">
          <div>
            <h1 className="text-lg font-bold text-white">{baslik}</h1>
            {aciklama && <p className="mt-0.5 text-sm text-white/50">{aciklama}</p>}
          </div>
          <BildirimZili />
        </header>

        <main className="flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
