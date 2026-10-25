"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { schedules } from "@/db/schema";
import { requireAuth } from "@/lib/auth";

export type ScheduleRow = typeof schedules.$inferSelect;

const DAYS = [
  "Ahad",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
] as const;

function normDay(raw: FormDataEntryValue | null): string {
  const v = String(raw ?? "").trim();
  const found = DAYS.find((d) => d.toLowerCase() === v.toLowerCase());
  return found ?? v;
}

function revalidateAll() {
  revalidatePath("/admin/schedules");
  revalidatePath("/jadwal");
  revalidatePath("/");
}

/** Daftar jadwal kajian, urut kolom `order` lalu hari. */
export async function listSchedules(): Promise<ScheduleRow[]> {
  await requireAuth();
  return db
    .select()
    .from(schedules)
    .orderBy(asc(schedules.order), asc(schedules.id));
}

/** Validasi bersama untuk create & update. */
function readForm(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const day = normDay(formData.get("day"));
  const time = String(formData.get("time") || "").trim();
  const speaker = String(formData.get("speaker") || "").trim();
  const location = String(formData.get("location") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const published = formData.get("published") === "on";
  const orderRaw = String(formData.get("order") || "").trim();
  const order = orderRaw === "" ? 0 : Number(orderRaw);

  if (!title) return { error: "Judul / kitab wajib diisi." as const };
  if (title.length > 255) return { error: "Judul maksimal 255 karakter." as const };
  if (!day) return { error: "Hari wajib dipilih." as const };
  if (!time) return { error: "Jam kajian wajib diisi." as const };
  if (!Number.isFinite(order))
    return { error: "Urutan harus berupa angka." as const };

  return {
    values: {
      title,
      day,
      time,
      speaker: speaker || null,
      location: location || null,
      description: description || null,
      published,
      order: Math.trunc(order),
    },
  };
}

export async function createSchedule(formData: FormData) {
  await requireAuth();

  const parsed = readForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  try {
    await db.insert(schedules).values(parsed.values);
  } catch (e) {
    console.error("createSchedule:", e);
    return { error: "Gagal menyimpan jadwal kajian. Coba lagi." };
  }

  revalidateAll();
  revalidateTag("schedules");
  revalidateTag("public-content");
  return { ok: true as const };
}

export async function updateSchedule(id: number, formData: FormData) {
  await requireAuth();

  if (!Number.isInteger(id) || id <= 0)
    return { error: "ID jadwal tidak valid." };

  const parsed = readForm(formData);
  if ("error" in parsed) return { error: parsed.error };

  try {
    await db.update(schedules).set(parsed.values).where(eq(schedules.id, id));
  } catch (e) {
    console.error("updateSchedule:", e);
    return { error: "Gagal menyimpan jadwal kajian. Coba lagi." };
  }

  revalidateAll();
  revalidateTag("schedules");
  revalidateTag("public-content");
  return { ok: true as const };
}

export async function deleteSchedule(id: number) {
  await requireAuth();

  try {
    await db.delete(schedules).where(eq(schedules.id, id));
  } catch (e) {
    console.error("deleteSchedule:", e);
    return { error: "Gagal menghapus jadwal kajian." };
  }

  revalidateAll();
  revalidateTag("schedules");
  revalidateTag("public-content");
  return { ok: true as const };
}

export async function togglePublishSchedule(id: number, next: boolean) {
  await requireAuth();

  try {
    await db.update(schedules).set({ published: next }).where(eq(schedules.id, id));
  } catch (e) {
    console.error("togglePublishSchedule:", e);
    return { error: "Gagal mengubah status." };
  }

  revalidateAll();
  revalidateTag("schedules");
  revalidateTag("public-content");
  return { ok: true as const };
}
