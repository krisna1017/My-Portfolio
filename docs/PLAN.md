# Project Plan: Full-Stack Portfolio Monorepo

> Dokumen ini adalah **jalur kerja (tracker)**. Semua langkah dicatat di sini agar
> pekerjaan tetap konsisten dengan `agents/AGENTS.md` dan keputusan yang sudah diambil.
> Update status `[]` -> `[x]` setiap kali satu langkah selesai.

## Keputusan yang Sudah Diambil
- **Struktur:** Monorepo dengan `apps/*` (npm workspaces biasa, tanpa Turborepo).
- **Frontend:** Next.js (App Router) + Tailwind + Shadcn UI + Zustand.
- **Backend:** NestJS (modular) + Prisma ORM + PostgreSQL.
- **Auth:** JWT via HttpOnly Cookies + Passport.js; `JwtAuthGuard` untuk write ops.
- **Database dev:** PostgreSQL via **Docker** (`docker-compose.yml`, port 5432).
- **Permission:** Agent **selalu minta izin** user untuk tiap aksi sistem (npm/npx/git/docker/file).

## Konvensi Wajib (dari AGENTS.md)
- Public pages = Server Components; dashboard = `'use client'`.
- DTO wajib untuk semua payload masuk; controller tipis (inject Prisma ke service).
- Jangan expose raw Prisma error ke client (pakai HttpException filter).
- Setelah ubah schema: `prisma generate` + `prisma migrate dev`.
- Next.js middleware intercept `/admin`.

---

## Langkah & Status

### [x] Langkah 1 — Root scaffolding (SELESAI)
File yang dibuat:
- `package.json` (workspaces `apps/*`, script `docker:up/down`, `db:generate`, `db:migrate`)
- `.gitignore`
- `docker-compose.yml` (postgres:16-alpine, user/db=`portfolio`, port 5432)
- `.env.example` (`DATABASE_URL`, `JWT_SECRET`, `PORT=3001`, `NEXT_PUBLIC_API_URL`)

### [x] Langkah 2 — Backend (`apps/backend`) — scaffold + kode SELESAI, build PASS
Yang sudah dibuat:
- NestJS 11 (`apps/backend`), Prisma 6 (downgrade dari 7 agar `url=env()` + `@prisma/client` klasik).
- `prisma/schema.prisma`: model `User`, `Project`, `Skill`, `Message`.
- `PrismaService` (global) + `AuthModule` (JWT + HttpOnly cookie via `cookie-parser`,
  `JwtStrategy`, `JwtAuthGuard`).
- `ProjectsModule`, `SkillsModule`, `MessagesModule`: CRUD, `JwtAuthGuard` di
  write ops (POST/PUT/DELETE). Validasi via `class-validator`.
- `main.ts`: global prefix `api`, CORS (credentials), `ValidationPipe`.
- `prisma/seed.ts` (admin user) + script `db:generate`, `db:migrate`, `db:seed`.
- `.env` backend + `.env.example` root sudah lengkap (DATABASE_URL, JWT, admin).

Catatan lingkungan (penting):
- npm workspaces menghasilkan `node_modules` korup saat di-install bertahap;
  **selalu jalankan `npm install` SEKALI di root** untuk hindari corrupt.
- Nest CLI butuh `node-emoji`/`@angular-devkit` — pastikan tidak corrupt.

SELESAI penuh: `prisma migrate dev` (tabel OK), `db:seed` (admin OK), smoke test:
- `POST /api/auth/login` → 201 + Set-Cookie `access_token` HttpOnly ✅
- `GET /api/projects` (public) → 200 `[]` ✅
- `GET /api/messages` (protected, tanpa cookie) → 401 ✅
Backend siap dipakai frontend. (Dev server jalan di port 3001, Docker Postgres jalan.)

### [x] Langkah 3 — Frontend (`apps/frontend`) — SELESAI
Yang sudah dibuat (Next.js 16, App Router, Tailwind v4, Shadcn/Base UI, Zustand):
- Landing 1 halaman: `#home` (hero), `#about` (Experience/Skills/ Education),
  `#projects` (filter kategori + grid `ProjectCard`), `#contact` (form → `/api/messages`).
- `about-section`: Skills diambil dari backend, dikelompokkan per kategori
  (Frontend/Backend/DevOps/Database/Language) dalam **carousel slide kiri/kanan**.
- Admin: login + dashboard `/admin/(dashboard)/*` untuk manage projects & skills.
  - Skills: tambah/edit/hapus, pilih **kategori** via `<select>`, upload **gambar**
    skill (`imageUrl`).
  - Projects: title/desc/category/featured, upload gambar, dan **Tech Stack**
    (pilih dari skill per kategori + custom tag) → tampil badge di kartu publik.
- `proxy.ts` (Next 16) intercept `/admin`; `JWT_SECRET` env sudah diset.
- Catatan: hero/about sudah dinetralisasi (token shadcn, tanpa tema oranye/Impact).

SELESAI: `tsc --noEmit` frontend PASS; `nest build` backend PASS.
Lihat `DIAGNOSIS-LOGIN-LOOP.md` Sesi 7 untuk detail migrasi & cara jalankan.

### [ ] Langkah 4 — Update `agents/AGENTS.md`
Tambahkan:
- Perintah wajib (`docker:up`, `db:migrate`, `db:generate`, `dev`).
- Env vars & cara copy `.env.example` -> `.env`.
- Catatan struktur agar sesuai kenyataan (workspace sudah jadi).

---

## Catatan / Blockers
- Pastikan Docker Desktop jalan sebelum `docker:up` & `prisma migrate`.
- `DATABASE_URL` di `.env` harus cocok dengan `docker-compose.yml`.
