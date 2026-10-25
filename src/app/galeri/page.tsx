import { getPublishedGalleries } from "@/lib/queries";
import { galeri as fallback } from "@/lib/pages-data";

export const metadata = { title: "Galeri" };
export const revalidate = 300; // ISR — cache 5 menit, navigasi instan

export default async function GaleriPage() {
  const rows = await getPublishedGalleries();

  const items =
    rows.length > 0
      ? rows.map((r) => ({
          src: r.imageUrl,
          caption: r.caption || r.title || "Foto Masjid",
        }))
      : fallback.items;

  return (
    <>
      <section className="iq-page-hero">
        <div className="iq-page-hero__inner">
          <div className="iq-eyebrow iq-eyebrow--center">
            <span className="iq-eyebrow__rule" />
            {fallback.eyebrow}
          </div>
          <h1>{fallback.title}</h1>
          <p>{fallback.desc}</p>
        </div>
      </section>

      <section className="iq-section iq-section--white">
        <div className="iq-container">
          <div className="iq-section__head iq-section__head--center">
            <div className="iq-eyebrow iq-eyebrow--dark iq-eyebrow--center">
              <span className="iq-eyebrow__rule" />
              FOTO
              <span className="iq-eyebrow__rule" />
            </div>
            <h2 className="iq-section__title">Momen di Masjid Al-Furqon</h2>
            <p className="iq-section__desc">
              Kumpulan dokumentasi kegiatan dan keindahan rumah ibadah kita.
            </p>
          </div>

          <div className="iq-gallery">
            {items.map((g, idx) => (
              <figure key={`${g.src}-${idx}`} className="iq-gallery__item">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={g.src} alt={g.caption} />
                <figcaption>{g.caption}</figcaption>
              </figure>
            ))}
          </div>

          <div className="iq-pagination">
            <span className="iq-pagination__info">Menampilkan {items.length} foto</span>
          </div>
        </div>
      </section>
    </>
  );
}
