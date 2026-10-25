import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { logoutAction } from "../login/actions";
import { LogOut, ExternalLink } from "lucide-react";
import "./admin.css";
import "./mobilenav.css";
import "./sidenav.css";
import "@/styles/upload.css";
import { AdminMobileNav } from "./AdminMobileNav";
import { AdminSideNav } from "./AdminSideNav";

export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s — Admin Masjid Al-Furqon",
  },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="flex min-h-screen bg-[#f7f8f7]">
      {/* ---------- SIDEBAR ---------- */}
      <aside className="hidden w-64 flex-col bg-emerald-700 md:flex">
        <div className="border-b border-white/10 px-6 py-5">
          <p className="font-serif text-lg font-bold text-white">
            Masjid Al-Furqon
          </p>
          <p className="text-[11px] uppercase tracking-wider text-gold">
            Admin Panel
          </p>
        </div>

<AdminSideNav />

        <div className="border-t border-white/10 p-3">
          <Link
            href="/"
            target="_blank"
            className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/60 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ExternalLink size={16} />
            Lihat Website
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/60 transition-colors hover:bg-red-500/20 hover:text-red-200"
            >
              <LogOut size={16} />
              Keluar
            </button>
          </form>
        </div>
      </aside>

      {/* ---------- MAIN ---------- */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-[var(--line)] bg-white px-4 py-3 md:px-6 md:py-4">
          <AdminMobileNav logoutAction={logoutAction} />
          <div className="text-sm text-muted">
            Masuk sebagai{" "}
            <span className="font-semibold text-emerald">{session.name}</span>
          </div>
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-mid">
            {session.role}
          </span>
        </header>

        <main className="min-w-0 flex-1 overflow-x-hidden p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
