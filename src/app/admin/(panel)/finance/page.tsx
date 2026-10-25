import type { Metadata } from "next";
import { listTransactions, getSummary } from "./actions";
import { FinanceClient } from "./FinanceClient";
import { getSettings } from "@/lib/queries";
import { getSession } from "@/lib/auth";
import "./finance.css";
import "./multi.css";

export const metadata: Metadata = { title: "Laporan Keuangan" };

export default async function FinancePage() {
  const [rows, summary, settings, session] = await Promise.all([
    listTransactions(),
    getSummary(),
    getSettings(),
    getSession(),
  ]);

  return (
    <>
      <div className="iq-adm-head">
        <div>
          <h1>Laporan Keuangan</h1>
          <p>
            Catat pemasukan dan pengeluaran harian masjid. Total dan saldo dihitung
            otomatis.
          </p>
        </div>
        <div className="iq-fin-headstat">
          <span>Total saldo tercatat</span>
          <strong>Rp {summary.balance.toLocaleString("id-ID")}</strong>
          <em>{summary.count} transaksi</em>
        </div>
      </div>

      <FinanceClient
        initial={rows}
        mosqueName={settings.site_name || "Masjid Al-Furqon"}
        userName={session?.name || "Administrator"}
      />
    </>
  );
}
