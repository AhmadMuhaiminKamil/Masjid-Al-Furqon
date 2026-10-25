"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { eq, asc } from "drizzle-orm";
import { db } from "@/db";
import { team } from "@/db/schema";
import { requireAuth } from "@/lib/auth";

export type TeamRow = typeof team.$inferSelect;

function toInt(v: FormDataEntryValue | null, fallback = 0) {
  const n = Number.parseInt(String(v ?? "").trim(), 10);
  return Number.isFinite(n) ? n : fallback;
}

function revalidateTeam() {
  revalidatePath("/admin/team");
  revalidatePath("/profil");
}

export async function listTeam() {
  await requireAuth();
  return db.select().from(team).orderBy(asc(team.order), asc(team.id));
}

export async function createTeam(formData: FormData) {
  await requireAuth();

  const name = String(formData.get("name") || "").trim();
  const position = String(formData.get("position") || "").trim();

  if (!name) return { error: "Nama wajib diisi." };
  if (!position) return { error: "Jabatan wajib diisi." };

  try {
    await db.insert(team).values({
      name,
      position,
      photo: String(formData.get("photo") || "").trim() || null,
      order: toInt(formData.get("order"), 0),
      published: formData.get("published") === "on",
    });
  } catch (e) {
    console.error("createTeam:", e);
    return { error: "Gagal menyimpan. Coba lagi." };
  }

  revalidateTeam();
  revalidateTag("team");
  revalidateTag("public-content");
  return { ok: true };
}

export async function updateTeam(id: number, formData: FormData) {
  await requireAuth();

  const name = String(formData.get("name") || "").trim();
  const position = String(formData.get("position") || "").trim();

  if (!name) return { error: "Nama wajib diisi." };
  if (!position) return { error: "Jabatan wajib diisi." };

  try {
    await db
      .update(team)
      .set({
        name,
        position,
        photo: String(formData.get("photo") || "").trim() || null,
        order: toInt(formData.get("order"), 0),
        published: formData.get("published") === "on",
      })
      .where(eq(team.id, id));
  } catch (e) {
    console.error("updateTeam:", e);
    return { error: "Gagal menyimpan. Coba lagi." };
  }

  revalidateTeam();
  revalidateTag("team");
  revalidateTag("public-content");
  return { ok: true };
}

export async function deleteTeam(id: number) {
  await requireAuth();
  try {
    await db.delete(team).where(eq(team.id, id));
  } catch (e) {
    console.error("deleteTeam:", e);
    return { error: "Gagal menghapus." };
  }
  revalidateTeam();
  revalidateTag("team");
  revalidateTag("public-content");
  return { ok: true };
}

export async function togglePublishTeam(id: number, next: boolean) {
  await requireAuth();
  try {
    await db.update(team).set({ published: next }).where(eq(team.id, id));
  } catch (e) {
    console.error("togglePublishTeam:", e);
    return { error: "Gagal mengubah status." };
  }
  revalidateTeam();
  revalidateTag("team");
  revalidateTag("public-content");
  return { ok: true };
}
