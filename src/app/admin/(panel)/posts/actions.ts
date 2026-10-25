"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { posts } from "@/db/schema";
import { requireAuth } from "@/lib/auth";

export type PostRow = typeof posts.$inferSelect;

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 90);
}

export async function listPosts() {
  await requireAuth();
  return db.select().from(posts).orderBy(desc(posts.publishedAt));
}

export async function createPost(formData: FormData) {
  await requireAuth();

  const title = String(formData.get("title") || "").trim();
  if (!title) return { error: "Judul wajib diisi." };

  const rawSlug = String(formData.get("slug") || "").trim();
  const slug = slugify(rawSlug || title) || `post-${Date.now()}`;

  try {
    await db.insert(posts).values({
      slug,
      title,
      excerpt: String(formData.get("excerpt") || "").trim() || null,
      content: String(formData.get("content") || "").trim() || null,
      coverImage: String(formData.get("coverImage") || "").trim() || null,
      category: String(formData.get("category") || "Berita").trim(),
      published: formData.get("published") === "on",
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("unique") || msg.includes("duplicate"))
      return { error: `Slug "${slug}" sudah dipakai. Ganti slug lain.` };
    console.error("createPost:", e);
    return { error: "Gagal menyimpan. Coba lagi." };
  }

  revalidatePath("/admin/posts");
  revalidatePath("/kegiatan");
  revalidatePath("/");
  revalidateTag("posts");
  revalidateTag("public-content");
  return { ok: true };
}

export async function updatePost(id: number, formData: FormData) {
  await requireAuth();

  const title = String(formData.get("title") || "").trim();
  if (!title) return { error: "Judul wajib diisi." };

  const rawSlug = String(formData.get("slug") || "").trim();
  const slug = slugify(rawSlug || title) || `post-${id}`;

  try {
    await db
      .update(posts)
      .set({
        slug,
        title,
        excerpt: String(formData.get("excerpt") || "").trim() || null,
        content: String(formData.get("content") || "").trim() || null,
        coverImage: String(formData.get("coverImage") || "").trim() || null,
        category: String(formData.get("category") || "Berita").trim(),
        published: formData.get("published") === "on",
      })
      .where(eq(posts.id, id));
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "";
    if (msg.includes("unique") || msg.includes("duplicate"))
      return { error: `Slug "${slug}" sudah dipakai.` };
    console.error("updatePost:", e);
    return { error: "Gagal menyimpan. Coba lagi." };
  }

  revalidatePath("/admin/posts");
  revalidatePath("/kegiatan");
  revalidatePath("/");
  revalidateTag("posts");
  revalidateTag("public-content");
  return { ok: true };
}

export async function deletePost(id: number) {
  await requireAuth();
  try {
    await db.delete(posts).where(eq(posts.id, id));
  } catch (e) {
    console.error("deletePost:", e);
    return { error: "Gagal menghapus." };
  }
  revalidatePath("/admin/posts");
  revalidatePath("/kegiatan");
  revalidatePath("/");
  revalidateTag("posts");
  revalidateTag("public-content");
  return { ok: true };
}

export async function togglePublishPost(id: number, next: boolean) {
  await requireAuth();
  await db.update(posts).set({ published: next }).where(eq(posts.id, id));
  revalidatePath("/admin/posts");
  revalidatePath("/kegiatan");
  revalidatePath("/");
  revalidateTag("posts");
  revalidateTag("public-content");
  return { ok: true };
}
