# Sprint Plan — SIM-Alfida (Phase 1 & 2: Modul PPDB & Akademik)

> **Dokumen ini disusun berdasarkan:**
> [PRD.md](./PRD.md) · [TDD.md](./TDD.md) · [DB-SCHEMA.md](./DB-SCHEMA.md) · [DESIGN.md](../DESIGN.md) · [PROJECTS.md](../PROJECTS.md)

---

## Ringkasan Proyek

| Item | Detail |
|------|--------|
| **Nama** | SIM-Alfida — Sistem Informasi Manajemen Yayasan Alfida |
| **Fokus Phase 1 & 2** | Modul PPDB (Penerimaan Peserta Didik Baru) & Modul Akademik |
| **Target User** | 8 unit pendidikan (Admin Unit, Guru, Wali Kelas, Pembina Ekskul, Orang Tua) |
| **Stack** | Next.js 15 (App Router) · Prisma · PostgreSQL 16 · Tailwind CSS · NextAuth v5 |
| **Deployment** | Vercel (Next.js) + Supabase (DB & Auth) + Cloudinary (Storage) |
| **Estimasi Total** | **21 Sprint (~40 minggu kerja)** |
| **Metode** | Scrum · Sprint 2 minggu |

---

## Timeline Overview

| Fase | Sprint | Fokus |
|------|--------|-------|
| **Fase 1** | **Sprint 0** | Project Bootstrap & Infrastructure |
| | **Sprint 1** | Autentikasi, RBAC & Layout Utama |
| | **Sprint 2** | Modul Super Admin |
| | **Sprint 3** | Admin Unit & Setup PPDB |
| | **Sprint 4** | Portal Orang Tua — Alur Pendaftaran Bagian 1 |
| | **Sprint 5** | Portal Orang Tua — Alur Pendaftaran Bagian 2 |
| | **Sprint 6** | Observasi & Seleksi |
| | **Sprint 7** | Penempatan Kelas & Finalisasi Fitur |
| | **Sprint 8** | QA, Polish & Deployment Produksi (Fase 1) |
| **Fase 2** | **Sprint 9-10**  | Skema database akademik & daftar ulang siswa |
| | **Sprint 10-11** | Manajemen mapel, assign guru & wali kelas |
| | **Sprint 11-13** | Input nilai (harian, ujian, ATS, AAS) & absensi |
| | **Sprint 13-14** | Jurnal pembelajaran & perencanaan (Prota/Promes/RPP) |
| | **Sprint 14-15** | Manajemen ekskul & pembina |
| | **Sprint 15-16** | Jadwal pelajaran & jadwal ekskul |
| | **Sprint 16-17** | Pembayaran SPP & biaya lain |
| | **Sprint 17-19** | Generate LHBS (PDF) & kenaikan kelas |
| | **Sprint 19-20** | Portal orang tua akademik (jadwal, LHBS, promosi) |
| | **Sprint 20-21** | QA, testing, & deployment Modul Akademik |

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

## Sprint 8 — QA, Polish & Deployment Produksi (Phase 1)
**Durasi:** 2 minggu
**Goal:** Aplikasi production-ready, deployed ke Vercel/Supabase, dan siap digunakan.

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
| S8-08 | Vercel Deployment Setup | Setup Vercel project, koneksi repositori GitHub, environment variables production | 4 jam |
| S8-09 | Supabase Production Setup | Setup project Supabase prod, auth settings, email templates, connection pooling | 4 jam |
| S8-10 | Cloudinary Integration | Konfigurasi Cloudinary production bucket & signed upload settings | 2 jam |
| S8-11 | Database Migration Prod | `npx prisma migrate deploy` di production. Seed data unit pendidikan real | 3 jam |
| S8-12 | CI/CD Pipeline Final | Vercel auto-deployment. Branch `main` → Preview, `release/*` → Production | 4 jam |
| S8-13 | Monitoring & Logging | Setup Vercel Analytics & Supabase logs monitoring | 3 jam |
| S8-14 | User Acceptance Testing | Demo ke stakeholder yayasan. Collect feedback. Quick-fix critical issues | 6 jam |
| S8-15 | Dokumentasi Deployment | README update, runbook operasional, panduan admin | 3 jam |

### Definition of Done
- [x] Semua E2E test pass (5 user journey)
- [x] Lighthouse score: Performance ≥ 80, Accessibility ≥ 90
- [x] Aplikasi live di Vercel dengan HTTPS
- [x] Zero critical/high severity bug
- [x] UAT sign-off dari stakeholder

---

## Phase 2 — Modul Akademik (Sprint 9 - 21)

Detail Backlog untuk Sprint 9 hingga 21 akan diperinci lebih lanjut pada saat Perencanaan Sprint (Sprint Planning) Phase 2. 
Fokus utama meliputi pendaftaran ulang, manajemen mapel, input nilai (harian, ATS, AAS), ekstrakurikuler, absensi, pembayaran SPP bulanan, dan rapor LHBS.

---

## Risiko & Mitigasi

| Risiko | Dampak | Probabilitas | Mitigasi |
|--------|--------|--------------|----------|
| Limitasi Vercel Hobby/Pro | Deployment macet | Rendah | Monitor usage Vercel, upgrade plan jika traffic PPDB/Akademik sangat tinggi |
| Perubahan requirement form PPDB/Rapor | Rework Sprint | Sedang | Lock requirement di awal Sprint, tampung perubahan di backlog iterasi berikutnya |
| Integrasi Cloudinary kompleks | Upload gagal | Rendah | Fallback ke local filesystem storage di dev, optimalkan presigned URL di staging/prod |
| Performance query nilai/rapor lambat | Dashboard lemot | Rendah | Gunakan agregasi dan snapshot JSONB (contoh pada `lhbs_reports`) untuk laporan |
| PDF generation memory-intensive | Server crash | Sedang | Limit concurrent PDF gen di serverless function, delegasikan ke service khusus jika timeout (Vercel max 10s) |

---

## Metrik Keberhasilan Phase 1 & 2

| Metrik | Target |
|--------|--------|
| Cakupan fitur PPDB & Akademik | 100% dari requirements PRD |
| Unit Test Coverage | ≥ 80% pada module auth, state machine, kalkulasi nilai, form validation |
| E2E Test Pass Rate | 100% pada critical user journey PPDB & Akademik |
| Build Time | ≤ 3 menit (Vercel pipeline) |
| Page Load (LCP) | ≤ 2.5 detik |
| Uptime Target | ≥ 99.9% (Serverless) |
| Bug Severity | Zero P0/P1 at launch tiap modul |

---

## Catatan

- **Modul Phase 3** (Surat Menyurat, Manajemen Karyawan, Payroll, Rekrutmen) akan direncanakan setelah Phase 2 go-live.
- **SSO Integration** dengan WordPress & Moodle disiapkan di arsitektur tapi implementasinya masuk iterasi berikutnya.
- Sprint plan ini bersifat *living document* — akan di-update setiap Sprint Review berdasarkan velocity aktual tim.
