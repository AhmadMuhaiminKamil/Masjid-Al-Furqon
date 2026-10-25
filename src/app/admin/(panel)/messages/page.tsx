import type { Metadata } from "next";
import { listMessages } from "./actions";
import { MessagesClient } from "./MessagesClient";

export const metadata: Metadata = { title: "Pesan Masuk" };

export default async function MessagesAdminPage() {
  const rows = await listMessages();

  return (
    <>
      <div className="iq-adm-head">
        <div>
          <h1>Pesan Masuk</h1>
          <p>Pesan yang dikirim jamaah melalui form kontak website.</p>
        </div>
      </div>
      <MessagesClient initial={rows} />
    </>
  );
}
