"use server";

import { requireAuth } from "@/lib/auth";

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "masjid-images";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export type UploadResult =
  | { ok: true; url: string; path: string }
  | { ok: false; error: string };

/** nama file aman: buang karakter aneh, tambah timestamp */
function safeName(original: string): string {
  const ext = (original.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const base = (original.split(".").slice(0, -1).join(".") || "foto")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  const stamp = Date.now();
  const rand = Math.random().toString(36).slice(2, 7);
  return `${base || "foto"}-${stamp}-${rand}.${ext}`;
}

/** folder berdasarkan tanggal: 2026/10/ */
function folderNow(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}/${m}`;
}

/**
 * Upload satu file gambar ke Supabase Storage.
 * Return URL publik yang bisa langsung dipakai.
 */
export async function uploadImage(formData: FormData): Promise<UploadResult> {
  await requireAuth();

  if (!SUPABASE_URL || !SERVICE_KEY) {
    return {
      ok: false,
      error: "Konfigurasi storage belum lengkap. Hubungi developer.",
    };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, error: "Tidak ada file yang dipilih." };
  }

  if (file.size === 0) {
    return { ok: false, error: "File kosong." };
  }

  if (file.size > MAX_SIZE) {
    const mb = (file.size / 1024 / 1024).toFixed(1);
    return { ok: false, error: `Ukuran file ${mb} MB, maksimal 5 MB.` };
  }

  if (!ALLOWED.includes(file.type)) {
    return {
      ok: false,
      error: "Format harus JPG, PNG, WEBP, atau GIF.",
    };
  }

  const path = `${folderNow()}/${safeName(file.name)}`;

  try {
    const body = await file.arrayBuffer();

    const res = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${SERVICE_KEY}`,
          "Content-Type": file.type,
          "x-upsert": "false",
          "cache-control": "public, max-age=31536000",
        },
        body: new Uint8Array(body),
      }
    );

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("uploadImage:", res.status, text);
      return {
        ok: false,
        error:
          res.status === 413
            ? "File terlalu besar untuk storage."
            : "Gagal mengunggah. Coba lagi.",
      };
    }

    const url = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
    return { ok: true, url, path };
  } catch (e) {
    console.error("uploadImage exception:", e);
    return { ok: false, error: "Koneksi ke storage gagal." };
  }
}

/** Hapus file di storage berdasarkan URL publik (best-effort) */
export async function deleteImage(url: string): Promise<{ ok: boolean }> {
  await requireAuth();

  if (!SUPABASE_URL || !SERVICE_KEY || !url) return { ok: false };

  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx < 0) return { ok: false };

  const path = url.slice(idx + marker.length);

  try {
    await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${SERVICE_KEY}` },
    });
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
