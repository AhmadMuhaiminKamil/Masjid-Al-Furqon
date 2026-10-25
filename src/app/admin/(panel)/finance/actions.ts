"use server";

import { revalidatePath } from "next/cache";
import { eq, and, gte, lte, desc, asc, sql } from "drizzle-orm";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import { requireAuth } from "@/lib/auth";

export type TrxRow = typeof transactions.$inferSelect;
export type TrxType = "income" | "expense";

export type Summary = {
  income: number;
  expense: number;
  balance: number;
  count: number;
};

/** satu baris input dari form multi-entry */
export type TrxInput = {
  date: string;
  description: string;
  type: TrxType;
  amount: number;
};

/** parse "1.500.000" / "1500000" / "15K" / "1.5jt" -> angka */
function parseAmount(raw: string): number | null {
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) return null;

  // notasi singkat: 15k / 15rb / 1.5jt / 2m
  const short = trimmed.match(/^([\d.,]+)\s*(k|rb|ribu|jt|juta|m|mio)?$/);
  if (short) {
    const numStr = short[1].replace(/\./g, "").replace(/,/g, ".");
    let n = Number(numStr);
    if (!Number.isFinite(n)) return null;

    const unit = short[2];
    if (unit === "k" || unit === "rb" || unit === "ribu") n *= 1_000;
    else if (unit === "jt" || unit === "juta") n *= 1_000_000;
    else if (unit === "m" || unit === "mio") n *= 1_000_000;

    n = Math.round(n);
    if (n <= 0 || n > 2_000_000_000) return null;
    return n;
  }

  // fallback: buang non-digit
  const cleaned = raw.replace(/[^\d]/g, "");
  if (!cleaned) return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n <= 0 || n > 2_000_000_000) return null;
  return n;
}

function isValidDate(d: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(d));
}

/* ---------- LIST ---------- */
export async function listTransactions(opts?: {
  from?: string;
  to?: string;
  type?: TrxType | "all";
}) {
  await requireAuth();

  const from = opts?.from && isValidDate(opts.from) ? opts.from : null;
  const to = opts?.to && isValidDate(opts.to) ? opts.to : null;
  const type = opts?.type && opts.type !== "all" ? opts.type : null;

  const conds = [];
  if (from) conds.push(gte(transactions.date, from));
  if (to) conds.push(lte(transactions.date, to));
  if (type) conds.push(eq(transactions.type, type));

  return conds.length
    ? db
        .select()
        .from(transactions)
        .where(and(...conds))
        .orderBy(desc(transactions.date), asc(transactions.id))
    : db
        .select()
        .from(transactions)
        .orderBy(desc(transactions.date), asc(transactions.id));
}

/* ---------- SUMMARY ---------- */
export async function getSummary(opts?: {
  from?: string;
  to?: string;
}): Promise<Summary> {
  await requireAuth();

  const from = opts?.from && isValidDate(opts.from) ? opts.from : null;
  const to = opts?.to && isValidDate(opts.to) ? opts.to : null;

  const conds = [];
  if (from) conds.push(gte(transactions.date, from));
  if (to) conds.push(lte(transactions.date, to));

  const base = db
    .select({
      type: transactions.type,
      total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)::int`,
      n: sql<number>`COUNT(*)::int`,
    })
    .from(transactions);

  const grouped = await (conds.length ? base.where(and(...conds)) : base).groupBy(
    transactions.type
  );

  let income = 0;
  let expense = 0;
  let count = 0;
  for (const g of grouped) {
    count += Number(g.n ?? 0);
    if (g.type === "income") income = Number(g.total ?? 0);
    if (g.type === "expense") expense = Number(g.total ?? 0);
  }

  return { income, expense, balance: income - expense, count };
}

/* ---------- CREATE BANYAK (multi-entry) ---------- */
export async function createTransactions(entries: TrxInput[]) {
  const session = await requireAuth();

  if (!Array.isArray(entries) || entries.length === 0) {
    return { error: "Tidak ada transaksi untuk disimpan." };
  }
  if (entries.length > 50) {
    return { error: "Maksimal 50 transaksi sekali simpan." };
  }

  const clean: {
    date: string;
    description: string;
    type: string;
    amount: number;
    createdBy: string;
  }[] = [];

  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    const n = i + 1;

    if (!isValidDate(String(e.date || ""))) {
      return { error: `Baris ${n}: tanggal tidak valid.` };
    }

    const desc = String(e.description || "").trim();
    if (!desc) return { error: `Baris ${n}: keterangan wajib diisi.` };

    if (e.type !== "income" && e.type !== "expense") {
      return { error: `Baris ${n}: jenis tidak valid.` };
    }

    const amount =
      typeof e.amount === "number" ? e.amount : parseAmount(String(e.amount));
    if (amount === null || !Number.isFinite(amount) || amount <= 0) {
      return { error: `Baris ${n}: nominal harus lebih dari 0.` };
    }

    clean.push({
      date: String(e.date),
      description: desc,
      type: e.type,
      amount,
      createdBy: session.name || session.email,
    });
  }

  try {
    await db.insert(transactions).values(clean);
  } catch (err) {
    console.error("createTransactions:", err);
    return { error: "Gagal menyimpan transaksi." };
  }

  revalidatePath("/admin/finance");
  revalidatePath("/keuangan");
  return { ok: true, saved: clean.length };
}

/* ---------- UPDATE ---------- */
export async function updateTransaction(id: number, formData: FormData) {
  await requireAuth();

  const date = String(formData.get("date") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const type = String(formData.get("type") || "").trim();
  const rawAmount = String(formData.get("amount") || "").trim();

  if (!isValidDate(date)) return { error: "Tanggal tidak valid." };
  if (!description) return { error: "Keterangan wajib diisi." };
  if (type !== "income" && type !== "expense") return { error: "Jenis tidak valid." };

  const amount = parseAmount(rawAmount);
  if (amount === null) return { error: "Nominal harus lebih dari 0." };

  try {
    await db
      .update(transactions)
      .set({ date, description, type, amount, updatedAt: sql`now()` })
      .where(eq(transactions.id, id));
  } catch (e) {
    console.error("updateTransaction:", e);
    return { error: "Gagal memperbarui transaksi." };
  }

  revalidatePath("/admin/finance");
  revalidatePath("/keuangan");
  return { ok: true };
}

/* ---------- DELETE ---------- */
export async function deleteTransaction(id: number) {
  await requireAuth();
  try {
    await db.delete(transactions).where(eq(transactions.id, id));
  } catch (e) {
    console.error("deleteTransaction:", e);
    return { error: "Gagal menghapus transaksi." };
  }
  revalidatePath("/admin/finance");
  revalidatePath("/keuangan");
  return { ok: true };
}

/* ---------- HAPUS BANYAK ---------- */
export async function deleteTransactions(ids: number[]) {
  await requireAuth();
  if (!Array.isArray(ids) || ids.length === 0) {
    return { error: "Tidak ada yang dipilih." };
  }

  try {
    await db.delete(transactions).where(sql`${transactions.id} = ANY(${ids})`);
  } catch (e) {
    console.error("deleteTransactions:", e);
    return { error: "Gagal menghapus." };
  }

  revalidatePath("/admin/finance");
  revalidatePath("/keuangan");
  return { ok: true, deleted: ids.length };
}
