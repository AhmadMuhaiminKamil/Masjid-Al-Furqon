import type { ReactNode } from "react";

/**
 * Layout /admin/login — sengaja polos.
 * Navbar & Footer publik sudah di-return null saat pathname /admin,
 * jadi tidak perlu disembunyikan lagi di sini.
 */
export default function LoginLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
