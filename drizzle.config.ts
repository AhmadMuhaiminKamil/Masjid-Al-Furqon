import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// drizzle-kit hanya baca .env default — tambah .env.local
config({ path: ".env.local" });
config();

const url = process.env.DATABASE_URL;

if (!url) {
  throw new Error(
    "DATABASE_URL tidak ditemukan di .env.local — isi connection string Supabase dulu"
  );
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url },
  verbose: true,
  strict: false,
});
