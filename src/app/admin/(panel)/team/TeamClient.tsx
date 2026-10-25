"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Pencil, Trash2, Eye, EyeOff, X, UserRound } from "lucide-react";
import {
  createTeam,
  updateTeam,
  deleteTeam,
  togglePublishTeam,
  type TeamRow,
} from "./actions";
import { ImageUpload } from "@/components/ImageUpload";

export function TeamClient({ initial }: { initial: TeamRow[] }) {
  const [rows, setRows] = useState<TeamRow[]>(initial);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<TeamRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [pending, start] = useTransition();

  const filtered = rows.filter(
    (r) =>
      r.name.toLowerCase().includes(q.toLowerCase()) ||
      r.position.toLowerCase().includes(q.toLowerCase())
  );

  function openCreate() {
    setPhotoUrl("");
    setEditing(null);
    setCreating(true);
    setError(null);
  }
  function openEdit(row: TeamRow) {
    setPhotoUrl(row.photo ?? "");
    setEditing(row);
    setCreating(false);
    setError(null);
  }
  function closeModal() {
    setPhotoUrl("");
    setEditing(null);
    setCreating(false);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    start(async () => {
      const res = editing ? await updateTeam(editing.id, fd) : await createTeam(fd);

      if (res?.error) {
        setError(res.error);
        return;
      }
      closeModal();
      window.location.reload();
    });
  }

  async function handleDelete(row: TeamRow) {
    if (!confirm(`Hapus pengurus "${row.name}"? Tindakan ini tidak bisa dibatalkan.`))
      return;
    start(async () => {
      const res = await deleteTeam(row.id);
      if (res?.error) {
        alert(res.error);
        return;
      }
      setRows((p) => p.filter((r) => r.id !== row.id));
    });
  }

  async function handleToggle(row: TeamRow) {
    const next = !row.published;
    start(async () => {
      const res = await togglePublishTeam(row.id, next);
      if (res?.error) {
        alert(res.error);
        return;
      }
      setRows((p) => p.map((r) => (r.id === row.id ? { ...r, published: next } : r)));
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
            placeholder="Cari nama atau jabatan..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <span style={{ fontSize: ".82rem", color: "#8a978f" }}>
          {filtered.length} dari {rows.length} pengurus
        </span>
        <div style={{ marginLeft: "auto" }}>
          <button className="iq-btn iq-btn--primary" onClick={openCreate}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Tambah Pengurus
          </button>
        </div>
      </div>

      <div className="iq-adm-card">
        {filtered.length === 0 ? (
          <div className="iq-adm-empty">
            <div className="iq-adm-empty__ico">
              <UserRound size={30} strokeWidth={1.6} />
            </div>
            <h3>{q ? "Tidak ada hasil" : "Belum ada pengurus"}</h3>
            <p>
              {q
                ? `Tidak ada pengurus cocok dengan "${q}".`
                : "Tambahkan pengurus pertama untuk ditampilkan di halaman profil."}
            </p>
            {!q && (
              <button className="iq-btn iq-btn--primary" onClick={openCreate}>
                Tambah Pengurus Pertama
              </button>
            )}
          </div>
        ) : (
          <div className="iq-adm-tablewrap">
            <table className="iq-adm-table">
              <thead>
                <tr>
                  <th style={{ width: 70 }}>Foto</th>
                  <th>Nama</th>
                  <th style={{ width: 200 }}>Jabatan</th>
                  <th style={{ width: 90 }}>Urutan</th>
                  <th style={{ width: 110 }}>Status</th>
                  <th style={{ width: 150 }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td>
                      {r.photo ? (
                        <Image
                          className="iq-adm-thumb"
                          src={r.photo}
                          alt={r.name}
                          width={52}
                          height={52}
                          unoptimized
                          style={{ borderRadius: "50%", objectFit: "cover" }}
                        />
                      ) : (
                        <div
                          className="iq-adm-thumb"
                          style={{
                            display: "grid",
                            placeItems: "center",
                            color: "#b6c3bb",
                            borderRadius: "50%",
                            background: "#eef2ef",
                            fontWeight: 700,
                            fontSize: ".9rem",
                          }}
                          title={r.name}
                        >
                          {r.name
                            .split(" ")
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((w) => w[0]?.toUpperCase())
                            .join("")}
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="iq-adm-celltitle">{r.name}</div>
                    </td>
                    <td>{r.position}</td>
                    <td style={{ color: "#7b8a82" }}>{r.order}</td>
                    <td>
                      <span
                        className={`iq-badge ${r.published ? "iq-badge--green" : "iq-badge--gray"}`}
                      >
                        {r.published ? "Terbit" : "Draf"}
                      </span>
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
              <h2>{form ? "Edit Pengurus" : "Tambah Pengurus"}</h2>
              <button className="iq-modal__close" onClick={closeModal}>
                <X size={17} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="iq-modal__body">
                {error && <div className="iq-adm-savebar iq-adm-savebar--err">{error}</div>}

                <div className="iq-adm-form">
                  <div className="iq-adm-field">
                    <label htmlFor="name">
                      Nama<span className="req">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      defaultValue={form?.name ?? ""}
                      placeholder="Contoh: H. Ahmad Fauzi"
                    />
                  </div>

                  <div className="iq-adm-field">
                    <label htmlFor="position">
                      Jabatan<span className="req">*</span>
                    </label>
                    <input
                      id="position"
                      name="position"
                      type="text"
                      required
                      defaultValue={form?.position ?? ""}
                      placeholder="Contoh: Ketua DKM"
                    />
                  </div>

                  <ImageUpload
                    label="Foto"
                    value={photoUrl}
                    onChange={setPhotoUrl}
                    ratio="1 / 1"
                    hint="JPG, PNG, WEBP · maks 5 MB · kosongkan untuk pakai inisial nama"
                  />
                  <input type="hidden" name="photo" value={photoUrl} />

                  <div className="iq-adm-field">
                    <label htmlFor="order">Urutan</label>
                    <input
                      id="order"
                      name="order"
                      type="number"
                      defaultValue={form ? form.order : 0}
                      placeholder="0"
                    />
                    <span className="hint">Angka kecil tampil lebih dulu.</span>
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
                  {pending ? "Menyimpan..." : form ? "Simpan Perubahan" : "Tambah Pengurus"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
