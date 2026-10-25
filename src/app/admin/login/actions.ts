"use server";

import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createToken, setSessionCookie, clearSessionCookie } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const from = String(formData.get("from") || "/admin");

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  try {
    const found = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (found.length === 0) {
      return { error: "Email atau password salah." };
    }

    const user = found[0];
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return { error: "Email atau password salah." };
    }

    const token = await createToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    await setSessionCookie(token);
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return { error: "Terjadi kesalahan server. Cek koneksi database." };
  }

  redirect(from);
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/admin/login");
}
