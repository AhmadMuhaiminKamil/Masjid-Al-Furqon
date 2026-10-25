"use client";

import { useMemo, useState, useTransition } from "react";
import { Pencil, Trash2, Eye, EyeOff, X, CalendarDays } from "lucide-react";
import {
  createSchedule,
  updateSchedule,
  deleteSchedule,
  togglePublishSchedule,
  type ScheduleRow,
} from "./actions";

const DAYS = ["Ahad", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export function SchedulesClient({ initial }: { initial: ScheduleRow[] }) {
  const [rows, setRows] = useState<ScheduleRow[]>(initial);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<ScheduleRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((r) =>
      [r.title, r.speaker ?? "", r.location ?? "", r.day, r.time]
        .join(" ")
        .toLowerCase()
        .includes(needle)
    );
  }, [rows, q]);

  function openCreate() {
    setEditing(null);
    setCreating(true);
    setError(null);
  }
  function openEdit(row: ScheduleRow) {
    setEditing(row);
    setCreating(false);
    setError(null);
  }
  function closeModal() {
    setEditing(null);
    setCreating(false);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    start(async () => {
      const res = editing
        ? await updateSchedule(editing.id, fd)
        : await createSchedule(fd);

      if (res && "error" in res && res.error) {
        setError(res.error);
        return;
      }
      closeModal();
      window.location.reload();
    });
  }

  async function handleDelete(row: ScheduleRow) {
    if (!confirm(`Hapus kajian "${row.title}"? Tindakan ini tidak bisa dibatalkan.`))
      return;
    start(async () => {
      const res = await deleteSchedule(row.id);
      if (res && "error" in res && res.error) {
        alert(res.error);
        return;
      }
      setRows((p) => p.filter((r) => r.id !== row.id));
    });
  }

  async function handleToggle(row: ScheduleRow) {
    const next = !row.published;
    start(async () => {
      const res = await togglePublishSchedule(row.id, next);
      if (res && "error" in res && res.error) {
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
            placeholder="Cari judul, pemateri, atau lokasi..."
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
            Tambah Kajian
          </button>
        </div>
      </div>

      <div className="iq-adm-card">
        {filtered.length === 0 ? (
          <div className="iq-adm-empty">
            <div className="iq-adm-empty__ico">
              <CalendarDays size={26} />
            </div>
            <h3>{q ? "Tidak ada hasil" : "Belum ada jadwal kajian"}</h3>
            <p>
              {q
                ? `Tidak ada entri cocok dengan "${q}".`
                : "Tambahkan kajian rutin pertama untuk halaman Jadwal."}
            </p>
            {!q && (
              <button className="iq-btn iq-btn--primary" onClick={openCreate}>
                Tambah Kajian Pertama
              </button>
            )}
          </div>
        ) : (
          <div className="iq-adm-tablewrap">
            <table className="iq-adm-table">
              <thead>
                <tr>
                  <th>Judul / Kitab</th>
                  <th style={{ width: 170 }}>Pemateri</th>
                  <th style={{ width: 100 }}>Hari</th>
                  <th style={{ width: 130 }}>Jam</th>
                  <th style={{ width: 150 }}>Lokasi</th>
                  <th style={{ width: 100 }}>Status</th>
                  <th style={{ width: 140 }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div className="iq-adm-celltitle">{r.title}</div>
                      {r.description && (
                        <div className="iq-adm-cellsub">
                          {r.description.length > 80
                            ? `${r.description.slice(0, 80)}…`
                            : r.description}
                        </div>
                      )}
                    </td>
                    <td>{r.speaker || <span className="iq-adm-cellsub">—</span>}</td>
                    <td>
                      <span className="iq-badge iq-badge--blue">{r.day}</span>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>{r.time}</td>
                    <td>{r.location || <span className="iq-adm-cellsub">—</span>}</td>
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
        <div
          className="iq-modal"
          onMouseDown={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="iq-modal__box">
            <div className="iq-modal__head">
              <h2>{form ? "Edit Jadwal Kajian" : "Tambah Jadwal Kajian"}</h2>
              <button className="iq-modal__close" onClick={closeModal} type="button">
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
                      Judul / Kitab<span className="req">*</span>
                    </label>
                    <input
                      id="title"
                      name="title"
                      type="text"
                      required
                      defaultValue={form?.title ?? ""}
                      placeholder="Contoh: Kajian Tafsir Al-Qur'an"
                    />
                  </div>

                  <div className="iq-adm-field">
                    <label htmlFor="speaker">Pemateri</label>
                    <input
                      id="speaker"
                      name="speaker"
                      type="text"
                      defaultValue={form?.speaker ?? ""}
                      placeholder="Ust. Ahmad Fauzi, Lc."
                    />
                  </div>

                  <div className="iq-adm-grid2">
                    <div className="iq-adm-field">
                      <label htmlFor="day">
                        Hari<span className="req">*</span>
                      </label>
                      <select id="day" name="day" defaultValue={form?.day ?? "Ahad"} required>
                        {DAYS.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="iq-adm-field">
                      <label htmlFor="time">
                        Jam<span className="req">*</span>
                      </label>
                      <input
                        id="time"
                        name="time"
                        type="text"
                        required
                        defaultValue={form?.time ?? ""}
                        placeholder="07.00 – 09.00"
                      />
                    </div>
                  </div>

                  <div className="iq-adm-grid2">
                    <div className="iq-adm-field">
                      <label htmlFor="location">Lokasi</label>
                      <input
                        id="location"
                        name="location"
                        type="text"
                        defaultValue={form?.location ?? ""}
                        placeholder="Aula Utama"
                      />
                    </div>
                    <div className="iq-adm-field">
                      <label htmlFor="order">Urutan</label>
                      <input
                        id="order"
                        name="order"
                        type="number"
                        defaultValue={form?.order ?? 0}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="iq-adm-field">
                    <label htmlFor="description">Deskripsi</label>
                    <textarea
                      id="description"
                      name="description"
                      style={{ minHeight: 90 }}
                      defaultValue={form?.description ?? ""}
                      placeholder="Keterangan singkat tentang kajian ini."
                    />
                  </div>

                  <label className="iq-adm-check">
                    <input
                      type="checkbox"
                      name="published"
                      defaultChecked={form ? form.published : true}
                    />
                    Tampilkan di website
                  </label>
                </div>
              </div>

              <div className="iq-modal__foot">
                <button type="button" className="iq-btn iq-btn--ghost" onClick={closeModal}>
                  Batal
                </button>
                <button type="submit" className="iq-btn iq-btn--primary" disabled={pending}>
                  {pending
                    ? "Menyimpan..."
                    : form
                      ? "Simpan Perubahan"
                      : "Tambah Kajian"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
