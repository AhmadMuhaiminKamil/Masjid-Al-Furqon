"use client";

import { useState, useTransition, useMemo, useRef } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  TrendingUp,
  TrendingDown,
  Wallet,
  X,
  Download,
  FileText,
  ArrowDownLeft,
  ArrowUpRight,
  Copy,
  Check,
} from "lucide-react";
import {
  createTransactions,
  updateTransaction,
  deleteTransaction,
  type TrxRow,
} from "./actions";
import { exportCsv, exportPdf } from "./export";

/* ---------- helper ---------- */
function rupiah(n: number) {
  return "Rp " + n.toLocaleString("id-ID");
}

function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function todayIso() {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60_000).toISOString().slice(0, 10);
}

/** parse input nominal -> angka (untuk preview total) */
function parseRupiah(raw: string): number {
  const t = raw.trim().toLowerCase();
  if (!t) return 0;
  const m = t.match(/^([\d.,]+)\s*(k|rb|ribu|jt|juta|m|mio)?$/);
  if (m) {
    let n = Number(m[1].replace(/\./g, "").replace(/,/g, "."));
    if (!Number.isFinite(n)) return 0;
    const u = m[2];
    if (u === "k" || u === "rb" || u === "ribu") n *= 1_000;
    else if (u === "jt" || u === "juta" || u === "m" || u === "mio") n *= 1_000_000;
    return Math.round(n);
  }
  const digits = raw.replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

/* ---------- tipe baris form ---------- */
type DraftRow = {
  key: string;
  description: string;
  amount: string;
};

function newRow(): DraftRow {
  return {
    key: Math.random().toString(36).slice(2),
    description: "",
    amount: "",
  };
}

/* ---------- preset periode ---------- */
type Preset = "today" | "month" | "year" | "all" | "custom";

function presetRange(p: Preset): { from: string; to: string } {
  const now = new Date();
  const iso = (d: Date) =>
    new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);

  if (p === "today") return { from: iso(now), to: iso(now) };
  if (p === "month") {
    return {
      from: iso(new Date(now.getFullYear(), now.getMonth(), 1)),
      to: iso(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
    };
  }
  if (p === "year") {
    return { from: `${now.getFullYear()}-01-01`, to: `${now.getFullYear()}-12-31` };
  }
  return { from: "", to: "" };
}

export function FinanceClient({
  initial,
  mosqueName,
  userName,
}: {
  initial: TrxRow[];
  mosqueName: string;
  userName: string;
}) {
  const [rows, setRows] = useState<TrxRow[]>(initial);
  const [preset, setPreset] = useState<Preset>("month");
  const [from, setFrom] = useState(() => presetRange("month").from);
  const [to, setTo] = useState(() => presetRange("month").to);
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [q, setQ] = useState("");

  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<TrxRow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [exporting, setExporting] = useState<"" | "csv" | "pdf">("");
  const lastExportRef = useRef(0);

  /* --- state form multi --- */
  const [multiDate, setMultiDate] = useState(todayIso);
  const [multiType, setMultiType] = useState<"income" | "expense">("income");
  const [drafts, setDrafts] = useState<DraftRow[]>([newRow(), newRow()]);
  const descRefs = useRef<(HTMLInputElement | null)[]>([]);

  /* --- filter --- */
  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (from && r.date < from) return false;
      if (to && r.date > to) return false;
      if (typeFilter !== "all" && r.type !== typeFilter) return false;
      if (q && !r.description.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [rows, from, to, typeFilter, q]);

  const sum = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const r of filtered) {
      if (r.type === "income") income += r.amount;
      else expense += r.amount;
    }
    return { income, expense, balance: income - expense };
  }, [filtered]);

  const totalAll = useMemo(() => {
    let income = 0;
    let expense = 0;
    for (const r of rows) {
      if (r.type === "income") income += r.amount;
      else expense += r.amount;
    }
    return { income, expense, balance: income - expense };
  }, [rows]);

  function applyPreset(p: Preset) {
    setPreset(p);
    if (p === "all") {
      setFrom("");
      setTo("");
      return;
    }
    const r = presetRange(p);
    setFrom(r.from);
    setTo(r.to);
  }

  /* --- modal --- */
  function openCreate() {
    setEditing(null);
    setMultiDate(todayIso());
    setMultiType("income");
    setDrafts([newRow(), newRow()]);
    setModal("create");
    setError(null);
    setTimeout(() => descRefs.current[0]?.focus(), 120);
  }

  function openEdit(r: TrxRow) {
    setEditing(r);
    setModal("edit");
    setError(null);
  }

  function closeModal() {
    setModal(null);
    setEditing(null);
    setError(null);
  }

  /* --- baris form --- */
  function updateDraft(key: string, patch: Partial<DraftRow>) {
    setDrafts((prev) => prev.map((d) => (d.key === key ? { ...d, ...patch } : d)));
  }

  function addRow() {
    setDrafts((prev) => [...prev, newRow()]);
    setTimeout(() => {
      const idx = drafts.length;
      descRefs.current[idx]?.focus();
    }, 80);
  }

  function removeRow(key: string) {
    setDrafts((prev) => (prev.length <= 1 ? prev : prev.filter((d) => d.key !== key)));
  }

  function duplicateRow(key: string) {
    setDrafts((prev) => {
      const idx = prev.findIndex((d) => d.key === key);
      if (idx < 0) return prev;
      const copy = { ...prev[idx], key: newRow().key, amount: "" };
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  }

  /* --- submit multi --- */
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // ambil baris yang benar-benar terisi
    const filled = drafts.filter(
      (d) => d.description.trim() || d.amount.trim()
    );

    if (filled.length === 0) {
      setError("Isi minimal satu transaksi.");
      return;
    }

    const entries = filled.map((d) => ({
      date: multiDate,
      description: d.description.trim(),
      type: multiType,
      amount: parseRupiah(d.amount),
    }));

    start(async () => {
      const res = await createTransactions(entries);
      if (res?.error) {
        setError(res.error);
        return;
      }
      closeModal();
      window.location.reload();
    });
  }

  /* --- submit edit --- */
  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    const fd = new FormData(e.currentTarget);

    start(async () => {
      const res = await updateTransaction(editing.id, fd);
      if (res?.error) {
        setError(res.error);
        return;
      }
      closeModal();
      window.location.reload();
    });
  }

  async function handleDelete(r: TrxRow) {
    if (!confirm(`Hapus "${r.description}" (${rupiah(r.amount)})?`)) return;
    start(async () => {
      const res = await deleteTransaction(r.id);
      if (res?.error) {
        alert(res.error);
        return;
      }
      setRows((p) => p.filter((x) => x.id !== r.id));
    });
  }

  /* --- export --- */
  const exportData = {
    rows: filtered,
    income: sum.income,
    expense: sum.expense,
    balance: sum.balance,
    meta: {
      from,
      to,
      mosqueName,
      printedBy: userName,
    },
  };

  function handleCsv() {
    // beri jeda 1.2s kalau baru saja export lain — browser hanya izinkan
    // satu download per gesture, jadi hindari tabrakan
    const since = Date.now() - lastExportRef.current;
    const delay = since < 1200 ? 1200 - since : 0;

    setExporting("csv");
    setTimeout(() => {
      try {
        exportCsv(exportData);
      } finally {
        lastExportRef.current = Date.now();
        setExporting("");
      }
    }, delay);
  }

  async function handlePdf() {
    const since = Date.now() - lastExportRef.current;
    const delay = since < 1200 ? 1200 - since : 0;

    setExporting("pdf");
    if (delay > 0) await new Promise((r) => setTimeout(r, delay));

    try {
      await exportPdf(exportData);
      lastExportRef.current = Date.now();
    } catch (err) {
      console.error(err);
      alert("Gagal membuat PDF. Coba lagi.");
    } finally {
      setExporting("");
    }
  }

  /* --- preview total form multi --- */
  const draftTotal = drafts.reduce((s, d) => s + parseRupiah(d.amount), 0);
  const draftCount = drafts.filter((d) => d.description.trim() && parseRupiah(d.amount) > 0).length;
  const editForm = editing;

  return (
    <>
      {/* ---------- KARTU RINGKASAN ---------- */}
      <div className="iq-fin-cards">
        <div className="iq-fin-card iq-fin-card--in">
          <div className="iq-fin-card__ico">
            <TrendingUp size={19} />
          </div>
          <div>
            <span className="iq-fin-card__label">Pemasukan</span>
            <strong>{rupiah(sum.income)}</strong>
          </div>
        </div>

        <div className="iq-fin-card iq-fin-card--out">
          <div className="iq-fin-card__ico">
            <TrendingDown size={19} />
          </div>
          <div>
            <span className="iq-fin-card__label">Pengeluaran</span>
            <strong>{rupiah(sum.expense)}</strong>
          </div>
        </div>

        <div
          className={`iq-fin-card ${sum.balance < 0 ? "iq-fin-card--neg" : "iq-fin-card--bal"}`}
        >
          <div className="iq-fin-card__ico">
            <Wallet size={19} />
          </div>
          <div>
            <span className="iq-fin-card__label">Saldo Periode</span>
            <strong>{rupiah(sum.balance)}</strong>
          </div>
        </div>

        <div className="iq-fin-card iq-fin-card--all">
          <div className="iq-fin-card__ico">
            <Wallet size={19} />
          </div>
          <div>
            <span className="iq-fin-card__label">Saldo Keseluruhan</span>
            <strong>{rupiah(totalAll.balance)}</strong>
          </div>
        </div>
      </div>

      {/* ---------- TOOLBAR ---------- */}
      <div className="iq-fin-toolbar">
        <div className="iq-fin-presets">
          {(
            [
              ["today", "Hari Ini"],
              ["month", "Bulan Ini"],
              ["year", "Tahun Ini"],
              ["all", "Semua"],
            ] as [Preset, string][]
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              className={`iq-fin-chip ${preset === k ? "is-active" : ""}`}
              onClick={() => applyPreset(k)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="iq-fin-dates">
          <input
            type="date"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setPreset("custom");
            }}
            aria-label="Dari tanggal"
          />
          <span>s/d</span>
          <input
            type="date"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setPreset("custom");
            }}
            aria-label="Sampai tanggal"
          />
        </div>

        <select
          className="iq-fin-select"
          value={typeFilter}
          onChange={(e) =>
            setTypeFilter(e.target.value as "all" | "income" | "expense")
          }
        >
          <option value="all">Semua Jenis</option>
          <option value="income">Pemasukan</option>
          <option value="expense">Pengeluaran</option>
        </select>

        <div className="iq-adm-search" style={{ maxWidth: 240 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            placeholder="Cari keterangan..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="iq-fin-actions">
          <button
            className="iq-btn iq-btn--primary"
            onClick={handleCsv}
            disabled={!filtered.length || exporting !== ""}
          >
            <Download size={16} />
            {exporting === "csv" ? "Menyiapkan..." : "CSV"}
          </button>
          <button
            className="iq-btn iq-btn--primary"
            onClick={handlePdf}
            disabled={!filtered.length || exporting !== ""}
          >
            <FileText size={16} />
            {exporting === "pdf" ? "Menyiapkan..." : "PDF"}
          </button>
          <button className="iq-btn iq-btn--primary" onClick={openCreate}>
            <Plus size={17} />
            Tambah Transaksi
          </button>
        </div>
      </div>

      {/* ---------- TABEL ---------- */}
      <div className="iq-adm-card">
        {filtered.length === 0 ? (
          <div className="iq-adm-empty">
            <div className="iq-adm-empty__ico">
              <Wallet size={26} />
            </div>
            <h3>{rows.length === 0 ? "Belum ada transaksi" : "Tidak ada transaksi"}</h3>
            <p>
              {rows.length === 0
                ? "Catat pemasukan atau pengeluaran pertama untuk mulai membuat laporan keuangan."
                : "Tidak ada transaksi pada periode atau filter yang dipilih."}
            </p>
            {rows.length === 0 && (
              <button className="iq-btn iq-btn--primary" onClick={openCreate}>
                Tambah Transaksi Pertama
              </button>
            )}
          </div>
        ) : (
          <div className="iq-adm-tablewrap">
            <table className="iq-adm-table">
              <thead>
                <tr>
                  <th style={{ width: 105 }}>Tanggal</th>
                  <th>Keterangan</th>
                  <th style={{ width: 145, textAlign: "right" }}>Pemasukan</th>
                  <th style={{ width: 145, textAlign: "right" }}>Pengeluaran</th>
                  <th style={{ width: 100 }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td
                      style={{
                        fontSize: ".82rem",
                        color: "#6b7a72",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatDate(r.date)}
                    </td>
                    <td>
                      <div className="iq-adm-celltitle">{r.description}</div>
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        fontWeight: 600,
                        color: "#16653f",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.type === "income" ? (
                        <span className="iq-fin-amount">
                          <ArrowDownLeft size={13} />
                          {rupiah(r.amount)}
                        </span>
                      ) : (
                        <span style={{ color: "#c9cdc9" }}>—</span>
                      )}
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        fontWeight: 600,
                        color: "#b91c1c",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.type === "expense" ? (
                        <span className="iq-fin-amount">
                          <ArrowUpRight size={13} />
                          {rupiah(r.amount)}
                        </span>
                      ) : (
                        <span style={{ color: "#c9cdc9" }}>—</span>
                      )}
                    </td>
                    <td className="iq-td-actions">
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
              <tfoot>
                <tr className="iq-fin-total">
                  <td colSpan={2}>Total periode ini ({filtered.length} transaksi)</td>
                  <td style={{ textAlign: "right", color: "#16653f" }}>
                    {rupiah(sum.income)}
                  </td>
                  <td style={{ textAlign: "right", color: "#b91c1c" }}>
                    {rupiah(sum.expense)}
                  </td>
                  <td style={{ textAlign: "right", fontWeight: 700, color: "#0b3d2c" }}>
                    {rupiah(sum.balance)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* ============ MODAL TAMBAH (MULTI) ============ */}
      {modal === "create" && (
        <div
          className="iq-modal"
          onMouseDown={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="iq-modal__box" style={{ maxWidth: 660 }}>
            <div className="iq-modal__head">
              <h2>Tambah Transaksi</h2>
              <button className="iq-modal__close" onClick={closeModal}>
                <X size={17} />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="iq-modal__body">
                {error && (
                  <div className="iq-adm-savebar iq-adm-savebar--err">{error}</div>
                )}

                <div className="iq-adm-form">
                  {/* jenis */}
                  <div className="iq-adm-field">
                    <label>
                      Jenis Transaksi<span className="req">*</span>
                    </label>
                    <div className="iq-fin-toggle">
                      <label className="iq-fin-toggle__opt iq-fin-toggle__opt--in">
                        <input
                          type="radio"
                          name="multiType"
                          value="income"
                          checked={multiType === "income"}
                          onChange={() => setMultiType("income")}
                        />
                        <span>
                          <ArrowDownLeft size={15} /> Pemasukan
                        </span>
                      </label>
                      <label className="iq-fin-toggle__opt iq-fin-toggle__opt--out">
                        <input
                          type="radio"
                          name="multiType"
                          value="expense"
                          checked={multiType === "expense"}
                          onChange={() => setMultiType("expense")}
                        />
                        <span>
                          <ArrowUpRight size={15} /> Pengeluaran
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* tanggal */}
                  <div className="iq-adm-field">
                    <label htmlFor="multiDate">
                      Tanggal<span className="req">*</span>
                    </label>
                    <input
                      id="multiDate"
                      type="date"
                      required
                      value={multiDate}
                      onChange={(e) => setMultiDate(e.target.value)}
                    />
                    <span className="hint">
                      Semua baris di bawah akan disimpan dengan tanggal ini.
                    </span>
                  </div>

                  {/* baris-baris */}
                  <div className="iq-adm-field">
                    <label>
                      Daftar Transaksi<span className="req">*</span>
                    </label>

                    <div className="iq-multi">
                      {drafts.map((d, i) => (
                        <div className="iq-multi__row" key={d.key}>
                          <span className="iq-multi__num">{i + 1}</span>

                          <input
                            ref={(el) => {
                              descRefs.current[i] = el;
                            }}
                            className="iq-multi__desc"
                            type="text"
                            placeholder={
                              i === 0
                                ? "Contoh: Infaq Maghrib"
                                : "Contoh: Infaq Subuh"
                            }
                            value={d.description}
                            onChange={(e) =>
                              updateDraft(d.key, { description: e.target.value })
                            }
                          />

                          <div className="iq-multi__amount">
                            <span>Rp</span>
                            <input
                              type="text"
                              inputMode="numeric"
                              placeholder="15.000"
                              value={d.amount}
                              onChange={(e) =>
                                updateDraft(d.key, { amount: e.target.value })
                              }
                            />
                          </div>

                          <button
                            type="button"
                            className="iq-multi__btn"
                            title="Duplikat baris"
                            onClick={() => duplicateRow(d.key)}
                          >
                            <Copy size={14} />
                          </button>
                          <button
                            type="button"
                            className="iq-multi__btn iq-multi__btn--del"
                            title="Hapus baris"
                            onClick={() => removeRow(d.key)}
                            disabled={drafts.length <= 1}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button type="button" className="iq-multi__add" onClick={addRow}>
                      <Plus size={15} /> Tambah Baris
                    </button>

                    <span className="hint">
                      Bisa isi beberapa transaksi sekaligus. Nominal boleh singkat:
                      15K, 1.5jt, 250rb.
                    </span>
                  </div>

                  {/* preview total */}
                  {draftCount > 0 && (
                    <div className="iq-multi__preview">
                      <span>
                        {draftCount} transaksi ·{" "}
                        {multiType === "income" ? "Pemasukan" : "Pengeluaran"}
                      </span>
                      <strong>{rupiah(draftTotal)}</strong>
                    </div>
                  )}
                </div>
              </div>

              <div className="iq-modal__foot">
                <button type="button" className="iq-btn iq-btn--ghost" onClick={closeModal}>
                  Batal
                </button>
                <button type="submit" className="iq-btn iq-btn--primary" disabled={pending}>
                  {pending
                    ? "Menyimpan..."
                    : draftCount > 1
                      ? `Simpan ${draftCount} Transaksi`
                      : "Simpan Transaksi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============ MODAL EDIT (SATU) ============ */}
      {modal === "edit" && editForm && (
        <div
          className="iq-modal"
          onMouseDown={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="iq-modal__box" style={{ maxWidth: 520 }}>
            <div className="iq-modal__head">
              <h2>Edit Transaksi</h2>
              <button className="iq-modal__close" onClick={closeModal}>
                <X size={17} />
              </button>
            </div>

            <form onSubmit={handleEdit}>
              <div className="iq-modal__body">
                {error && (
                  <div className="iq-adm-savebar iq-adm-savebar--err">{error}</div>
                )}

                <div className="iq-adm-form">
                  <div className="iq-adm-field">
                    <label>
                      Jenis Transaksi<span className="req">*</span>
                    </label>
                    <div className="iq-fin-toggle">
                      <label className="iq-fin-toggle__opt iq-fin-toggle__opt--in">
                        <input
                          type="radio"
                          name="type"
                          value="income"
                          defaultChecked={editForm.type === "income"}
                        />
                        <span>
                          <ArrowDownLeft size={15} /> Pemasukan
                        </span>
                      </label>
                      <label className="iq-fin-toggle__opt iq-fin-toggle__opt--out">
                        <input
                          type="radio"
                          name="type"
                          value="expense"
                          defaultChecked={editForm.type === "expense"}
                        />
                        <span>
                          <ArrowUpRight size={15} /> Pengeluaran
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="iq-adm-grid2">
                    <div className="iq-adm-field">
                      <label htmlFor="date">
                        Tanggal<span className="req">*</span>
                      </label>
                      <input
                        id="date"
                        name="date"
                        type="date"
                        required
                        defaultValue={editForm.date}
                      />
                    </div>
                    <div className="iq-adm-field">
                      <label htmlFor="amount">
                        Nominal (Rp)<span className="req">*</span>
                      </label>
                      <input
                        id="amount"
                        name="amount"
                        type="text"
                        inputMode="numeric"
                        required
                        defaultValue={String(editForm.amount)}
                        placeholder="1500000"
                      />
                      <span className="hint">Boleh 1.500.000 atau 1.5jt</span>
                    </div>
                  </div>

                  <div className="iq-adm-field">
                    <label htmlFor="description">
                      Keterangan<span className="req">*</span>
                    </label>
                    <input
                      id="description"
                      name="description"
                      type="text"
                      required
                      defaultValue={editForm.description}
                      placeholder="Contoh: Infaq Jumat"
                    />
                  </div>
                </div>
              </div>

              <div className="iq-modal__foot">
                <button type="button" className="iq-btn iq-btn--ghost" onClick={closeModal}>
                  Batal
                </button>
                <button type="submit" className="iq-btn iq-btn--primary" disabled={pending}>
                  {pending ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
