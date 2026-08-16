# Log Pekerjaan SIM-Alfida

---

**tanggal:** 16 Agustus 2026 (Sesi 2)
**progress:** 
- Menyelesaikan inisiatif **Sprint 8** (QA, Polish & Deployment Produksi).
- Menerapkan _Multi-stage Build_ pada `Dockerfile` untuk optimalisasi *image* Next.js, dan membungkusnya dalam konfigurasi `docker-compose.prod.yml`.
- Menambahkan konfigurasi *Reverse Proxy* dan _Security Headers_ menggunakan Nginx (`nginx/sim-alfida.conf`) serta menyesuaikan *next.config.ts*.
- Merancang fondasi CI/CD *Pipeline* lewat GitHub Actions (`.github/workflows/deploy.yml`) untuk _auto-deploy_ ke VPS.
- Melengkapi halaman ralat global (`error.tsx` dan `not-found.tsx`).
- Menuliskan panduan produksi untuk administrator di `docs/DEPLOYMENT.md`.
**commit message:** chore: finalize sprint 8 with dockerization, CI/CD, and production polish

**tanggal:** 16 Agustus 2026
**progress:** 
- Menyelesaikan fungsionalitas **Sprint 7** (Penempatan Kelas & Finalisasi).
- Membuat *Server Actions* untuk manajemen kelas (`classes.ts`) beserta antarmuka untuk menambah kelas dan memantau kapasitasnya (`class-management-client.tsx`).
- Membangun fitur *Class Assignment* (`class-assignment.ts`) bagi Admin Unit untuk memindahkan siswa berstatus `accepted` ke dalam rombongan kelas tertentu.
- Validasi transaksi basis data untuk memastikan batas kuota maksimal kelas tak terlampaui.
- *State machine* selesai ditutup dengan status mutlak `enrolled`.
**commit message:** feat: complete sprint 7 class management and final assignment flow

**tanggal:** 08 Agustus 2026 (Sesi 2)
**progress:** 
- Menyelesaikan seluruh fungsionalitas **Sprint 6** (Observasi & Seleksi).
- Membuat *Server Actions* untuk manajemen jadwal (`observation-schedule.ts`), *booking* oleh orang tua (`observation-booking.ts`), penginputan hasil uji (`observation-result.ts`), dan aksi persetujuan kelulusan (`acceptance.ts`).
- Mengimplementasikan sistem **Auto-Ranking** massal yang dipicu saat Observer menyimpan skor nilai tes pendaftar.
- Membuat rancangan cetak `@react-pdf/renderer` untuk **Surat Kelulusan** penerimaan siswa.
- Mengembangkan antarmuka (UI) manajemen jadwal & panel persetujuan hasil seleksi untuk *Admin Unit*, serta portal _dashboard_ khusus untuk guru penilai (*Observer*).
**commit message:** feat: complete sprint 6 observation scheduling, auto-ranking, and acceptance flow

**tanggal:** 08 Agustus 2026
**progress:** 
- Menyelesaikan seluruh fungsionalitas Sprint 5 (Alur Pendaftaran Bagian 2 untuk Orang Tua). 
- Mengimplementasikan unggah banyak berkas (KTP, KK, Akte, dll) yang terintegrasi dengan Cloudinary.
- Mengimplementasikan fitur pembuatan dokumen PDF _on-the-fly_ untuk Surat Pengantar Tes Medis (IMC) menggunakan `@react-pdf/renderer`.
- Menuntaskan UI dasbor verifikasi berkas untuk Tim PPDB yang mencakup *preview* (pratinjau) dokumen, serta fungsi "Loloskan" atau "Tolak" dokumen.
- Melakukan pemisahan arsitektur *Multi-Schema* pada PostgreSQL Prisma, dengan menaruh data spesifik proyek di schema `sim`, dan identitas _user_ di schema `shared`. 
- Menambahkan _Trigger_ fungsi SQL untuk menjaga sinkronisasi otomatis antara Supabase Auth (`auth.users`) dan tabel profil pengguna lokal (`shared.users`).
**commit message:** feat: complete sprint 5 PPDB flow, PDF generation, and multi-schema refactoring

---
