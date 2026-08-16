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
| S0-05 | Docker Compose (Dev) | Setup container: Next.js (hot-reload), PostgreSQL 16, Cloudinary (S3-compatible) | 3 jam |
| S0-06 | Design System & Token | Konfigurasi Tailwind dengan design tokens dari `DESIGN.md` (warna, typography, spacing) | 3 jam |
| S0-07 | Shared UI Components | Buat komponen dasar: Button, Input, Badge, Card, Table, Modal skeleton | 4 jam |
| S0-08 | Material Symbols Setup | Integrasi Google Material Symbols Rounded via CDN/self-host + Icon component wrapper | 1 jam |
| S0-09 | Linter & Formatter | ESLint strict config, Prettier, Husky pre-commit hooks, lint-staged | 2 jam |
| S0-10 | CI Pipeline Dasar | GitHub Actions: lint → tsc → vitest → build (trigger on push) | 2 jam |
| S0-11 | Environment Config | `.env.example`, `.env.local`, validasi env vars dengan `zod` | 1 jam |
| S0-12 | Konfigurasi Vitest | Setup Vitest + React Testing Library + path aliases | 1 jam |

### Definition of Done
- [x] Orang tua bisa upload 6 jenis berkas + preview & hapus
- [ ] Surat Pengantar IMC ter-generate sebagai PDF dengan kop surat benar
- [ ] Tim PPDB bisa memverifikasi berkas per pendaftar
- [ ] State machine transisi: documents_uploaded → medical_pending → medical_uploaded → verification → observation_scheduled / rejected
- [x] PDF surat pengantar bisa di-download oleh orang tua

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
- [x] Admin Unit bisa membuat jadwal observasi dengan kuota
- [x] Orang tua bisa booking slot jadwal
- [x] Observer bisa input skor & catatan per pendaftar
- [x] Sistem auto-rank dan admin bisa batch-terima/tolak
- [x] Orang tua melihat hasil seleksi di dashboard
- [x] Surat keterangan lulus ter-generate untuk yang diterima

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
- [x] Admin Unit bisa membuat kelas dan assign siswa diterima
- [x] State machine selesai: `accepted` → `enrolled`
- [x] Full end-to-end flow berjalan tanpa error
- [x] Semua 13 state tervalidasi bisa dicapai

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
- [x] Semua E2E test pass (5 user journey)
- [x] Lighthouse score: Performance ≥ 80, Accessibility ≥ 90
- [x] Aplikasi live di VPS dengan HTTPS
- [x] CI/CD pipeline: push → auto-deploy ke staging
- [x] Zero critical/high severity bug
- [x] UAT sign-off dari stakeholder

---

## Risiko & Mitigasi

| Risiko | Dampak | Probabilitas | Mitigasi |
|--------|--------|--------------|----------|
| VPS belum ready saat Sprint 8 | Deployment tertunda | Sedang | Gunakan Railway/Vercel sebagai staging sementara |
| Perubahan requirement form PPDB | Rework Sprint 4-5 | Sedang | Lock requirement di akhir Sprint 3, tampung perubahan di backlog Phase 2 |
| Integrasi Cloudinary kompleks | Upload gagal | Rendah | Fallback ke local filesystem storage di dev, Cloudinary di staging/prod |
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
