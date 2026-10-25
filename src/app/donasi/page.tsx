import { donasi as fb } from "@/lib/pages-data";
import { getSettings } from "@/lib/queries";

export const metadata = { title: "Donasi" };
export const revalidate = 300; // ISR — cache 5 menit, navigasi instan

export default async function DonasiPage() {
  const st = await getSettings();

  // ganti data rekening bank dari settings DB
  const donasi = {
    ...fb,
    methods: fb.methods.map((m) =>
      m.type === "bank"
        ? {
            ...m,
            bank: st.bank_account || m.bank,
            detail: st.bank_name
              ? `${st.bank_name}
a.n. ${st.bank_holder || "DKM Masjid Al-Furqon"}`
              : m.detail,
          }
        : m
    ),
  };

  return (
    <>
      <section className="iq-page-hero">
        <div className="iq-page-hero__inner">
          <div className="iq-eyebrow iq-eyebrow--center">
            <span className="iq-eyebrow__rule" />
            {donasi.eyebrow}
          </div>
          <h1>{donasi.title}</h1>
          <p>{donasi.desc}</p>
        </div>
      </section>

      {/* METODE DONASI */}
      <section className="iq-section iq-section--white">
        <div className="iq-container">
          <div className="iq-section__head iq-section__head--center">
            <div className="iq-eyebrow iq-eyebrow--dark iq-eyebrow--center">
              <span className="iq-eyebrow__rule" />
              MARI BERINFAQ
              <span className="iq-eyebrow__rule" />
            </div>
            <h2 className="iq-section__title">Salurkan Infaq Terbaik Anda</h2>
            <p className="iq-section__desc">
              Donasi Anda digunakan untuk operasional masjid, program pendidikan,
              dan kegiatan sosial.
            </p>
          </div>

          <div className="iq-donasi">
            {donasi.methods.map((m) => (
              <div key={m.label} className="iq-donasi__card">
                <span className="iq-donasi__label">{m.label}</span>

                {m.type === "bank" && (
                  <>
                    <div className="iq-bank">{m.bank}</div>
                    <p>
                      {m.detail?.split("\n").map((l, i) => (
                        <span key={i}>
                          {l}
                          {i < (m.detail?.split("\n").length ?? 0) - 1 && <br />}
                        </span>
                      ))}
                    </p>
                  </>
                )}

                {m.type === "qris" && (
                  <>
                    <div className="iq-qris">QR Code</div>
                    <p>
                      {m.detail?.split("\n").map((l, i) => (
                        <span key={i}>
                          {l}
                          {i < (m.detail?.split("\n").length ?? 0) - 1 && <br />}
                        </span>
                      ))}
                    </p>
                  </>
                )}

                {m.type === "cash" && (
                  <>
                    <div className="iq-qris" style={{ borderStyle: "solid", background: "rgba(15,81,50,.06)", color: "#0f5132" }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="56" height="56">
                        <rect x="2" y="6" width="20" height="12" rx="2" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </div>
                    <p>
                      {m.detail?.split("\n").map((l, i) => (
                        <span key={i}>
                          {l}
                          {i < (m.detail?.split("\n").length ?? 0) - 1 && <br />}
                        </span>
                      ))}
                    </p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROGRAM */}
      <section className="iq-section iq-section--soft">
        <div className="iq-container">
          <div className="iq-section__head iq-section__head--center">
            <div className="iq-eyebrow iq-eyebrow--dark iq-eyebrow--center">
              <span className="iq-eyebrow__rule" />
              PROGRAM
              <span className="iq-eyebrow__rule" />
            </div>
            <h2 className="iq-section__title">
              Program yang Didukung Donasi Anda
            </h2>
          </div>

          <div className="iq-progress">
            {donasi.programs.map((p) => (
              <div key={p.title} className="iq-progress__card">
                <h4>{p.title}</h4>
                <div className="iq-progress__bar">
                  <span style={{ width: `${p.percent}%` }} />
                </div>
                <div className="iq-progress__meta">
                  <span>{p.collected}</span>
                  <span>{p.target}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
