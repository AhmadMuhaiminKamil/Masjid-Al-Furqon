# 🚀 Panduan Deploy ke Vercel

## Prasyarat

| Item | Status |
|---|---|
| Repo git lokal | ✅ Sudah di-commit (`2df956b`) |
| Build production lokal | ✅ Lolos, 20 halaman |
| Akun Vercel | Perlu daftar (gratis) |
| Akun GitHub | Perlu (untuk push repo) |

---

## Langkah 1 — Push ke GitHub

### 1.1 Bikin repo baru di GitHub

1. Buka https://github.com/new
2. **Repository name**: `masjid-alfurqon`
3. **Visibility**: Private (rekomendasi) atau Public
4. **JANGAN** centang "Add README", ".gitignore", atau "license"
5. Klik **Create repository**

### 1.2 Push dari terminal

Copy perintah yang muncul di GitHub (bagian "...or push an existing repository"), lalu jalankan:

```bash
cd C:\laragon\www\masjid-next
git remote add origin https://github.com/USERNAME/masjid-alfurqon.git
git push -u origin main
```

Ganti `USERNAME` dengan username GitHub lu.

> **Kalau diminta password**: GitHub sudah tidak menerima password biasa.
> Bikin Personal Access Token di https://github.com/settings/tokens
> (scope: `repo`), lalu pakai token itu sebagai password.

---

## Langkah 2 — Import ke Vercel

1. Buka https://vercel.com/signup → daftar pakai **GitHub**
2. Di dashboard, klik **Add New → Project**
3. Pilih repo **masjid-alfurqon** → klik **Import**
4. **Framework Preset**: Next.js (otomatis terdeteksi)
5. **Root Directory**: biarkan `.` (default)
6. **JANGAN klik Deploy dulu** — isi environment variables dulu (Langkah 3)

---

## Langkah 3 — Environment Variables

Klik **Environment Variables** → tambahkan satu per satu.
Pilih **All Environments** (Production, Preview, Development) untuk masing-masing.

### Ambil nilai dari file `.env.local` di project lu

Buka `C:\laragon\www\masjid-next\.env.local` dengan text editor, lalu copy nilainya.

| Key | Nilai | Catatan |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres` | **Harus port 6543** (pooler) |
| `DIRECT_URL` | sama tapi port `5432` | Untuk migration |
| `JWT_SECRET` | (dari `.env.local`) | String acak 48 char |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://PROJECT_REF.supabase.co` | |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (dari `.env.local`) | Panjang, mulai `eyJ` |
| `SUPABASE_SERVICE_ROLE_KEY` | (dari `.env.local`) | **Rahasia** |
| `SUPABASE_STORAGE_BUCKET` | `masjid-images` | |
| `NEXT_PUBLIC_SITE_URL` | `https://masjid-alfurqon.vercel.app` | Bisa diisi setelah tau domain |

### ⚠️ Penting

- **Jangan** pakai tanda kutip (`"`) di Vercel — cukup isinya saja
- `DATABASE_URL` **wajib** port `6543` (pooler). Kalau pakai 5432, Vercel akan error karena serverless bikin koneksi terlalu banyak
- `SUPABASE_SERVICE_ROLE_KEY` jangan pernah taruh di kode frontend — project ini sudah benar (hanya dipakai di server action)

---

## Langkah 4 — Deploy

Klik **Deploy**. Tunggu ~2-3 menit.

Kalau sukses, lu dapat URL seperti:
```
https://masjid-alfurqon.vercel.app
```

---

## Langkah 5 — Update NEXT_PUBLIC_SITE_URL

Setelah tau URL final:

1. Vercel → Project → **Settings → Environment Variables**
2. Edit `NEXT_PUBLIC_SITE_URL` → ganti ke `https://masjid-alfurqon.vercel.app`
3. **Deployments** → klik `...` pada deployment terakhir → **Redeploy**

---

## Langkah 6 — Test Setelah Deploy

| Yang dites | Cara cek |
|---|---|
| Beranda tampil | Buka URL Vercel |
| 7 halaman publik | Klik semua menu navbar |
| Login admin | `/admin/login` — pakai akun yang dibuat saat `npm run db:seed` |
| Data muncul | Dashboard harus tampil 6 berita, 6 galeri, dll |
| Upload foto | Admin → Galeri → Tambah Foto |
| Export PDF/CSV | Admin → Laporan Keuangan |

---

## Kalau Ada Error

### Error: `Connection terminated` / `too many connections`
→ `DATABASE_URL` masih port 5432. Ganti ke **6543**.

### Error: `password authentication failed`
→ Password DB di `DATABASE_URL` salah. Copy ulang dari `.env.local`.

### Error saat build: `DATABASE_URL is not defined`
→ Environment variable belum diisi, atau belum di-set untuk environment Production.

### Halaman tampil tapi data kosong
→ Supabase RLS atau koneksi DB gagal. Cek Vercel → Deployments → Functions → Logs.

### Upload foto gagal
→ `SUPABASE_SERVICE_ROLE_KEY` belum diisi atau salah.

---

## Update Setelah Deploy

Setiap kali lu ubah kode:

```bash
cd C:\laragon\www\masjid-next
git add -A
git commit -m "deskripsi perubahan"
git push
```

Vercel otomatis build & deploy ulang. Nggak perlu apa-apa lagi.

---

## Domain Sendiri (Nanti)

Kalau nanti mau pakai domain seperti `masjidalfurqon.or.id`:

1. Vercel → Settings → **Domains**
2. Tambah domain
3. Di penyedia domain, set:
   - **A record** `@` → `76.76.21.21`
   - **CNAME** `www` → `cname.vercel-dns.com`
4. Tunggu propagasi DNS (5 menit - 24 jam)

---

## Biaya

| Layanan | Plan | Biaya |
|---|---|---|
| Vercel | Hobby | **Gratis** |
| Supabase | Free | **Gratis** (500 MB DB, 1 GB storage) |

Cukup untuk website masjid. Kalau trafik naik atau storage penuh, bisa upgrade nanti.
