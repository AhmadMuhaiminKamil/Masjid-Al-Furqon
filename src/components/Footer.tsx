"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const year = new Date().getFullYear();

  // halaman admin punya layout sendiri — tanpa footer publik
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="iq-footer">
      <div className="iq-footer__grid">
        <div className="iq-footer__brand">
          <h3>Masjid Al-Furqon</h3>
          <p>
            Selamat datang di Masjid Al-Furqon, rumah ibadah dan pusat kegiatan
            umat. Merajut ukhuwah, menebar kedamaian, dan menghadirkan manfaat
            bagi seluruh alam.
          </p>
        </div>

        <div>
          <h4>Kontak &amp; Lokasi</h4>
          <div className="iq-footer__rows">
            <div className="iq-footer__row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>
                Jl. Contoh Raya No. 123, Kel. Sukamaju, Kec. Padang Barat, Padang
                25119
              </span>
            </div>
            <div className="iq-footer__row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <a href="tel:+6221000000">+62 21 0000 0000</a>
            </div>
            <div className="iq-footer__row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 6-10 7L2 6" />
              </svg>
              <a href="mailto:info@masjidalfurqon.id">info@masjidalfurqon.id</a>
            </div>
          </div>
        </div>

        <div>
          <h4>Ikuti Sosial Media</h4>
          <div className="iq-footer__social">
            <a href="#" aria-label="Instagram" target="_blank" rel="noopener">
              <svg viewBox="0 0 24 24"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 5.17a4.67 4.67 0 1 0 0 9.34 4.67 4.67 0 0 0 0-9.34zm0 7.7a3.03 3.03 0 1 1 0-6.06 3.03 3.03 0 0 1 0 6.06zm5.95-7.89a1.09 1.09 0 1 1-2.18 0 1.09 1.09 0 0 1 2.18 0z" /></svg>
            </a>
            <a href="#" aria-label="YouTube" target="_blank" rel="noopener">
              <svg viewBox="0 0 24 24"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-5.8zM9.6 15.6V8.4L15.8 12l-6.2 3.6z" /></svg>
            </a>
            <a href="#" aria-label="Facebook" target="_blank" rel="noopener">
              <svg viewBox="0 0 24 24"><path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.25h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z" /></svg>
            </a>
          </div>
        </div>
      </div>

      <div className="iq-footer__bottom">
        <span>&copy; {year} Masjid Al-Furqon. Hak cipta dilindungi.</span>
        <span>Dibangun dengan niat baik untuk umat.</span>
      </div>
    </footer>
  );
}
