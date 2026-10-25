"use client";

import { useState, useTransition } from "react";
import { Eye, MailCheck, Trash2, X, Inbox, Reply } from "lucide-react";
import { markRead, deleteMessage, type ContactRow } from "./actions";

/* ============================================================
   Pesan masuk — hanya baca, tandai dibaca, hapus.
   ============================================================ */

function fmtDate(d: Date) {
  return new Date(d).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MessagesClient({ initial }: { initial: ContactRow[] }) {
  const [rows, setRows] = useState<ContactRow[]>(initial);
  const [q, setQ] = useState("");
  const [detail, setDetail] = useState<ContactRow | null>(null);
  const [pending, start] = useTransition();

  const unread = rows.filter((r) => !r.read).length;

  const filtered = rows.filter((r) => {
    const s = q.toLowerCase();
    return (
      r.name.toLowerCase().includes(s) ||
      r.email.toLowerCase().includes(s) ||
      (r.subject ?? "").toLowerCase().includes(s) ||
      r.message.toLowerCase().includes(s)
    );
  });

  function openDetail(row: ContactRow) {
    setDetail(row);
    if (!row.read) void handleMarkRead(row, true);
  }

  async function handleMarkRead(row: ContactRow, silent = false) {
    start(async () => {
      const res = await markRead(row.id);
      if (res?.error) {
        if (!silent) alert(res.error);
        return;
      }
      setRows((p) => p.map((r) => (r.id === row.id ? { ...r, read: true } : r)));
      setDetail((d) => (d && d.id === row.id ? { ...d, read: true } : d));
    });
  }

  async function handleDelete(row: ContactRow) {
    if (!confirm(`Hapus pesan dari "${row.name}"? Tindakan ini tidak bisa dibatalkan.`))
      return;
    start(async () => {
      const res = await deleteMessage(row.id);
      if (res?.error) {
        alert(res.error);
        return;
      }
      setRows((p) => p.filter((r) => r.id !== row.id));
      setDetail((d) => (d && d.id === row.id ? null : d));
    });
  }

  return (
    <>
      <div className="iq-adm-toolbar">
        <div className="iq-adm-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            placeholder="Cari nama, email, subjek, atau isi pesan..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        {unread > 0 ? (
          <span className="iq-badge iq-badge--gold" style={{ fontSize: ".78rem" }}>
            <Inbox size={13} style={{ marginRight: 5, verticalAlign: "-2px" }} />
            {unread} pesan belum dibaca
          </span>
        ) : (
          <span className="iq-badge iq-badge--gray" style={{ fontSize: ".78rem" }}>
            Semua pesan sudah dibaca
          </span>
        )}
        <span style={{ marginLeft: "auto", fontSize: ".82rem", color: "#8a978f" }}>
          {filtered.length} dari {rows.length} pesan
        </span>
      </div>

      <div className="iq-adm-card">
        {filtered.length === 0 ? (
          <div className="iq-adm-empty">
            <div className="iq-adm-empty__ico">
              <Inbox size={30} strokeWidth={1.6} />
            </div>
            <h3>{q ? "Tidak ada hasil" : "Belum ada pesan masuk"}</h3>
            <p>
              {q
                ? `Tidak ada pesan cocok dengan "${q}".`
                : "Pesan dari form kontak website akan muncul di sini."}
            </p>
          </div>
        ) : (
          <div className="iq-adm-tablewrap">
            <table className="iq-adm-table">
              <thead>
                <tr>
                  <th style={{ width: 170 }}>Nama</th>
                  <th style={{ width: 220 }}>Email</th>
                  <th>Subjek</th>
                  <th style={{ width: 150 }}>Tanggal</th>
                  <th style={{ width: 90 }}>Status</th>
                  <th style={{ width: 170 }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} style={!r.read ? { background: "#f0f9f4" } : undefined}>
                    <td>
                      <div
                        className="iq-adm-celltitle"
                        style={{ fontWeight: r.read ? 500 : 700 }}
                      >
                        {r.name}
                      </div>
                    </td>
                    <td style={{ fontSize: ".82rem", color: "#5c7a68" }}>
                      <a
                        href={`mailto:${r.email}`}
                        style={{ color: "inherit", textDecoration: "none" }}
                      >
                        {r.email}
                      </a>
                    </td>
                    <td>
                      <div className="iq-adm-celltitle" style={{ fontWeight: r.read ? 500 : 600 }}>
                        {r.subject?.trim() || "(tanpa subjek)"}
                      </div>
                    </td>
                    <td style={{ fontSize: ".8rem", color: "#7b8a82" }}>
                      {fmtDate(r.createdAt)}
                    </td>
                    <td>
                      <span
                        className={`iq-badge ${r.read ? "iq-badge--gray" : "iq-badge--green"}`}
                      >
                        {r.read ? "Dibaca" : "Baru"}
                      </span>
                    </td>
                    <td className="iq-td-actions">
                      <button
                        className="iq-btn iq-btn--ghost iq-btn--icon"
                        title="Lihat"
                        onClick={() => openDetail(r)}
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        className="iq-btn iq-btn--ghost iq-btn--icon"
                        title={r.read ? "Sudah dibaca" : "Tandai Dibaca"}
                        onClick={() => handleMarkRead(r)}
                        disabled={pending || r.read}
                      >
                        <MailCheck size={15} />
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

      {detail && (
        <div
          className="iq-modal"
          onMouseDown={(e) => e.target === e.currentTarget && setDetail(null)}
        >
          <div className="iq-modal__box">
            <div className="iq-modal__head">
              <h2>{detail.subject?.trim() || "(tanpa subjek)"}</h2>
              <button className="iq-modal__close" onClick={() => setDetail(null)}>
                <X size={17} />
              </button>
            </div>

            <div className="iq-modal__body">
              <div
                style={{
                  display: "grid",
                  gap: 10,
                  paddingBottom: 16,
                  marginBottom: 16,
                  borderBottom: "1px solid #eef2ef",
                }}
              >
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ color: "#8a978f", fontSize: ".8rem", width: 70 }}>
                    Nama
                  </span>
                  <strong style={{ color: "#1f2d27" }}>{detail.name}</strong>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ color: "#8a978f", fontSize: ".8rem", width: 70 }}>
                    Email
                  </span>
                  <a
                    href={`mailto:${detail.email}`}
                    style={{ color: "#0f5132", fontSize: ".875rem" }}
                  >
                    {detail.email}
                  </a>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ color: "#8a978f", fontSize: ".8rem", width: 70 }}>
                    Telepon
                  </span>
                  <span style={{ color: "#2c3833", fontSize: ".875rem" }}>
                    —
                  </span>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ color: "#8a978f", fontSize: ".8rem", width: 70 }}>
                    Masuk
                  </span>
                  <span style={{ color: "#5c7a68", fontSize: ".82rem" }}>
                    {fmtDate(detail.createdAt)}
                  </span>
                </div>
              </div>

              <p
                style={{
                  fontSize: ".68rem",
                  fontWeight: 700,
                  letterSpacing: ".09em",
                  textTransform: "uppercase",
                  color: "#7b8a82",
                  marginBottom: 8,
                }}
              >
                Isi Pesan
              </p>
              <div
                style={{
                  background: "#f8faf8",
                  border: "1px solid #eef2ef",
                  borderRadius: 10,
                  padding: "14px 16px",
                  fontSize: ".875rem",
                  lineHeight: 1.7,
                  color: "#2c3833",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {detail.message}
              </div>
            </div>

            <div className="iq-modal__foot">
              <button
                type="button"
                className="iq-btn iq-btn--ghost"
                onClick={() => setDetail(null)}
              >
                Tutup
              </button>
              <button
                type="button"
                className="iq-btn iq-btn--danger"
                onClick={() => handleDelete(detail)}
                disabled={pending}
              >
                <Trash2 size={15} />
                Hapus
              </button>
              <a
                className="iq-btn iq-btn--primary"
                href={`mailto:${detail.email}?subject=${encodeURIComponent(
                  detail.subject ? `Re: ${detail.subject}` : "Re: Pesan Anda"
                )}`}
              >
                <Reply size={15} />
                Balas via Email
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
