"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Newspaper,
  Image as ImageIcon,
  CalendarDays,
  Users,
  Wallet,
  Mail,
  Settings,
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

/**
 * Navigasi sidebar desktop dengan indikator geser (sliding pill).
 * Posisi & tinggi indikator dihitung dari elemen aktif, lalu dianimasikan.
 */
export function AdminSideNav() {
  const pathname = usePathname();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState<{ top: number; height: number } | null>(null);

  const activeHref =
    nav.find((n) =>
      n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href)
    )?.href ?? "/admin";

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const measure = () => {
      const el = wrap.querySelector<HTMLElement>(`a[data-href="${activeHref}"]`);
      if (!el) return;
      setIndicator({ top: el.offsetTop, height: el.offsetHeight });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    window.addEventListener("resize", measure);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [activeHref]);

  return (
    <nav className="iq-sidenav" ref={wrapRef}>
      {/* indikator geser */}
      {indicator && (
        <span
          className="iq-sidenav__indicator"
          style={{
            transform: `translateY(${indicator.top}px)`,
            height: indicator.height,
          }}
        />
      )}

      {nav.map((item) => {
        const Icon = item.icon;
        const active = item.href === activeHref;

        return (
          <Link
            key={item.href}
            href={item.href}
            data-href={item.href}
            className={`iq-sidenav__link ${active ? "is-active" : ""}`}
          >
            <Icon size={18} className="iq-sidenav__icon" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
