**tanggal:** 29 Agustus 2026
**progress:**
- Menginvestigasi tantangan komputasi pada arsitektur monolith Next.js, dan berhasil memigrasikannya secara utuh ke arsitektur **Turborepo Monorepo** (Next.js + NestJS).
- Menyelesaikan inisiatif **Sprint 37** (Inisialisasi Monorepo): Mengatur `turbo.json`, `pnpm-workspace.yaml`, dan mengekstrak kode menjadi 4 ruang lingkup independen (`@sim/web`, `@sim/api`, `@sim/database`, `@sim/shared`).
- Menyelesaikan inisiatif **Sprint 38** (Modul NestJS): Mengerahkan *Autonomous Subagents* untuk mereplika logika Server Actions (PPDB, Akademik, HR) menjadi struktur *Controller* dan *Service* di NestJS lengkap dengan perlindungan otorisasi dan `ZodValidationPipe`.
- Menyelesaikan inisiatif **Sprint 39** (Penyatuan BFF): Membangun utilitas proksi (`apiFetch`) di Next.js yang secara aman meneruskan *token session* JWT dari Supabase *cookies* ke _header_ NestJS API. *Server Actions* lama disederhanakan hanya untuk memicu pemanggilan API dan menjalankan `revalidatePath()`.
- Melengkapi rancangan rilis dengan membuat `docs/DEPLOYMENT.md` khusus arsitektur terpisah (menuju Vercel, Railway/Render) dengan hasil akhir pengecekan kompilasi 100% *type-safe* tanpa satupun galat.
**commit message:** feat: complete phase 4 migration to turborepo, nestjs backend, and bff proxy integration

---

# Log Pekerjaan SIM-Alfida

---

**tanggal:** 26 Agustus 2026
**progress:**
- Mengatasi _bug_ 404 pada navigasi menu Admin Unit (Akademik) dengan menyelaraskan kembali _URL sidebar_ (Mata Pelajaran, Kelas, Ekstrakurikuler) terhadap struktur _folder routes_ Next.js yang sebenarnya.
- Mengatasi 245 peringatan _error_ tipe TypeScript bawaan yang mengakibatkan `TypeError: Cannot read properties of undefined` dengan merombak struktur impor `@prisma/client` menjadi kustom `@/generated/client` secara global (massal) pada 100+ fail sumber.
- Melakukan ekspansi skema _database_ (Prisma) pada _enum_ `SubjectLevel` dengan menyisipkan opsi `level_0` (TK) dan `level_13` (Pesantren) untuk mengakomodasi seluruh spektrum lembaga pendidikan Yayasan Alfida, beserta sinkronisasinya pada antarmuka manajemen mata pelajaran.
- Memisahkan arsitektur pengelolaan Tahun Ajaran: menciptakan laman mandiri `/unit/academic-years` khusus untuk modul akademik (*existing cohorts*) agar tidak lagi bergantungan pada form pengaktifan PPDB.
- Memperketat visibilitas hierarki kepegawaian: Admin Unit kini hanya dapat melihat daftar staf milik unitnya pada _dashboard_ tabel, namun tetap diberikan akses global ke seluruh akun yayasan saat membuka _modal_ "Assign Staf/Guru".
- Menyiapkan integrasi ekosistem AI terotomasi (*Model Context Protocol* / MCP) untuk Vercel dan Supabase melalui sistem _plugin workspace_ lokal (`.agents/plugins`).
- Melakukan pembersihan dokumen desain arsitektur (PRD, TDD, Sprint Plan) dengan mencabut wacana integrasi SSO menuju WordPress dan Moodle demi berfokus pada MVP internal.
**commit message:** refactor: decouple academic years from ppdb, fix prisma client imports, expand subject levels for TK/Pesantren, and restrict staff visibility per unit

---

**tanggal:** 24 Agustus 2026
**progress:**
- Melakukan investigasi mendalam terhadap *bottleneck* performa Vercel Serverless akibat beban komputasi Node.js (CPU dan Memori).
- Memisahkan seluruh pembuatan *file* PDF (Surat Kelulusan, Rapor, RPP, Jadwal Kelas, IMC) dari API Routes Vercel ke sebuah **Supabase Edge Function** (`generate-pdf`) tersentralisasi menggunakan Deno dan `@react-pdf/renderer`.
- Menerapkan pendelegasian komputasi nilai **Raport (LHBS)** ke basis data dengan memindahkan ratusan baris logika JavaScript ke **PostgreSQL RPC** (`calculate_lhbs_grades`).
- Menghapus perulangan JS pada agregasi data ribuan catatan mutabaah BPI (Bina Pribadi Islam) dan menggantinya dengan kueri murni PostgreSQL (`COUNT(*) FILTER (WHERE...)`).
- Merombak total alur penyimpanan massal (*Batch Upsert*) seperti **Absensi Kelas**, **Input Nilai**, dan **Keputusan Kenaikan Kelas**; menyingkirkan Prisma `$transaction` *looping promises array* demi prosedur "INSERT ON CONFLICT" kilat di Database melalui *RPC batch functions* murni.
**commit message:** perf: extreme optimization offloading batch processing and PDF rendering to Supabase

---

**tanggal:** 23 Agustus 2026 (Sesi 3)
**progress:**
- Membangun fitur **Identitas Yayasan** di dasbor *Super Admin* yang memungkinkan manajemen pengaturan global seperti nama yayasan, detail rekening bank, serta fitur unggah logo dan tanda tangan pimpinan yayasan yang terintegrasi langsung dengan CDN *Cloudinary*.
- Menginvestigasi dan menyelesaikan *bug* hak akses _(role privilege)_ Murobbi; kini sistem secara otomatis menyuntikkan *role* `murobbi` pada *database* (Tabel `UserRoleAssignment`) sesaat setelah Super Admin menugaskan seorang pengguna sebagai pembimbing grup Liqo.
- Menambahkan kapabilitas penyimpanan **Tautan Grup WhatsApp** (`whatsapp_link`) di modul pengelolaan *LiqoGroup*, yang memungkinkan Murobbi menempelkan *invite link* mereka sehingga para peserta binaan bisa langsung mengaksesnya melalui tombol khusus di Dasbor Info Liqo Karyawan.
**commit message:** feat: add foundation settings module, fix murobbi assignment role, and integrate whatsapp group links

---

**tanggal:** 23 Agustus 2026 (Sesi 2)
**progress:**
- Memperbaiki tautan navigasi dasbor Guru dari `/teacher/dashboard` ke `/teacher/schedules` serta melengkapi *sidebar* dengan menu **Absensi Siswa**.
- Merestrukturisasi penamaan menu RPP menjadi **Prota, Promes & RPP** agar lebih deskriptif dan mencakup semua perangkat pembelajaran.
- Menerapkan arsitektur segregasi wewenang tingkat unit pada Modul SDM: Admin Unit kini hanya dapat memodifikasi koordinat GPS dan Kalender Libur untuk sekolah/unit miliknya sendiri.
- Mengatur level unit `non_pendidikan` dan peran *custom* `admin_unit_nondik` (khusus untuk staf struktural Yayasan/Lazis/Asrama) agar menu dan fitur akademik tersembunyi secara otomatis.
- Membuka akses menu **Rekap Absensi**, **Kelola Cuti/Izin**, dan **Distribusi Pegawai** kepada Admin Unit dengan filter data otomatis yang mengisolasi *output* hanya untuk staf bawahan mereka.
- Mengembangkan fitur pembuatan (pendaftaran) akun SSO *staff* baru (Guru/Karyawan) secara langsung dari antarmuka Distribusi Pegawai yang dapat dieksekusi tanpa memutuskan sesi *login* Admin yang sedang aktif.
**commit message:** feat: refactor unit admin segregation and enhance teacher navigation

---

**tanggal:** 23 Agustus 2026
**progress:**
- Menginvestigasi dan menyelesaikan anomali gagal kompilasi di server **Vercel** (`next/headers` digunakan di _Client Component_). Solusinya: menyuntikkan deklarasi `"use server";` ke seluruh fail _Server Actions_ Fase 3 (Dasbor HR, UPA/Liqo, Cuti, Proker).
- Menambahkan *hook* `"postinstall": "prisma generate"` ke `package.json` untuk memaksa Vercel melakukan regenerasi _Prisma Client_ guna menghindari *Type error* dari *cache*.
- Merombak total `prisma/seed.ts` untuk merepresentasikan hierarki *Kantor Pusat Yayasan* dan departemen nyata (Keuangan, Sarpras, Pendidikan) serta menangani entitas _double job_ seperti **Murobbi** (yang ditugaskan ke Guru).
- Mengembangkan skrip utilitas khusus (`scripts/import-sso.ts`) yang membaca *file* `data-sso-pegawai.xlsx`, memetakan *roles* dan *groups* otomatis, dan menyinkronkan 130+ akun ke pangkalan data relasional dan otentikasi *Supabase Auth*.
**commit message:** chore: fix vercel build issue with server actions and prisma cache, add SSO import script

---

**tanggal:** 19 Agustus 2026 (Sesi Akhir Phase 3)
**progress:**
- Menyelesaikan inisiatif **Sprint 22-36** secara menyeluruh (Modul Manajemen Karyawan & Absensi).
- Mengimplementasikan **Presensi GPS Karyawan** dengan dukungan kalkulasi jarak (Haversine formula), batasan radius per unit, serta jadwal efektif harian (Sprint 22-26).
- Membangun ekosistem **Bina Pribadi Islam (UPA/Liqo)** yang memfasilitasi penjadwalan mentoring, pencatatan mutaba'ah wajibat ibadah harian oleh anggota, hingga pantauan global oleh Admin BPI (Sprint 27-29).
- Mengembangkan **Pengajuan Cuti/Izin** berjenjang dengan integrasi potong otomatis *leaveQuota* berbasis *Prisma Transaction* saat cuti disetujui oleh Admin (Sprint 30-31).
- Menyediakan arsitektur **Program Kerja Bidang** dan rekam pelaporan (Activity Reports) berkala untuk seluruh departemen (Sprint 32-33).
- Membangun kumpulan **Dashboard Eksekutif**, memisahkan Dasbor Kepegawaian (HR) untuk agregasi demografi & rekap CSV absensi, serta Dasbor *Super Admin* (*Bird-Eye View*) yang merangkum keseluruhan indeks Liqo, ibadah harian, kinerja departemen, dan absensi lintas-yayasan secara asinkron tanpa memblokir peramban (Sprint 34-35).
- Mengeksekusi penutupan **Quality Assurance (Sprint 36)**, merampungkan *tech debt* (TSC `0 errors`), mematenkan pengujian *Playwright E2E*, dan menyusun pedoman rilis produksi (`PRODUCTION.md`).
**commit message:** feat: finalize phase 3 HR modul with dashboards, E2E tests, and zero type errors

---

**tanggal:** 16 Agustus 2026 (Sesi 4)
**progress:**
- Menyelesaikan inisiatif **Sprint 9** (Skema Database Akademik & Daftar Ulang Siswa).
- Mengimplementasikan alur pendaftaran ulang (Re-enrollment) bagi orang tua siswa ke tahun ajaran berikutnya, divalidasi dengan _Zod_.
- Membangun fitur **Batch Upload CSV/XLSX** untuk impor _SSO Pegawai_ menggunakan modul `xlsx` di _client-side_ yang memetakan kolom secara otomatis (termasuk konversi string akses peran ganda ke enum `UserRole`).
- Menyelesaikan inisiatif **Sprint 10** (Manajemen Mapel & Penugasan Guru).
- Mengembangkan *Server Actions* (`academic.ts`) dengan pengecekan Otorisasi unit, untuk CRUD Mata Pelajaran, serta penugasan (assign) guru sebagai **Wali Kelas** maupun **Guru Mata Pelajaran**.
- Menyelesaikan inisiatif **Sprint 11** (Input Nilai & Absensi).
- Membuat *Server Actions* untuk pengisian kehadiran harian secara massal (`submitBatchAttendance`) beserta UI pemilihan `AttendanceStatus` (Hadir, Sakit, Izin, Alpa).
- Mengembangkan antarmuka UI matriks untuk pengisian nilai siswa secara _batch_ yang tervalidasi menggunakan Zod dengan dukungan pembatasan skor 0-100.
- Menerapkan _Prisma Transactions_ untuk memastikan data nilai (harian, ujian, ATS, AAS) dan absensi per siswa di suatu kelas di-update secara konsisten.
**commit message:** feat: complete sprint 11 with batch attendance and grade inputs

---

**tanggal:** 16 Agustus 2026 (Sesi 3)
**progress:** 
- Merancang dan menambahkan kelengkapan dokumentasi untuk **Modul Akademik** ke dalam `docs/PRD.md` dan struktur teknis di `docs/TDD.md`.
- Memperbarui `docs/DB-SCHEMA.md` dengan menambahkan 18 tabel baru dan berbagai Tipe ENUM untuk menopang kebutuhan data operasional akademik (Mapel, Nilai, Jurnal, Ekskul, SPP, Rapor).
- Mengubah target arsitektur aplikasi dari VPS (Docker & Nginx) menjadi **Serverless** (Vercel, Supabase, Cloudinary). Imbasnya, direktori `nginx` beserta file-file Docker dihapus.
- Menyelaraskan seluruh lini masa _Sprint Plan_ sehingga Fase 1 (PPDB) resmi selesai di Sprint 8, lalu dilanjutkan Fase 2 (Modul Akademik) pada rentang Sprint 9 hingga Sprint 21 di dalam `docs/SPRINT-PLAN.md` dan `docs/PRD.md`.
**commit message:** docs: update academic module architecture, schema, sprint plan, and shift to serverless deployment

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
