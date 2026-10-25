"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { eq, asc } from "drizzle-orm";
import { db } from "@/db";
import { pages } from "@/db/schema";
import { requireAuth } from "@/lib/auth";

export type PageRow = typeof pages.$inferSelect;

/* ============================================================
   Halaman statis — TIDAK ada create/delete.
   Hanya list + update (profil, jadwal, kontak, donasi tetap).
   ============================================================ */

export async function listPages() {
  await requireAuth();
  return db.select().from(pages).orderBy(asc(pages.slug));
}

export async function updatePage(id: number, formData: FormData) {
  await requireAuth();

  if (!Number.isFinite(id) || id <= 0) return { error: "Halaman tidak valid." };

  const title = String(formData.get("title") || "").trim();
  if (!title) return { error: "Judul wajib diisi." };

  // slug sengaja tidak diambil dari form — slug halaman tetap (readonly)
  try {
    await db
      .update(pages)
      .set({
        title,
        content: String(formData.get("content") || "").trim() || null,
        eyebrow: String(formData.get("eyebrow") || "").trim() || null,
        excerpt: String(formData.get("excerpt") || "").trim() || null,
        heroImage: String(formData.get("heroImage") || "").trim() || null,
        published: formData.get("published") === "on",
        updatedAt: new Date(),
      })
      .where(eq(pages.id, id));
  } catch (e) {
    console.error("updatePage:", e);
    return { error: "Gagal menyimpan. Coba lagi." };
  }

  revalidatePath("/admin/pages");
  revalidatePath("/profil");
  revalidatePath("/kontak");
  revalidatePath("/donasi");
  revalidatePath("/jadwal");
  revalidateTag("public-content");
  return { ok: true };
}
