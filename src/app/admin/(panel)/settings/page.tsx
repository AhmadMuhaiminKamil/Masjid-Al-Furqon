import type { Metadata } from "next";
import { listSettings } from "./actions";
import { SettingsClient } from "./SettingsClient";

export const metadata: Metadata = { title: "Pengaturan" };

export default async function SettingsPage() {
  const rows = await listSettings();

  return (
    <>
      <div className="iq-adm-head">
        <div>
          <h1>Pengaturan</h1>
          <p>Konfigurasi identitas situs, kontak, rekening donasi, dan media sosial.</p>
        </div>
      </div>
      <SettingsClient initial={rows} />
    </>
  );
}
