"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { requireAuth } from "@/lib/auth";

export type SettingRow = { key: string; value: string };

export async function listSettings(): Promise<SettingRow[]> {
  await requireAuth();
  const rows = await db.select().from(settings);
  return rows.map((r) => ({ key: r.key, value: r.value }));
}

/** Simpan banyak key sekaligus (upsert) */
export async function saveSettings(formData: FormData) {
  await requireAuth();

  const entries: SettingRow[] = [];
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && key.startsWith("s_")) {
      entries.push({ key: key.slice(2), value: value.trim() });
    }
  }

  if (entries.length === 0) return { error: "Tidak ada perubahan." };

  try {
    for (const e of entries) {
      await db
        .insert(settings)
        .values({ key: e.key, value: e.value })
        .onConflictDoUpdate({
          target: settings.key,
          set: { value: e.value, updatedAt: sql`now()` },
        });
    }
  } catch (err) {
    console.error("saveSettings:", err);
    return { error: "Gagal menyimpan pengaturan. Coba lagi." };
  }

  revalidatePath("/admin/settings");
  revalidatePath("/");
  revalidatePath("/kontak");
  revalidatePath("/donasi");
  revalidateTag("settings");
  revalidateTag("public-content");
  return { ok: true };
}
