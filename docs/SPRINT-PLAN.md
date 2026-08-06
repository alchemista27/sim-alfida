# Sprint Plan — SIM-Alfida (Phase 1: Modul PPDB)

> **Dokumen ini disusun berdasarkan:**
> [PRD.md](./PRD.md) · [TDD.md](./TDD.md) · [DB-SCHEMA.md](./DB-SCHEMA.md) · [DESIGN.md](../DESIGN.md) · [PROJECTS.md](../PROJECTS.md)

---

## Ringkasan Proyek

| Item | Detail |
|------|--------|
| **Nama** | SIM-Alfida — Sistem Informasi Manajemen Yayasan Alfida |
| **Fokus Phase 1** | Modul PPDB (Penerimaan Peserta Didik Baru) |
| **Target User** | 8 unit pendidikan (2 TK, 3 SD, 1 SMP, 1 SMA, 1 Pesantren) |
| **Stack** | Next.js 15 (App Router) · Prisma · PostgreSQL 16 · Tailwind CSS · NextAuth v5 |
| **Deployment** | Docker Compose on Ubuntu VPS (Nginx + Let's Encrypt) |
| **Estimasi Total** | **9 Sprint (~16 minggu kerja)** |
| **Metode** | Scrum · Sprint 2 minggu · Sprint 0 & 7 = 1 minggu |

---

## Timeline Overview

```
Minggu   1    2    3    4    5    6    7    8    9   10   11   12   13   14   15   16
       ├──┤ ├─────┤ ├─────┤ ├─────┤ ├─────┤ ├─────┤ ├─────┤ ├──┤ ├─────────────────┤
        S0     S1     S2     S3     S4     S5     S6   S7          S8
```

| Sprint | Durasi | Fokus |
|--------|--------|-------|
| **Sprint 0** | 1 minggu | Project Bootstrap & Infrastructure |
| **Sprint 1** | 2 minggu | Autentikasi, RBAC & Layout Utama |
| **Sprint 2** | 2 minggu | Modul Super Admin |
| **Sprint 3** | 2 minggu | Admin Unit & Setup PPDB |
| **Sprint 4** | 2 minggu | Portal Orang Tua — Alur Pendaftaran Bagian 1 |
| **Sprint 5** | 2 minggu | Portal Orang Tua — Alur Pendaftaran Bagian 2 |
| **Sprint 6** | 2 minggu | Observasi & Seleksi |
| **Sprint 7** | 1 minggu | Penempatan Kelas & Finalisasi Fitur |
| **Sprint 8** | 2 minggu | QA, Polish & Deployment Produksi |

---

## Sprint 0 — Project Bootstrap & Infrastructure
**Durasi:** 1 minggu
**Goal:** Fondasi teknis siap — developer bisa langsung coding fitur.

### Backlog

| ID | Task | Detail | Estimasi |
|----|------|--------|----------|
| S0-01 | Inisiasi Next.js Project | `pnpm create next-app` dengan TypeScript, App Router, Tailwind CSS, ESLint | 2 jam |
| S0-02 | Konfigurasi Prisma ORM | Install Prisma, setup `schema.prisma` dengan PostgreSQL provider, konfigurasi `DATABASE_URL` | 2 jam |
| S0-03 | Definisi Database Schema | Implementasi seluruh 18 tabel + 4 ENUM dari `DB-SCHEMA.md` ke `schema.prisma` | 4 jam |
| S0-04 | Seed Data Awal | Script seed: 8 unit pendidikan, 1 super admin, `foundation_settings`, tahun ajaran demo | 3 jam |
| S0-05 | Docker Compose (Dev) | Setup container: Next.js (hot-reload), PostgreSQL 16, MinIO (S3-compatible) | 3 jam |
| S0-06 | Design System & Token | Konfigurasi Tailwind dengan design tokens dari `DESIGN.md` (warna, typography, spacing) | 3 jam |
| S0-07 | Shared UI Components | Buat komponen dasar: Button, Input, Badge, Card, Table, Modal skeleton | 4 jam |
| S0-08 | Material Symbols Setup | Integrasi Google Material Symbols Rounded via CDN/self-host + Icon component wrapper | 1 jam |
| S0-09 | Linter & Formatter | ESLint strict config, Prettier, Husky pre-commit hooks, lint-staged | 2 jam |
| S0-10 | CI Pipeline Dasar | GitHub Actions: lint → tsc → vitest → build (trigger on push) | 2 jam |
| S0-11 | Environment Config | `.env.example`, `.env.local`, validasi env vars dengan `zod` | 1 jam |
| S0-12 | Konfigurasi Vitest | Setup Vitest + React Testing Library + path aliases | 1 jam |

### Definition of Done
- [x] `pnpm dev` berjalan tanpa error
- [x] `pnpm db:push` berhasil membuat seluruh 18 tabel di PostgreSQL
- [x] `pnpm db:seed` mengisi data dummy 8 unit + 1 super admin
- [x] `docker compose up` menjalankan app + DB + MinIO
- [x] `pnpm lint && pnpm tsc --noEmit` zero error
- [x] CI pipeline green di GitHub Actions

---

## Sprint 1 — Autentikasi, RBAC & Layout Utama
**Durasi:** 2 minggu
**Goal:** User bisa login/register, sistem RBAC aktif, layout shell siap pakai.
**Wireframe Ref:** `01-login.html`, `02-register.html`, `03-modules.html`

### Backlog

| ID | Task | Detail | Estimasi |
|----|------|--------|----------|
| S1-01 | NextAuth.js v5 Setup | Install Auth.js, konfigurasi Prisma Adapter, database session strategy | 4 jam |
| S1-02 | Halaman Login | Implementasi UI login (2-panel layout), form validation dengan Zod, error handling | 6 jam |
| S1-03 | Halaman Register | Form registrasi orang tua (nama, email, WA, password), password strength indicator, bcrypt hash (salt ≥12) | 6 jam |
| S1-04 | Auth Middleware | Next.js Middleware untuk proteksi route, redirect unauthenticated ke `/login` | 4 jam |
| S1-05 | RBAC Guard | Helper function `requireRole()` dan `requireUnit()` untuk Server Components & API routes | 6 jam |
| S1-06 | Session & User Context | React Context / NextAuth hook untuk akses data sesi (user, roles, units) di client | 3 jam |
| S1-07 | Rate Limiter Login | Implementasi rate limiting: max 5 percobaan / 15 menit / IP | 3 jam |
| S1-08 | Layout Shell: Topbar | Komponen Topbar sticky: logo SIM-Alfida, avatar user, nama + role badge | 4 jam |
| S1-09 | Layout Shell: Sidebar | Komponen Sidebar navigasi: grouped menu items, active state, responsive collapse | 6 jam |
| S1-10 | Layout Shell: Responsive | Mobile sidebar (hamburger menu), responsive breakpoints, main content area | 4 jam |
| S1-11 | Halaman Pilih Modul | Dashboard module selection: 6 modul cards, role-based visibility (aktif/segera hadir), routing ke modul | 6 jam |
| S1-12 | Unit Tests Auth | Test: login flow, register validation, RBAC guard, session management | 4 jam |
| S1-13 | E2E Test: Auth Flow | Playwright test: register → login → module selection → protected route redirect | 4 jam |

### Definition of Done
- [x] Orang tua bisa register → login → lihat dashboard modul
- [x] Super Admin bisa login → lihat semua modul aktif
- [x] Route protection: unauthenticated redirect, 403 pada role mismatch
- [x] Rate limiter aktif pada endpoint login
- [x] Layout shell (topbar + sidebar) render sempurna di desktop & mobile
- [x] ≥80% unit test coverage pada modul auth

---

## Sprint 2 — Modul Super Admin
**Durasi:** 2 minggu
**Goal:** Super Admin dapat mengelola seluruh unit pendidikan dan assign admin.
**Wireframe Ref:** `04-admin-dashboard.html`, `05-admin-units.html`, `06-admin-unit-detail.html`

### Backlog

| ID | Task | Detail | Estimasi |
|----|------|--------|----------|
| S2-01 | Dashboard Super Admin | 4 stat cards (Total Unit, Total User, PPDB Aktif, Pendaftar Bulan Ini), query aggregasi | 6 jam |
| S2-02 | Tabel Unit Pendidikan | Server Component tabel 8 unit: nama, jenjang, status PPDB, kuota, admin | 4 jam |
| S2-03 | Halaman Kelola Unit | Daftar unit dengan search, filter jenjang, filter status, badge jenjang berwarna | 6 jam |
| S2-04 | CRUD Unit Pendidikan | Server Action: create, update unit. Validasi Zod. Auto-generate slug dari nama | 6 jam |
| S2-05 | Detail Unit & Settings | Form edit: nama, jenjang, slug (readonly), toggle aktif. Upload logo unit | 6 jam |
| S2-06 | Assign Admin Unit | Search user → assign role `admin_unit` scoped ke unit. Remove admin. List admin per unit | 6 jam |
| S2-07 | Upload Logo Yayasan | Super Admin upload logo yayasan ke MinIO via presigned URL. Preview & replace | 4 jam |
| S2-08 | Manajemen User Global | Tabel user (all), filter by role, status aktif/nonaktif. Reset password (future) | 6 jam |
| S2-09 | Presigned URL Service | Utility function untuk generate MinIO/S3 presigned URL (upload & download) | 4 jam |
| S2-10 | Unit Tests Super Admin | Test: unit CRUD, role assignment, aggregation queries, presigned URL gen | 4 jam |
| S2-11 | E2E Test: Admin Flow | Playwright: login admin → dashboard → create unit → assign admin → verify | 4 jam |

### Definition of Done
- [x] Dashboard menampilkan statistik real-time dari database
- [x] Super Admin bisa CRUD unit pendidikan (8 unit terisi)
- [x] Assign/remove admin unit berfungsi dengan scope benar
- [ ] Upload logo yayasan tersimpan di MinIO, preview di UI *(MinIO digunakan di prod, di-skip untuk dev lokal)*
- [x] Non-super-admin mendapat 403 saat akses route ini

---

## Sprint 3 — Admin Unit & Setup PPDB
**Durasi:** 2 minggu
**Goal:** Admin Unit dapat mengatur unit dan mengaktifkan periode PPDB.
**Wireframe Ref:** `07-unit-dashboard.html`, `08-unit-settings.html`, `09-unit-ppdb-overview.html`, `10-unit-ppdb-registrations.html`

### Backlog

| ID | Task | Detail | Estimasi |
|----|------|--------|----------|
| S3-01 | Dashboard Unit | 4 stat cards scoped per unit: Pendaftar, Pending Bayar, Berkas Verified, Diterima | 6 jam |
| S3-02 | Progress Bar PPDB | Visual progress bar kuota: "X dari Y terisi" + persentase | 3 jam |
| S3-03 | Shortcut Cards | 4 shortcut ke fitur utama: Verifikasi Bayar, Berkas, Observasi, Penempatan (dengan badge count) | 3 jam |
| S3-04 | Settings Unit | Form readonly (nama, jenjang) + editable (kepsek, NIP). Scope data per unit_id | 4 jam |
| S3-05 | Upload Logo & TTD | Upload zona drag-drop: logo unit + tanda tangan kepsek. Preview + validasi format/size | 6 jam |
| S3-06 | Info Rekening Bank | Tampilkan rekening yayasan dari `foundation_settings` (readonly untuk admin unit) | 2 jam |
| S3-07 | CRUD Tahun Ajaran | Buat tahun ajaran baru (nama, tanggal mulai/selesai, kuota). Toggle `ppdb_active` | 6 jam |
| S3-08 | Overview PPDB | Highlight tahun ajaran aktif, riwayat tahun sebelumnya, modal form tambah baru | 4 jam |
| S3-09 | Daftar Pendaftaran | Tabel semua registrasi per unit. Filter status (13 state). Search nama. Pagination | 8 jam |
| S3-10 | Detail Pendaftaran | Halaman detail 1 pendaftar: timeline state, data siswa, ortu, berkas, status bayar | 6 jam |
| S3-11 | Tenant Isolation | Pastikan semua query di-scope dengan `unit_id` dari sesi. Test cross-unit access denied | 4 jam |
| S3-12 | Unit & E2E Tests | Test: CRUD tahun ajaran, tenant isolation, dashboard aggregation | 4 jam |

### Definition of Done
- [x] Admin Unit hanya melihat data unitnya sendiri (tenant isolation verified)
- [x] Tahun ajaran bisa dibuat/diaktifkan, kuota terset
- [x] Daftar pendaftaran menampilkan data dengan filter & pagination
- [x] Logo unit & TTD kepsek terupload & terpreview *(UI siap, integrasi MinIO ditangguhkan untuk dev)*
- [x] Dashboard unit menampilkan statistik real-time

---

## Sprint 4 — Portal Orang Tua: Alur Pendaftaran Bagian 1
**Durasi:** 2 minggu
**Goal:** Orang tua dapat memilih unit, bayar, dan mengisi formulir.
**Wireframe Ref:** `15-ppdb-dashboard.html`, `16-ppdb-select-unit.html`, `17-ppdb-payment.html`, `18-ppdb-form-student.html`, `19-ppdb-form-parents.html`

### Backlog

| ID | Task | Detail | Estimasi |
|----|------|--------|----------|
| S4-01 | Dashboard Orang Tua | Stepper visual (10 tahap), status aktif, card unit terdaftar, nomor pendaftaran | 6 jam |
| S4-02 | State Machine Service | Implementasi PPDB FSM (13 state) sebagai service. Validasi transisi state, guard conditions | 8 jam |
| S4-03 | Halaman Pilih Unit | Katalog 8 unit pendidikan. Card: nama, jenjang, kuota real-time, badge status. Disable jika penuh | 6 jam |
| S4-04 | Create Registration | Server Action: buat `registration` baru, generate `registration_number` (format: PPDB-{SLUG}-{YEAR}-{SEQ}), set state `pending_payment` | 4 jam |
| S4-05 | Halaman Pembayaran | Info rekening yayasan (BSI), nominal biaya, tombol salin rekening | 4 jam |
| S4-06 | Upload Bukti Bayar | Drag-drop zone untuk unggah bukti transfer (JPG/PNG/PDF, max 5MB) ke MinIO. State → `payment_uploaded` | 6 jam |
| S4-07 | Verifikasi Pembayaran (Admin) | Halaman admin: tabel pending payments, preview bukti, tombol Verifikasi/Tolak + alasan. State → `payment_verified` atau kembali ke `pending_payment` | 8 jam |
| S4-08 | Form Data Siswa | Form multi-field sesuai PRD (nama, panggilan, gender, TTL, NISN, alamat, transportasi, hobi, cita-cita). Validasi Zod. Simpan ke `student_data` | 8 jam |
| S4-09 | Form Data Orang Tua | Tab Ayah/Ibu. Field: nama, NIK (16 digit), TTL, pendidikan, pekerjaan, penghasilan, no. HP, alamat. Simpan ke `parent_data` | 8 jam |
| S4-10 | Stepper Navigation | Navigasi maju/mundur antar step. Disable step yang belum bisa diakses. Auto-redirect berdasarkan current state | 4 jam |
| S4-11 | Unit & E2E Tests | Test: state machine transitions, form validation, payment upload, registration creation | 6 jam |

### Definition of Done
- [x] Orang tua bisa: pilih unit → bayar → upload bukti → isi form siswa → isi form ortu
- [x] State machine transisi benar (pending_payment → payment_uploaded → payment_verified → form_filling)
- [x] Admin bisa verifikasi/tolak pembayaran
- [x] Registration number ter-generate dengan format benar
- [x] Form validation menangkap semua error (NIK 16 digit, required fields, dll)

---

## Sprint 4.5 — Supabase Migration
**Durasi:** 1 minggu
**Goal:** Mengganti NextAuth (Auth.js) dan koneksi database lokal dengan Supabase Auth & PostgreSQL.

### Backlog

| ID | Task | Detail | Estimasi |
|----|------|--------|----------|
| S4.5-01 | Setup Supabase Client | Install `@supabase/ssr` dan `@supabase/supabase-js`. Buat utilitas client browser, server, dan middleware. | 4 jam |
| S4.5-02 | Migrasi Prisma Connection | Ubah `DATABASE_URL` ke Transaction Pooler Supabase, dan `DIRECT_URL` ke Direct Connection untuk migrasi Prisma. | 2 jam |
| S4.5-03 | Refactor Auth Logic (Login/Register) | Ganti implementasi `signIn`/`signUp` dari NextAuth ke metode `supabase.auth.signInWithPassword` dll. Sinkronisasi session. | 8 jam |
| S4.5-04 | Refactor Auth Guard | Perbarui middleware dan fungsi utilitas pengecekan sesi dan role (RBAC) agar membaca sesi Supabase, bukan NextAuth token. | 6 jam |
| S4.5-05 | Supabase User Sync | Buat mekanisme sinkronisasi antara tabel `auth.users` Supabase (sebagai auth source) dan tabel `users` publik Prisma (profil). | 6 jam |
| S4.5-06 | Cleanup NextAuth | Hapus *package* `next-auth`, hapus file kongfigurasi Auth.js, dan perbarui skrip *seed*. | 2 jam |

### Definition of Done
- [ ] Autentikasi berjalan penuh menggunakan Supabase Auth (SSR)
- [ ] Semua rute terproteksi (`requireRole`) berjalan normal
- [ ] Prisma terhubung stabil ke Supabase Postgres

---

## Sprint 5 — Portal Orang Tua: Alur Pendaftaran Bagian 2
**Durasi:** 2 minggu
**Goal:** Upload berkas, generate surat IMC, dan verifikasi berkas oleh Tim PPDB.
**Wireframe Ref:** `20-ppdb-documents.html`, `21-ppdb-medical.html`, `12-unit-ppdb-verification.html`

### Backlog

| ID | Task | Detail | Estimasi |
|----|------|--------|----------|
| S5-01 | Halaman Upload Berkas | List 6 jenis dokumen: pasfoto, KTP ayah, KTP ibu, akte, KK, surat sekolah. Status uploaded/pending per dokumen | 6 jam |
| S5-02 | Upload Service (Batch) | Multi-file upload ke MinIO via presigned URL. Validasi format (JPG/PNG/PDF) & size (max 5MB). Progress indicator | 8 jam |
| S5-03 | Document Preview | Preview dokumen terupload (image viewer untuk JPG/PNG, PDF viewer embed). Tombol hapus & re-upload | 4 jam |
| S5-04 | State → documents_uploaded | Auto-transition ketika semua required documents terupload. Guard: minimal 5 dokumen wajib | 3 jam |
| S5-05 | Generate Surat IMC (PDF) | `@react-pdf/renderer` server-side: kop surat (logo yayasan + logo unit), data siswa, TTD kepsek, nomor surat otomatis | 8 jam |
| S5-06 | Halaman Surat IMC | Info penjelasan IMC, tombol download PDF surat pengantar, zona upload hasil tes IMC | 4 jam |
| S5-07 | Upload Hasil IMC | Upload hasil lab/medis dari klinik. State → `medical_uploaded` | 3 jam |
| S5-08 | State → verification | Auto-transition setelah hasil IMC terupload. Pendaftaran masuk antrian verifikasi Tim PPDB | 2 jam |
| S5-09 | Verifikasi Berkas (Tim PPDB) | Tabel pendaftar per unit. Per dokumen: icon check/cancel/pending. Filter tab: Semua/Perlu Verifikasi/Lolos/Ditolak | 8 jam |
| S5-10 | Aksi Verifikasi | Tombol "Loloskan" (state → `observation_scheduled`) / "Tolak" (state → `rejected`, wajib isi alasan) | 4 jam |
| S5-11 | Notifikasi Status | Tampilkan perubahan status di dashboard orang tua. (Opsional: kirim email/WA notification placeholder) | 4 jam |
| S5-12 | Unit & E2E Tests | Test: upload flow, PDF generation, verification flow, state transitions | 6 jam |

### Definition of Done
- [ ] Orang tua bisa upload 6 jenis berkas + preview & hapus
- [ ] Surat Pengantar IMC ter-generate sebagai PDF dengan kop surat benar
- [ ] Tim PPDB bisa memverifikasi berkas per pendaftar
- [ ] State machine transisi: documents_uploaded → medical_pending → medical_uploaded → verification → observation_scheduled / rejected
- [ ] PDF surat pengantar bisa di-download oleh orang tua

---

## Sprint 6 — Observasi & Seleksi
**Durasi:** 2 minggu
**Goal:** Proses observasi end-to-end dari penjadwalan hingga pengumuman hasil.
**Wireframe Ref:** `13-unit-ppdb-observations.html`, `22-ppdb-observation.html`, `24-observer-input.html`, `23-ppdb-result.html`

### Backlog

| ID | Task | Detail | Estimasi |
|----|------|--------|----------|
| S6-01 | Manajemen Jadwal Observasi | Admin Unit CRUD jadwal: tanggal, jam, kuota harian. Tabel dengan edit/hapus | 6 jam |
| S6-02 | Booking Observasi (Ortu) | Orang tua memilih slot jadwal. Validasi kuota tersedia. Konfirmasi booking. State tetap `observation_scheduled` | 6 jam |
| S6-03 | Halaman Jadwal Ortu | Tampilkan jadwal terbooking: tanggal, jam, lokasi. Info persiapan observasi | 4 jam |
| S6-04 | Form Input Observasi | Observer: pilih pendaftar, input skor (0-100), textarea catatan. Simpan ke `observation_results` | 6 jam |
| S6-05 | Auto-Ranking | Trigger setelah skor diinput: hitung peringkat otomatis per unit+tahun ajaran berdasarkan skor descending | 4 jam |
| S6-06 | Hasil Observasi (Admin) | Tab "Hasil Observasi": tabel ranked. Kolom: peringkat, nama, skor, observer, catatan. Filter & sort | 4 jam |
| S6-07 | Keputusan Penerimaan | Admin Unit: batch action "Terima" (top-N sesuai kuota) → state `accepted`. Sisanya → state `rejected` | 6 jam |
| S6-08 | State → observation_done | Auto-transition setelah skor diinput observer. Guard: observer hanya bisa input 1x per pendaftar | 3 jam |
| S6-09 | Halaman Hasil Seleksi (Ortu) | Dashboard ortu update: status Diterima/Ditolak. Badge besar, pesan selamat atau info penolakan | 6 jam |
| S6-10 | Generate Surat Lulus (PDF) | PDF surat keterangan lulus: kop surat, data siswa, TTD kepsek, nomor surat. Hanya untuk state `accepted` | 6 jam |
| S6-11 | Download Surat Lulus | Tombol download di halaman hasil. Guard: hanya muncul jika state = accepted/enrolled | 2 jam |
| S6-12 | Unit & E2E Tests | Test: jadwal CRUD, booking flow, skor input, ranking, acceptance batch, PDF gen | 6 jam |

### Definition of Done
- [ ] Admin Unit bisa membuat jadwal observasi dengan kuota
- [ ] Orang tua bisa booking slot jadwal
- [ ] Observer bisa input skor & catatan per pendaftar
- [ ] Sistem auto-rank dan admin bisa batch-terima/tolak
- [ ] Orang tua melihat hasil seleksi di dashboard
- [ ] Surat keterangan lulus ter-generate untuk yang diterima

---

## Sprint 7 — Penempatan Kelas & Finalisasi Fitur
**Durasi:** 1 minggu
**Goal:** Siswa diterima di-assign ke kelas. Alur PPDB lengkap end-to-end.
**Wireframe Ref:** `14-unit-ppdb-classes.html`, `11-unit-ppdb-payments.html`

### Backlog

| ID | Task | Detail | Estimasi |
|----|------|--------|----------|
| S7-01 | Manajemen Kelas | Admin Unit CRUD kelas paralel: nama (1A, 1B, 1C), grade, kapasitas. Per unit + tahun ajaran | 4 jam |
| S7-02 | Info Kelas Summary | Cards summary: nama kelas, kapasitas, jumlah assigned, sisa slot | 3 jam |
| S7-03 | Penempatan Siswa | Tabel siswa diterima: dropdown pilih kelas, tombol simpan. Validasi kapasitas kelas | 6 jam |
| S7-04 | Batch Assignment | Tombol "Simpan Semua Penempatan". State → `enrolled` untuk setiap yang di-assign | 4 jam |
| S7-05 | State → enrolled | Transisi final state machine. Guard: hanya dari state `accepted`, kelas harus dipilih | 2 jam |
| S7-06 | Verifikasi Pembayaran Polish | Review & polish UI halaman verifikasi bayar. Modal tolak dengan alasan. Riwayat verifikasi | 4 jam |
| S7-07 | Dashboard Updates | Update semua dashboard (super admin, unit, ortu) agar merefleksikan data enrolled | 3 jam |
| S7-08 | Integrasi Review | Full walkthrough seluruh flow: register → login → pilih unit → bayar → form → berkas → IMC → verifikasi → observasi → hasil → kelas | 4 jam |
| S7-09 | Bug Fixes Sprint 1-6 | Buffer waktu untuk perbaikan bug dari sprint sebelumnya | 6 jam |

### Definition of Done
- [ ] Admin Unit bisa membuat kelas dan assign siswa diterima
- [ ] State machine selesai: `accepted` → `enrolled`
- [ ] Full end-to-end flow berjalan tanpa error
- [ ] Semua 13 state tervalidasi bisa dicapai

---

## Sprint 8 — QA, Polish & Deployment Produksi
**Durasi:** 2 minggu
**Goal:** Aplikasi production-ready, deployed, dan siap digunakan.

### Backlog

| ID | Task | Detail | Estimasi |
|----|------|--------|----------|
| **Minggu 1: Testing & Polish** ||||
| S8-01 | E2E Test Suite Lengkap | Playwright: 5 user journey utama (ortu, admin unit, super admin, tim ppdb, observer) | 8 jam |
| S8-02 | Accessibility Audit | Keyboard navigation, screen reader, color contrast, ARIA labels pada semua halaman kritis | 6 jam |
| S8-03 | Responsive Testing | Test di viewport: 375px (mobile), 768px (tablet), 1024px (desktop), 1440px (wide) | 4 jam |
| S8-04 | Performance Optimization | Lighthouse audit, lazy loading, image optimization, bundle analysis, query optimization | 6 jam |
| S8-05 | Error Handling & Edge Cases | Error boundaries, empty states, loading skeletons, 404/500 pages, timeout handling | 6 jam |
| S8-06 | Security Hardening | Validasi ulang semua input (Zod), CSRF protection, header keamanan (CSP, HSTS), sanitize uploads | 4 jam |
| S8-07 | UI Polish | Micro-animations, hover states, transition smoothing, konsistensi spacing & typography | 4 jam |
| **Minggu 2: Deployment** ||||
| S8-08 | Dockerize Production | Multi-stage Dockerfile (build → production). `docker-compose.prod.yml` | 4 jam |
| S8-09 | Nginx Configuration | Reverse proxy config, SSL termination (Let's Encrypt / Certbot), gzip, static caching | 4 jam |
| S8-10 | VPS Provisioning | Ubuntu setup, Docker install, firewall (UFW), SSH hardening, monitoring dasar | 4 jam |
| S8-11 | Database Migration Prod | `prisma migrate deploy` di production. Backup strategy. Seed data unit pendidikan real | 3 jam |
| S8-12 | CI/CD Pipeline Final | GitHub Actions: lint → tsc → test → build → deploy SSH ke VPS. Branch `main` → staging, `release/*` → prod | 4 jam |
| S8-13 | Monitoring & Logging | Setup logging (structured JSON), health check endpoint, basic uptime monitoring | 3 jam |
| S8-14 | User Acceptance Testing | Demo ke stakeholder yayasan. Collect feedback. Quick-fix critical issues | 6 jam |
| S8-15 | Dokumentasi Deployment | README update, runbook operasional, panduan admin | 3 jam |

### Definition of Done
- [ ] Semua E2E test pass (5 user journey)
- [ ] Lighthouse score: Performance ≥ 80, Accessibility ≥ 90
- [ ] Aplikasi live di VPS dengan HTTPS
- [ ] CI/CD pipeline: push → auto-deploy ke staging
- [ ] Zero critical/high severity bug
- [ ] UAT sign-off dari stakeholder

---

## Risiko & Mitigasi

| Risiko | Dampak | Probabilitas | Mitigasi |
|--------|--------|--------------|----------|
| VPS belum ready saat Sprint 8 | Deployment tertunda | Sedang | Gunakan Railway/Vercel sebagai staging sementara |
| Perubahan requirement form PPDB | Rework Sprint 4-5 | Sedang | Lock requirement di akhir Sprint 3, tampung perubahan di backlog Phase 2 |
| Integrasi MinIO kompleks | Upload gagal | Rendah | Fallback ke local filesystem storage di dev, MinIO di staging/prod |
| Performance query aggregasi lambat | Dashboard lemot | Rendah | Gunakan materialized view / caching Redis (add di Sprint 8 jika perlu) |
| PDF generation memory-intensive | Server crash | Rendah | Limit concurrent PDF gen, gunakan queue (bull) jika diperlukan |

---

## Metrik Keberhasilan Phase 1

| Metrik | Target |
|--------|--------|
| Cakupan fitur PPDB | 100% (seluruh 13 state machine terealisasi) |
| Unit Test Coverage | ≥ 80% pada module auth, state machine, dan form validation |
| E2E Test Pass Rate | 100% pada 5 critical user journey |
| Build Time | ≤ 3 menit (CI pipeline) |
| Page Load (LCP) | ≤ 2.5 detik |
| Downtime Target | ≤ 0.1% (post-deployment) |
| Bug Severity | Zero P0/P1 at launch |

---

## Catatan

- **Modul Phase 2 & 3** (Akademik, Surat Menyurat, Manajemen Karyawan, Payroll, Rekrutmen) akan direncanakan dalam sprint plan terpisah setelah Phase 1 go-live.
- **SSO Integration** dengan WordPress & Moodle disiapkan di arsitektur tapi implementasinya masuk Phase 2.
- Sprint plan ini bersifat *living document* — akan di-update setiap Sprint Review berdasarkan velocity aktual tim.
