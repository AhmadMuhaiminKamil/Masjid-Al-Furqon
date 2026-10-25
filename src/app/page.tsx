import Link from "next/link";
import { prayerTimes, services, gallery } from "@/lib/data";
import { getSettings } from "@/lib/queries";

/* ---------- ikon service ---------- */
function ServiceIcon({ name }: { name: string }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    viewBox: "0 0 24 24",
  } as const;

  if (name === "prayer")
    return (
      <svg {...common}>
        <path d="M12 2C8 6 6 9 6 12a6 6 0 0012 0c0-3-2-6-6-10z" />
        <path d="M12 22v-4" />
      </svg>
    );
  if (name === "book")
    return (
      <svg {...common}>
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
      </svg>
    );
  if (name === "social")
    return (
      <svg {...common}>
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  );
}

/* ---------- tanggal Indonesia ---------- */
function todayId() {
  const d = new Date();
  const hari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const bulan = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  return `${hari[d.getDay()]}, ${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
}

export default async function Home() {
  const st = await getSettings();
  const namaMasjid = (st.site_name || "Masjid Al-Furqon").toUpperCase();
  const kota = (st.site_city || "Padang").toUpperCase();
  return (
    <>
      {/* ============ HERO ============ */}
      <section
        className="iq-hero"
        style={{ backgroundImage: "url('/images/hero-masjid.jpg')" }}
      >
        <div className="iq-hero__overlay" />

        <div className="iq-hero__inner">
          <div className="iq-hero__content">
            <div className="iq-eyebrow">
              <span className="iq-eyebrow__rule" />
              {namaMasjid} &middot; {kota}
            </div>

            <h1 className="iq-hero__title">
              Rumah Ibadah,
              <br />
              Pusat Peradaban
              <br />
              Umat
            </h1>

            <p className="iq-hero__sub">
              Membangun Umat, <span className="accent">Merawat Tradisi.</span>
            </p>

            <p className="iq-hero__desc">
              Selamat datang di Masjid Al-Furqon. Tempat kita menautkan hati,
              meneguhkan iman, dan menebar manfaat bagi seluruh alam.
            </p>

            <div className="iq-hero__actions">
              <Link href="/jadwal" className="iq-btn iq-btn--gold">
                Lihat Jadwal Sholat{" "}
                <span className="iq-btn__arrow">&rarr;</span>
              </Link>
              <Link href="/donasi" className="iq-btn iq-btn--ghost">
                Donasi Sekarang
              </Link>
            </div>
          </div>
        </div>

        {/* prayer bar */}
        <div className="iq-prayer">
          <div className="iq-prayer__inner">
            <div className="iq-prayer__head">
              <span className="iq-prayer__label">JADWAL SHOLAT HARI INI</span>
              <span className="iq-prayer__date">{todayId()}</span>
            </div>
            <div className="iq-prayer__list">
              {prayerTimes.map((p) => (
                <div key={p.name} className="iq-prayer__item">
                  <span className="iq-prayer__name">
                    {p.name.toUpperCase()}
                  </span>
                  <span className="iq-prayer__time">{p.adzan}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ LAYANAN ============ */}
      <section className="iq-section iq-section--white">
        <div className="iq-container">
          <div className="iq-section__head iq-section__head--center">
            <div className="iq-eyebrow iq-eyebrow--dark iq-eyebrow--center">
              <span className="iq-eyebrow__rule" />
              LAYANAN KAMI
              <span className="iq-eyebrow__rule" />
            </div>
            <h2 className="iq-section__title">
              Untuk Kemakmuran
              <br />
              dan Kesejahteraan Umat
            </h2>
            <p className="iq-section__desc">
              Berbagai program dan layanan yang kami sediakan untuk jamaah dan
              masyarakat luas.
            </p>
          </div>

          <div className="iq-services">
            {services.map((s) => (
              <Link key={s.title} href={s.href} className="iq-service">
                <div className="iq-service__icon">
                  <ServiceIcon name={s.icon} />
                </div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <span className="iq-service__link">
                  Selengkapnya <span className="iq-btn__arrow">&rarr;</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============ GALERI ============ */}
      <section className="iq-section iq-section--soft">
        <div className="iq-container">
          <div className="iq-section__head iq-section__head--center">
            <div className="iq-eyebrow iq-eyebrow--dark iq-eyebrow--center">
              <span className="iq-eyebrow__rule" />
              GALERI
              <span className="iq-eyebrow__rule" />
            </div>
            <h2 className="iq-section__title">Momen di Masjid Al-Furqon</h2>
            <p className="iq-section__desc">
              Rekam jejak kegiatan dan keindahan rumah ibadah kita.
            </p>
          </div>

          <div className="iq-gallery">
            {gallery.map((g) => (
              <figure key={g.src} className="iq-gallery__item">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={g.src} alt={g.caption} />
                <figcaption>{g.caption}</figcaption>
              </figure>
            ))}
          </div>

          <div className="iq-gallery__cta">
            <Link
              href="/galeri"
              className="iq-btn"
              style={{
                color: "#0f5132",
                borderColor: "rgba(11,61,44,.28)",
                border: "1.5px solid rgba(11,61,44,.28)",
              }}
            >
              Lihat Semua Galeri <span className="iq-btn__arrow">&rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="iq-cta">
        <div className="iq-cta__overlay" />
        <div className="iq-container iq-cta__inner">
          <div className="iq-eyebrow iq-eyebrow--center">
            <span className="iq-eyebrow__rule" />
            MARI BERINFAQ
          </div>
          <h2 className="iq-cta__title">
            Setiap Infaq Anda
            <br />
            Menghidupkan Masjid
          </h2>
          <p className="iq-cta__desc">
            Berkontribusi untuk kemakmuran masjid dan kesejahteraan umat. Setiap
            rupiah yang Anda salurkan akan menjadi amal jariyah.
          </p>
          <Link href="/donasi" className="iq-btn iq-btn--gold">
            Salurkan Donasi <span className="iq-btn__arrow">&rarr;</span>
          </Link>
        </div>
      </section>
    </>
  );
}
