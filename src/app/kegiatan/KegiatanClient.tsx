"use client";

import { useState } from "react";

export type EventItem = {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  date: string;
};

export function KegiatanClient({ items }: { items: EventItem[] }) {
  const [active, setActive] = useState("Semua");

  const categories = ["Semua", ...Array.from(new Set(items.map((i) => i.category)))];

  const filtered =
    active === "Semua"
      ? items
      : items.filter((i) => i.category.toLowerCase() === active.toLowerCase());

  return (
    <section className="iq-section iq-section--white">
      <div className="iq-container">
        <div className="iq-filter">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              className={active === c ? "is-active" : ""}
              onClick={() => setActive(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="iq-events">
          {filtered.map((item) => (
            <article key={item.id} className="iq-event">
              <div className="iq-event__img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt={item.title} />
                <span className="iq-event__badge">{item.category}</span>
              </div>
              <div className="iq-event__body">
                <div className="iq-event__meta">
                  <span>{item.date}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.excerpt}</p>
                <span className="iq-event__link">
                  Baca selengkapnya <span className="iq-btn__arrow">&rarr;</span>
                </span>
              </div>
            </article>
          ))}
        </div>

        {filtered.length === 0 && (
          <p style={{ textAlign: "center", color: "#6b746f", padding: "40px 0" }}>
            Belum ada kegiatan untuk kategori ini.
          </p>
        )}

        <div className="iq-pagination">
          <span className="iq-pagination__info">
            Menampilkan {filtered.length} dari {items.length} kegiatan
          </span>
        </div>
      </div>
    </section>
  );
}
