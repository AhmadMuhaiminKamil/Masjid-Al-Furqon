import { profil as fb } from "@/lib/pages-data";
import { getPublishedTeam } from "@/lib/queries";

export const metadata = { title: "Profil" };
export const revalidate = 300; // ISR — cache 5 menit, navigasi instan

export default async function ProfilPage() {
  const teamRows = await getPublishedTeam();

  // pengurus: DB mengalahkan data statis
  const profil = {
    ...fb,
    team:
      teamRows.length > 0
        ? teamRows.map((t) => ({
            name: t.name,
            position: t.position,
            initials: t.name
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((w) => w[0])
              .join("")
              .toUpperCase(),
          }))
        : fb.team,
  };

  return (
    <>
      <section className="iq-page-hero">
        <div className="iq-page-hero__inner">
          <div className="iq-eyebrow iq-eyebrow--center">
            <span className="iq-eyebrow__rule" />
            {profil.eyebrow}
          </div>
          <h1>{profil.title}</h1>
          <p>{profil.desc}</p>
        </div>
      </section>

      {/* SEJARAH */}
      <section className="iq-section iq-section--white">
        <div className="iq-container">
          <div className="iq-split">
            <div>
              <div className="iq-eyebrow iq-eyebrow--dark">
                <span className="iq-eyebrow__rule" />
                SEJARAH
              </div>
              <h2 className="iq-section__title">
                {profil.sejarah.title.split("\n").map((line, i) => (
                  <span key={i}>
                    {line}
                    {i === 0 && <br />}
                  </span>
                ))}
              </h2>
              <p className="iq-body-text">{profil.sejarah.p1}</p>
              <p className="iq-body-text">{profil.sejarah.p2}</p>

              <div className="iq-stat-inline">
                {profil.sejarah.stats.map((s) => (
                  <div key={s.label}>
                    <strong>{s.value}</strong>
                    <span>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="iq-split__img">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/galeri-1.jpg" alt="Masjid Al-Furqon" />
            </div>
          </div>
        </div>
      </section>

      {/* VISI MISI */}
      <section className="iq-section iq-section--soft">
        <div className="iq-container">
          <div className="iq-vm">
            <div className="iq-vm__card">
              <div className="iq-vm__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="6" />
                  <circle cx="12" cy="12" r="2" />
                </svg>
              </div>
              <h3>Visi</h3>
              <p>{profil.visi}</p>
            </div>

            <div className="iq-vm__card">
              <div className="iq-vm__icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                </svg>
              </div>
              <h3>Misi</h3>
              <ul className="iq-misi-list">
                {profil.misi.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="iq-section iq-section--white">
        <div className="iq-container">
          <div className="iq-section__head iq-section__head--center">
            <div className="iq-eyebrow iq-eyebrow--dark iq-eyebrow--center">
              <span className="iq-eyebrow__rule" />
              PENGURUS
              <span className="iq-eyebrow__rule" />
            </div>
            <h2 className="iq-section__title">Struktur Pengurus DKM</h2>
            <p className="iq-section__desc">Periode 2024 – 2029</p>
          </div>

          <div className="iq-team">
            {profil.team.map((t) => (
              <div key={t.name} className="iq-team__card">
                <div className="iq-team__avatar">{t.initials}</div>
                <h4>{t.name}</h4>
                <span>{t.position}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
