"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Pencil, Trash2, Eye, EyeOff, X, ImageIcon } from "lucide-react";
import {
  createPost,
  updatePost,
  deletePost,
  togglePublishPost,
  type PostRow,
} from "./actions";
import { ImageUpload } from "@/components/ImageUpload";

const CATEGORIES = ["Berita", "Kegiatan", "Pengumuman", "Artikel"];

export function PostsClient({ initial }: { initial: PostRow[] }) {
  const [rows, setRows] = useState<PostRow[]>(initial);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<PostRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coverImage, setCoverImage] = useState<string>("");
  const [pending, start] = useTransition();

  const filtered = rows.filter(
    (r) =>
      r.title.toLowerCase().includes(q.toLowerCase()) ||
      (r.category || "").toLowerCase().includes(q.toLowerCase())
  );

  function openCreate() {
    setCoverImage("");
    setEditing(null);
    setCreating(true);
    setError(null);
  }
  function openEdit(row: PostRow) {
    setCoverImage(row.coverImage ?? "");
    setEditing(row);
    setCreating(false);
    setError(null);
  }
  function closeModal() {
    setCoverImage("");
    setEditing(null);
    setCreating(false);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    start(async () => {
      const res = editing
        ? await updatePost(editing.id, fd)
        : await createPost(fd);

      if (res?.error) {
        setError(res.error);
        return;
      }
      closeModal();
      window.location.reload();
    });
  }

  async function handleDelete(row: PostRow) {
    if (!confirm(`Hapus "${row.title}"? Tindakan ini tidak bisa dibatalkan.`))
      return;
    start(async () => {
      const res = await deletePost(row.id);
      if (res?.error) {
        alert(res.error);
        return;
      }
      setRows((p) => p.filter((r) => r.id !== row.id));
    });
  }

  async function handleToggle(row: PostRow) {
    const next = !row.published;
    start(async () => {
      await togglePublishPost(row.id, next);
      setRows((p) =>
        p.map((r) => (r.id === row.id ? { ...r, published: next } : r))
      );
    });
  }

  const showModal = creating || editing !== null;
  const form = editing;

  return (
    <>
      <div className="iq-adm-toolbar">
        <div className="iq-adm-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            placeholder="Cari judul atau kategori..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <span style={{ fontSize: ".82rem", color: "#8a978f" }}>
          {filtered.length} dari {rows.length} entri
        </span>
        <div style={{ marginLeft: "auto" }}>
          <button className="iq-btn iq-btn--primary" onClick={openCreate}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Tambah Berita
          </button>
        </div>
      </div>

      <div className="iq-adm-card">
        {filtered.length === 0 ? (
          <div className="iq-adm-empty">
            <div className="iq-adm-empty__ico">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9h4" />
                <path d="M18 14h-8M15 18h-5M10 6h8v4h-8z" />
              </svg>
            </div>
            <h3>{q ? "Tidak ada hasil" : "Belum ada berita"}</h3>
            <p>
              {q
                ? `Tidak ada entri cocok dengan "${q}".`
                : "Tambahkan berita atau kegiatan pertama untuk website masjid."}
            </p>
            {!q && (
              <button className="iq-btn iq-btn--primary" onClick={openCreate}>
                Tambah Berita Pertama
              </button>
            )}
          </div>
        ) : (
          <div className="iq-adm-tablewrap">
            <table className="iq-adm-table">
              <thead>
                <tr>
                  <th style={{ width: 70 }}>Foto</th>
                  <th>Judul</th>
                  <th style={{ width: 120 }}>Kategori</th>
                  <th style={{ width: 110 }}>Status</th>
                  <th style={{ width: 130 }}>Tanggal</th>
                  <th style={{ width: 150 }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td>
                      {r.coverImage ? (
                        <Image
                          className="iq-adm-thumb"
                          src={r.coverImage}
                          alt={r.title}
                          width={52}
                          height={52}
                          unoptimized
                        />
                      ) : (
                        <div className="iq-adm-thumb" style={{ display: "grid", placeItems: "center", color: "#b6c3bb" }}>
                          <ImageIcon size={18} />
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="iq-adm-celltitle">{r.title}</div>
                      <div className="iq-adm-cellsub">/{r.slug}</div>
                    </td>
                    <td>
                      <span className="iq-badge iq-badge--blue">{r.category}</span>
                    </td>
                    <td>
                      <span
                        className={`iq-badge ${r.published ? "iq-badge--green" : "iq-badge--gray"}`}
                      >
                        {r.published ? "Terbit" : "Draf"}
                      </span>
                    </td>
                    <td style={{ fontSize: ".8rem", color: "#7b8a82" }}>
                      {new Date(r.publishedAt ?? r.createdAt ?? Date.now()).toLocaleDateString(
                        "id-ID",
                        { day: "2-digit", month: "short", year: "numeric" }
                      )}
                    </td>
                    <td className="iq-td-actions">
                      <button
                        className="iq-btn iq-btn--ghost iq-btn--icon"
                        title={r.published ? "Sembunyikan" : "Terbitkan"}
                        onClick={() => handleToggle(r)}
                        disabled={pending}
                      >
                        {r.published ? <Eye size={15} /> : <EyeOff size={15} />}
                      </button>
                      <button
                        className="iq-btn iq-btn--ghost iq-btn--icon"
                        title="Edit"
                        onClick={() => openEdit(r)}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        className="iq-btn iq-btn--danger iq-btn--icon"
                        title="Hapus"
                        onClick={() => handleDelete(r)}
                        disabled={pending}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="iq-modal" onMouseDown={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="iq-modal__box">
            <div className="iq-modal__head">
              <h2>{form ? "Edit Berita" : "Tambah Berita"}</h2>
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
                      placeholder="Contoh: Kajian Rutin Bulan Ini"
                    />
                  </div>

                  <div className="iq-adm-grid2">
                    <div className="iq-adm-field">
                      <label htmlFor="category">Kategori</label>
                      <select
                        id="category"
                        name="category"
                        defaultValue={form?.category ?? "Berita"}
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="iq-adm-field">
                      <label htmlFor="slug">Slug URL</label>
                      <input
                        id="slug"
                        name="slug"
                        type="text"
                        defaultValue={form?.slug ?? ""}
                        placeholder="otomatis dari judul"
                      />
                    </div>
                  </div>

                  <ImageUpload
                    label="Foto Utama"
                    value={coverImage}
                    onChange={setCoverImage}
                    ratio="16 / 9"
                    hint="JPG, PNG, WEBP, atau GIF · maksimal 5 MB · opsional"
                  />
                  <input type="hidden" name="coverImage" value={coverImage} />

                  <div className="iq-adm-field">
                    <label htmlFor="excerpt">Ringkasan</label>
                    <textarea
                      id="excerpt"
                      name="excerpt"
                      style={{ minHeight: 76 }}
                      defaultValue={form?.excerpt ?? ""}
                      placeholder="Satu atau dua kalimat ringkas untuk kartu berita."
                    />
                  </div>

                  <div className="iq-adm-field">
                    <label htmlFor="content">Isi Lengkap</label>
                    <textarea
                      id="content"
                      name="content"
                      defaultValue={form?.content ?? ""}
                      placeholder="Tulis isi berita di sini..."
                    />
                    <span className="hint">Mendukung HTML sederhana seperti &lt;p&gt; dan &lt;strong&gt;.</span>
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
                <button type="button" className="iq-btn iq-btn--ghost" onClick={closeModal}>
                  Batal
                </button>
                <button type="submit" className="iq-btn iq-btn--primary" disabled={pending}>
                  {pending ? "Menyimpan..." : form ? "Simpan Perubahan" : "Tambah Berita"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
