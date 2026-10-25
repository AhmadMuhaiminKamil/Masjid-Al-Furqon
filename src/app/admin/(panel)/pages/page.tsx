import type { Metadata } from "next";
import { listPages } from "./actions";
import { PagesClient } from "./PagesClient";

export const metadata: Metadata = { title: "Halaman" };

export default async function PagesAdminPage() {
  const rows = await listPages();

  return (
    <>
      <div className="iq-adm-head">
        <div>
          <h1>Halaman</h1>
          <p>
            Kelola isi halaman statis website: profil, jadwal, kontak, dan
            donasi.
          </p>
        </div>
      </div>
      <PagesClient initial={rows} />
    </>
  );
}
