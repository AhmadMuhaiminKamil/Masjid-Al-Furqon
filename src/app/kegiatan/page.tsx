import { getPublishedPosts } from "@/lib/queries";
import { kegiatan as fallback } from "@/lib/pages-data";
import { KegiatanClient, type EventItem } from "./KegiatanClient";

export const metadata = { title: "Kegiatan" };
export const revalidate = 300; // ISR — cache 5 menit, navigasi instan

export default async function KegiatanPage() {
  const rows = await getPublishedPosts();

  // fallback ke data statis kalau DB kosong
  const items: EventItem[] =
    rows.length > 0
      ? rows.map((r) => ({
          id: r.id,
          title: r.title,
          excerpt: r.excerpt ?? "",
          image: r.coverImage ?? "/images/evt-kajian.jpg",
          category: r.category ?? "Kegiatan",
          date: new Date(r.publishedAt ?? r.createdAt ?? Date.now()).toLocaleDateString(
            "id-ID",
            { day: "2-digit", month: "long", year: "numeric" }
          ),
        }))
      : fallback.items.map((i, idx) => ({
          id: idx + 1,
          title: i.title,
          excerpt: i.desc,
          image: i.image,
          category: i.badge,
          date: i.date,
        }));

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

      <KegiatanClient items={items} />
    </>
  );
}
