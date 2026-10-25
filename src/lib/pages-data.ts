/* ============================================================
   Data halaman dalam — sama persis dengan WordPress
   Nanti diganti fetch dari Supabase
   ============================================================ */

/* ---------- PROFIL ---------- */
export const profil = {
  eyebrow: "TENTANG KAMI",
  title: "Profil Masjid",
  desc: "Mengenal lebih dekat Masjid Al-Furqon: sejarah, visi misi, dan para pengurus yang mengabdi untuk umat.",
  sejarah: {
    title: "Berdiri Sejak 1985,\nTumbuh Bersama Umat",
    p1: "Masjid Al-Furqon bermula dari musala sederhana berukuran 8×8 meter yang dibangun atas inisiatif warga pada tahun 1985. Seiring bertambahnya jamaah, pada tahun 1998 dilakukan perluasan pertama menjadi 12×15 meter.",
    p2: "Tahun 2010, berkat gotong royong warga dan donatur, masjid mengalami renovasi besar hingga menjadi bangunan dua lantai seperti sekarang dengan kapasitas 800 jamaah. Kini Masjid Al-Furqon tidak hanya menjadi tempat ibadah, tetapi juga pusat kegiatan pendidikan, sosial, dan pemberdayaan ekonomi umat.",
    stats: [
      { value: "40", label: "Tahun Berdiri" },
      { value: "800", label: "Kapasitas Jamaah" },
      { value: "12", label: "Program Aktif" },
    ],
  },
  visi: "Menjadi masjid yang makmur, modern, dan menjadi pusat kegiatan umat yang membawa rahmat bagi seluruh alam.",
  misi: [
    "Memakmurkan masjid dengan sholat berjamaah lima waktu",
    "Menyelenggarakan kajian dan pendidikan agama berkala",
    "Membangun kegiatan sosial kemasyarakatan",
    "Memberdayakan ekonomi umat melalui usaha produktif",
    "Membina generasi muda melalui program kepemudaan",
  ],
  team: [
    { name: "H. Ahmad Fauzi", position: "Ketua DKM", initials: "HA" },
    { name: "M. Syaiful Anwar", position: "Sekretaris", initials: "MS" },
    { name: "Hj. Rahimah Yusuf", position: "Bendahara", initials: "RH" },
    { name: "Ust. Abdul Basir", position: "Bidang Dakwah", initials: "AB" },
    { name: "Ir. Ismail Karim", position: "Bidang Pembangunan", initials: "IK" },
    { name: "Nur Zalikha", position: "Bidang Sosial", initials: "NZ" },
  ],
};

/* ---------- JADWAL ---------- */
export const jadwal = {
  eyebrow: "AGENDA KAJIAN",
  title: "Jadwal Kajian",
  desc: "Kajian rutin mingguan di Masjid Al-Furqon. Untuk jadwal sholat, lihat di halaman beranda.",
  sholat: [
    { name: "Subuh", adzan: "04:38", iqomah: "04:48" },
    { name: "Dzuhur", adzan: "11:52", iqomah: "12:02" },
    { name: "Ashar", adzan: "15:14", iqomah: "15:24" },
    { name: "Maghrib", adzan: "17:56", iqomah: "18:01" },
    { name: "Isya", adzan: "19:08", iqomah: "19:18" },
  ],
  kajian: [
    {
      day: "AHAD",
      time: "07.00 – 09.00",
      title: "Tafsir Al-Qur'an",
      desc: "Kajian tafsir surat pilihan bersama Ust. Abdul Basir. Terbuka untuk umum, disediakan sarapan ringan.",
      location: "Aula Utama",
    },
    {
      day: "SENIN",
      time: "19.30 – 21.00",
      title: "Kajian Kitab Fiqih",
      desc: "Membahas fiqih ibadah dan muamalah harian bersama Ust. Hidayatullah.",
      location: "Ruang Belajar",
    },
    {
      day: "RABU",
      time: "16.30 – 17.30",
      title: "Tahsin & Tahfidz",
      desc: "Program perbaikan bacaan Al-Qur'an untuk remaja dan dewasa. Pendampingan bersanad.",
      location: "Gedung Lantai 2",
    },
    {
      day: "JUMAT",
      time: "12.00 – 13.00",
      title: "Khutbah Jumat",
      desc: "Khutbah mingguan dengan penceramah bergilir. Tersedia terjemahan untuk jamaah.",
      location: "Ruang Utama",
    },
  ],
};

/* ---------- KEGIATAN ---------- */
export const kegiatan = {
  eyebrow: "PROGRAM & KEGIATAN",
  title: "Kegiatan Masjid",
  desc: "Berbagai program ibadah, pendidikan, dan sosial yang berjalan di Masjid Al-Furqon.",
  categories: [
    "Semua",
    "Ibadah",
    "Pendidikan",
    "Sosial",
    "Kepemudaan",
    "Kesehatan",
  ],
  items: [
    {
      badge: "SOSIAL",
      date: "15 Juni 2026",
      time: "08.00 WIB",
      title: "Penyembelihan & Pembagian Hewan Qurban",
      desc: "Distribusi daging qurban untuk 320 keluarga penerima manfaat di sekitar masjid.",
      image: "/images/evt-sosial.jpg",
    },
    {
      badge: "PENDIDIKAN",
      date: "12 Juni 2026",
      time: "09.00 WIB",
      title: "Diklat Bahasa Arab Intensif",
      desc: "Program tiga bulan untuk jamaah yang ingin memperdalam bahasa Arab Al-Qur'an.",
      image: "/images/evt-anak.jpg",
    },
    {
      badge: "IBADAH",
      date: "10 Juni 2026",
      time: "18.30 WIB",
      title: "Qiyamul Lail Bersama",
      desc: "Sholat tahajud berjamaah dilanjutkan kajian dan sahur bersama.",
      image: "/images/galeri-2.jpg",
    },
    {
      badge: "SOSIAL",
      date: "05 Juni 2026",
      time: "10.00 WIB",
      title: "Santunan Yatim & Dhuafa",
      desc: "Pemberian santunan bulanan untuk 85 anak yatim binaan masjid.",
      image: "/images/evt-kajian.jpg",
    },
    {
      badge: "KEPEMUDAAN",
      date: "01 Juni 2026",
      time: "14.00 WIB",
      title: "Pelatihan Kepemimpinan Remaja Masjid",
      desc: "Workshop organisasi dan manajemen kegiatan untuk remaja masjid usia 15–22 tahun.",
      image: "/images/evt-remaja2.jpg",
    },
    {
      badge: "KESEHATAN",
      date: "28 Mei 2026",
      time: "08.00 WIB",
      title: "Bakti Sosial Kesehatan Gratis",
      desc: "Pemeriksaan kesehatan dan pengobatan gratis bekerja sama dengan puskesmas setempat.",
      image: "/images/evt-sehat.jpg",
    },
  ],
};

/* ---------- GALERI ---------- */
export const galeri = {
  eyebrow: "DOKUMENTASI",
  title: "Galeri Masjid",
  desc: "Rekam jejak kegiatan, keindahan arsitektur, dan momen kebersamaan di Masjid Al-Furqon.",
  items: [
    { src: "/images/galeri-1.jpg", caption: "Eksterior Masjid" },
    { src: "/images/galeri-2.jpg", caption: "Refleksi Kolam di Malam Hari" },
    { src: "/images/evt-kajian.jpg", caption: "Kajian Al-Qur'an" },
    { src: "/images/evt-sosial.jpg", caption: "Santunan Anak Yatim" },
    { src: "/images/evt-remaja2.jpg", caption: "Kegiatan Remaja Masjid" },
    { src: "/images/galeri-3.jpg", caption: "Panorama Masjid" },
  ],
};

/* ---------- KONTAK ---------- */
export const kontak = {
  eyebrow: "HUBUNGI KAMI",
  title: "Kontak & Lokasi",
  desc: "Sampaikan pertanyaan, usulan, atau kebutuhan Anda. Kami siap membantu.",
  address:
    "Jl. Contoh Raya No. 123, Kel. Sukamaju,\nKec. Padang Barat, Padang 25119",
  phone: "+62 21 0000 0000",
  email: "info@masjidalfurqon.id",
  hours: "Senin – Jumat: 08.00 – 16.00 WIB\nSabtu – Ahad: Tutup",
};

/* ---------- DONASI ---------- */
export const donasi = {
  eyebrow: "INFAQ & SEDEKAH",
  title: "Donasi Masjid",
  desc: "Setiap infaq Anda menghidupkan masjid dan menebar manfaat bagi umat.",
  methods: [
    {
      label: "TRANSFER BANK",
      bank: "1234 567 890",
      detail: "Bank Syariah Indonesia (BSI)\na.n. DKM Masjid Al-Furqon",
      type: "bank",
    },
    {
      label: "QRIS",
      detail: "Scan dengan aplikasi\ne-wallet atau m-banking",
      type: "qris",
    },
    {
      label: "TUNAI",
      detail: "Serahkan langsung ke\nsekretariat masjid",
      type: "cash",
    },
  ],
  programs: [
    { title: "Renovasi Tempat Wudhu", collected: "Rp 68 jt terkumpul", target: "dari Rp 100 jt", percent: 68 },
    { title: "Beasiswa Santri Yatim", collected: "Rp 21 jt terkumpul", target: "dari Rp 50 jt", percent: 42 },
    { title: "Operasional Masjid", collected: "Rp 42,5 jt terkumpul", target: "dari Rp 50 jt", percent: 85 },
  ],
};
