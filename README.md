# 🕌 Masjid Al-Furqon — Website & Admin Panel

Website resmi Masjid Al-Furqon (Padang) dengan panel admin untuk mengelola konten
tanpa menyentuh kode.

## Stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js 15 (App Router) |
| Bahasa | TypeScript |
| Styling | Pure CSS (custom) + Tailwind (admin) |
| Database | Supabase Postgres 17 |
| ORM | Drizzle ORM |
| Auth | JWT (httpOnly cookie) + middleware |
| Storage | Supabase Storage |
| Export | jsPDF + jsPDF-AutoTable |

## Halaman Publik (7)

| Route | Isi |
|---|---|
| `/` | Beranda — hero, jadwal sholat, layanan, galeri, CTA |
| `/profil` | Profil masjid + struktur pengurus |
| `/jadwal` | Jadwal kajian rutin |
| `/kegiatan` | Berita & dokumentasi kegiatan |
| `/galeri` | Galeri foto |
| `/kontak` | Kontak, alamat, form pesan |
| `/donasi` | Rekening donasi |

## Admin Panel (9 modul)

| Route | Fungsi |
|---|---|
| `/admin` | Dashboard + statistik |
| `/admin/pages` | Edit halaman statis |
| `/admin/posts` | CRUD berita & kegiatan |
| `/admin/gallery` | CRUD galeri foto |
| `/admin/schedules` | CRUD jadwal kajian |
| `/admin/team` | CRUD pengurus |
| `/admin/finance` | Laporan keuangan + export CSV/PDF |
| `/admin/messages` | Pesan masuk dari form kontak |
| `/admin/settings` | Identitas situs, kontak, rekening, sosial |

## Menjalankan Lokal

```bash
# 1. Install dependency
npm install

# 2. Siapkan environment
cp .env.example .env.local
# lalu isi nilai aslinya

# 3. Push schema ke database
npm run db:push

# 4. Isi data awal (admin user + konten contoh)
npm run db:seed

# 5. Jalan
npm run dev
```

Buka http://localhost:3000

## Login Admin

```
URL      : /admin/login
Email    : admin@masjidalfurqon.id
Password : Admin123!
```

⚠️ **Ganti password setelah login pertama.**

## Struktur Project

```
src/
├── app/
│   ├── (publik)/          beranda, profil, jadwal, kegiatan, galeri, kontak, donasi
│   └── admin/
│       ├── login/         halaman login (standalone)
│       └── (panel)/       9 modul admin + sidebar
├── components/            Navbar, Footer, ImageUpload
├── db/                    schema, seed, koneksi
├── lib/                   auth, queries (cached), upload
└── middleware.ts          guard /admin/*
```

## Scripts

| Command | Fungsi |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Build production |
| `npm run start` | Jalankan hasil build |
| `npm run db:push` | Push schema ke DB |
| `npm run db:seed` | Isi data awal |
| `npm run db:studio` | Buka Drizzle Studio |

## Deploy

Lihat **[DEPLOY.md](./DEPLOY.md)** untuk panduan lengkap deploy ke Vercel.

## Catatan Teknis

- **Halaman publik** pakai ISR (`revalidate = 300`) — data di-cache 5 menit
- **Admin** kirim `revalidateTag()` setiap simpan, jadi publik langsung update
- **Upload gambar** langsung ke Supabase Storage via server action (file tidak lewat client)
- **Export PDF/CSV** dibuat di browser, tidak membebani server
- **Jadwal sholat** tampil di beranda saja (tidak ada menu admin, sesuai permintaan)
