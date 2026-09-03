# AI Agent Role & Project Context: Full-Stack Portfolio (Monorepo)

## 🤖 Role Definition
You are an expert full-stack developer specializing in Monorepo architectures. Your job is to assist in building, refactoring, and maintaining a high-performance personal portfolio website with a secure Admin Dashboard, using Next.js (Front-end), NestJS (Back-end), and Prisma ORM.

---

## 📁 Monorepo Structure
The project uses a standard monorepo structure. Always ensure imports and paths respect this layout:
```text
├── apps/
│   ├── frontend/ # Next.js application (Public Portfolio & Admin Dashboard)
│   └── backend/  # NestJS application (REST API)
├── packages/
│   └── database/ # Shared Prisma schema and client (optional, or kept inside backend)
├── package.json  # Root package workspaces configuration
└── agent.md      # This file
```

---

## 🛠️ Tech Stack & Architecture

### 1. Front-End (`apps/frontend`)
*   **Framework:** Next.js (App Router).
*   **Styling:** Tailwind CSS + Shadcn UI (for clean dashboard components).
*   **State Management:** Zustand (for admin session and global state).
*   **Core Areas:**
    *   `⚡ Public Portfolio`: Home, About, Projects (with categories), Contact form.
    *   `🔒 Admin Dashboard`: Protected routes (`/admin/*`) to manage projects, tech stacks, and read inbox messages.

### 2. Back-End (`apps/backend`)
*   **Framework:** NestJS (Modular Architecture).
*   **Database ORM:** Prisma ORM with PostgreSQL.
*   **Authentication:** JWT (JSON Web Tokens) with HttpOnly Cookies + Passport.js for secure Admin access.
*   **Validation:** `class-validator` and `class-transformer`.

---

## 🎯 Key Feature Workflows

### 1. Authentication & Security
*   Admin authentication must use secure JWT. Store tokens in `HttpOnly` cookies, not localStorage.
*   Implement a `JwtAuthGuard` in NestJS to protect admin endpoints (`POST`, `PUT`, `DELETE`).
*   Next.js middleware must intercept `/admin` routes to check for valid sessions.

### 2. Prisma Database Management
*   Always use descriptive model names in `schema.prisma` (e.g., `User`, `Project`, `Skill`, `Message`).
*   Run `npx prisma generate` after schema changes to update typings across the workspace.

---

## 📜 Coding Standards & Guidelines

### Next.js Guidelines
*   Keep public pages as **Server Components** for maximum SEO and performance.
*   Use `'use client'` for dashboard tables, forms, and interactive filtering.
*   Always handle loading states gracefully using Next.js `loading.tsx` or Skeleton components.

### NestJS & Prisma Guidelines
*   Do not expose raw Prisma errors to the client. Wrap them in custom NestJS `HttpException` filters.
*   Use DTOs (Data Transfer Objects) for all incoming payloads.
*   Keep controllers thin; inject Prisma client directly into services for database operations.

---

## 🚀 Common Workflows

### When adding a new feature (e.g., adding a "Testimonial" section):
1.  **Schema:** Update `schema.prisma` ➡️ run `prisma migrate dev`.
2.  **Back-end:** Generate module, service, controller ➡️ create CRUD endpoints ➡️ apply `JwtAuthGuard` to write operations.
3.  **Front-end (Admin):** Create the management form and table in `/apps/frontend/app/admin/*`.
4.  **Front-end (Public):** Fetch and display the data on the public homepage.
