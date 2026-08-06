# Product Requirements Document (PRD)

## SIM-Alfida — Sistem Informasi Manajemen Yayasan Alfida

| Atribut         | Detail                                      |
| --------------- | ------------------------------------------- |
| **Versi**       | 0.1.0-alpha                                 |
| **Tanggal**     | 6 Agustus 2026                              |
| **Penulis**     | Tim Pengembangan SIM-Alfida                 |
| **Status**      | Draft                                       |
| **Referensi**   | AGENTS.md · DESIGN.md · PROJECTS.md         |

---

## 1. Ringkasan Eksekutif

SIM-Alfida adalah platform Sistem Informasi Manajemen terpadu untuk Yayasan Alfida yang menaungi **2 TK, 3 SD, 1 SMP, 1 SMA, dan 1 Pesantren Alquran**. Sistem ini bertujuan meningkatkan efektivitas dan efisiensi pengelolaan yayasan melalui digitalisasi proses operasional mulai dari penerimaan siswa baru, akademik, surat-menyurat, manajemen karyawan, payroll, hingga rekrutmen.

Platform dibangun dengan arsitektur **multi-tenant** yang memungkinkan setiap unit pendidikan dikelola secara independen di bawah satu sistem terpusat.

---

## 2. Tujuan & Sasaran

### 2.1 Tujuan Bisnis

- Menyatukan seluruh proses administrasi yayasan dalam satu platform terintegrasi
- Mengurangi proses manual dan paper-based di seluruh unit pendidikan
- Meningkatkan transparansi dan akuntabilitas pengelolaan yayasan
- Mempermudah koordinasi antar unit di bawah naungan yayasan

### 2.2 Sasaran Terukur

| Sasaran                                             | Target           |
| --------------------------------------------------- | ---------------- |
| Digitalisasi proses PPDB seluruh unit                | 100%             |
| Pengurangan waktu proses administrasi PPDB           | ≥ 50%            |
| Adopsi sistem oleh seluruh unit pendidikan           | 8/8 unit         |
| Integrasi SSO dengan WordPress & Moodle              | Selesai di v1.0  |

---

## 3. Tech Stack

| Layer            | Teknologi                                         |
| ---------------- | ------------------------------------------------- |
| **Framework**    | Next.js (React · App Router)                      |
| **Database/Auth**| Supabase (PostgreSQL & Supabase Auth)             |
| **Bahasa**       | TypeScript (strict, no `any`)                     |
| **ORM**          | Prisma (Connection to Supabase Pooler)            |
| **Styling**      | Tailwind CSS                                      |
| **Icons**        | Material UI Icons (tanpa emoji)                   |
| **Validasi**     | Zod / Valibot                                     |
| **Unit Test**    | Vitest                                            |
| **E2E Test**     | Playwright                                        |
| **Formatter**    | Prettier                                          |
| **Linter**       | ESLint                                            |
| **Package Mgr**  | pnpm                                              |

---

## 4. Design System

Mengacu pada [DESIGN.md](file:///home/alchemista/projects/sim-alfida/DESIGN.md):

### 4.1 Palet Warna

| Token          | Hex       | Penggunaan                                    |
| -------------- | --------- | --------------------------------------------- |
| `primary`      | `#454545` | Teks utama                                    |
| `secondary`    | `#06bfa2` | Aksen sekunder, highlight                     |
| `tertiary`     | `#0f7f6d` | CTA utama, button primary                     |
| `neutral`      | `#F7F8F8` | Background halaman (warm neutral)             |
| `surface`      | `#FFFFFF` | Background card dan elevated surface          |
| `on-tertiary`  | `#F7F8F8` | Teks di atas tertiary                         |
| `border`       | `#E3E8E7` | Border dan divider                            |

### 4.2 Tipografi

| Token         | Font    | Size     | Weight |
| ------------- | ------- | -------- | ------ |
| `h1`          | Roboto  | 3rem     | 700    |
| `body-md`     | Inter   | 1rem     | 400    |
| `label-caps`  | Inter   | 0.75rem  | 600    |

### 4.3 Prinsip Desain

- Gunakan **tonal layering** dan subtle border, bukan drop shadow
- Tertiary color hanya untuk aksi highest-emphasis
- Maksimal 2 font family per layar
- Background default menggunakan warm neutral; pure white untuk card
- Hanya gunakan **Material UI Icons** (Google), dilarang menggunakan emoji untuk ikon UI

---

## 5. Arsitektur Multi-Tenant & Peran Pengguna

### 5.1 Hierarki Tenant

```
Yayasan Alfida (Root)
├── TK Islam Terpadu Auladuna 1
├── TK Islam Terpadu Auladuna 2
├── SD Islam Terpadu Iqra 1
├── SD Islam Terpadu Iqra 2
├── SD Islam Terpadu Iqra 3
├── SMP Islam Terpadu Iqra
├── SMA Islam Terpadu Iqra
└── Pesantren Quran Alfida
```

### 5.2 Definisi Peran (Roles)

| Peran                  | Akses                                                                                           |
| ---------------------- | ----------------------------------------------------------------------------------------------- |
| **Super Admin**        | Akses seluruh unit & modul. Membuat unit, assign admin unit, upload logo yayasan.               |
| **Admin Unit**         | Akses fitur khusus unitnya. Assign guru/karyawan homebase. Upload logo unit & TTD kepala sekolah. |
| **Guru / Karyawan**   | Akses modul manajemen karyawan dan absensi.                                                     |
| **Orang Tua / Wali**  | Akses portal PPDB: registrasi, pembayaran, pengisian formulir, unggah berkas, pilih jadwal.     |
| **Observer (PPDB)**    | Input hasil observasi calon siswa.                                                              |
| **Tim PPDB Unit**      | Verifikasi berkas, menentukan peserta lolos tahap observasi.                                    |

### 5.3 SSO (Single Sign-On)

- Satu akun untuk seluruh modul SIM-Alfida
- Integrasi dengan **WordPress** (Website Yayasan) dan **Moodle** (LMS Yayasan)
- Mendukung multi-role per pengguna (satu user bisa memiliki peran di lebih dari satu unit)

---

## 6. Modul Sistem

### 6.1 Modul PPDB (Penerimaan Peserta Didik Baru)

**Prioritas:** 🔴 Tinggi (modul pertama yang dikembangkan)

#### 6.1.1 Deskripsi

Modul untuk mengelola seluruh proses penerimaan peserta didik baru secara digital, dari pendaftaran hingga penempatan kelas.

#### 6.1.2 Alur Kerja (User Flow)

```mermaid
flowchart TD
    A["Super Admin membuat unit & assign admin"] --> B["Admin unit aktifkan tahun ajaran baru"]
    B --> C["Admin unit tentukan kuota pendaftar"]
    C --> D["Orang tua registrasi akun"]
    D --> E1["Orang tua login"]
    E1 --> E2["Sistem tampilkan halaman pilih modul (Dashboard Modul)"]
    E2 --> E3["Orang tua pilih modul PPDB"]
    E3 --> E["Orang tua pilih unit pendidikan"]
    E --> F["Orang tua melakukan pembayaran pendaftaran"]
    F --> G["Admin verifikasi pembayaran"]
    G --> H["Orang tua isi formulir data siswa"]
    H --> I["Orang tua isi formulir data orang tua"]
    I --> J["Orang tua unggah berkas persyaratan"]
    J --> K["Orang tua download surat pengantar IMC"]
    K --> L["Orang tua unggah hasil pemeriksaan IMC"]
    L --> M["Tim PPDB verifikasi berkas"]
    M --> N["Admin atur jadwal & kuota observasi"]
    N --> O["Orang tua pilih jadwal observasi"]
    O --> P["Observer input hasil observasi"]
    P --> Q["Sistem menyusun peringkat otomatis"]
    Q --> R["Admin assign siswa ke kelas"]
    R --> S["Orang tua download surat keterangan lulus"]
    S --> T["Redirect ke modul akademik untuk daftar ulang"]
```

#### 6.1.3 Fitur Detail

##### A. Manajemen Unit & Tahun Ajaran (Admin)

| ID       | Fitur                                      | Aktor         |
| -------- | ------------------------------------------ | ------------- |
| PPDB-01  | Membuat unit pendidikan baru               | Super Admin   |
| PPDB-02  | Assign admin unit                          | Super Admin   |
| PPDB-03  | Upload logo yayasan                        | Super Admin   |
| PPDB-04  | Upload logo unit                           | Admin Unit    |
| PPDB-05  | Upload tanda tangan kepala sekolah         | Admin Unit    |
| PPDB-06  | Mengaktifkan tahun ajaran baru             | Admin Unit    |
| PPDB-07  | Menentukan kuota pendaftar per tahun ajaran | Admin Unit   |

##### B. Registrasi & Pemilihan Unit (Orang Tua)

| ID       | Fitur                                              | Detail                                                     |
| -------- | -------------------------------------------------- | ---------------------------------------------------------- |
| PPDB-08  | Registrasi akun orang tua                          | Nama Lengkap, Email, No. WA/HP, Password, Konfirmasi Password |
| PPDB-09  | Login ke portal sistem                             | Email + Password, dilanjutkan dengan pemilihan modul sesuai role |
| PPDB-10  | Melihat daftar unit pendidikan (Modul PPDB)        | Menampilkan info kuota (tersedia / penuh)                  |
| PPDB-11  | Memilih unit pendidikan untuk pendaftaran           | Validasi kuota belum penuh                                 |

##### C. Pembayaran Pendaftaran

| ID       | Fitur                                              | Detail                                                     |
| -------- | -------------------------------------------------- | ---------------------------------------------------------- |
| PPDB-12  | Informasi rekening pembayaran                      | Menampilkan rekening tujuan transfer yayasan               |
| PPDB-13  | Upload bukti pembayaran                            | Orang tua mengunggah bukti transfer                        |
| PPDB-14  | Verifikasi pembayaran                              | Admin memverifikasi dan update status (v1: manual)         |
| PPDB-15  | *(Future)* Integrasi Payment Gateway               | DOKU / Midtrans / Duitku / Xendit — verifikasi otomatis   |

##### D. Pengisian Formulir

| ID       | Fitur                          | Detail Field                                                                                               |
| -------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| PPDB-16  | Formulir data calon siswa      | Nama Lengkap, Panggilan, Jenis Kelamin, Agama (Islam), Tempat Lahir, Tanggal Lahir (DDMMYYYY), NISN, Jumlah Saudara, Alamat Lengkap, Alat Transportasi, Hobi, Cita-cita |
| PPDB-17  | Formulir data ayah             | Nama lengkap, Pekerjaan, Penghasilan, dan Alamat                                                           |
| PPDB-18  | Formulir data ibu              | Nama lengkap, Pekerjaan, Penghasilan, dan Alamat                                                           |

##### E. Unggah Berkas

| ID       | Berkas                                     | Format        |
| -------- | ------------------------------------------ | ------------- |
| PPDB-19  | Pasfoto calon siswa                        | JPG / PNG     |
| PPDB-20  | Surat keterangan sekolah sebelumnya        | PDF / JPG     |
| PPDB-21  | Akte kelahiran                             | PDF / JPG     |
| PPDB-22  | Kartu keluarga                             | PDF / JPG     |
| PPDB-23  | KTP ayah                                   | PDF / JPG     |
| PPDB-24  | KTP ibu                                    | PDF / JPG     |

##### F. Surat Pengantar Pemeriksaan Kesehatan

| ID       | Fitur                                              | Detail                                                     |
| -------- | -------------------------------------------------- | ---------------------------------------------------------- |
| PPDB-25  | Generate surat pengantar ke Klinik IMC             | Menggunakan kop surat (logo unit + logo yayasan)           |
| PPDB-26  | Tanda tangan digital kepala sekolah                | Menggunakan TTD yang di-upload admin unit                   |
| PPDB-27  | Download surat pengantar (PDF)                     | Orang tua bisa unduh dan cetak                              |
| PPDB-28  | Upload hasil pemeriksaan IMC                       | Orang tua mengunggah hasil dari klinik                     |

##### G. Seleksi & Observasi

| ID       | Fitur                                              | Aktor         |
| -------- | -------------------------------------------------- | ------------- |
| PPDB-29  | Verifikasi kelengkapan berkas                      | Tim PPDB Unit |
| PPDB-30  | Menentukan peserta lolos ke tahap observasi        | Tim PPDB Unit |
| PPDB-31  | Mengatur jadwal observasi (tanggal & kuota harian) | Admin Unit    |
| PPDB-32  | Memilih jadwal observasi                           | Orang Tua     |
| PPDB-33  | Input hasil/skor observasi                         | Observer       |
| PPDB-34  | Pemeringkatan otomatis berdasarkan skor            | Sistem        |
| PPDB-35  | Penentuan siswa diterima berdasarkan kuota         | Sistem        |

##### H. Pasca Seleksi

| ID       | Fitur                                              | Aktor         |
| -------- | -------------------------------------------------- | ---------------------------------------------------------- |
| PPDB-36  | Assign siswa baru ke kelas paralel                 | Admin Unit    |
| PPDB-37  | Download/print surat keterangan lulus               | Orang Tua     |
| PPDB-38  | Redirect ke modul akademik (daftar ulang)          | Sistem        |

---

### 6.2 Modul Akademik

**Prioritas:** 🟡 Sedang
**Status:** TBA — Detail akan didefinisikan pada iterasi berikutnya.

---

### 6.3 Modul Surat Menyurat

**Prioritas:** 🟡 Sedang
**Status:** TBA — Detail akan didefinisikan pada iterasi berikutnya.

> [!NOTE]
> Modul ini akan memanfaatkan aset logo yayasan, logo unit, dan tanda tangan kepala sekolah yang diupload pada modul PPDB.

---

### 6.4 Modul Manajemen Karyawan & Absensi

**Prioritas:** 🟡 Sedang
**Status:** TBA — Detail akan didefinisikan pada iterasi berikutnya.

> [!NOTE]
> Guru dan karyawan memiliki akses langsung ke modul ini sesuai role-based access control.

---

### 6.5 Modul Payroll

**Prioritas:** 🟢 Rendah (tergantung modul karyawan)
**Status:** TBA — Detail akan didefinisikan pada iterasi berikutnya.

---

### 6.6 Modul Rekrutmen Tenaga Kerja Baru

**Prioritas:** 🟢 Rendah
**Status:** TBA — Detail akan didefinisikan pada iterasi berikutnya.

---

## 7. Kebutuhan Non-Fungsional

### 7.1 Keamanan

| Aspek                  | Ketentuan                                                                         |
| ---------------------- | --------------------------------------------------------------------------------- |
| **Autentikasi**        | SSO berbasis session/token. Setiap API route wajib cek auth & authorization server-side. |
| **Validasi Input**     | Semua input eksternal divalidasi dengan Zod/Valibot sebelum diproses.             |
| **Secrets Management** | Tidak ada API key, token, atau credential di source code. Gunakan `.env.local`.   |
| **File Upload**        | Validasi tipe file, ukuran maksimal, dan scan malware dasar.                      |
| **RBAC**               | Role-Based Access Control diterapkan pada setiap endpoint.                        |

### 7.2 Performa

| Metrik                          | Target         |
| ------------------------------- | -------------- |
| Time to First Byte (TTFB)      | ≤ 200ms        |
| Largest Contentful Paint (LCP)  | ≤ 2.5s         |
| First Input Delay (FID)         | ≤ 100ms        |
| Cumulative Layout Shift (CLS)   | ≤ 0.1          |

### 7.3 Aksesibilitas

- Automated a11y assertions pada halaman kritis
- Manual keyboard test sebelum merge UI changes
- Semantic HTML dan ARIA labels yang memadai
- Kontras warna memenuhi standar WCAG 2.1 AA

### 7.4 Responsivitas

- Mobile-first approach
- Breakpoint: mobile (< 640px) · tablet (640–1024px) · desktop (> 1024px)
- Semua fitur harus bisa diakses dari perangkat mobile

### 7.5 Internationalisasi

- Bahasa utama: **Bahasa Indonesia**
- Struktur siap untuk i18n di masa depan jika diperlukan

---

## 8. Integrasi Eksternal

| Sistem           | Tipe Integrasi | Status       | Keterangan                                 |
| ---------------- | -------------- | ------------ | ------------------------------------------ |
| WordPress        | SSO            | Planned v1.0 | Website Yayasan Alfida                     |
| Moodle           | SSO            | Planned v1.0 | LMS Yayasan Alfida                         |
| Payment Gateway  | API            | Future       | DOKU / Midtrans / Duitku / Xendit          |

---

## 9. Roadmap & Fase Pengembangan

### Fase 1 — Foundation & Modul PPDB

| Milestone                              | Target       |
| -------------------------------------- | ------------ |
| Setup project, auth, dan multi-tenant  | Sprint 1–2   |
| Manajemen unit & admin                 | Sprint 2–3   |
| Portal PPDB (registrasi → pembayaran)  | Sprint 3–5   |
| Formulir & upload berkas               | Sprint 5–6   |
| Generate surat pengantar (PDF)         | Sprint 6–7   |
| Seleksi & observasi                    | Sprint 7–8   |
| Penempatan kelas & surat kelulusan     | Sprint 8–9   |
| QA, testing, dan bugfix                | Sprint 9–10  |

### Fase 2 — Modul Akademik & Surat Menyurat

> Detail akan didefinisikan setelah Fase 1 selesai.

### Fase 3 — Modul Karyawan, Payroll & Rekrutmen

> Detail akan didefinisikan setelah Fase 2 selesai.

### Fase 4 — Integrasi Eksternal

> SSO WordPress, SSO Moodle, Payment Gateway.

---

## 10. Risiko & Mitigasi

| Risiko                                              | Dampak | Mitigasi                                                      |
| --------------------------------------------------- | ------ | ------------------------------------------------------------- |
| Adopsi rendah oleh admin unit                       | Tinggi | Pelatihan intensif, UX yang intuitif, dukungan teknis aktif   |
| Integrasi SSO dengan WordPress/Moodle kompleks      | Sedang | Riset teknis awal, implementasi di fase terpisah              |
| Keamanan data siswa dan orang tua                   | Tinggi | Enkripsi data sensitif, audit keamanan berkala, RBAC ketat    |
| Perubahan requirement dari unit-unit                 | Sedang | Arsitektur modular, sprint review rutin dengan stakeholder    |
| Ketergantungan pada payment gateway pihak ketiga     | Rendah | Fallback ke transfer manual, abstraksi layer pembayaran       |

---

## 11. Kriteria Penerimaan (Definition of Done)

Sebuah fitur dianggap selesai jika:

- [ ] Kode TypeScript tanpa penggunaan `any`
- [ ] Lulus ESLint tanpa error
- [ ] Unit test tersedia (happy path + minimal 1 edge case)
- [ ] E2E test untuk critical path
- [ ] Accessibility check lolos
- [ ] Responsive di mobile, tablet, dan desktop
- [ ] Code review dilakukan dan disetujui
- [ ] Dokumentasi diperbarui (jika diperlukan)
- [ ] `pnpm lint && pnpm test && pnpm build` berjalan tanpa error

---

## 12. Lampiran

### 12.1 Referensi Dokumen

- [AGENTS.md](file:///home/alchemista/projects/sim-alfida/AGENTS.md) — Konfigurasi stack & konvensi pengembangan
- [DESIGN.md](file:///home/alchemista/projects/sim-alfida/DESIGN.md) — Design system dan komponen visual
- [PROJECTS.md](file:///home/alchemista/projects/sim-alfida/PROJECTS.md) — Deskripsi project dan modul

### 12.2 Glosarium

| Istilah    | Definisi                                                     |
| ---------- | ------------------------------------------------------------ |
| **PPDB**   | Penerimaan Peserta Didik Baru                                |
| **SSO**    | Single Sign-On — satu akun untuk seluruh sistem              |
| **IMC**    | Iqra Medical Centre — klinik mitra untuk pemeriksaan siswa   |
| **NISN**   | Nomor Induk Siswa Nasional                                   |
| **LMS**    | Learning Management System                                   |
| **RBAC**   | Role-Based Access Control                                    |
