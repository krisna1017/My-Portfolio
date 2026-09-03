# Deployment Produksi — Panduan Vercel + PaaS

> Dokumen ini menjelaskan cara naik ke production. Arsitektur terpilih:
> **Frontend = Vercel**, **Backend (NestJS) = PaaS (Railway/Render/Fly.io)**,
> **Database = Managed PostgreSQL (Railway/Neon/Supabase)**.

## Kenapa arsitektur ini?

- **Vercel** sangat cocok untuk Next.js, tapi hanya bisa menjalankan fungsi
  serverless — **tidak bisa** menjalankan server NestJS yang berjalan terus.
- Karena itu backend NestJS di-deploy di **PaaS** (server berjalan terus),
  dan database di **managed PostgreSQL**.
- Frontend memanggil API backend lewat **rewrite same-origin** jadi admin auth
  (cookie HttpOnly) tetap bekerja seperti di localhost.

---

## 1. Persiapkan Repositori (Push ke Git + GitHub)

Monorepo ini belum terhubung ke git. Langkah minimal:

```bash
git init
git add .
git commit -m "chore: initial commit"
# buat repo kosong di GitHub lalu:
git remote add origin https://github.com/<username>/my-portfolio.git
git branch -M main
git push -u origin main
```

Pastikan file rahasia TIDAK ikut ter-commit (sudah di-`.gitignore`):
`.env`, `.env.local`, `apps/backend/.env`, `apps/backend/uploads/`.

---

## 2. Deploy Database (Managed PostgreSQL)

Media contoh: **Railway Postgres**, **Neon**, atau **Supabase**.

1. Buat database PostgreSQL.
2. Salin connection string, mis. `postgresql://user:pass@host:5432/db?schema=public`.
3. Simpan untuk dipakai di langkah 3 (env `DATABASE_URL`).

---

## 3. Deploy Backend (NestJS) ke PaaS (Railway / Render)

Pilih salah satu. Contoh pakai **Railway** dengan repo ini (Root Directory `apps/backend`).

### Build Command (di PaaS):
```bash
npm install && npx prisma generate && npm run build
```

### Start Command:
```bash
npm run start:prod
```
(`node dist/main`)

### Environment Variables (Backend di PaaS):
| Nama | Nilai contoh | Wajib |
|------|--------------|-------|
| `DATABASE_URL` | `postgresql://...` | ✅ |
| `JWT_SECRET` | string acak panjang (jangan `change-me-in-production`!) | ✅ |
| `JWT_EXPIRES_IN` | `7d` | |
| `PORT` | dibiarkan (PaaS set) | |
| `NODE_ENV` | `production` | ✅ |
| `FRONTEND_ORIGIN` | `https://<your-app>.vercel.app` (izin CORS) | ✅ |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` | untuk seed | opsional |

### Migrasi Database:
Setelah deploy pertama, jalankan migrasi sekali:
```bash
# di mesin lokal, arahkan DATABASE_URL ke DB production
npx prisma migrate deploy
npx prisma db seed   # opsional, untuk data awal admin
```
atau jalankan lewat command/script di PaaS jika tersedia.

> **Catatan** — file upload (`/api/upload` → folder `uploads/`) disimpan di
> disk **ephemeral** PaaS dan bisa hilang saat redeploy/restart. Untuk personal
> portfolio ini umumnya diterima (upload ulang setelah deploy). Jika gambar harus
> persisten, pindahkan upload ke object storage (S3/R2) — di luar scope panduan ini.

---

## 4. Deploy Frontend ke Vercel

Vercel mendukung monorepo. Di dashboard Vercel ketika import repo:

### Project Settings:
- **Root Directory:** `apps/frontend`
- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Install Command:** `npm install` (biarkan default dari root)

### Environment Variables (Frontend di Vercel):
| Nama | Nilai | Keterangan |
|------|-------|------------|
| `BACKEND_API_URL` | `https://<backend>.onrender.com` | URL backend PaaS. Dipakai untuk rewrite `/api/*`. JANGAN pakai trailing slash. |

- **Jangan** set `NEXT_PUBLIC_API_URL` di production. `api.ts` default-nya
  `''` (same-origin) → permintaan `/api/*` di-replace ke `BACKEND_API_URL`
  oleh `next.config.ts` `rewrites`. Ini yang membuat cookie admin berfungsi
  lintas-domain dengan aman.
- `.env.local` (dengan `http://localhost:3001`) TIDAK ikut ke Vercel karena
  gitignored, jadi aman.

---

## 5. Alur Permintaan (Agar Admin Auth Bekerja)

```
Browser ──> https://<frontend>.vercel.app/api/auth/login
              (Vercel rewrite /api/* -> BACKEND_API_URL/api/*)
      ──> https://<backend>.onrender.com/api/auth/login
              (Set-Cookie access_token HttpOnly, SameSite=Lax, Secure)
      ──> cookie disimpan di domain <frontend>.vercel.app  ✅
```

Karena cookie berada di **domain Vercel**, maka `proxy.ts` (guard `/admin`) dan
`admin/(dashboard)/layout.tsx` (membaca cookie) berfungsi normal — persis seperti
di localhost.

---

## 6. Checklist Sebelum Rilis

- [ ] Ganti `JWT_SECRET` dari `change-me-in-production` ke string acak (mis.
      `openssl rand -hex 32`). **Disarankan oleh docs & wajib sebelum production.**
- [ ] Ganti kredensial admin default (`admin@example.com` / `admin123`) via seed
      atau update DB.
- [ ] `BACKEND_API_URL` di Vercel memakai URL HTTPS backend (tanpa trailing slash).
- [ ] Backend di PaaS: `NODE_ENV=production`, `FRONTEND_ORIGIN` = URL Vercel.
- [ ] `prisma migrate deploy` sudah dijalankan ke DB production.
- [ ] Build frontend & backend lulus lokal.
- [ ] Custom domain (opsional) dikonfigurasi di Vercel.

---

## 7. Verifikasi Setelah Deploy

1. Buka `https://<frontend>.vercel.app` → hero/about/projects/contact tampil.
2. Cek list/section yang fetch dari backend (skills, projects) tidak kosong.
3. Login admin `https://<frontend>.vercel.app/admin` → tidak redirect-loop,
   CRUD projects & skills berhasil (verifikasi upload gambar).
4. Cek browser DevTools → tab Network: request `/api/*` → status 200/20x
   lewat rewrite ke backend.
