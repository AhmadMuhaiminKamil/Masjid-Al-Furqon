import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = process.env.SUPABASE_STORAGE_BUCKET || "masjid-images";

export function getSupabaseAdmin() {
  if (!supabaseUrl || !serviceKey) {
    throw new Error(
      "Supabase env belum lengkap: NEXT_PUBLIC_SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY"
    );
  }
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
}

/**
 * Upload file ke Supabase Storage, kembalikan public URL.
 */
export async function uploadImage(
  file: File,
  folder: string = "general"
): Promise<string> {
  const supabase = getSupabaseAdmin();

  const ext = file.name.split(".").pop() || "jpg";
  const safeName = file.name
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-z0-9]/gi, "-")
    .toLowerCase()
    .slice(0, 50);
  const path = `${folder}/${Date.now()}-${safeName}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) throw new Error(`Upload gagal: ${error.message}`);

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Hapus file dari storage berdasarkan public URL.
 */
export async function deleteImage(publicUrl: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  // ekstrak path setelah /object/public/<bucket>/
  const marker = `/object/public/${bucket}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return;
  const path = publicUrl.slice(idx + marker.length);
  await supabase.storage.from(bucket).remove([path]);
}
