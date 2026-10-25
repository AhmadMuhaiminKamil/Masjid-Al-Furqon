import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

/* ============================================================
   USERS — admin & editor
   ============================================================ */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(), // bcrypt hash
  role: varchar("role", { length: 20 }).notNull().default("editor"), // admin | editor
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/* ============================================================
   SETTINGS — konfigurasi situs (key-value)
   ============================================================ */
export const settings = pgTable("settings", {
  key: varchar("key", { length: 100 }).primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/* ============================================================
   PAGES — halaman statis (Profil, Jadwal, Kontak, Donasi)
   ============================================================ */
export const pages = pgTable("pages", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  eyebrow: varchar("eyebrow", { length: 100 }), // label kecil gold di atas judul
  excerpt: text("excerpt"), // deskripsi singkat di hero
  content: text("content"), // HTML dari Tiptap
  heroImage: text("hero_image"), // URL gambar
  published: boolean("published").default(true).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/* ============================================================
   POSTS — berita / kegiatan
   ============================================================ */
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  excerpt: text("excerpt"),
  content: text("content"),
  coverImage: text("cover_image"),
  category: varchar("category", { length: 50 }).notNull().default("Berita"), // Berita | Kegiatan | Artikel
  published: boolean("published").default(false).notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }).defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/* ============================================================
   GALLERIES — album foto
   ============================================================ */
export const galleries = pgTable("galleries", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  caption: text("caption"),
  imageUrl: text("image_url").notNull(),
  order: integer("order").default(0).notNull(),
  published: boolean("published").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/* ============================================================
   PRAYER_TIMES — jadwal sholat
   ============================================================ */
export const prayerTimes = pgTable("prayer_times", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 30 }).notNull(), // Subuh, Dzuhur, Ashar, Maghrib, Isya
  adzan: varchar("adzan", { length: 10 }).notNull(), // "04:38"
  iqomah: varchar("iqomah", { length: 10 }).notNull(), // "04:48"
  order: integer("order").default(0).notNull(),
});

/* ============================================================
   SCHEDULES — jadwal kajian rutin
   ============================================================ */
export const schedules = pgTable("schedules", {
  id: serial("id").primaryKey(),
  day: varchar("day", { length: 20 }).notNull(), // Ahad, Senin, ...
  time: varchar("time", { length: 50 }).notNull(), // "07.00 – 09.00"
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  speaker: varchar("speaker", { length: 255 }),
  location: varchar("location", { length: 255 }),
  order: integer("order").default(0).notNull(),
  published: boolean("published").default(true).notNull(),
});

/* ============================================================
   TEAM — struktur pengurus
   ============================================================ */
export const team = pgTable("team", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  position: varchar("position", { length: 255 }).notNull(),
  photo: text("photo"),
  order: integer("order").default(0).notNull(),
  published: boolean("published").default(true).notNull(),
});

/* ============================================================
   CONTACTS — pesan dari form kontak
   ============================================================ */
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 255 }),
  message: text("message").notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/* ============================================================
   TRANSACTIONS — laporan keuangan masjid (bendahara)
   type: "income" (pemasukan) | "expense" (pengeluaran)
   amount: disimpan dalam RUPIAH penuh (integer), bukan sen
   ============================================================ */
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  description: varchar("description", { length: 500 }).notNull(),
  type: varchar("type", { length: 10 }).notNull(), // income | expense
  amount: integer("amount").notNull(), // rupiah penuh
  category: varchar("category", { length: 100 }), // Infaq, Sedekah, Operasional, dll
  note: text("note"),
  createdBy: varchar("created_by", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
