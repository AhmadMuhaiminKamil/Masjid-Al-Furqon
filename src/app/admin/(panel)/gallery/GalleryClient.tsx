"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Pencil, Trash2, Eye, EyeOff, X, ImageIcon, Plus, Search } from "lucide-react";
import {
  createGallery,
  updateGallery,
  deleteGallery,
  togglePublishGallery,
  type GalleryRow,
} from "./actions";
import { ImageUpload } from "@/components/ImageUpload";

export function GalleryClient({ initial }: { initial: GalleryRow[] }) {
  const [rows, setRows] = useState<GalleryRow[]>(initial);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<GalleryRow | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  /* ---------- search by title ---------- */
  const filtered = rows.filter((r) =>
    r.title.toLowerCase().includes(q.trim().toLowerCase())
  );

  function openCreate() {
    setImageUrl("");
    setEditing(null);
    setCreating(true);
    setError(null);
  }
  function openEdit(row: GalleryRow) {
    setImageUrl(row.imageUrl ?? "");
    setEditing(row);
    setCreating(false);
    setError(null);
  }
  function closeModal() {
    setImageUrl("");
    setEditing(null);
    setCreating(false);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    start(async () => {
      const res = editing
        ? await updateGallery(editing.id, fd)
        : await createGallery(fd);

      if (res?.error) {
        setError(res.error);
        return;
      }
      closeModal();
      window.location.reload();
    });
  }

  async function handleDelete(row: GalleryRow) {
    if (!confirm(`Hapus foto "${row.title}"? Tindakan ini tidak bisa dibatalkan.`))
      return;
    start(async () => {
      const res = await deleteGallery(row.id);
      if (res?.error) {
        alert(res.error);
        return;
      }
      setRows((p) => p.filter((r) => r.id !== row.id));
    });
  }

  async function handleToggle(row: GalleryRow) {
    const next = !row.published;
    start(async () => {
      const res = await togglePublishGallery(row.id, next);
      if (res?.error) {
        alert(res.error);
        return;
      }
      setRows((p) =>
        p.map((r) => (r.id === row.id ? { ...r, published: next } : r))
      );
    });
  }

  const showModal = creating || editing !== null;
  const form = editing;

  return (
    <>
      {/* ---------- toolbar ---------- */}
      <div className="iq-adm-toolbar">
        <div className="iq-adm-search">
          <Search size={15} />
          <input
            placeholder="Cari judul foto..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <span style={{ fontSize: ".82rem", color: "#8a978f" }}>
          {filtered.length} dari {rows.length} foto
        </span>
        <div style={{ marginLeft: "auto" }}>
          <button className="iq-btn iq-btn--primary" onClick={openCreate}>
            <Plus size={15} />
            Tambah Foto
          </button>
        </div>
      </div>

      {/* ---------- empty state ---------- */}
      {filtered.length === 0 ? (
        <div className="iq-adm-card">
          <div className="iq-adm-empty">
            <div className="iq-adm-empty__ico">
              <ImageIcon size={26} />
            </div>
            <h3>{q ? "Tidak ada hasil" : "Belum ada foto"}</h3>
            <p>
              {q
                ? `Tidak ada foto cocok dengan "${q}".`
                : "Tambahkan foto pertama untuk mengisi galeri website masjid."}
            </p>
            {!q && (
              <button className="iq-btn iq-btn--primary" onClick={openCreate}>
                Tambah Foto Pertama
              </button>
            )}
          </div>
        </div>
      ) : (
        /* ---------- grid view ---------- */
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "16px",
          }}
        >
          {filtered.map((r) => (
            <article
              key={r.id}
              style={{
                position: "relative",
                background: "#fff",
                border: "1px solid #e6ebe7",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 1px 2px rgba(16,40,30,.04)",
              }}
            >
              {/* thumbnail + hover overlay */}
              <div
                className="iq-gal-thumb"
                style={{
                  position: "relative",
                  aspectRatio: "4 / 3",
                  background: "#eef3ef",
                  overflow: "hidden",
                }}
              >
                <Image
                  src={r.imageUrl}
                  alt={r.title}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 100vw, 260px"
                  style={{ objectFit: "cover" }}
                />

                {/* badge status */}
                <span
                  style={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    zIndex: 3,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "3px 8px",
                    borderRadius: 999,
                    fontSize: ".68rem",
                    fontWeight: 700,
                    letterSpacing: ".02em",
                    background: r.published
                      ? "rgba(20,120,70,.9)"
                      : "rgba(120,110,40,.92)",
                    color: "#fff",
                  }}
                >
                  {r.published ? "Terbit" : "Draf"}
                </span>

                {/* hover overlay: edit / hapus */}
                <div
                  className="iq-gal-overlay"
                  style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    background: "rgba(12,32,24,.55)",
                    opacity: 0,
                    transition: "opacity .18s ease",
                  }}
                >
                  <button
                    type="button"
                    title="Edit foto"
                    onClick={() => openEdit(r)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 13px",
                      borderRadius: 8,
                      border: "none",
                      cursor: "pointer",
                      background: "#fff",
                      color: "#16402f",
                      fontSize: ".78rem",
                      fontWeight: 600,
                    }}
                  >
                    <Pencil size={14} />
                    Edit
                  </button>
                  <button
                    type="button"
                    title="Hapus foto"
                    onClick={() => handleDelete(r)}
                    disabled={pending}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 13px",
                      borderRadius: 8,
                      border: "none",
                      cursor: pending ? "not-allowed" : "pointer",
                      background: "#c0392b",
                      color: "#fff",
                      fontSize: ".78rem",
                      fontWeight: 600,
                    }}
                  >
                    <Trash2 size={14} />
                    Hapus
                  </button>
                </div>
              </div>

              {/* meta */}
              <div style={{ padding: "11px 12px 12px" }}>
                <div
                  style={{
                    fontSize: ".9rem",
                    fontWeight: 600,
                    color: "#1b3a2c",
                    lineHeight: 1.35,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {r.title}
                </div>
                {r.caption && (
                  <div
                    style={{
                      fontSize: ".76rem",
                      color: "#7b8a82",
                      marginTop: 4,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {r.caption}
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: 10,
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: ".72rem", color: "#9aa9a0" }}>
                    Urutan {r.order}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <button
                      type="button"
                      className="iq-btn iq-btn--ghost iq-btn--icon"
                      title={r.published ? "Jadikan draf" : "Terbitkan"}
                      onClick={() => handleToggle(r)}
                      disabled={pending}
                    >
                      {r.published ? <Eye size={15} /> : <EyeOff size={15} />}
                    </button>
                    <button
                      type="button"
                      className="iq-btn iq-btn--danger iq-btn--icon"
                      title="Hapus foto"
                      onClick={() => handleDelete(r)}
                      disabled={pending}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* hover overlay behaviour + keyboard focus (scoped, harmless) */}
      <style>{`
        .iq-gal-thumb .iq-gal-overlay { opacity: 0; }
        .iq-gal-thumb:hover .iq-gal-overlay,
        .iq-gal-thumb:focus-within .iq-gal-overlay { opacity: 1; }
        @media (hover: none) {
          .iq-gal-thumb .iq-gal-overlay { opacity: 1; background: rgba(12,32,24,.35); }
        }
      `}</style>

      {/* ---------- modal form ---------- */}
      {showModal && (
        <div
          className="iq-modal"
          onMouseDown={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="iq-modal__box">
            <div className="iq-modal__head">
              <h2>{form ? "Edit Foto" : "Tambah Foto"}</h2>
              <button className="iq-modal__close" onClick={closeModal}>
                <X size={17} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="iq-modal__body">
                {error && (
                  <div className="iq-adm-savebar iq-adm-savebar--err">{error}</div>
                )}

                <div className="iq-adm-form">
                  <div className="iq-adm-field">
                    <label htmlFor="title">
                      Judul<span className="req">*</span>
                    </label>
                    <input
                      id="title"
                      name="title"
                      type="text"
                      required
                      defaultValue={form?.title ?? ""}
                      placeholder="Contoh: Kajian Rutin Ahad Pagi"
                    />
                  </div>

                                    <ImageUpload
                    label="Foto"
                    required
                    value={imageUrl}
                    onChange={setImageUrl}
                    ratio="16 / 10"
                  />
                  {/* hidden input supaya nilai ikut terkirim saat submit */}
                  <input type="hidden" name="imageUrl" value={imageUrl} />

                  <div className="iq-adm-field">
                    <label htmlFor="caption">Caption</label>
                    <textarea
                      id="caption"
                      name="caption"
                      style={{ minHeight: 76 }}
                      defaultValue={form?.caption ?? ""}
                      placeholder="Keterangan singkat foto (opsional)."
                    />
                  </div>

                  <div className="iq-adm-field">
                    <label htmlFor="order">Urutan</label>
                    <input
                      id="order"
                      name="order"
                      type="number"
                      defaultValue={form ? form.order : 0}
                      placeholder="0"
                    />
                    <span className="hint">
                      Angka kecil tampil lebih dulu. Default 0.
                    </span>
                  </div>

                  <label className="iq-adm-check">
                    <input
                      type="checkbox"
                      name="published"
                      defaultChecked={form ? form.published : true}
                    />
                    Terbitkan di website
                  </label>
                </div>
              </div>

              <div className="iq-modal__foot">
                <button
                  type="button"
                  className="iq-btn iq-btn--ghost"
                  onClick={closeModal}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="iq-btn iq-btn--primary"
                  disabled={pending}
                >
                  {pending
                    ? "Menyimpan..."
                    : form
                      ? "Simpan Perubahan"
                      : "Tambah Foto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
