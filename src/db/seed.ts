import { config } from "dotenv";
config({ path: ".env.local" });
config();
import bcrypt from "bcryptjs";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌ DATABASE_URL belum di-set");
  process.exit(1);
}

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client, { schema });

async function seed() {
  console.log("🌱 Seeding database...\n");

  /* ---------- ADMIN ---------- */
  const email = process.env.SEED_ADMIN_EMAIL || "admin@masjidalfurqon.id";
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!password || password.length < 8) {
    console.error("❌ SEED_ADMIN_PASSWORD belum diset (minimal 8 karakter).");
    console.error("   Jalankan: SEED_ADMIN_PASSWORD='passwordku' npm run db:seed");
    process.exit(1);
  }

  const name = process.env.SEED_ADMIN_NAME || "Administrator";

  const hash = await bcrypt.hash(password, 10);

  await db
    .insert(schema.users)
    .values({
      email: email.toLowerCase(),
      name,
      password: hash,
      role: "admin",
    })
    .onConflictDoNothing();

  console.log(`✅ Admin: ${email} / ${password}`);

  /* ---------- SETTINGS ---------- */
  const settingsData = [
    { key: "site_name", value: "Masjid Al-Furqon" },
    { key: "site_tagline", value: "Membangun Umat, Merawat Tradisi, Menebar Manfaat" },
    { key: "site_city", value: "Padang" },
    { key: "contact_address", value: "Jl. Contoh Raya No. 123, Kel. Sukamaju, Kec. Padang Barat, Padang 25119" },
    { key: "contact_phone", value: "+62 21 0000 0000" },
    { key: "contact_email", value: "info@masjidalfurqon.id" },
    { key: "contact_hours", value: "Senin – Jumat: 08.00 – 16.00 WIB" },
    { key: "bank_name", value: "Bank Syariah Indonesia (BSI)" },
    { key: "bank_account", value: "1234 567 890" },
    { key: "bank_holder", value: "DKM Masjid Al-Furqon" },
    { key: "social_instagram", value: "#" },
    { key: "social_youtube", value: "#" },
    { key: "social_facebook", value: "#" },
  ];

  for (const s of settingsData) {
    await db.insert(schema.settings).values(s).onConflictDoUpdate({
      target: schema.settings.key,
      set: { value: s.value },
    });
  }
  console.log(`✅ ${settingsData.length} settings`);

  /* ---------- PAGES ---------- */
  const pagesData = [
    {
      slug: "profil",
      title: "Profil Masjid",
      eyebrow: "TENTANG KAMI",
      excerpt: "Mengenal lebih dekat Masjid Al-Furqon: sejarah, visi misi, dan para pengurus yang mengabdi untuk umat.",
      content: `<h2>Sejarah Masjid</h2><p>Masjid Al-Furqon bermula dari musala sederhana berukuran 8×8 meter yang dibangun atas inisiatif warga pada tahun 1985.</p><h2>Visi</h2><p>Menjadi masjid yang makmur, modern, dan menjadi pusat kegiatan umat yang membawa rahmat bagi seluruh alam.</p><h2>Misi</h2><ul><li>Memakmurkan masjid dengan sholat berjamaah lima waktu</li><li>Menyelenggarakan kajian dan pendidikan agama berkala</li><li>Membangun kegiatan sosial kemasyarakatan</li><li>Memberdayakan ekonomi umat melalui usaha produktif</li></ul>`,
    },
    {
      slug: "jadwal",
      title: "Jadwal Sholat & Kajian",
      eyebrow: "WAKTU IBADAH",
      excerpt: "Jadwal sholat lima waktu, sholat Jumat, dan kajian rutin mingguan di Masjid Al-Furqon.",
      content: `<h2>Jadwal Sholat</h2><p>Jadwal sholat lima waktu diperbarui secara berkala.</p>`,
    },
    {
      slug: "kegiatan",
      title: "Kegiatan Masjid",
      eyebrow: "PROGRAM & KEGIATAN",
      excerpt: "Berbagai program ibadah, pendidikan, dan sosial yang berjalan di Masjid Al-Furqon.",
      content: "",
    },
    {
      slug: "galeri",
      title: "Galeri Masjid",
      eyebrow: "DOKUMENTASI",
      excerpt: "Rekam jejak kegiatan, keindahan arsitektur, dan momen kebersamaan di Masjid Al-Furqon.",
      content: "",
    },
    {
      slug: "kontak",
      title: "Kontak & Lokasi",
      eyebrow: "HUBUNGI KAMI",
      excerpt: "Sampaikan pertanyaan, usulan, atau kebutuhan Anda. Kami siap membantu.",
      content: `<p>Sekretariat masjid buka setiap hari kerja pukul 08.00 – 16.00 WIB.</p>`,
    },
    {
      slug: "donasi",
      title: "Donasi Masjid",
      eyebrow: "INFAQ & SEDEKAH",
      excerpt: "Setiap infaq Anda menghidupkan masjid dan menebar manfaat bagi umat.",
      content: `<h2>Mari Berinfaq</h2><p>Donasi Anda digunakan untuk operasional masjid, program pendidikan, dan kegiatan sosial.</p>`,
    },
  ];

  for (const p of pagesData) {
    await db.insert(schema.pages).values(p).onConflictDoUpdate({
      target: schema.pages.slug,
      set: { title: p.title, eyebrow: p.eyebrow, excerpt: p.excerpt },
    });
  }
  console.log(`✅ ${pagesData.length} halaman`);

  /* ---------- PRAYER TIMES ---------- */
  const prayers = [
    { name: "Subuh", adzan: "04:38", iqomah: "04:48", order: 1 },
    { name: "Dzuhur", adzan: "11:52", iqomah: "12:02", order: 2 },
    { name: "Ashar", adzan: "15:14", iqomah: "15:24", order: 3 },
    { name: "Maghrib", adzan: "17:56", iqomah: "18:01", order: 4 },
    { name: "Isya", adzan: "19:08", iqomah: "19:18", order: 5 },
  ];

  const existingPrayer = await db.select().from(schema.prayerTimes);
  if (existingPrayer.length === 0) {
    await db.insert(schema.prayerTimes).values(prayers);
    console.log(`✅ ${prayers.length} jadwal sholat`);
  } else {
    console.log(`⏭  Jadwal sholat sudah ada (${existingPrayer.length})`);
  }

  /* ---------- SCHEDULES ---------- */
  const scheduleData = [
    { day: "Ahad", time: "07.00 – 09.00", title: "Tafsir Al-Qur'an", description: "Kajian tafsir surat pilihan. Terbuka untuk umum.", speaker: "Ust. Abdul Basir", location: "Aula Utama", order: 1 },
    { day: "Senin", time: "19.30 – 21.00", title: "Kajian Kitab Fiqih", description: "Membahas fiqih ibadah dan muamalah harian.", speaker: "Ust. Hidayatullah", location: "Ruang Belajar", order: 2 },
    { day: "Rabu", time: "16.30 – 17.30", title: "Tahsin & Tahfidz", description: "Program perbaikan bacaan Al-Qur'an untuk remaja dan dewasa.", speaker: "", location: "Gedung Lantai 2", order: 3 },
    { day: "Jumat", time: "12.00 – 13.00", title: "Khutbah Jumat", description: "Khutbah mingguan dengan penceramah bergilir.", speaker: "", location: "Ruang Utama", order: 4 },
  ];

  const existingSchedules = await db.select().from(schema.schedules);
  if (existingSchedules.length === 0) {
    await db.insert(schema.schedules).values(scheduleData);
    console.log(`✅ ${scheduleData.length} jadwal kajian`);
  } else {
    console.log(`⏭  Jadwal kajian sudah ada (${existingSchedules.length})`);
  }

  /* ---------- TEAM ---------- */
  const teamData = [
    { name: "H. Ahmad Fauzi", position: "Ketua DKM", order: 1 },
    { name: "M. Syaiful Anwar", position: "Sekretaris", order: 2 },
    { name: "Hj. Rahimah Yusuf", position: "Bendahara", order: 3 },
    { name: "Ust. Abdul Basir", position: "Bidang Dakwah", order: 4 },
    { name: "Ir. Ismail Karim", position: "Bidang Pembangunan", order: 5 },
    { name: "Nur Zalikha", position: "Bidang Sosial", order: 6 },
  ];

  const existingTeam = await db.select().from(schema.team);
  if (existingTeam.length === 0) {
    await db.insert(schema.team).values(teamData);
    console.log(`✅ ${teamData.length} pengurus`);
  } else {
    console.log(`⏭  Pengurus sudah ada (${existingTeam.length})`);
  }

  /* ---------- POSTS (berita & kegiatan) ---------- */
  const postsData = [
    {
      slug: "penyembelihan-hewan-qurban",
      title: "Penyembelihan & Pembagian Hewan Qurban",
      excerpt: "Distribusi daging qurban untuk 320 keluarga penerima manfaat di sekitar masjid.",
      content: "<p>Alhamdulillah, pada 15 Juni 2026 Masjid Al-Furqon melaksanakan penyembelihan hewan qurban dan mendistribusikan daging kepada 320 keluarga penerima manfaat.</p>",
      coverImage: "/images/evt-sosial.jpg",
      category: "Kegiatan",
      published: true,
    },
    {
      slug: "diklat-bahasa-arab-intensif",
      title: "Diklat Bahasa Arab Intensif",
      excerpt: "Program tiga bulan untuk jamaah yang ingin memperdalam bahasa Arab Al-Qur'an.",
      content: "<p>Diklat bahasa Arab intensif dibuka untuk seluruh jamaah. Program berlangsung tiga bulan dengan pertemuan dua kali sepekan.</p>",
      coverImage: "/images/evt-anak.jpg",
      category: "Kegiatan",
      published: true,
    },
    {
      slug: "qiyamul-lail-bersama",
      title: "Qiyamul Lail Bersama",
      excerpt: "Sholat tahajud berjamaah dilanjutkan kajian dan sahur bersama.",
      content: "<p>Qiyamul lail dilaksanakan setiap malam ganjil di sepuluh hari terakhir Ramadhan.</p>",
      coverImage: "/images/galeri-2.jpg",
      category: "Berita",
      published: true,
    },
    {
      slug: "santunan-yatim-dhuafa",
      title: "Santunan Yatim & Dhuafa",
      excerpt: "Pemberian santunan bulanan untuk 85 anak yatim binaan masjid.",
      content: "<p>Program santunan yatim dan dhuafa berjalan setiap bulan dengan 85 penerima manfaat.</p>",
      coverImage: "/images/evt-kajian.jpg",
      category: "Kegiatan",
      published: true,
    },
    {
      slug: "pelatihan-kepemimpinan-remaja",
      title: "Pelatihan Kepemimpinan Remaja Masjid",
      excerpt: "Workshop organisasi dan manajemen kegiatan untuk remaja masjid usia 15-22 tahun.",
      content: "<p>Workshop kepemimpinan bagi remaja masjid untuk membangun generasi muda yang aktif dan berorganisasi.</p>",
      coverImage: "/images/evt-remaja2.jpg",
      category: "Kegiatan",
      published: true,
    },
    {
      slug: "baksos-kesehatan-gratis",
      title: "Bakti Sosial Kesehatan Gratis",
      excerpt: "Pemeriksaan kesehatan dan pengobatan gratis bekerja sama dengan puskesmas setempat.",
      content: "<p>Bakti sosial kesehatan gratis melayani pemeriksaan umum, tekanan darah, dan konsultasi dokter.</p>",
      coverImage: "/images/evt-sehat.jpg",
      category: "Kegiatan",
      published: true,
    },
  ];

  for (const p of postsData) {
    await db.insert(schema.posts).values(p).onConflictDoUpdate({
      target: schema.posts.slug,
      set: { title: p.title, excerpt: p.excerpt, coverImage: p.coverImage, category: p.category },
    });
  }
  console.log("[OK] " + postsData.length + " berita/kegiatan");

  /* ---------- GALLERIES ---------- */
  const galleryData = [
    { title: "Eksterior Masjid", imageUrl: "/images/galeri-1.jpg", caption: "Eksterior Masjid", order: 1 },
    { title: "Refleksi Kolam di Malam Hari", imageUrl: "/images/galeri-2.jpg", caption: "Refleksi Kolam di Malam Hari", order: 2 },
    { title: "Kajian Al-Qur'an", imageUrl: "/images/evt-kajian.jpg", caption: "Kajian Al-Qur'an", order: 3 },
    { title: "Santunan Anak Yatim", imageUrl: "/images/evt-sosial.jpg", caption: "Santunan Anak Yatim", order: 4 },
    { title: "Kegiatan Remaja Masjid", imageUrl: "/images/evt-remaja2.jpg", caption: "Kegiatan Remaja Masjid", order: 5 },
    { title: "Panorama Masjid", imageUrl: "/images/galeri-3.jpg", caption: "Panorama Masjid", order: 6 },
  ];

  const existingGallery = await db.select().from(schema.galleries);
  if (existingGallery.length === 0) {
    await db.insert(schema.galleries).values(galleryData);
    console.log("[OK] " + galleryData.length + " foto galeri");
  } else {
    console.log("[SKIP] Galeri sudah ada (" + existingGallery.length + ")");
  }

  console.log("\n🎉 Seed selesai!");
  console.log("\n📋 Login admin:");
  console.log(`   URL      : http://localhost:3000/admin/login`);
  console.log(`   Email    : ${email}`);
  console.log(`   Password : ${password}`);
  console.log("\n⚠️  GANTI PASSWORD setelah login pertama!\n");

  await client.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed gagal:", err);
  process.exit(1);
});
