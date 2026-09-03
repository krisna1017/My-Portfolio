# Laporan Debugging & Pengembangan — Portfolio Monorepo

Proyek: `D:\my-portfolio` (monorepo Next.js 16 + NestJS + Prisma + Postgres)
Tanggal terakhir update: 25/08/2026

---

# Sesi 1 — Backend Crash-Loop (ringkasan)
- Backend `npm run start:dev` crash-loop: `TS1272` di `auth.controller.ts`
  (`import { Response } from 'express'` → harus `import type`).
- Beberapa proses backend berjalan bersamaan + `dist/src/main` mengunci engine
  Prisma (EPERM saat `prisma generate`).
- Fix: perbaiki import, bunuh proses stale, `prisma generate`, `nest build`,
  jalankan 1 instance via `wmic`.
- Postgres disajikan Laragon di :5432 (Docker daemon tidak responsif tapi DB ok).

# Sesi 2 — Login Page "Rendering Terus"
## Gejala
`/admin/login` terus redirect/rendering (infinite loop).

## Akar masalah
`app/admin/layout.tsx` membungkus **semua** `/admin/*` termasuk `/admin/login`,
lalu `redirect('/admin/login')` saat tanpa token → loop.
Proxy (`src/proxy.ts`) sudah benar (exclude `/admin/login`).

## Perbaikan
1. Migrasi `middleware.ts` → `proxy.ts` (Next 16).
2. Pindahkan auth-layout ke route group `app/admin/(dashboard)/`; `/admin/login`
   tetap di luar grup → loop terputus.
3. Bersihkan debug log `jwt.strategy.ts`.

## Verifikasi
- `/admin/login` tanpa cookie → 200 ✅
- `POST /api/auth/login` → 201 + Set-Cookie ✅
- `/api/auth/me` dengan cookie → 200 ✅
- `/admin` dengan cookie → 200; tanpa cookie → 307 → login ✅

> Catatan: 401 awal pada `/api/auth/me` adalah **artifact curl** (cookie jar
> domain `localhost` vs host `127.0.0.1`). Bukan bug backend.

---

# Sesi 3 — Seed Data + Fitur Upload Gambar Project
Tanggal: 25/08/2026

## A. Seed Data Contoh
`prisma/seed.ts` diperluas (sementara hanya seed user admin) → tambah 11 skills,
6 projects (3 featured), pesan contoh. Idempoten (find-or-create, tidak duplikat).
Jalankan: `npm run db:seed` (dari `apps/backend`). Hasil terverifikasi via
`/api/projects` (6), `/api/skills` (11), `/api/messages` (2).

## B. Fitur Upload Gambar (user: "project harus bisa upload gambar")
Sebelumnya admin Project hanya punya field URL teks. Sekarang bisa upload file.

### Backend
- `src/uploads/uploads.controller.ts`:
  - `POST /api/upload` — HANYA admin (`JwtAuthGuard`), simpan ke
    `apps/backend/uploads/`, max 5 MB, hanya `image/*`. Balikan
    `{ url: "http://localhost:3001/api/uploads/<file>" }`.
  - `GET /api/uploads/:filename` — publik (untuk <img>).
  - `diskStorage` + `fileFilter` + `ensureDir()` (mkdir recursive).
  - Sanitasi `basename()` pada param filename (cegah path traversal).
- `src/uploads/uploads.module.ts` + daftarkan di `app.module.ts`.
- Tambah dep: `multer ^2.2.0` (dependency) & `@types/multer ^2.0.0` (dev), lalu
  `npm install` di root (workspace).
- `apps/backend/.gitignore` → tambah `/uploads`.
- DTO `create-project.dto.ts` & `update-project.dto.ts` sudah punya `imageUrl?`
  (optional string) → aman dari `ValidationPipe({ whitelist: true })`.

### Frontend
- `src/lib/api.ts` → method `uploadFile(file: File)` (FormData + credentials).
- `src/app/admin/(dashboard)/projects/page.tsx` → input `type="file" accept="image/*"`
  + preview + tetap bisa paste URL.
- `src/app/projects/page.tsx` → render thumbnail `imageUrl` pada card.

## Verifikasi (end-to-end)
- Login → `POST /api/upload` → URL balik → `GET` file **200 image/png** ✅
- `POST /api/projects` dengan `imageUrl` → tersimpan (DTO ok) ✅
- `GET` gambar **200**; `DELETE` project **200** (record benar-benar hilang) ✅
- Halaman `/admin/projects` render input `type="file"` (HTTP 200) ✅

> Catatan: `findOne(id)` backend mengembalikan `null`/200 bila id tak ada
> (bukan 404). Itu sebabnya "Verify gone -> 200" — delete tetap sukses.
> Bisa diubah jadi 404 kalau mau lebih REST-ish (opsional).

---

# Status Terkini (akhir sesi 3)
- **Backend** NestJS :3001 — jalan, fitur upload live, seed sudah diisi.
- **Frontend** Next.js :3000 — jalan, admin bisa upload, publik tampil thumbnail.
- Data: 6 projects (3 featured), 11 skills, 2 messages.
- `uploads/` bersih (file test sudah dihapus).

# Sesi 4 — Redesign UI "Showcase Kreatif" (Light Minimal)
Tanggal: 27/08/2026
Keputusan user: **Light minimal**, scope **Home + Projects** dulu.

## Perubahan
- `globals.css`: tambah aksen brand halus (`--brand` oklch biru tenang) di
  `@theme inline` + `:root`; tetap light, banyak whitespace.
- `src/components/reveal.tsx` (baru): client wrapper scroll-reveal pakai
  `IntersectionObserver` (tanpa framer-motion; lib itu tak terpasang).
- `src/components/project-card.tsx` (baru): kartu project reusable
  (gambar/preview, badge kategori, link Live/Code). Pakai `Code` dari
  lucide (ikon `Github` sudah dihapus di lucide v1 — trademark).
- `src/app/page.tsx`: hero besar + radial-gradient tipis, featured projects,
  skills dikelompokkan per kategori; semua section dibungkus `Reveal`.
- `src/app/projects/page.tsx`: filter chip dengan aksen brand saat aktif,
  grid kartu `ProjectCard`, skeleton loading pakai `animate-pulse`.
- Fix (di luar scope, agar typecheck lolos): `admin/login/page.tsx`
  `api.post<AdminUser>` (error TS2345 pre-existing).

## Verifikasi
- `tsc --noEmit` di `apps/frontend` → **bersih** ✅
- ESLint via binary hang di env ini (bukan error kode) — butuh cek manual
  saat dev server nyala.

## Next Step (sisa dari sesi 3, belum dikerjakan)
- ⬜ About page, Contact (data/statis?).
- ⬜ Satukan tipe `Project`/`Skill`/`Message` ke `src/lib/types.ts`
  (saat ini `Project` diduplikasi di `project-card.tsx` + 2 page).
- ⬜ Redesign admin ringkas, loading.tsx/skeleton global.
- ⬜ Ganti `JWT_SECRET` sebelum production.

# Sesi 5 — Landing Page 1 Halaman (Home+About+Projects+Contact)
Tanggal: 27/08/2026
User: "dibuat landing page 1 halaman, di 1 halaman berisikan home, about,
projects, contact".

## Perubahan
- `src/components/projects-section.tsx` (baru, client): ambil + filter
  kategori project, grid `ProjectCard` + `Reveal`, skeleton loading.
  Logika dipindah dari `app/projects/page.tsx` (route dihapus).
- `src/components/contact-section.tsx` (baru, client): form contact
  (POST `/api/messages`) dari `app/contact/page.tsx` (route dihapus).
- `src/app/page.tsx`: jadi **single-page** dengan section `#home` (hero),
  `#about` (teks + skills per kategori, server-fetch), `#projects`
  (embed `ProjectsSection`), `#contact` (embed `ContactSection`).
  CTA hero → anchor `#projects`/`#contact`.
- `src/components/navbar.tsx`: jadi `sticky top-0` + backdrop-blur; link
  diubah jadi anchor (`#home`,`#about`,`#projects`,`#contact`), Admin tetap
  `/admin`.
- `src/app/layout.tsx`: `html` ditambah `scroll-smooth`.
- `src/lib/api.ts`: timeout `AbortSignal.timeout` 10s → **5s** (empty-state
  fallback lebih cepat saat backend mati).
- Hapus route terpisah: `app/about`, `app/projects`, `app/contact`
  (semua sudah digabung ke landing).

## Verifikasi
- `tsc --noEmit` bersih ✅ (setelah `Remove-Item .next` karena cache
  `.next/dev/types/routes.d.ts` stale).
- Dev server `Ready`; `GET /` → **200** dan keempat section
  (`#home/#about/#projects/#contact`) + teks render ✅ (backend docker
  belum nyala → projects/skills tampil empty-state, sesuai fallback).

## Next Step (sisa)
- ⬜ Redesign admin ringkas (list/table sudah ada, tinggal poles UI).
- ⬜ Satukan tipe `Project`/`Skill`/`Message` ke `src/lib/types.ts`.
- ⬜ (Opsional) animasi halus tambahan, section reveal staggered.
- ⬜ Ganti `JWT_SECRET` sebelum production.

# Sesi 6 — "Failed to fetch" saat Login (root cause: backend mati)
Tanggal: 27/08/2026
User: "saya tidak bisa login, failed to fetch".

## Diagnosis
- `netstat` → port **3001 TIDAK listen**, tapi proses `dist/src/main` (Nest)
  hidup → backend stuck/tidak bind.
- Ditemukan **dua starter backend bentrok**:
  1. `npm run dev --workspaces` (root) — ikut men-start backend.
  2. start manual `npm run start:dev` (PID 9652 → nest 13316 → 19756).
  Saling EADDRINUSE/stuck sehingga tak ada yang listen di 3001.
- Postgres Laragon **:5432 listen** (DB ok). Frontend :3000 tetap up.
- Penyebab "Failed to fetch": browser fetch ke `http://localhost:3001`
  gagal karena backend tak mendengarkan.

## Fix
- Bunuh semua proses backend (9276, 9652, 13316, 19756). Frontend dibiarkan.
- Start **SATU** backend bersih via wmic:
  `wmic process call create "cmd /c cd /d D:\my-portfolio\apps\backend & npm run start:dev > ...\be2.log 2>&1"`
- Verifikasi: `netstat` → `0.0.0.0:3001 LISTENING` (PID 18516),
  log `Nest application successfully started`.
- Tes `POST /api/auth/login` (admin@example.com / admin123):
  **201 + Set-Cookie `access_token` HttpOnly** + body user ✅.

## Catatan
- `localhost:3000` vs `localhost:3001` = **same-site** (port diabaikan utk
  cookie) → cookie `SameSite=Lax` tersimpan di browser, login aman.
- JANGAN jalankan dua starter backend sekaligus (root `npm run dev
  --workspaces` + manual `start:dev`) → konflik port 3001.
- Cara aman jalankan: start backend 1x (wmic), frontend 1x. Cek port 3001
  sebelum start (`netstat -ano | findstr :3001`).

# Cara Lanjut Besok (RESUME)
## Menjalankan dev server
### Terminal Anda sendiri (paling mudah)
```
npm run dev          # concurrently: backend (:3001) + frontend (:3000) sekaligus
# atau jalankan terpisah:
npm run dev:be       # hanya backend
npm run dev:fe       # hanya frontend
```
### Di tool ini (Start-Process keburu SIGINT → pakai wmic agar lepas dari tree)
```
wmic process call create "cmd /c cd /d D:\my-portfolio\apps\backend & npm run start:dev > C:\Users\Asus\AppData\Local\Temp\be.log 2>&1"
wmic process call create "cmd /c cd /d D:\my-portfolio\apps\frontend & npm run dev > C:\Users\Asus\AppData\Local\Temp\fe.log 2>&1"
```
- PASTIKAN hanya 1 instance backend (cek port 3001; bunuh jika EADDRINUSE).
- Sebelum `prisma migrate dev`/`generate`: matikan backend dulu (lihat Gotcha migrasi Sesi 7).
- Tes selalu pakai host `localhost` (bukan `127.0.0.1`) supaya cookie terkirim.

## Env penting
- Backend: `DATABASE_URL` (Postgres Laragon :5432), `JWT_SECRET`,
  `ADMIN_EMAIL=admin@example.com`, `ADMIN_PASSWORD=admin123`,
  `FRONTEND_ORIGIN=http://localhost:3000`, `PORT=3001`.
- Frontend: `.env.local` → `NEXT_PUBLIC_API_URL=http://localhost:3001`.
- Login admin: `http://localhost:3000/admin` → `/admin/login`
  (email `admin@example.com`, pass `admin123`).

## Next Step yang Disepakati
**Redesign UI "Showcase Kreatif"** (pilihan user). Belum dimulai.
Style: creative showcase (hero besar, scroll-reveal, grid portfolio menonjol).
- BELUM ada keputusan: warna/brand dominan (mis. ungu/cyan, atau hitam-emas).
  Tanyakan user sebelum mulai agar konsisten.

## File kunci untuk lanjut
- Frontend UI: `src/app/page.tsx` (Home), `src/app/projects/page.tsx`,
  `src/app/about/page.tsx`, `src/app/contact/page.tsx`,
  `src/app/admin/(dashboard)/*`, `src/components/*`, `src/lib/api.ts`.
- Desain: `tailwind.config.*`, `globals.css`, `components/ui/*` (base-ui).
- Backend (jika perlu): `src/projects/*`, `src/uploads/*`.

## Gotcha wajib (baca sebelum ngoding frontend)
- **WAJIB baca** `node_modules/next/dist/docs/` sebelum ubah kode frontend
  (aturan `apps/frontend/AGENTS.md`).
- Next 16: `middleware` → `proxy`; `params`/`searchParams` sekarang **Promise**
  (harus `await`); Server Component default; fetch tak cache implisit.
- Edit `proxy.ts` → restart penuh dev server + `Remove-Item .next` (HMR proxy
  tidak full-reload).
- Upload gambar cross-origin: `<img src="http://localhost:3001/api/uploads/..">`
  aman (img tak butuh CORS).

## Rekomendasi sisa (dari sesi 2, sebagian sudah selesai)
- ✅ Seed data — DONE.
- ✅ Upload gambar project — DONE.
- ⬜ Redesign UI "Showcase Kreatif" — **DONE** (jadi landing 1 halaman
  light-minimal: Home+About+Projects+Contact, lihat Sesi 5).
- ⬜ About/Contact — **DONE** (digabung ke landing, Sesi 5).
- ⬜ Satukan tipe `Project`/`Skill`/`Message` ke `src/lib/types.ts`.
- ⬜ (Opsional) TanStack Query/SWR untuk admin; loading.tsx/skeleton;
  `findOne` balik 404; proteksi `/api/*` di proxy (sudah di-handle backend).
- ⬜ Ganti `JWT_SECRET` sebelum production (`change-me-in-production`).

# Sesi 7 — Setup Dev, Netralisasi Style & Fitur Skill/Project (28/08/2026)
Tanggal: 28/08/2026

## A. Cara menjalankan dev server (root `npm run dev`)
- Root `package.json` `dev` diubah pakai **`concurrently`** agar jalanin
  backend + frontend sekaligus:
  ```
  "dev": "concurrently -n BE,FE -c blue,green \"npm run start:dev --workspace apps/backend\" \"npm run dev --workspace apps/frontend\""
  ```
- `concurrently` ditambah sebagai **root devDependency** (`npm install` di root).
- Alias: `dev:be` (backend saja), `dev:fe` (frontend saja).
- CATATAN (penting): perintah di atas untuk **terminal Anda sendiri**. Di tool
  ini proses tetap di-bypass via `wmic` (timeout tool mematikan child process),
  lihat pola di bawah. `&` mentah tidak dipakai karena di cmd berurutan &
  di PowerShell `&` adalah call operator.

## B. Tailwind
- Tailwind v4 **sudah terpasang** (ter-hoist ke root `node_modules` karena
  workspace): `tailwindcss` + `@tailwindcss/postcss` + `tw-animate-css`.
- `apps/frontend/postcss.config.mjs`: plugin `@tailwindcss/postcss`.
- `apps/frontend/src/app/globals.css`: `@import "tailwindcss"` +
  `@import "shadcn/tailwind.css"`. Primary styling = Tailwind + token shadcn.

## C. Netralisasi "style baru" (Hero & About)
- `apps/frontend/src/components/hero-section.tsx` **dibuat ulang** (file-nya
  hilang & import di `page.tsx` rusak). Hero netral: token `bg-primary`,
  `text-muted-foreground`, placeholder "Your Name".
- `apps/frontend/src/components/about-section.tsx` dibersihkan dari tema oranye
  `#FF6B00` + font `Impact` + animasi bar. Sekarang pakai token shadcn netral.

## D. Skill — image upload + ambil dari backend + carousel per kategori
- Backend `prisma/schema.prisma`: `Skill` + field `imageUrl String?`.
  DTO `create/update-skill.dto.ts`: + `imageUrl?`.
  Migrasi: **`add_skill_image`** (`prisma migrate dev`).
- `about-section.tsx`: sekarang `'use client'` & `GET /api/skills`. Skills
  **dikelompokkan per kategori** (`Frontend, Backend, DevOps, Database,
  Language` via `CATEGORY_ORDER`) dalam **carousel slide kiri/kanan**
  (tombol ‹ › + dot). Tiap slide grid 2 kolom: gambar skill (atau inisial) +
  nama + bar level.
- Admin `apps/frontend/src/app/admin/(dashboard)/skills/page.tsx`:
  - Input **Category** diubah jadi `<select>` (opsi 5 kategori di `CATEGORIES`).
  - Input **Image** skill: upload file (`/api/upload`) atau paste URL + preview.

## E. Project — Tech Stack (dibangun dengan apa)
- Backend `prisma/schema.prisma`: `Project` + `tech String[] @default([])`.
  DTO `create/update-project.dto.ts`: + `tech?: string[]` (`IsString({each:true})`).
  Migrasi: **`add_project_tech`**.
- `apps/frontend/src/components/project-card.tsx`: type `Project` + `tech?` &
  render badge tech di bawah deskripsi.
- Admin `projects/page.tsx`: field **Tech Stack**:
  - Chip tech terpilih (bisa diklik × hapus).
  - Saran dari `GET /api/skills` dikelompokkan per kategori (Frontend/Backend/
    DevOps/Database/Language) — klik toggle (terpilih = highlight).
  - Input custom tech (ketik + Enter / tombol Add).

## Gotcha migrasi (WAJIB)
- Sebelum `prisma migrate dev` / `prisma generate`, **matikan dulu backend di
  port 3001** (`Stop-Process` PID dari `Get-NetTCPConnection -LocalPort 3001`),
  karena instance live mengunci `query_engine-windows.dll.node` → `EPERM` saat
  generate. Setelah migrasi+generate, restart backend via wmic:
  ```
  wmic process call create "cmd /c cd /d D:\my-portfolio\apps\backend & npm run start:dev > C:\Users\Asus\AppData\Local\Temp\be.log 2>&1"
  ```

## Status Akhir Sesi 7
- Backend NestJS :3001 jalan (2 migrasi diterapkan). Frontend Next.js :3000
  jalan. Skill & Project sudah mendukung image/tech dari backend.
- Typecheck frontend & `nest build` backend: **PASS**.
- Fitur "hapus background otomatis" pada gambar skill **belum dikerjakan**
  (user menutup opsi; pending keputusan).

## Next Step (sisa)
- ⬜ Hapus background otomatis pada gambar skill (pending keputusan metode).
- ⬜ Redesign UI "Showcase Kreatif" — sudah jadi landing light-minimal
  (Sesi 5); hero/about dinetralisasi di Sesi 7.
- ⬜ Satukan tipe `Project`/`Skill`/`Message` ke `src/lib/types.ts`.
- ⬜ Ganti `JWT_SECRET` sebelum production (`change-me-in-production`).
