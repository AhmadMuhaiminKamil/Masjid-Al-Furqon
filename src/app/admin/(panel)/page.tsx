import Link from "next/link";
import { count } from "drizzle-orm";
import { db } from "@/db";
import { posts, pages, galleries, contacts, schedules, team } from "@/db/schema";
import {
  Newspaper,
  FileText,
  ImageIcon,
  Mail,
  CalendarDays,
  Users,
  ArrowRight,
} from "lucide-react";

async function getStats() {
  try {
    const [p] = await db.select({ n: count() }).from(posts);
    const [pg] = await db.select({ n: count() }).from(pages);
    const [g] = await db.select({ n: count() }).from(galleries);
    const [c] = await db.select({ n: count() }).from(contacts);
    const [s] = await db.select({ n: count() }).from(schedules);
    const [t] = await db.select({ n: count() }).from(team);

    return {
      posts: Number(p?.n ?? 0),
      pages: Number(pg?.n ?? 0),
      galleries: Number(g?.n ?? 0),
      contacts: Number(c?.n ?? 0),
      schedules: Number(s?.n ?? 0),
      team: Number(t?.n ?? 0),
      error: false,
    };
  } catch {
    return {
      posts: 0,
      pages: 0,
      galleries: 0,
      contacts: 0,
      schedules: 0,
      team: 0,
      error: true,
    };
  }
}

export default async function AdminDashboard() {
  const s = await getStats();

  const cards = [
    { label: "Berita & Kegiatan", value: s.posts, href: "/admin/posts", icon: Newspaper, color: "bg-blue-500" },
    { label: "Halaman", value: s.pages, href: "/admin/pages", icon: FileText, color: "bg-emerald-600" },
    { label: "Foto Galeri", value: s.galleries, href: "/admin/gallery", icon: ImageIcon, color: "bg-purple-500" },
    { label: "Pesan Masuk", value: s.contacts, href: "/admin/messages", icon: Mail, color: "bg-amber-500" },
    { label: "Jadwal Kajian", value: s.schedules, href: "/admin/schedules", icon: CalendarDays, color: "bg-teal-600" },
    { label: "Pengurus", value: s.team, href: "/admin/team", icon: Users, color: "bg-rose-500" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-bold text-emerald">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">
          Ringkasan konten website Masjid Al-Furqon
        </p>
      </div>

      {s.error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          <strong>Database belum terhubung.</strong> Isi{" "}
          <code className="rounded bg-amber-100 px-1.5 py-0.5">DATABASE_URL</code>{" "}
          di <code className="rounded bg-amber-100 px-1.5 py-0.5">.env.local</code>{" "}
          lalu jalankan <code className="rounded bg-amber-100 px-1.5 py-0.5">npm run db:push</code>.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link key={c.href} href={c.href} className="card-iq group p-6">
              <div className="flex items-start justify-between">
                <div
                  className={`${c.color} flex h-11 w-11 items-center justify-center rounded-xl text-white`}
                >
                  <Icon size={20} />
                </div>
                <ArrowRight
                  size={16}
                  className="text-muted opacity-0 transition-opacity group-hover:opacity-100"
                />
              </div>
              <p className="mt-4 font-serif text-3xl font-bold text-emerald">
                {c.value}
              </p>
              <p className="mt-1 text-sm text-muted">{c.label}</p>
            </Link>
          );
        })}
      </div>

      <div className="rounded-2xl border border-[var(--line)] bg-white p-6">
        <h2 className="font-serif text-lg font-bold text-emerald">Mulai Cepat</h2>
        <ul className="mt-4 space-y-2 text-sm text-muted">
          <li>• Edit halaman <strong>Profil</strong>, <strong>Jadwal</strong>, <strong>Kontak</strong>, <strong>Donasi</strong> di menu <Link href="/admin/pages" className="text-emerald-mid underline">Halaman</Link></li>
          <li>• Tambah berita atau kegiatan di menu <Link href="/admin/posts" className="text-emerald-mid underline">Berita & Kegiatan</Link></li>
          <li>• Upload foto ke <Link href="/admin/gallery" className="text-emerald-mid underline">Galeri</Link></li>
          <li>• Atur nama masjid & kontak di <Link href="/admin/settings" className="text-emerald-mid underline">Pengaturan</Link></li>
        </ul>
      </div>
    </div>
  );
}
