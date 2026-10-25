import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import "./nav-footer.css";
import "./hero.css";
import "./sections.css";
import "./pages.css";
import "./polish.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "Masjid Al-Furqon — Membangun Umat, Merawat Tradisi",
    template: "%s — Masjid Al-Furqon",
  },
  description:
    "Website resmi Masjid Al-Furqon. Jadwal sholat, kajian rutin, kegiatan sosial, galeri, dan informasi donasi.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
