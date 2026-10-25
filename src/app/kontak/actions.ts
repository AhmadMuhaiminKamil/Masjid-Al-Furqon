"use server";

import { db } from "@/db";
import { contacts } from "@/db/schema";

export async function submitContact(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const subject = String(formData.get("subject") || "").trim();
  const message = String(formData.get("message") || "").trim();

  if (!name || !email || !message) {
    return { error: "Nama, email, dan pesan wajib diisi." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Format email tidak valid." };
  }

  try {
    await db.insert(contacts).values({
      name,
      email,
      subject: subject || "Pesan dari website",
      message,
    });
  } catch (e) {
    console.error("submitContact:", e);
    return { error: "Gagal mengirim pesan. Coba lagi nanti." };
  }

  return { ok: true };
}
