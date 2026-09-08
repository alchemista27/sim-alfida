# SIM-Alfida

Sistem Informasi Manajemen terpadu untuk **Yayasan Alfida** yang menaungi 2 TK, 3 SD, 1 SMP, 1 SMA, dan 1 Pesantren Alquran. Platform ini bertujuan untuk mendigitalkan seluruh proses operasional mulai dari Penerimaan Peserta Didik Baru (PPDB), akademik, surat-menyurat, hingga rekrutmen. Saat ini Modul PPDB dan Akademik telah selesai (Complete), dan Modul Manajemen Karyawan sedang dalam tahap pengembangan (In Development).

Sistem ini dirancang dengan arsitektur **multi-tenant** sehingga setiap unit pendidikan memiliki *scope* datanya masing-masing dan beroperasi di bawah payung yayasan yang sama.

---

## Modul Sistem (Modules)

- **Modul PPDB (Complete)** - Penerimaan Peserta Didik Baru
- **Modul Akademik (Complete)** - Pengelolaan akademik, nilai, LHBS, ekskul
- **Modul Manajemen Karyawan & Absensi (In Development)** - GPS attendance, UPA/Liqo, leave management
- **Modul Surat Menyurat (Planned)**
- **Modul Payroll (Planned)**
- **Modul Rekrutmen (Planned)**

---

## Antarmuka Layar (Screenshots)

### Halaman Login
![Halaman Login](./assets/halaman-login.PNG)

### Halaman Register
![Halaman Register](./assets/halaman-register.PNG)

---

## Tech Stack

- **Framework:** Next.js (React · App Router)
- **Database:** PostgreSQL (lokal)
- **Auth:** Better Auth
- **ORM:** Prisma
- **Storage:** MinIO (S3-compatible local storage via Docker)
- **Icons:** Material UI Icons (Google)
- **Styling:** Tailwind CSS
- **Validasi:** Zod

---

## Panduan Instalasi (Setup)

Prasyarat sebelum menjalankan proyek:
- Node.js (v24+)
- PNPM (*Package Manager*)
- Docker (untuk menjalankan PostgreSQL dan MinIO lokal)

### 1. Klon Repositori & Instal Dependensi

```bash
git clone <url-repo-anda>
cd sim-alfida
pnpm install
```

### 2. Jalankan Infrastruktur Lokal (Docker)

```bash
docker compose up -d
```
Ini akan menjalankan PostgreSQL dan MinIO secara lokal.

### 3. Atur Environment Variables
Salin konfigurasi dari `.env.example` ke dalam `.env.local`.

```bash
cp .env.example .env.local
```

Contoh konfigurasi `.env.local`:
```env
# Database Connection (PostgreSQL Lokal)
DATABASE_URL="postgresql://user:password@localhost:5432/sim_alfida"

# Better Auth Configuration
BETTER_AUTH_SECRET="your-secret-key-here"

# MinIO Configuration
MINIO_ENDPOINT="localhost"
MINIO_PORT=9000
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
```

### 4. Migrasi Skema & Sinkronisasi Database
Dorong skema Prisma ke database lokal dan generate client Prisma.

```bash
npx prisma db push
npx prisma generate
```

*(Opsional)* Anda dapat melakukan injeksi data dummy awal (*seeding*):
```bash
npx prisma db seed
```

### 4. Jalankan Aplikasi
```bash
pnpm dev
```
Aplikasi akan berjalan di `http://localhost:3000`.

Perintah lain yang tersedia:
- `pnpm build` - Build untuk production
- `pnpm lint` - Menjalankan ESLint
- `pnpm test` - Menjalankan Vitest untuk unit tests
- `pnpm test:e2e` - Menjalankan Playwright untuk E2E tests
- `pnpm tsc --noEmit` - Menjalankan Typechecking

---

## Struktur Proyek (Project Structure)

- `src/app/` - Halaman Next.js App Router
- `src/components/` - Komponen React yang dapat digunakan ulang
- `src/lib/` - Utility functions, Prisma client, dll
- `prisma/` - Skema database (`schema.prisma`)
- `tests/` - Unit tests & E2E tests
- `docs/` - Dokumentasi proyek (PRD, Skema DB, Sprint Plan)

---

## Struktur Dokumentasi
Untuk referensi desain dan alur bisnis sistem, kami menggunakan beberapa *single source of truth*:
- `docs/PRD.md` — Product Requirements
- `docs/DB-SCHEMA.md` — Skema basis data
- `docs/SPRINT-PLAN.md` — Rencana *roadmap* pengembangan (termasuk modul PPDB)
- `AGENTS.md` & `PROJECTS.md` — Spesifikasi direktif sistem

© 2026 Yayasan Alfida. All rights reserved.
