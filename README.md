# Masjid Al-Furqon

Website resmi Masjid Al-Furqon (Padang) beserta panel admin untuk mengelola
konten tanpa menyentuh kode.

## Stack

| Layer | Teknologi |
|---|---|
| Framework | Next.js 15 (App Router) |
| Bahasa | TypeScript |
| Styling | Pure CSS (publik) + Tailwind (admin) |
| Database | Supabase Postgres |
| ORM | Drizzle ORM |
| Auth | JWT httpOnly cookie + middleware |
| Storage | Supabase Storage |
| Export | jsPDF + jsPDF-AutoTable |

## Halaman Publik

| Route | Isi |
|---|---|
| `/` | Beranda — hero, jadwal sholat, layanan, galeri, CTA |
| `/profil` | Profil masjid + struktur pengurus |
| `/jadwal` | Jadwal kajian rutin |
| `/kegiatan` | Berita & dokumentasi kegiatan |
| `/galeri` | Galeri foto |
| `/kontak` | Kontak, alamat, form pesan |
| `/donasi` | Rekening donasi |

## Admin Panel

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

# 4. Isi data awal (akun admin + konten contoh)
#    password admin WAJIB diset sendiri, minimal 8 karakter
SEED_ADMIN_PASSWORD='passwordku' npm run db:seed

# 5. Jalankan
npm run dev
```

Buka http://localhost:3000

## Akun Admin

Dibuat saat menjalankan `npm run db:seed`, dengan password yang wajib
lu tentukan sendiri lewat environment variable (tidak ada password default):

```bash
SEED_ADMIN_EMAIL='admin@masjidalfurqon.id' SEED_ADMIN_PASSWORD='passwordku' npm run db:seed
```

Email dan nama juga bisa diatur lewat `SEED_ADMIN_EMAIL` / `SEED_ADMIN_NAME`.

Segera ganti password setelah login pertama.

## Struktur Project

```
src/
├── app/
│   ├── publik/            beranda, profil, jadwal, kegiatan, galeri, kontak, donasi
│   └── admin/
│       ├── login/         halaman login (standalone)
│       └── (panel)/       modul admin + sidebar
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

Lihat `DEPLOY.md` untuk panduan deploy ke Vercel.

## Catatan Teknis

- Halaman publik pakai ISR (`revalidate = 300`) — data di-cache 5 menit
- Admin mengirim `revalidateTag()` setiap simpan, jadi publik langsung update
- Upload gambar langsung ke Supabase Storage via server action
- Export PDF/CSV dibuat di browser, tidak membebani server
- Jadwal sholat tampil di beranda saja
