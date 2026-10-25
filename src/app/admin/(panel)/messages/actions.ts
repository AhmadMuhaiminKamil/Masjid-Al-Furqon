"use server";

import { revalidatePath } from "next/cache";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { contacts } from "@/db/schema";
import { requireAuth } from "@/lib/auth";

export type ContactRow = typeof contacts.$inferSelect;

/* ============================================================
   Pesan masuk — READ ONLY + tandai dibaca + hapus.
   Tidak boleh create (pesan berasal dari form kontak publik).
   ============================================================ */

export async function listMessages() {
  await requireAuth();
  return db.select().from(contacts).orderBy(desc(contacts.createdAt));
}

export async function markRead(id: number) {
  await requireAuth();
  try {
    await db.update(contacts).set({ read: true }).where(eq(contacts.id, id));
  } catch (e) {
    console.error("markRead:", e);
    return { error: "Gagal menandai pesan." };
  }
  revalidatePath("/admin/messages");
  return { ok: true };
}

export async function deleteMessage(id: number) {
  await requireAuth();
  try {
    await db.delete(contacts).where(eq(contacts.id, id));
  } catch (e) {
    console.error("deleteMessage:", e);
    return { error: "Gagal menghapus pesan." };
  }
  revalidatePath("/admin/messages");
  return { ok: true };
}
