"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { galleries } from "@/db/schema";
import { requireAuth } from "@/lib/auth";

export type GalleryRow = typeof galleries.$inferSelect;

/* ---------- helper: parse urutan ---------- */
function parseOrder(raw: FormDataEntryValue | null): number {
  const n = parseInt(String(raw ?? "").trim(), 10);
  return Number.isFinite(n) ? n : 0;
}

/* ---------- helper: validasi input ---------- */
function readFields(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const imageUrl = String(formData.get("imageUrl") || "").trim();
  const caption = String(formData.get("caption") || "").trim();
  const order = parseOrder(formData.get("order"));
  const published = formData.get("published") === "on";

  return { title, imageUrl, caption, order, published };
}

/* ---------- READ ---------- */
export async function listGalleries(): Promise<GalleryRow[]> {
  await requireAuth();
  return db
    .select()
    .from(galleries)
    .orderBy(asc(galleries.order), asc(galleries.id));
}

/* ---------- CREATE ---------- */
export async function createGallery(formData: FormData) {
  await requireAuth();

  const { title, imageUrl, caption, order, published } = readFields(formData);

  if (!title) return { error: "Judul wajib diisi." };
  if (!imageUrl) return { error: "URL Foto wajib diisi." };

  try {
    await db.insert(galleries).values({
      title,
      imageUrl,
      caption: caption || null,
      order,
      published,
    });
  } catch (e: unknown) {
    console.error("createGallery:", e);
    return { error: "Gagal menyimpan. Coba lagi." };
  }

  revalidatePath("/admin/gallery");
  revalidatePath("/galeri");
  revalidatePath("/");
  revalidateTag("galleries");
  revalidateTag("public-content");
  return { ok: true };
}

/* ---------- UPDATE ---------- */
export async function updateGallery(id: number, formData: FormData) {
  await requireAuth();

  const { title, imageUrl, caption, order, published } = readFields(formData);

  if (!title) return { error: "Judul wajib diisi." };
  if (!imageUrl) return { error: "URL Foto wajib diisi." };

  try {
    await db
      .update(galleries)
      .set({
        title,
        imageUrl,
        caption: caption || null,
        order,
        published,
      })
      .where(eq(galleries.id, id));
  } catch (e: unknown) {
    console.error("updateGallery:", e);
    return { error: "Gagal menyimpan. Coba lagi." };
  }

  revalidatePath("/admin/gallery");
  revalidatePath("/galeri");
  revalidatePath("/");
  revalidateTag("galleries");
  revalidateTag("public-content");
  return { ok: true };
}

/* ---------- DELETE ---------- */
export async function deleteGallery(id: number) {
  await requireAuth();

  try {
    await db.delete(galleries).where(eq(galleries.id, id));
  } catch (e: unknown) {
    console.error("deleteGallery:", e);
    return { error: "Gagal menghapus. Coba lagi." };
  }

  revalidatePath("/admin/gallery");
  revalidatePath("/galeri");
  revalidatePath("/");
  revalidateTag("galleries");
  revalidateTag("public-content");
  return { ok: true };
}

/* ---------- TOGGLE PUBLISHED ---------- */
export async function togglePublishGallery(id: number, next: boolean) {
  await requireAuth();

  try {
    await db
      .update(galleries)
      .set({ published: next })
      .where(eq(galleries.id, id));
  } catch (e: unknown) {
    console.error("togglePublishGallery:", e);
    return { error: "Gagal mengubah status. Coba lagi." };
  }

  revalidatePath("/admin/gallery");
  revalidatePath("/galeri");
  revalidatePath("/");
  revalidateTag("galleries");
  revalidateTag("public-content");
  return { ok: true };
}
