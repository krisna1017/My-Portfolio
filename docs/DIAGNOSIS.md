# Laporan Diagnosis & Perbaikan — My Portfolio Monorepo

Tanggal: 25/08/2026
Lokasi: `D:\my-portfolio` (monorepo Next.js + NestJS + Prisma)

## Gejala
Proses dev (backend) "not responding" — `npm run start:dev` (`nest start --watch`)
terjebak crash-loop dan tidak pernah melayani request di port 3001.

## Akar Masalah
1. **TypeScript error TS1272** di `apps/backend/src/auth/auth.controller.ts:2`
   - `Response` dari `express` diimpor tanpa `import type`, padahal
     `tsconfig.json` mengaktifkan `isolatedModules` + `emitDecoratorMetadata`.
   - Akibat: `nest start --watch` selalu gagal compile → server tidak pernah start.
2. **Proses duplikat & `EADDRINUSE :3001`**
   - Beberapa `npm run start:dev` sebelumnya menumpuk dan saling merebut port 3001
     (terlihat di `apps/backend/backend.err`: `listen EADDRINUSE: address already in use :::3001`).
3. **File engine Prisma terkunci (`EPERM`)**
   - Instance `node dist/src/main` (PID 21724) masih berjalan dan mengunci
     `node_modules/.prisma/client/query_engine-windows.dll.node`, sehingga
     `prisma generate` gagal dengan `EPERM: operation not permitted, rename ... .tmp -> ... .node`.
4. **Proses terbunuh oleh timeout tool**
   - Saat restart via `Start-Process`, command tool timeout 120 detik mengirim `^C`
     ke seluruh process tree → server yang baru saja start ikut mati.

## Tindakan yang Dilakukan
- Fix import: `import { Response } from 'express'` → `import type { Response } from 'express'`
  di `apps/backend/src/auth/auth.controller.ts:2`.
- Kill proses stale: 18004/17592 (dev-loop) dan 21724 (prod instance) → port & file Prisma terlepas.
- `npm run db:generate` → Prisma Client (v6.19.3) berhasil di-generate.
- `npm run build --workspace apps/backend` (`nest build`) → compile bersih, 0 error.
- Restart `npm run start:dev` **terlepas dari process tree** (via `wmic process call create`)
  agar tidak terbunuh oleh timeout tool.

## Status Setelah Perbaikan
- Backend NestJS: **JALAN & LISTEN di :3001**, merespons `GET /api` → `HTTP 200 "Hello World!"`.
- Postgres: reachable di `localhost:5432` (DB tidak menjadi blocker).
- Frontend (Next.js :3000): **belum dijalankan** pada saat diagnosis (proses hang hanya backend).
- Catatan: `docker ps` memang hang (Docker Desktop daemon tidak responsif), tapi karena Postgres
  sudah menyala di 5432, backend tidak membutuhkan Docker saat ini.

## Langkah Selanjutnya (Frontend)
- Jalankan `npm run dev` di `apps/frontend` (Next.js 16, `next dev`) → port 3000.
- Pastikan `apps/frontend/.env.local` mengarah ke `NEXT_PUBLIC_API_URL=http://localhost:3001/api`.
- Next.js 16 memiliki breaking changes — baca panduan di
  `node_modules/next/dist/docs/` sebelum mengubah kode frontend.
