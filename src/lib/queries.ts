import { unstable_cache } from "next/cache";
import { db } from "@/db";
import {
  posts,
  galleries,
  schedules,
  team,
  prayerTimes,
  settings,
  pages,
} from "@/db/schema";
import { eq, and, asc, desc } from "drizzle-orm";

/* ============================================================
   QUERY PUBLIK — DI-CACHE
   ------------------------------------------------------------
   Semua query dibungkus unstable_cache dengan tag, supaya:
   - navigasi antar halaman tidak query DB ulang (instan)
   - admin panel tetap bisa invalidate lewat revalidateTag()
   TTL 5 menit sebagai jaring aman.
   ============================================================ */

const TTL = 300; // 5 menit

export const getPublishedPosts = unstable_cache(
  async (limit?: number) => {
    try {
      const q = db
        .select()
        .from(posts)
        .where(eq(posts.published, true))
        .orderBy(desc(posts.publishedAt));
      return limit ? await q.limit(limit) : await q;
    } catch (e) {
      console.error("getPublishedPosts:", e);
      return [];
    }
  },
  ["published-posts"],
  { revalidate: TTL, tags: ["posts", "public-content"] }
);

export const getPublishedGalleries = unstable_cache(
  async () => {
    try {
      return await db
        .select()
        .from(galleries)
        .where(eq(galleries.published, true))
        .orderBy(asc(galleries.order));
    } catch (e) {
      console.error("getPublishedGalleries:", e);
      return [];
    }
  },
  ["published-galleries"],
  { revalidate: TTL, tags: ["galleries", "public-content"] }
);

export const getPublishedSchedules = unstable_cache(
  async () => {
    try {
      return await db
        .select()
        .from(schedules)
        .where(eq(schedules.published, true))
        .orderBy(asc(schedules.order));
    } catch (e) {
      console.error("getPublishedSchedules:", e);
      return [];
    }
  },
  ["published-schedules"],
  { revalidate: TTL, tags: ["schedules", "public-content"] }
);

export const getPublishedTeam = unstable_cache(
  async () => {
    try {
      return await db
        .select()
        .from(team)
        .where(eq(team.published, true))
        .orderBy(asc(team.order));
    } catch (e) {
      console.error("getPublishedTeam:", e);
      return [];
    }
  },
  ["published-team"],
  { revalidate: TTL, tags: ["team", "public-content"] }
);

export const getPrayerTimes = unstable_cache(
  async () => {
    try {
      return await db.select().from(prayerTimes).orderBy(asc(prayerTimes.order));
    } catch (e) {
      console.error("getPrayerTimes:", e);
      return [];
    }
  },
  ["prayer-times"],
  { revalidate: TTL, tags: ["prayer", "public-content"] }
);

/** Semua settings jadi object { key: value } */
export const getSettings = unstable_cache(
  async (): Promise<Record<string, string>> => {
    try {
      const rows = await db.select().from(settings);
      const out: Record<string, string> = {};
      for (const r of rows) out[r.key] = r.value;
      return out;
    } catch (e) {
      console.error("getSettings:", e);
      return {};
    }
  },
  ["site-settings"],
  { revalidate: TTL, tags: ["settings", "public-content"] }
);

/** Ambil satu halaman statis berdasarkan slug */
export async function getPage(slug: string) {
  return unstable_cache(
    async () => {
      try {
        const rows = await db
          .select()
          .from(pages)
          .where(and(eq(pages.slug, slug), eq(pages.published, true)))
          .limit(1);
        return rows[0] ?? null;
      } catch (e) {
        console.error("getPage:", e);
        return null;
      }
    },
    ["page", slug],
    { revalidate: TTL, tags: [`page-${slug}`, "public-content"] }
  )();
}
