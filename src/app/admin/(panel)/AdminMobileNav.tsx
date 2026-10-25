"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  LayoutDashboard,
  FileText,
  Newspaper,
  Image as ImageIcon,
  CalendarDays,
  Users,
  Wallet,
  Mail,
  Settings,
  LogOut,
  ExternalLink,
} from "lucide-react";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/pages", label: "Halaman", icon: FileText },
  { href: "/admin/posts", label: "Berita & Kegiatan", icon: Newspaper },
  { href: "/admin/gallery", label: "Galeri", icon: ImageIcon },
  { href: "/admin/schedules", label: "Jadwal Kajian", icon: CalendarDays },
  { href: "/admin/team", label: "Pengurus", icon: Users },
  { href: "/admin/finance", label: "Laporan Keuangan", icon: Wallet },
  { href: "/admin/messages", label: "Pesan Masuk", icon: Mail },
  { href: "/admin/settings", label: "Pengaturan", icon: Settings },
];

export function AdminMobileNav({ logoutAction }: { logoutAction: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // tutup saat pindah halaman
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // lock scroll + escape
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="iq-adm-mobilenav">
      <button
        className="iq-adm-burger"
        onClick={() => setOpen(true)}
        aria-label="Buka menu"
      >
        <Menu size={21} />
      </button>

      {open && (
        <div className="iq-adm-drawer" role="dialog" aria-modal="true">
          <div className="iq-adm-drawer__scrim" onClick={() => setOpen(false)} />

          <aside className="iq-adm-drawer__panel">
            <div className="iq-adm-drawer__head">
              <div>
                <strong>Masjid Al-Furqon</strong>
                <span>Admin Panel</span>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Tutup menu">
                <X size={19} />
              </button>
            </div>

            <nav className="iq-adm-drawer__links">
              {nav.map((n) => {
                const Icon = n.icon;
                const active =
                  n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href);
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    className={active ? "is-active" : ""}
                  >
                    <Icon size={17} />
                    {n.label}
                  </Link>
                );
              })}
            </nav>

            <div className="iq-adm-drawer__foot">
              <Link href="/" target="_blank">
                <ExternalLink size={16} /> Lihat Website
              </Link>
              <form action={logoutAction}>
                <button type="submit">
                  <LogOut size={16} /> Keluar
                </button>
              </form>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
