import type { Metadata } from "next";
import { listGalleries } from "./actions";
import { GalleryClient } from "./GalleryClient";

export const metadata: Metadata = { title: "Galeri" };

export default async function GalleryPage() {
  const rows = await listGalleries();

  return (
    <>
      <div className="iq-adm-head">
        <div>
          <h1>Galeri</h1>
          <p>Kelola foto dokumentasi kegiatan dan keindahan masjid.</p>
        </div>
      </div>
      <GalleryClient initial={rows} />
    </>
  );
}
