import YasalSayfaShell from "@/components/YasalSayfaShell";
import { SOZLESME_BOLUMLERI, SOZLESME_TARIHI, SOZLESME_SURUMU } from "@/lib/avukatSozlesmesi";

export const metadata = { title: "Avukat Hizmet Sözleşmesi" };

export default function AvukatSozlesmesi() {
  return (
    <YasalSayfaShell baslik="Avukat Hizmet Sözleşmesi" guncellemeTarihi={`${SOZLESME_TARIHI} (sürüm ${SOZLESME_SURUMU})`}>
      {SOZLESME_BOLUMLERI.map(({ baslik, maddeler }, bolumSirasi) => (
        <section key={baslik}>
          <h2>
            Madde {bolumSirasi + 1} · {baslik}
          </h2>
          {maddeler.map((metin, maddeSirasi) => (
            <p key={metin}>
              <strong className="text-white">
                {bolumSirasi + 1}.{maddeSirasi + 1}
              </strong>{" "}
              {metin}
            </p>
          ))}
        </section>
      ))}
    </YasalSayfaShell>
  );
}
