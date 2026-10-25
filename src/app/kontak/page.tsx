import { kontak as fb } from "@/lib/pages-data";
import { getSettings } from "@/lib/queries";
import { ContactForm } from "./ContactForm";

export const metadata = { title: "Kontak" };
export const revalidate = 300; // ISR — cache 5 menit, navigasi instan

export default async function KontakPage() {
  const st = await getSettings();

  // gabung: DB mengalahkan data statis
  const kontak = {
    ...fb,
    address: st.contact_address || fb.address,
    phone: st.contact_phone || fb.phone,
    email: st.contact_email || fb.email,
    hours: st.contact_hours || fb.hours,
  };

  return (
    <>
      <section className="iq-page-hero">
        <div className="iq-page-hero__inner">
          <div className="iq-eyebrow iq-eyebrow--center">
            <span className="iq-eyebrow__rule" />
            {kontak.eyebrow}
          </div>
          <h1>{kontak.title}</h1>
          <p>{kontak.desc}</p>
        </div>
      </section>

      <section className="iq-section iq-section--white">
        <div className="iq-container">
          <div className="iq-contact">
            {/* info */}
            <div>
              <div className="iq-eyebrow iq-eyebrow--dark">
                <span className="iq-eyebrow__rule" />
                INFORMASI
              </div>
              <h2 className="iq-section__title">
                Mari Terhubung
                <br />
                dengan Kami
              </h2>
              <p className="iq-body-text">
                Sekretariat masjid buka setiap hari kerja pukul 08.00 &ndash;
                16.00 WIB.
              </p>

              <div className="iq-contact__list">
                <div className="iq-contact__item">
                  <div className="iq-contact__icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div>
                    <span className="iq-contact__label">Alamat</span>
                    <p>
                      {kontak.address.split("\n").map((l, i) => (
                        <span key={i}>
                          {l}
                          {i < kontak.address.split("\n").length - 1 && <br />}
                        </span>
                      ))}
                    </p>
                  </div>
                </div>

                <div className="iq-contact__item">
                  <div className="iq-contact__icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                  <div>
                    <span className="iq-contact__label">Telepon</span>
                    <p>
                      <a href={`tel:${kontak.phone.replace(/\s/g, "")}`}>
                        {kontak.phone}
                      </a>
                    </p>
                  </div>
                </div>

                <div className="iq-contact__item">
                  <div className="iq-contact__icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 6-10 7L2 6" />
                    </svg>
                  </div>
                  <div>
                    <span className="iq-contact__label">Email</span>
                    <p>
                      <a href={`mailto:${kontak.email}`}>{kontak.email}</a>
                    </p>
                  </div>
                </div>

                <div className="iq-contact__item">
                  <div className="iq-contact__icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                  </div>
                  <div>
                    <span className="iq-contact__label">Jam Operasional</span>
                    <p>
                      {kontak.hours.split("\n").map((l, i) => (
                        <span key={i}>
                          {l}
                          {i < kontak.hours.split("\n").length - 1 && <br />}
                        </span>
                      ))}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* form */}
            <div className="iq-form-wrap">
              <h3>Kirim Pesan</h3>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* map */}
      <section className="iq-map">
        <div className="iq-map__inner">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <h3>Lokasi Masjid Al-Furqon</h3>
          <p>Jl. Contoh Raya No. 123, Padang Barat</p>
          <a
            href="https://maps.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="iq-btn"
            style={{
              color: "#0f5132",
              border: "1.5px solid rgba(11,61,44,.28)",
            }}
          >
            Buka di Google Maps <span className="iq-btn__arrow">&rarr;</span>
          </a>
        </div>
      </section>
    </>
  );
}
