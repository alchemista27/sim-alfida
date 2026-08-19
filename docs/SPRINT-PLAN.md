# Sprint Plan — SIM-Alfida (Phase 1 & 2: Modul PPDB & Akademik)

> **Dokumen ini disusun berdasarkan:**
> [PRD.md](./PRD.md) · [TDD.md](./TDD.md) · [DB-SCHEMA.md](./DB-SCHEMA.md) · [DESIGN.md](../DESIGN.md) · [PROJECTS.md](../PROJECTS.md)

---

## Ringkasan Proyek

| Item | Detail |
|------|--------|
| **Nama** | SIM-Alfida — Sistem Informasi Manajemen Yayasan Alfida |
| **Fokus Fase 1, 2, 3** | Modul PPDB, Modul Akademik & Modul Manajemen Karyawan |
| **Target User** | 8 unit pendidikan (Admin Unit, Guru, Wali Kelas, Pembina Ekskul, Orang Tua) |
| **Stack** | Next.js 15 (App Router) · Prisma · PostgreSQL 16 · Tailwind CSS · NextAuth v5 |
| **Deployment** | Vercel (Next.js) + Supabase (DB & Auth) + Cloudinary (Storage) |
| **Estimasi Total** | **36 Sprint (~72 minggu kerja)** |
| **Metode** | Scrum · Sprint 2 minggu |

---

## Timeline Overview

| Fase | Sprint | Fokus |
|------|--------|-------|
| **Fase 1 (Complete)** | **Sprint 0** | Project Bootstrap & Infrastructure |
| | **Sprint 1** | Autentikasi, RBAC & Layout Utama |
| | **Sprint 2** | Modul Super Admin |
| | **Sprint 3** | Admin Unit & Setup PPDB |
| | **Sprint 4** | Portal Orang Tua — Alur Pendaftaran Bagian 1 |
| | **Sprint 5** | Portal Orang Tua — Alur Pendaftaran Bagian 2 |
| | **Sprint 6** | Observasi & Seleksi |
| | **Sprint 7** | Penempatan Kelas & Finalisasi Fitur |
| | **Sprint 8** | QA, Polish & Deployment Produksi (Fase 1) |
| **Fase 2 (Complete)** | **Sprint 9-10**  | Skema database akademik & daftar ulang siswa |
| | **Sprint 10-11** | Manajemen mapel, assign guru & wali kelas |
| | **Sprint 11-13** | Input nilai (harian, ujian, ATS, AAS) & absensi |
| | **Sprint 13-14** | Jurnal pembelajaran & perencanaan (Prota/Promes/RPP) |
| | **Sprint 14-15** | Manajemen ekskul & pembina |
| | **Sprint 15-16** | Jadwal pelajaran & jadwal ekskul |
| | **Sprint 16-17** | Pembayaran SPP & biaya lain |
| | **Sprint 17-19** | Generate LHBS (PDF) & kenaikan kelas |
| | **Sprint 19-20** | Portal orang tua akademik (jadwal, LHBS, promosi) |
| | **Sprint 20-21** | QA, testing, & deployment Modul Akademik |
| **Fase 3 (Complete)** | **Sprint 22-23** | Database schema untuk employee, department, & GPS config |
| | **Sprint 24-25** | GPS attendance (check-in/out), holiday management |
| | **Sprint 26-27** | UPA/Liqo groups, murobbi assignment, member management |
| | **Sprint 28-29** | Liqo attendance, wajibat reports & recap |
| | **Sprint 30-31** | Leave request workflow & approval |
| | **Sprint 32-33** | Work programs & activity reports per department |
| | **Sprint 34-35** | Super admin & admin dashboards for employee module |
| | **Sprint 36** | QA, testing, & deployment Modul Karyawan |

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

| ID | Task | Detail | Estimasi | Status |
|----|------|--------|----------|--------|
| S0-01 | Inisiasi Next.js Project | `pnpm create next-app` dengan TypeScript, App Router, Tailwind CSS, ESLint | 2 jam | ✅ Selesai |
| S0-02 | Konfigurasi Prisma ORM | Install Prisma, setup `schema.prisma` dengan PostgreSQL provider, konfigurasi `DATABASE_URL` | 2 jam | ✅ Selesai |
| S0-03 | Definisi Database Schema | Implementasi seluruh 18 tabel + 4 ENUM dari `DB-SCHEMA.md` ke `schema.prisma` | 4 jam | ✅ Selesai |
| S0-04 | Seed Data Awal | Script seed: 8 unit pendidikan, 1 super admin, `foundation_settings`, tahun ajaran demo | 3 jam | ✅ Selesai |
| S0-05 | Docker Compose (Dev) | Setup container: Next.js (hot-reload), PostgreSQL 16, Cloudinary (S3-compatible) | 3 jam | ✅ Selesai |
| S0-06 | Design System & Token | Konfigurasi Tailwind dengan design tokens dari `DESIGN.md` (warna, typography, spacing) | 3 jam | ✅ Selesai |
| S0-07 | Shared UI Components | Buat komponen dasar: Button, Input, Badge, Card, Table, Modal skeleton | 4 jam | ✅ Selesai |
| S0-08 | Material Symbols Setup | Integrasi Google Material Symbols Rounded via CDN/self-host + Icon component wrapper | 1 jam | ✅ Selesai |
| S0-09 | Linter & Formatter | ESLint strict config, Prettier, Husky pre-commit hooks, lint-staged | 2 jam | ✅ Selesai |
| S0-10 | CI Pipeline Dasar | GitHub Actions: lint → tsc → vitest → build (trigger on push) | 2 jam | ✅ Selesai |
| S0-11 | Environment Config | `.env.example`, `.env.local`, validasi env vars dengan `zod` | 1 jam | ✅ Selesai |
| S0-12 | Konfigurasi Vitest | Setup Vitest + React Testing Library + path aliases | 1 jam | ✅ Selesai |

### Definition of Done
- [x] Orang tua bisa upload 6 jenis berkas + preview & hapus
- [x] Surat Pengantar IMC ter-generate sebagai PDF dengan kop surat benar
- [x] Tim PPDB bisa memverifikasi berkas per pendaftar
- [x] State machine transisi: documents_uploaded → medical_pending → medical_uploaded → verification → observation_scheduled / rejected
- [x] PDF surat pengantar bisa di-download oleh orang tua

---

## Sprint 6 — Observasi & Seleksi
**Durasi:** 2 minggu
**Goal:** Proses observasi end-to-end dari penjadwalan hingga pengumuman hasil.
**Wireframe Ref:** `13-unit-ppdb-observations.html`, `22-ppdb-observation.html`, `24-observer-input.html`, `23-ppdb-result.html`

### Backlog

| ID | Task | Detail | Estimasi | Status |
|----|------|--------|----------|--------|
| S6-01 | Manajemen Jadwal Observasi | Admin Unit CRUD jadwal: tanggal, jam, kuota harian. Tabel dengan edit/hapus | 6 jam | ✅ Selesai |
| S6-02 | Booking Observasi (Ortu) | Orang tua memilih slot jadwal. Validasi kuota tersedia. Konfirmasi booking. State tetap `observation_scheduled` | 6 jam | ✅ Selesai |
| S6-03 | Halaman Jadwal Ortu | Tampilkan jadwal terbooking: tanggal, jam, lokasi. Info persiapan observasi | 4 jam | ✅ Selesai |
| S6-04 | Form Input Observasi | Observer: pilih pendaftar, input skor (0-100), textarea catatan. Simpan ke `observation_results` | 6 jam | ✅ Selesai |
| S6-05 | Auto-Ranking | Trigger setelah skor diinput: hitung peringkat otomatis per unit+tahun ajaran berdasarkan skor descending | 4 jam | ✅ Selesai |
| S6-06 | Hasil Observasi (Admin) | Tab "Hasil Observasi": tabel ranked. Kolom: peringkat, nama, skor, observer, catatan. Filter & sort | 4 jam | ✅ Selesai |
| S6-07 | Keputusan Penerimaan | Admin Unit: batch action "Terima" (top-N sesuai kuota) → state `accepted`. Sisanya → state `rejected` | 6 jam | ✅ Selesai |
| S6-08 | State → observation_done | Auto-transition setelah skor diinput observer. Guard: observer hanya bisa input 1x per pendaftar | 3 jam | ✅ Selesai |
| S6-09 | Halaman Hasil Seleksi (Ortu) | Dashboard ortu update: status Diterima/Ditolak. Badge besar, pesan selamat atau info penolakan | 6 jam | ✅ Selesai |
| S6-10 | Generate Surat Lulus (PDF) | PDF surat keterangan lulus: kop surat, data siswa, TTD kepsek, nomor surat. Hanya untuk state `accepted` | 6 jam | ✅ Selesai |
| S6-11 | Download Surat Lulus | Tombol download di halaman hasil. Guard: hanya muncul jika state = accepted/enrolled | 2 jam | ✅ Selesai |
| S6-12 | Unit & E2E Tests | Test: jadwal CRUD, booking flow, skor input, ranking, acceptance batch, PDF gen | 6 jam | ✅ Selesai |

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

| ID | Task | Detail | Estimasi | Status |
|----|------|--------|----------|--------|
| S7-01 | Manajemen Kelas | Admin Unit CRUD kelas paralel: nama (1A, 1B, 1C), grade, kapasitas. Per unit + tahun ajaran | 4 jam | ✅ Selesai |
| S7-02 | Info Kelas Summary | Cards summary: nama kelas, kapasitas, jumlah assigned, sisa slot | 3 jam | ✅ Selesai |
| S7-03 | Penempatan Siswa | Tabel siswa diterima: dropdown pilih kelas, tombol simpan. Validasi kapasitas kelas | 6 jam | ✅ Selesai |
| S7-04 | Batch Assignment | Tombol "Simpan Semua Penempatan". State → `enrolled` untuk setiap yang di-assign | 4 jam | ✅ Selesai |
| S7-05 | State → enrolled | Transisi final state machine. Guard: hanya dari state `accepted`, kelas harus dipilih | 2 jam | ✅ Selesai |
| S7-06 | Verifikasi Pembayaran Polish | Review & polish UI halaman verifikasi bayar. Modal tolak dengan alasan. Riwayat verifikasi | 4 jam | ✅ Selesai |
| S7-07 | Dashboard Updates | Update semua dashboard (super admin, unit, ortu) agar merefleksikan data enrolled | 3 jam | ✅ Selesai |
| S7-08 | Integrasi Review | Full walkthrough seluruh flow: register → login → pilih unit → bayar → form → berkas → IMC → verifikasi → observasi → hasil → kelas | 4 jam | ✅ Selesai |
| S7-09 | Bug Fixes Sprint 1-6 | Buffer waktu untuk perbaikan bug dari sprint sebelumnya | 6 jam | ✅ Selesai |

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

| ID | Task | Detail | Estimasi | Status |
|----|------|--------|----------|--------|
| **Minggu 1: Testing & Polish** ||||
| S8-01 | E2E Test Suite Lengkap | Playwright: 5 user journey utama (ortu, admin unit, super admin, tim ppdb, observer) | 8 jam | ✅ Selesai |
| S8-02 | Accessibility Audit | Keyboard navigation, screen reader, color contrast, ARIA labels pada semua halaman kritis | 6 jam | ✅ Selesai |
| S8-03 | Responsive Testing | Test di viewport: 375px (mobile), 768px (tablet), 1024px (desktop), 1440px (wide) | 4 jam | ✅ Selesai |
| S8-04 | Performance Optimization | Lighthouse audit, lazy loading, image optimization, bundle analysis, query optimization | 6 jam | ✅ Selesai |
| S8-05 | Error Handling & Edge Cases | Error boundaries, empty states, loading skeletons, 404/500 pages, timeout handling | 6 jam | ✅ Selesai |
| S8-06 | Security Hardening | Validasi ulang semua input (Zod), CSRF protection, header keamanan (CSP, HSTS), sanitize uploads | 4 jam | ✅ Selesai |
| S8-07 | UI Polish | Micro-animations, hover states, transition smoothing, konsistensi spacing & typography | 4 jam | ✅ Selesai |
| **Minggu 2: Deployment** ||||
| S8-08 | Vercel Deployment Setup | Setup Vercel project, koneksi repositori GitHub, environment variables production | 4 jam | ✅ Selesai |
| S8-09 | Supabase Production Setup | Setup project Supabase prod, auth settings, email templates, connection pooling | 4 jam | ✅ Selesai |
| S8-10 | Cloudinary Integration | Konfigurasi Cloudinary production bucket & signed upload settings | 2 jam | ✅ Selesai |
| S8-11 | Database Migration Prod | `npx prisma migrate deploy` di production. Seed data unit pendidikan real | 3 jam | ✅ Selesai |
| S8-12 | CI/CD Pipeline Final | Vercel auto-deployment. Branch `main` → Preview, `release/*` → Production | 4 jam | ✅ Selesai |
| S8-13 | Monitoring & Logging | Setup Vercel Analytics & Supabase logs monitoring | 3 jam | ✅ Selesai |
| S8-14 | User Acceptance Testing | Demo ke stakeholder yayasan. Collect feedback. Quick-fix critical issues | 6 jam | ✅ Selesai |
| S8-15 | Dokumentasi Deployment | README update, runbook operasional, panduan admin | 3 jam | ✅ Selesai |

### Definition of Done
- [x] Semua E2E test pass (5 user journey)
- [x] Lighthouse score: Performance ≥ 80, Accessibility ≥ 90
- [x] Aplikasi live di Vercel dengan HTTPS
- [x] Zero critical/high severity bug
- [x] UAT sign-off dari stakeholder

---

## Phase 2 — Modul Akademik (Sprint 9 - 21) [COMPLETE]

Fokus utama meliputi pendaftaran ulang, manajemen mapel, input nilai (harian, ATS, AAS), ekstrakurikuler, absensi, pembayaran SPP bulanan, dan rapor LHBS.

---

## Sprint 9 — Skema Database & Daftar Ulang Siswa
**Durasi:** 2 minggu
**Goal:** Transisi siswa dari PPDB ke Modul Akademik dan persiapan fondasi data.

### Backlog
| ID | Task | Detail | Estimasi | Status |
|----|------|--------|----------|--------|
| S9-01 | Skema Database Akademik | Pembuatan model Prisma (Subject, Grade, Attendance, dll) | 8 jam | ✅ Selesai |
| S9-02 | Formulir Daftar Ulang | Halaman portal ortu untuk daftar ulang tahun ajaran baru | 6 jam | ✅ Selesai |
| S9-03 | Server Action Daftar Ulang | Pemrosesan `StudentEnrollment` ke tahun ajaran baru | 4 jam | ✅ Selesai |
| S9-04 | Batch Upload CSV | Fitur upload data SSO Pegawai via Admin | 6 jam | ✅ Selesai |

### Definition of Done
- [x] Skema database berhasil di-push ke Supabase
- [x] Orang tua dapat melakukan konfirmasi daftar ulang siswa
- [x] Admin dapat mengunggah CSV data pegawai (SSO) secara batch
- [x] Tervalidasi TypeScript & bebas error

---

## Sprint 10 — Manajemen Mapel & Penugasan Guru
**Durasi:** 2 minggu
**Goal:** Kesiapan struktur mata pelajaran dan siapa pengajarnya per kelas.

### Backlog
| ID | Task | Detail | Estimasi | Status |
|----|------|--------|----------|--------|
| S10-01 | CRUD Mata Pelajaran | Form untuk kode, nama, level mata pelajaran di Unit Dashboard | 6 jam | ✅ Selesai |
| S10-02 | Penugasan Wali Kelas | UI & logika penugasan (assign) guru sebagai wali kelas | 4 jam | ✅ Selesai |
| S10-03 | Penugasan Guru Mapel | UI & logika menugaskan guru mapel ke kelas tertentu | 6 jam | ✅ Selesai |
| S10-04 | Validasi & RBAC Akademik| Zod validator & otorisasi khusus UserRole.admin_unit | 4 jam | ✅ Selesai |

### Definition of Done
- [x] Admin unit dapat melihat, menambah, mengubah mapel
- [x] Admin unit dapat menugaskan guru ke suatu kelas & mapel
- [x] Admin unit dapat mengatur wali kelas per kelas
- [x] Type-checking Typescript sukses

---

## Sprint 11 — Input Nilai & Absensi
**Durasi:** 2 minggu
**Goal:** Guru mapel dapat mengelola data presensi dan capaian nilai siswa.

### Backlog
| ID | Task | Detail | Estimasi | Status |
|----|------|--------|----------|--------|
| S11-01 | Input Absensi Harian | UI dan fungsi guru mencatat kehadiran siswa per pertemuan | 6 jam | ✅ Selesai |
| S11-02 | Input Nilai Harian & Ujian | UI dan fungsi batch guru menyimpan nilai (UH, Kuis) | 6 jam | ✅ Selesai |
| S11-03 | Input Nilai ATS & AAS | UI input Asesmen Tengah & Akhir Semester | 4 jam | ✅ Selesai |
| S11-04 | Validasi Transaksional | Proteksi upsert batch nilai dengan Prisma Transaction | 4 jam | ✅ Selesai |

### Definition of Done
- [x] Guru mapel dapat mencatat absensi siswa (Hadir, Sakit, Izin, Alpa) per kelas
- [x] Guru mapel dapat menyimpan nilai akademik siswa per komponen secara batch
- [x] Data konsisten tersimpan ke tabel `grades` dan `attendances`
- [x] Validasi Zod dan Type-checking Typescript sukses

---

---

## Sprint 12 — Jurnal Pembelajaran & Perencanaan (Prota/Promes/RPP)
**Durasi:** 2 minggu
**Goal:** Guru mapel dapat menyusun rencana ajar dan mengisi jurnal mengajar harian, serta mendownloadnya dalam bentuk PDF.

### Backlog
| ID | Task | Detail | Estimasi | Status |
|----|------|--------|----------|--------|
| S12-01 | Jurnal Harian (AKD-14) | Guru mencatat materi diajarkan, metode, dan refleksi per pertemuan | 6 jam | ✅ Selesai |
| S12-02 | Input Perencanaan (AKD-15,16,17) | Form untuk guru menyusun Prota, Promes, dan RPP | 8 jam | ✅ Selesai |
| S12-03 | PDF Perencanaan (AKD-18) | Generate dokumen ber-kop surat untuk Prota, Promes, dan RPP | 6 jam | ✅ Selesai |

---

## Sprint 13 — Jadwal Pelajaran
**Durasi:** 2 minggu
**Goal:** Wali Kelas atau Admin Unit menyusun jadwal kelas harian.

### Backlog
| ID | Task | Detail | Estimasi | Status |
|----|------|--------|----------|--------|
| S13-01 | Input Jadwal (AKD-19) | UI interaktif penyusunan jadwal mapel per hari per jam | 8 jam | ✅ Selesai |
| S13-02 | Tampilan Jadwal Ortu (AKD-20) | Menampilkan jadwal kelas di dashboard orang tua | 4 jam | ✅ Selesai |
| S13-03 | Cetak Jadwal PDF (AKD-21) | Download jadwal pelajaran ber-kop surat resmi unit | 4 jam | ✅ Selesai |

---

## Sprint 14 — Manajemen Ekstrakurikuler (Setup)
**Durasi:** 2 minggu
**Goal:** Admin Unit membuat program ekstrakurikuler dan orang tua dapat mendaftarkan siswanya.

### Backlog
| ID | Task | Detail | Estimasi | Status |
|----|------|--------|----------|--------|
| S14-01 | CRUD Ekskul & Pembina (AKD-22,23) | Admin menambah ekskul dan menugaskan pembina | 6 jam | ✅ Selesai |
| S14-02 | Pendaftaran Siswa (AKD-27) | Orang tua mendaftarkan anak ke ekskul (jika belum wajib) | 4 jam | ✅ Selesai |
| S14-03 | Input Jadwal & Jurnal (AKD-24,25) | Pembina ekskul mengatur jadwal kegiatan dan jurnal pertemuan | 6 jam | ✅ Selesai |

---

## Sprint 15 — Ekstrakurikuler (Nilai & Output)
**Durasi:** 2 minggu
**Goal:** Penyelesaian modul ekskul termasuk input nilai dan akses jadwal oleh ortu.

### Backlog
| ID | Task | Detail | Estimasi | Status |
|----|------|--------|----------|--------|
| S15-01 | Input Nilai Ekskul (AKD-26) | Pembina menginput nilai/predikat (A/B/C/dll) | 6 jam | ✅ Selesai |
| S15-02 | Tampilan Jadwal Ekskul Ortu (AKD-28) | Orang tua melihat jadwal ekskul anak | 4 jam | ✅ Selesai |
| S15-03 | Cetak Jadwal PDF (AKD-29) | Download jadwal ekstrakurikuler dalam bentuk PDF ber-kop surat | 4 jam | ✅ Selesai |

---

## Sprint 16 — Pembayaran SPP
**Durasi:** 2 minggu
**Goal:** Manajemen tagihan bulanan SPP yang transparan bagi sekolah dan orang tua.

### Backlog
| ID | Task | Detail | Estimasi | Status |
|----|------|--------|----------|--------|
| S16-01 | Tampilan Tagihan (AKD-34) | Orang tua melihat tagihan berjalan per bulan | 6 jam | ✅ Selesai |
| S16-02 | Upload & Verifikasi Bukti (AKD-35,36) | Ortu unggah bukti transfer, Admin Unit memverifikasi (manual) | 8 jam | ✅ Selesai |
| S16-03 | Riwayat Transaksi (AKD-37) | Orang tua dan Admin melihat seluruh riwayat SPP | 4 jam | ✅ Selesai |

---

## Sprint 17 — LHBS Tengah Semester & Kalkulasi Akhir
**Durasi:** 2 minggu
**Goal:** Persiapan rapor dan agregasi kalkulasi LHBS.

### Backlog
| ID | Task | Detail | Estimasi | Status |
|----|------|--------|----------|--------|
| S17-01 | Kalkulasi Nilai (AKD-12) | Sistem otomatis rata-rata berbobot (harian, ujian, ATS, AAS) | 6 jam | ✅ Selesai |
| S17-02 | Generate LHBS Tengah Smt (AKD-30) | Wali kelas generate rapor ATS (menggabungkan harian & ATS) | 6 jam | ✅ Selesai |
| S17-03 | Tampilan LHBS Digital (AKD-32 pt 1)| Orang tua melihat rapor tengah semester di portal | 4 jam | ✅ Selesai |

---

## Sprint 18 — LHBS Akhir Semester
**Durasi:** 2 minggu
**Goal:** Wali kelas dapat mengunci dan mencetak PDF Rapor LHBS Akhir Semester lengkap.

### Backlog
| ID | Task | Detail | Estimasi | Status |
|----|------|--------|----------|--------|
| S18-01 | Generate LHBS Akhir Smt (AKD-31) | Menggabungkan seluruh nilai mapel dan ekskul | 6 jam | ✅ Selesai |
| S18-02 | Cetak LHBS PDF (AKD-33) | Generate PDF rapor ber-kop resmi yayasan dan unit (react-pdf) | 8 jam | ✅ Selesai |
| S18-03 | Tampilan LHBS Digital (AKD-32 pt 2)| Orang tua mendownload PDF Rapor di portal | 4 jam | ✅ Selesai |

---

## Sprint 19 — Keputusan Kenaikan Kelas
**Durasi:** 2 minggu
**Goal:** Pemrosesan akhir tahun ajaran (naik/tinggal kelas).

### Backlog
| ID | Task | Detail | Estimasi | Status |
|----|------|--------|----------|--------|
| S19-01 | Tentukan Kenaikan (AKD-39) | Wali kelas menandai siswa yang naik atau tinggal kelas | 6 jam | ✅ Selesai |
| S19-02 | Tampilan Keputusan (AKD-40) | Orang tua dapat melihat status kenaikan anak | 4 jam | ✅ Selesai |
| S19-03 | Cetak SK PDF (AKD-41) | Download Surat Keputusan kenaikan kelas ber-kop surat | 4 jam | ✅ Selesai |

---

## Sprint 20 — Finalisasi Portal Orang Tua
**Durasi:** 2 minggu
**Goal:** Penggabungan semua fitur di dashboard orang tua agar intuitif dan komprehensif.

### Backlog
| ID | Task | Detail | Estimasi | Status |
|----|------|--------|----------|--------|
| S20-01 | Dashboard Integrasi | Menyatukan navigasi nilai, absen, jadwal, ekskul, dan SPP bagi ortu | 8 jam | ✅ Selesai |
| S20-02 | UI Polish Portal Ortu | Memperbaiki UX/UI Mobile-responsive untuk diakses HP | 6 jam | ✅ Selesai |
| S20-03 | Edge Cases Dashboard | Penanganan state ketika data belum siap atau tahun ajaran belum mulai | 4 jam | ✅ Selesai |

---

## Sprint 21 — QA, Testing, & Deployment Modul Akademik
**Durasi:** 2 minggu
**Goal:** Rilis produksi stabil untuk Modul Akademik.

### Backlog
| ID | Task | Detail | Estimasi | Status |
|----|------|--------|----------|--------|
| S21-01 | E2E Testing Akademik | Playwright test untuk flow Modul Akademik utama | 8 jam | ✅ Selesai |
| S21-02 | Performance & Security Audit| Menguji kebocoran akses data antar unit pendidikan (RBAC Test) | 6 jam | ✅ Selesai |
| S21-03 | Deployment | Migrasi DB, Vercel update, UAT final Modul Akademik dengan Stakeholder | 6 jam | ✅ Selesai |

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

- **Modul Phase 3** (Manajemen Karyawan) sedang dalam pengembangan. Modul berikutnya (Surat Menyurat, Payroll, Rekrutmen) akan direncanakan setelah Phase 3 go-live.
- **SSO Integration** dengan WordPress & Moodle disiapkan di arsitektur tapi implementasinya masuk iterasi berikutnya.
- Sprint plan ini bersifat *living document* — akan di-update setiap Sprint Review berdasarkan velocity aktual tim.

---

## Phase 3 — Modul Manajemen Karyawan & Absensi (Sprint 22 - 36) [IN DEVELOPMENT]

**Fokus Utama:** Manajemen data karyawan, presensi berbasis koordinat (GPS), manajemen kelompok pembinaan (UPA/Liqo), serta cuti.

---

## Sprint 22 — Skema Database Modul Karyawan & Departemen
**Durasi:** 2 minggu
**Goal:** Persiapan arsitektur database untuk Modul Manajemen Karyawan, Departemen, dan Absensi.

### Backlog
| ID | Task | Detail | Estimasi | Status |
|----|------|--------|----------|--------|
| S22-01 | Setup Skema DB Karyawan | Tabel `departments`, `department_admins`, `holidays` | 6 jam | ✅ Selesai |
| S22-02 | Setup Skema DB GPS | Tabel `gps_attendance_config`, `gps_attendances` | 4 jam | ✅ Selesai |
| S22-03 | Migrasi Prisma Modul Karyawan | Generate dan push migration Prisma ke Supabase | 4 jam | ✅ Selesai |

---

## Sprint 23 — Manajemen Departemen & Unit Kerja
**Durasi:** 2 minggu
**Goal:** Super Admin dapat membuat departemen dan mengatur admin bidang.

### Backlog
| ID | Task | Detail | Estimasi | Status |
|----|------|--------|----------|--------|
| S23-01 | CRUD Departemen / Bidang | Halaman untuk Super Admin membuat dan mengelola bidang | 6 jam | ✅ Selesai |
| S23-02 | Assign Admin Bidang | Fitur assign user sebagai Admin Bidang | 4 jam | ✅ Selesai |
| S23-03 | Assign Staf ke Unit/Bidang | Fitur Admin Kepegawaian untuk menempatkan staf | 8 jam | ✅ Selesai |

---

## Sprint 24 — Setup GPS Absensi & Jadwal Libur
**Durasi:** 2 minggu
**Goal:** Admin Unit dapat mengatur parameter absensi dan tanggal merah.

### Backlog
| ID | Task | Detail | Estimasi | Status |
|----|------|--------|----------|--------|
| S24-01 | Konfigurasi GPS Absensi | Admin Unit set latitude, longitude, dan radius per unit | 6 jam | ✅ Selesai |
| S24-02 | Manajemen Hari Libur | Admin Unit/Kepegawaian menentukan hari libur nasional | 6 jam | ✅ Selesai |
| S24-03 | API Validasi Lokasi | Server action untuk menghitung jarak coordinate vs radius | 6 jam | ✅ Selesai |

---

## Sprint 25 — Fitur Absensi Karyawan
**Durasi:** 2 minggu
**Goal:** Karyawan dan guru dapat melakukan check-in dan check-out.

### Backlog
| ID | Task | Detail | Estimasi | Status |
|----|------|--------|----------|--------|
| S25-01 | UI Absensi Karyawan | Halaman di dashboard staf untuk tombol absen masuk/pulang | 8 jam | ✅ Selesai |
| S25-02 | Tracking Keterlambatan | Logika penentuan status (Hadir, Terlambat, dll) dari waktu absen | 4 jam | ✅ Selesai |
| S25-03 | Riwayat Absensi Personal | Halaman karyawan melihat rekapan absennya sendiri | 4 jam | ✅ Selesai |

---

## Sprint 26 — Setup Pembinaan UPA/Liqo
**Durasi:** 2 minggu
**Goal:** Admin BPI dapat membentuk kelompok Liqo dan assign Murobbi.

### Backlog
| ID | Task | Detail | Estimasi | Status |
|----|------|--------|----------|--------|
| S26-01 | CRUD Kelompok UPA/Liqo | Form Admin BPI menambah nama kelompok mentoring | 6 jam | ✅ Selesai |
| S26-02 | Assign Murobbi | Assign guru/ustadz sebagai Murobbi di suatu kelompok | 4 jam | ✅ Selesai |
| S26-03 | Manajemen Anggota Liqo | Admin BPI memasukkan staf/guru ke kelompok Liqo | 6 jam | ✅ Selesai |

---

## Sprint 27 — Jadwal & Pengelolaan Liqo
**Durasi:** 2 minggu
**Goal:** Murobbi dapat menentukan jadwal dan mengelola anggota liqonya.

### Backlog
| ID | Task | Detail | Estimasi | Status |
|----|------|--------|----------|--------|
| S27-01 | Input Jadwal Liqo | Murobbi menentukan hari, jam, dan lokasi pekanan | 6 jam | ✅ Selesai |
| S27-02 | Tampilan Jadwal Anggota | Anggota dapat melihat jadwal mentoring di dashboard mereka | 4 jam | ✅ Selesai |
| S27-03 | Laporan Kegiatan Liqo | Murobbi mengisi materi / resume kegiatan tiap pertemuan | 4 jam | ✅ Selesai |

---

## Sprint 28 — Absensi UPA/Liqo
**Durasi:** 2 minggu
**Goal:** Pencatatan tingkat kehadiran karyawan pada kegiatan pembinaan.

### Backlog
| ID | Task | Detail | Estimasi | Status |
|----|------|--------|----------|--------|
| S28-01 | Input Absensi Liqo | UI bagi Murobbi untuk mengabsen anggota per pertemuan | 6 jam | ✅ Selesai |
| S28-02 | Tampilan Riwayat Kehadiran| Anggota bisa melihat rekap kehadiran liqonya sendiri | 4 jam | ✅ Selesai |
| S28-03 | Rekap Absensi Liqo Admin | Admin BPI melihat statistik kehadiran seluruh kelompok | 6 jam | ✅ Selesai |

---

## Sprint 29 — Pelaporan Wajibat
**Durasi:** 2 minggu
**Goal:** Pemantauan ibadah harian / mingguan (sholat, puasa, infaq) bagi anggota Liqo.

### Backlog
| ID | Task | Detail | Estimasi | Status |
|----|------|--------|----------|--------|
| S29-01 | Form Wajibat Anggota | Karyawan mengisi rekap ibadah harian (mandiri) | 8 jam | ✅ Selesai |
| S29-02 | Mutabaah Murobbi | UI bagi Murobbi untuk verifikasi / melihat laporan wajibat anggota | 6 jam | ✅ Selesai |
| S29-03 | Rekap Wajibat Admin BPI | Admin BPI dapat menarik laporan wajibat global | 4 jam | ✅ Selesai |

---

## Sprint 30 — Pengajuan Izin/Cuti Karyawan
**Durasi:** 2 minggu
**Goal:** Karyawan dapat mengajukan izin tidak masuk kerja atau cuti.

### Backlog
| ID | Task | Detail | Estimasi | Status |
|----|------|--------|----------|--------|
| S30-01 | Form Pengajuan Izin | UI Karyawan mengisi tipe (cuti/sakit/izin), tanggal, dan alasan | 6 jam | ✅ Selesai |
| S30-02 | Upload Bukti Sakit | Fungsionalitas unggah surat dokter ke Cloudinary | 4 jam | ✅ Selesai |
| S30-03 | Riwayat Pengajuan | Karyawan dapat memantau status (pending/approved/rejected) | 4 jam | ✅ Selesai |

---

## Sprint 31 — Approval Izin
**Durasi:** 2 minggu
**Goal:** Atasan / Admin Kepegawaian memproses pengajuan izin staf.

### Backlog
| ID | Task | Detail | Estimasi | Status |
|----|------|--------|----------|--------|
| S31-01 | Approval Workflow | UI bagi atasan menyetujui atau menolak izin | 8 jam | ✅ Selesai |
| S31-02 | Notifikasi Cuti | (Opsional) Pemberitahuan status izin di-update | 4 jam | ✅ Selesai |
| S31-03 | Kalkulasi Kuota Cuti | Pengurangan sisa jatah cuti karyawan apabila disetujui | 6 jam | ✅ Selesai |

---

## Sprint 32 — Program Kerja Bidang
**Durasi:** 2 minggu
**Goal:** Admin Bidang dapat menyusun program kerja (proker) tahunan/semesteran.

### Backlog
| ID | Task | Detail | Estimasi | Status |
|----|------|--------|----------|--------|
| S32-01 | Input Program Kerja | Form Admin Bidang mendefinisikan proker, target waktu | 8 jam | ✅ Selesai |
| S32-02 | Tracking Status Proker | Mengubah status proker (Belum mulai, Berjalan, Selesai) | 4 jam | ✅ Selesai |
| S32-03 | Pantauan Super Admin | Super admin bisa membaca seluruh proker dari tiap bidang | 4 jam | ✅ Selesai |

---

## Sprint 33 — Laporan Aktivitas Bidang
**Durasi:** 2 minggu
**Goal:** Penyampaian laporan progres secara berkala dari tiap departemen/bidang.

### Backlog
| ID | Task | Detail | Estimasi | Status |
|----|------|--------|----------|--------|
| S33-01 | Laporan Mingguan | Admin Bidang mengisi progress kegiatan per pekan | 6 jam | ✅ Selesai |
| S33-02 | Laporan Bulanan | Admin Bidang submit evaluasi dan pencapaian per bulan | 6 jam | ✅ Selesai |
| S33-03 | Rekap Aktivitas Super Admin| Dasbor pantauan laporan aktivitas dari seluruh departemen | 4 jam | ✅ Selesai |

---

## Sprint 34 — Dashboard Kepegawaian & Rekapitulasi
**Durasi:** 2 minggu
**Goal:** Agregasi data absensi, cuti, dan demografi karyawan.

### Backlog
| ID | Task | Detail | Estimasi | Status |
|----|------|--------|----------|--------|
| S34-01 | Rekap GPS Kehadiran | UI komprehensif untuk Admin Kepegawaian melihat harian/bulanan | 8 jam | ✅ Selesai |
| S34-02 | Dashboard Pegawai | Statistik komposisi pegawai per unit / per jabatan | 6 jam | ✅ Selesai |
| S34-03 | Export Rekap | Fungsi download rekapan absensi dalam bentuk CSV / Excel | 4 jam | ✅ Selesai |

---

## Sprint 35 — Dashboard Super Admin
**Durasi:** 2 minggu
**Goal:** Ringkasan utuh (bird-eye view) untuk Pimpinan/Super Admin atas kinerja pegawai.

### Backlog
| ID | Task | Detail | Estimasi | Status |
|----|------|--------|----------|--------|
| S35-01 | Bird-eye View BPI | Widget presentase pencapaian wajibat & kehadiran Liqo global | 6 jam | ✅ Selesai |
| S35-02 | Bird-eye View Departemen | Widget progres program kerja tiap departemen | 6 jam | ✅ Selesai |
| S35-03 | Bird-eye View Presensi | Widget tren kedisiplinan dan absensi harian per unit | 6 jam | ✅ Selesai |

---

## Sprint 36 — QA, Testing & Deployment (Phase 3)
**Durasi:** 2 minggu
**Goal:** Memastikan semua alur manajemen karyawan stabil dan aman.

### Backlog
| ID | Task | Detail | Estimasi | Status |
|----|------|--------|----------|--------|
| S36-01 | E2E Testing Modul Karyawan | Playwright: test flow GPS absensi, pengajuan cuti, liqo | 8 jam | ✅ Selesai |
| S36-02 | Role-based Security Audit | Validasi bahwa staf tak bisa lihat data departemen lain (RLS) | 6 jam | ✅ Selesai |
| S36-03 | Lokasi GPS Spoofing Test | Cek proteksi mock location (jika memungkinkan di FE) | 4 jam | ✅ Selesai |
| S36-04 | User Acceptance Testing | UAT internal dengan admin BPI, admin kepegawaian & yayasan | 6 jam | ✅ Selesai |
| S36-05 | Release ke Production | Push fitur ke live Vercel & sinkronisasi database prod | 4 jam | ✅ Selesai |
