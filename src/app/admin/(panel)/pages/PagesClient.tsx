"use client";

import { useMemo, useState, useTransition } from "react";
import { FileText, Save, Check } from "lucide-react";
import { updatePage, type PageRow } from "./actions";

/* ============================================================
   Halaman statis — hanya LIST + EDIT (tanpa create/delete).
   Layout dua kolom: sidebar daftar halaman + form edit.
   ============================================================ */

export function PagesClient({ initial }: { initial: PageRow[] }) {
  const [rows, setRows] = useState<PageRow[]>(initial);
  const [selectedId, setSelectedId] = useState<number | null>(
    initial.length > 0 ? initial[0].id : null
  );
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const selected = useMemo(
    () => rows.find((r) => r.id === selectedId) ?? null,
    [rows, selectedId]
  );

  function pick(row: PageRow) {
    setSelectedId(row.id);
    setError(null);
    setOkMsg(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected) return;

    const fd = new FormData(e.currentTarget);
    const id = selected.id;
    setError(null);
    setOkMsg(null);

    start(async () => {
      const res = await updatePage(id, fd);
      if (res?.error) {
        setError(res.error);
        return;
      }
      // sinkronkan state lokal supaya sidebar langsung ter-update
      setRows((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                title: String(fd.get("title") || "").trim() || r.title,
                content: (String(fd.get("content") || "").trim() || null) as
                  | string
                  | null,
                eyebrow: (String(fd.get("eyebrow") || "").trim() || null) as
                  | string
                  | null,
                excerpt: (String(fd.get("excerpt") || "").trim() || null) as
                  | string
                  | null,
                heroImage: (String(fd.get("heroImage") || "").trim() || null) as
                  | string
                  | null,
                published: fd.get("published") === "on",
                updatedAt: new Date(),
              }
            : r
        )
      );
      setOkMsg("Halaman berhasil disimpan.");
    });
  }

  if (rows.length === 0) {
    return (
      <div className="iq-adm-card">
        <div className="iq-adm-empty">
          <div className="iq-adm-empty__ico">
            <FileText size={30} strokeWidth={1.6} />
          </div>
          <h3>Belum ada halaman</h3>
          <p>
            Jalankan seed database untuk membuat halaman statis (profil,
            jadwal, kontak, donasi).
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="iq-adm-card"
      style={{ display: "grid", gridTemplateColumns: "260px 1fr", minHeight: 520 }}
    >
      {/* ---------- SIDEBAR: daftar halaman ---------- */}
      <aside
        style={{
          borderRight: "1px solid #e8ece9",
          background: "#f8faf8",
          padding: "12px 10px",
          overflowY: "auto",
        }}
      >
        <p
          style={{
            fontSize: ".68rem",
            fontWeight: 700,
            letterSpacing: ".09em",
            textTransform: "uppercase",
            color: "#7b8a82",
            padding: "6px 10px 10px",
          }}
        >
          Daftar Halaman
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {rows.map((r) => {
            const active = r.id === selectedId;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => pick(r)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 2,
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: active ? "1px solid #0f5132" : "1px solid transparent",
                  background: active ? "#fff" : "transparent",
                  boxShadow: active
                    ? "0 1px 3px rgba(16,40,30,.08)"
                    : "none",
                  cursor: "pointer",
                  transition: "background .16s ease",
                }}
              >
                <span
                  style={{
                    fontSize: ".875rem",
                    fontWeight: active ? 650 : 550,
                    color: active ? "#0f5132" : "#2c3833",
                    lineHeight: 1.3,
                  }}
                >
                  {r.title}
                </span>
                <span
                  style={{
                    fontSize: ".75rem",
                    color: active ? "#5c7a68" : "#98a69e",
                    fontFamily: "ui-monospace, monospace",
                  }}
                >
                  /{r.slug}
                </span>
                {!r.published && (
                  <span
                    className="iq-badge iq-badge--gray"
                    style={{ marginTop: 4, fontSize: ".62rem" }}
                  >
                    Draf
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </aside>

      {/* ---------- PANEL KANAN: form edit ---------- */}
      <section style={{ padding: "20px 22px" }}>
        {!selected ? (
          <div className="iq-adm-empty" style={{ padding: "80px 24px" }}>
            <div className="iq-adm-empty__ico">
              <FileText size={30} strokeWidth={1.6} />
            </div>
            <h3>Pilih halaman di sebelah kiri</h3>
            <p>Klik salah satu halaman untuk mulai mengedit isinya.</p>
          </div>
        ) : (
          <form key={selected.id} onSubmit={handleSubmit}>
            {error && (
              <div className="iq-adm-savebar iq-adm-savebar--err">{error}</div>
            )}
            {okMsg && (
              <div className="iq-adm-savebar iq-adm-savebar--ok">
                <Check size={15} style={{ marginRight: 6, verticalAlign: "-2px" }} />
                {okMsg}
              </div>
            )}

            <div className="iq-adm-form">
              <div className="iq-adm-field">
                <label htmlFor={`title-${selected.id}`}>
                  Judul<span className="req">*</span>
                </label>
                <input
                  id={`title-${selected.id}`}
                  name="title"
                  type="text"
                  required
                  defaultValue={selected.title}
                  placeholder="Judul halaman"
                />
              </div>

              <div className="iq-adm-field">
                <label htmlFor={`slug-${selected.id}`}>Slug</label>
                <input
                  id={`slug-${selected.id}`}
                  type="text"
                  defaultValue={selected.slug}
                  disabled
                  readOnly
                  style={{
                    background: "#f4f6f5",
                    color: "#8a978f",
                    cursor: "not-allowed",
                  }}
                />
                <span className="hint">
                  Slug halaman statis tidak dapat diubah agar URL website tetap.
                </span>
              </div>

              <div className="iq-adm-grid2">
                <div className="iq-adm-field">
                  <label htmlFor={`eyebrow-${selected.id}`}>
                    Label Kecil (Eyebrow)
                  </label>
                  <input
                    id={`eyebrow-${selected.id}`}
                    name="eyebrow"
                    type="text"
                    defaultValue={selected.eyebrow ?? ""}
                    placeholder="Contoh: TENTANG KAMI"
                  />
                </div>
                <div className="iq-adm-field">
                  <label htmlFor={`heroImage-${selected.id}`}>URL Gambar Hero</label>
                  <input
                    id={`heroImage-${selected.id}`}
                    name="heroImage"
                    type="text"
                    defaultValue={selected.heroImage ?? ""}
                    placeholder="/images/hero-profil.jpg"
                  />
                </div>
              </div>

              <div className="iq-adm-field">
                <label htmlFor={`excerpt-${selected.id}`}>
                  Deskripsi Singkat
                </label>
                <textarea
                  id={`excerpt-${selected.id}`}
                  name="excerpt"
                  style={{ minHeight: 76 }}
                  defaultValue={selected.excerpt ?? ""}
                  placeholder="Satu atau dua kalimat yang tampil di bagian hero halaman."
                />
              </div>

              <div className="iq-adm-field">
                <label htmlFor={`content-${selected.id}`}>Konten</label>
                <textarea
                  id={`content-${selected.id}`}
                  name="content"
                  style={{ minHeight: 300 }}
                  defaultValue={selected.content ?? ""}
                  placeholder="Tulis isi halaman di sini..."
                />
                <span className="hint">
                  Mendukung HTML sederhana seperti &lt;p&gt;, &lt;strong&gt;, dan
                  &lt;ul&gt;.
                </span>
              </div>

              <label className="iq-adm-check">
                <input
                  type="checkbox"
                  name="published"
                  defaultChecked={selected.published}
                />
                Terbitkan di website
              </label>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginTop: 18,
                paddingTop: 16,
                borderTop: "1px solid #eef2ef",
              }}
            >
              <button
                type="submit"
                className="iq-btn iq-btn--primary"
                disabled={pending}
              >
                <Save size={15} />
                {pending ? "Menyimpan..." : "Simpan"}
              </button>
              <span style={{ fontSize: ".78rem", color: "#8a978f" }}>
                Terakhir diperbarui{" "}
                {new Date(selected.updatedAt).toLocaleString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}
