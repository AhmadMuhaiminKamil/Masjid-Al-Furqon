"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV = [
  { label: "BERANDA", href: "/" },
  { label: "PROFIL", href: "/profil" },
  { label: "JADWAL", href: "/jadwal" },
  { label: "KEGIATAN", href: "/kegiatan" },
  { label: "GALERI", href: "/galeri" },
  { label: "DONASI", href: "/donasi" },
  { label: "KONTAK", href: "/kontak" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isHome = pathname === "/";

  // halaman admin punya layout sendiri — tanpa navbar publik
  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      <header
        className={`iq-nav ${scrolled ? "iq-nav--scrolled" : ""}`}
        data-home={isHome ? "true" : "false"}
      >
        <div className="iq-nav__pill">
          <Link href="/" className="iq-nav__brand">
            Masjid Al-Furqon
          </Link>

          <nav className="iq-nav__links">
            {NAV.map((n) => {
              const active =
                n.href === "/" ? pathname === "/" : pathname.startsWith(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`iq-nav__link ${active ? "is-active" : ""}`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            className={`iq-nav__toggle ${open ? "is-open" : ""}`}
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <div
        className={`iq-mmenu ${open ? "is-open" : ""}`}
        aria-hidden={!open}
      >
        <div className="iq-mmenu__panel">
          <div className="iq-mmenu__head">
            <span>Menu</span>
            <button
              type="button"
              className="iq-mmenu__close"
              aria-label="Tutup menu"
              onClick={() => setOpen(false)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="iq-mmenu__links">
            {NAV.map((n) => {
              const active =
                n.href === "/" ? pathname === "/" : pathname.startsWith(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={active ? "is-active" : ""}
                  onClick={() => setOpen(false)}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <div className="iq-mmenu__foot">
            <span>Masjid Al-Furqon</span>
            <span>Padang</span>
          </div>
        </div>
      </div>
    </>
  );
}
