import YasalSayfaShell from "@/components/YasalSayfaShell";
import { SOZLESME_BOLUMLERI, SOZLESME_TARIHI } from "@/lib/avukatSozlesmesi";

export const metadata = { title: "Avukat Hizmet Sözleşmesi" };

export default function AvukatSozlesmesi() {
  return (
    <YasalSayfaShell baslik="Avukat Hizmet Sözleşmesi" guncellemeTarihi={SOZLESME_TARIHI}>
      {SOZLESME_BOLUMLERI.map(({ baslik, paragraflar, liste }) => (
        <section key={baslik}>
          <h2>{baslik}</h2>
          {paragraflar.map((metin) => (
            <p key={metin}>{metin}</p>
          ))}
          {liste && (
            <ul>
              {liste.map((madde) => (
                <li key={madde}>{madde}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </YasalSayfaShell>
  );
}
