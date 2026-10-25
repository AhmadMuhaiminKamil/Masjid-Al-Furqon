/* ============================================================
   Data statis — nanti diganti fetch dari Supabase
   Semua isi sama persis dengan versi WordPress
   ============================================================ */

export const site = {
  name: "Masjid Al-Furqon",
  tagline: "Membangun Umat, Merawat Tradisi, Menebar Manfaat",
  city: "Padang",
  address:
    "Jl. Contoh Raya No. 123, Kel. Sukamaju, Kec. Padang Barat, Padang 25119",
  phone: "+62 21 0000 0000",
  email: "info@masjidalfurqon.id",
};

export const prayerTimes = [
  { name: "Subuh", adzan: "04:38" },
  { name: "Dzuhur", adzan: "11:52" },
  { name: "Ashar", adzan: "15:14" },
  { name: "Maghrib", adzan: "17:56" },
  { name: "Isya", adzan: "19:08" },
];

export const services = [
  {
    title: "Jadwal Sholat",
    desc: "Jadwal sholat lima waktu dan Jumat lengkap dengan waktu iqomah yang akurat.",
    href: "/jadwal",
    icon: "prayer",
  },
  {
    title: "Kajian Rutin",
    desc: "Kajian mingguan, tafsir Al-Quran, dan kajian kitab bersama ustadz pilihan.",
    href: "/kegiatan",
    icon: "book",
  },
  {
    title: "Kegiatan Sosial",
    desc: "Santunan yatim, pembagian sembako, dan berbagai kegiatan sosial kemasyarakatan.",
    href: "/kegiatan",
    icon: "social",
  },
  {
    title: "Donasi & Infaq",
    desc: "Salurkan infaq terbaik Anda untuk kemakmuran masjid dan kesejahteraan umat.",
    href: "/donasi",
    icon: "heart",
  },
];

export const gallery = [
  { src: "/images/galeri-1.jpg", caption: "Suasana Masjid" },
  { src: "/images/galeri-2.jpg", caption: "Keindahan Arsitektur" },
  { src: "/images/galeri-3.jpg", caption: "Area Jamaah" },
];
