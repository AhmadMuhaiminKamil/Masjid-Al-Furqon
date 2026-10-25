/* ============================================================
   EXPORT — CSV & PDF laporan keuangan
   Format rapi, terstruktur, siap cetak / dilampirkan
   ============================================================ */

import type { TrxRow } from "./actions";

export type ExportMeta = {
  from: string;
  to: string;
  mosqueName: string;
  printedBy: string;
};

export type ExportData = {
  rows: TrxRow[];
  income: number;
  expense: number;
  balance: number;
  meta: ExportMeta;
};

/* ---------- helper ---------- */
function rp(n: number) {
  // format minus yang benar: -Rp 750.000 (bukan Rp -750.000)
  const abs = Math.abs(n).toLocaleString("id-ID");
  return (n < 0 ? "-Rp " : "Rp ") + abs;
}

function tanggalPanjang(iso: string) {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00").toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function labelPeriode(from: string, to: string) {
  if (!from && !to) return "Semua Periode";
  if (from && to) return `${tanggalPanjang(from)} — ${tanggalPanjang(to)}`;
  if (from) return `Sejak ${tanggalPanjang(from)}`;
  return `Sampai ${tanggalPanjang(to)}`;
}

/** urutkan baris: tanggal naik, lalu id naik (kronologis seperti buku kas) */
function sorted(rows: TrxRow[]) {
  return [...rows].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    return a.id - b.id;
  });
}

/** pengelompokan per tanggal untuk laporan */
function groupByDate(rows: TrxRow[]) {
  const map = new Map<string, TrxRow[]>();
  for (const r of rows) {
    const arr = map.get(r.date) ?? [];
    arr.push(r);
    map.set(r.date, arr);
  }
  return [...map.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1));
}

/* ============================================================
   CSV
   ============================================================ */
export function exportCsv(data: ExportData) {
  const { rows, income, expense, balance, meta } = data;
  const ordered = sorted(rows);

  const esc = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
  const line = (cells: (string | number)[]) => cells.map((c) => esc(String(c))).join(";");

  const out: string[] = [];

  // --- header dokumen ---
  out.push(line(["LAPORAN KEUANGAN MASJID"]));
  out.push(line([meta.mosqueName]));
  out.push(line(["Periode", labelPeriode(meta.from, meta.to)]));
  out.push("");

  // --- ringkasan ---
  out.push(line(["RINGKASAN"]));
  out.push(line(["Total Pemasukan", income]));
  out.push(line(["Total Pengeluaran", expense]));
  out.push(line(["Saldo", balance]));
  out.push(line(["Jumlah Transaksi", ordered.length]));
  out.push("");

  // --- tabel utama ---
  out.push(
    line([
      "No",
      "Tanggal",
      "Keterangan",
      "Jenis",
      "Pemasukan (Rp)",
      "Pengeluaran (Rp)",
      "Saldo Berjalan (Rp)",
    ])
  );

  let running = 0;
  ordered.forEach((r, i) => {
    running += r.type === "income" ? r.amount : -r.amount;
    out.push(
      line([
        i + 1,
        tanggalPanjang(r.date),
        r.description,
        r.type === "income" ? "Masuk" : "Keluar",
        r.type === "income" ? r.amount : "",
        r.type === "expense" ? r.amount : "",
        running,
      ])
    );
  });

  // --- baris total ---
  out.push(line(["", "", "TOTAL", "", income, expense, balance]));

  // BOM untuk Excel agar UTF-8 terbaca benar, separator ";" agar ramah Excel ID
  const csv = "\uFEFF" + out.join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const suffix = meta.from && meta.to ? `${meta.from}_${meta.to}` : "semua";
  triggerDownload(blob, `laporan-keuangan-${suffix}.csv`);
}

/* ============================================================
   PDF
   ============================================================ */
export async function exportPdf(data: ExportData) {
  const [{ default: jsPDF }, autoTableMod] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);
  const autoTable = (autoTableMod as unknown as { default: Function }).default;

  const { rows, income, expense, balance, meta } = data;
  const ordered = sorted(rows);

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const M = 14; // margin

  const GREEN: [number, number, number] = [15, 81, 50];
  const GOLD: [number, number, number] = [201, 162, 39];
  const DARK: [number, number, number] = [30, 41, 35];
  const GRAY: [number, number, number] = [120, 133, 126];

  /* ---------- KOP ---------- */
  doc.setFillColor(...GREEN);
  doc.rect(0, 0, pageW, 30, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(meta.mosqueName.toUpperCase(), M, 13);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(232, 201, 90);
  doc.text("LAPORAN KEUANGAN", M, 20);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text(`Periode: ${labelPeriode(meta.from, meta.to)}`, M, 26);

  /* ---------- KARTU RINGKASAN ---------- */
  let y = 38;
  const cardW = (pageW - M * 2 - 8) / 3;
  const cards: { label: string; value: string; color: [number, number, number] }[] = [
    { label: "TOTAL PEMASUKAN", value: rp(income), color: [22, 101, 63] },
    { label: "TOTAL PENGELUARAN", value: rp(expense), color: [185, 28, 28] },
    { label: "SALDO", value: rp(balance), color: [29, 79, 145] },
  ];

  cards.forEach((c, i) => {
    const x = M + i * (cardW + 4);
    doc.setFillColor(248, 250, 248);
    doc.setDrawColor(226, 230, 227);
    doc.roundedRect(x, y, cardW, 18, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(...GRAY);
    doc.text(c.label, x + 4, y + 6);

    doc.setFontSize(11);
    doc.setTextColor(...c.color);
    doc.text(c.value, x + 4, y + 14);
  });

  y += 24;

  /* ---------- TABEL TRANSAKSI ---------- */
  let running = 0;
  const body = ordered.map((r, i) => {
    running += r.type === "income" ? r.amount : -r.amount;
    return [
      String(i + 1),
      tanggalPanjang(r.date),
      r.description,
      r.type === "income" ? "Masuk" : "Keluar",
      r.type === "income" ? rp(r.amount) : "—",
      r.type === "expense" ? rp(r.amount) : "—",
      rp(running),
    ];
  });

  autoTable(doc, {
    startY: y,
    head: [
      ["No", "Tanggal", "Keterangan", "Jenis", "Pemasukan", "Pengeluaran", "Saldo"],
    ],
    body,
    foot: [
      [
        { content: "TOTAL", colSpan: 4, styles: { halign: "right" as const } },
        rp(income),
        rp(expense),
        rp(balance),
      ],
    ],
    showFoot: "lastPage" as const,
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 7,
      cellPadding: { top: 1.6, bottom: 1.6, left: 2.2, right: 2.2 },
      textColor: DARK,
      lineColor: [226, 230, 227],
      lineWidth: 0.15,
      valign: "middle" as const,
    },
    headStyles: {
      fillColor: GREEN,
      textColor: [255, 255, 255],
      fontStyle: "bold" as const,
      fontSize: 7,
      halign: "center" as const,
    },
    footStyles: {
      fillColor: [240, 245, 241],
      textColor: GREEN,
      fontStyle: "bold" as const,
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 9, halign: "center" as const },
      1: { cellWidth: 26 },
      2: { cellWidth: "auto" as const },
      3: { cellWidth: 15, halign: "center" as const },
      4: { cellWidth: 27, halign: "right" as const, textColor: [22, 101, 63] },
      5: { cellWidth: 27, halign: "right" as const, textColor: [185, 28, 28] },
      6: { cellWidth: 27, halign: "right" as const, textColor: [29, 79, 145] },
    },
    alternateRowStyles: { fillColor: [252, 253, 252] },
    margin: { left: M, right: M },
    didDrawPage: () => {
      // footer tiap halaman
      const pageNum = doc.getNumberOfPages();
      doc.setFontSize(7);
      doc.setTextColor(...GRAY);
      doc.text(
        `${meta.mosqueName} · Laporan Keuangan`,
        M,
        pageH - 7
      );
      doc.text(`Halaman ${pageNum}`, pageW - M, pageH - 7, { align: "right" });
    },
  });

  /* ---------- simpan ---------- */
  const suffix = meta.from && meta.to ? `${meta.from}_${meta.to}` : "semua";
  const blob = doc.output("blob");
  triggerDownload(blob, `laporan-keuangan-${suffix}.pdf`);
}

/* ---------- util ---------- */
function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // beri waktu cukup sebelum revoke
  setTimeout(() => URL.revokeObjectURL(url), 8000);
}
