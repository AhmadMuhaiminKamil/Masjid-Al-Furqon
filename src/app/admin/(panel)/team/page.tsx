import type { Metadata } from "next";
import { listTeam } from "./actions";
import { TeamClient } from "./TeamClient";

export const metadata: Metadata = { title: "Pengurus" };

export default async function TeamAdminPage() {
  const rows = await listTeam();

  return (
    <>
      <div className="iq-adm-head">
        <div>
          <h1>Pengurus</h1>
          <p>Kelola struktur pengurus dan dewan kemakmuran masjid.</p>
        </div>
      </div>
      <TeamClient initial={rows} />
    </>
  );
}
