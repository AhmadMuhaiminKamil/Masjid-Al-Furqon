import type { Metadata } from "next";
import { listPosts } from "./actions";
import { PostsClient } from "./PostsClient";

export const metadata: Metadata = { title: "Berita & Kegiatan" };

export default async function PostsPage() {
  const rows = await listPosts();

  return (
    <>
      <div className="iq-adm-head">
        <div>
          <h1>Berita &amp; Kegiatan</h1>
          <p>Kelola berita, pengumuman, dan dokumentasi kegiatan masjid.</p>
        </div>
      </div>
      <PostsClient initial={rows} />
    </>
  );
}
