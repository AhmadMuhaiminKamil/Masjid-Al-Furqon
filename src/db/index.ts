import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

/**
 * Koneksi DB dibuat lazy — supaya build/SSG tidak gagal
 * saat DATABASE_URL belum diisi (fase frontend only).
 */
let _db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (_db) return _db;

  if (!connectionString || connectionString.includes("xxxxx")) {
    throw new Error(
      "DATABASE_URL belum di-set dengan benar di .env.local (isi connection string Supabase)"
    );
  }

  const client = postgres(connectionString, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false, // wajib untuk Supabase pooler (transaction mode)
  });

  _db = drizzle(client, { schema });
  return _db;
}

/** Alias kompatibel untuk kode lama (`db.select()` dll) */
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    const real = getDb() as unknown as Record<string | symbol, unknown>;
    const value = real[prop];
    return typeof value === "function" ? value.bind(real) : value;
  },
});
