import { jadwal as fb } from "@/lib/pages-data";
import { getPublishedSchedules } from "@/lib/queries";

export const metadata = { title: "Jadwal" };
export const revalidate = 300; // ISR — cache 5 menit, navigasi instan

export default async function JadwalPage() {
  const rows = await getPublishedSchedules();

  // kajian: DB mengalahkan data statis
  const jadwal = {
    ...fb,
    kajian:
      rows.length > 0
        ? rows.map((r) => ({
            day: (r.day || "").toUpperCase(),
            time: r.time || "",
            title: r.title,
            desc: r.description || "",
            location: r.location || "",
          }))
        : fb.kajian,
  };

  return (
    <>
      <section className="iq-page-hero">
        <div className="iq-page-hero__inner">
          <div className="iq-eyebrow iq-eyebrow--center">
            <span className="iq-eyebrow__rule" />
            {jadwal.eyebrow}
          </div>
          <h1>{jadwal.title}</h1>
          <p>{jadwal.desc}</p>
        </div>
      </section>

      {/* KAJIAN RUTIN — tabel jadwal sholat ada di beranda */}
      <section className="iq-section iq-section--white">
        <div className="iq-container">
          <div className="iq-section__head iq-section__head--center">
            <div className="iq-eyebrow iq-eyebrow--dark iq-eyebrow--center">
              <span className="iq-eyebrow__rule" />
              KAJIAN RUTIN
              <span className="iq-eyebrow__rule" />
            </div>
            <h2 className="iq-section__title">Agenda Kajian Mingguan</h2>
            <p className="iq-section__desc">
              Kajian rutin yang terbuka untuk seluruh jamaah Masjid Al-Furqon.
            </p>
          </div>

          <div className="iq-kajian">
            {jadwal.kajian.map((k) => (
              <div key={k.title} className="iq-kajian__card">
                <div className="iq-kajian__day">
                  <span className="iq-day">{k.day}</span>
                  <span className="iq-time">{k.time}</span>
                </div>
                <h3>{k.title}</h3>
                <p>{k.desc}</p>
                <span className="iq-tag">{k.location}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
