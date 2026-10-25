import type { Metadata } from "next";
import { listSchedules } from "./actions";
import { SchedulesClient } from "./SchedulesClient";

export const metadata: Metadata = { title: "Jadwal Kajian" };

export default async function SchedulesPage() {
  const rows = await listSchedules();

  return (
    <>
      <div className="iq-adm-head">
        <div>
          <h1>Jadwal Kajian</h1>
          <p>Kelola agenda kajian rutin mingguan yang tampil di halaman Jadwal.</p>
        </div>
      </div>
      <SchedulesClient initial={rows} />
    </>
  );
}
