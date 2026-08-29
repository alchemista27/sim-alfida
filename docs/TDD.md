# Technical Design Document (TDD)

## SIM-Alfida — Sistem Informasi Manajemen Yayasan Alfida

| Atribut         | Detail                                          |
| --------------- | ----------------------------------------------- |
| **Versi**       | 0.1.0-alpha                                     |
| **Tanggal**     | 6 Agustus 2026                                  |
| **Penulis**     | Tim Pengembangan SIM-Alfida                     |
| **Status**      | Fase 3 (Manajemen Karyawan) - Fase 1 & 2 Selesai|
| **Referensi**   | [PRD.md](file:///home/alchemista/projects/sim-alfida/docs/PRD.md) · [AGENTS.md](file:///home/alchemista/projects/sim-alfida/AGENTS.md) · [DESIGN.md](file:///home/alchemista/projects/sim-alfida/DESIGN.md) |

---

## 1. Arsitektur Sistem

### 1.1 Gambaran Umum

SIM-Alfida menggunakan arsitektur **Turborepo Monorepo** yang memisahkan Frontend (Next.js) dan Backend (NestJS) ke dalam workspace independen. Seluruh modul (PPDB, Akademik, Karyawan) diorganisir sebagai NestJS modules di backend, sementara Next.js bertanggung jawab murni untuk rendering UI.

```mermaid
graph TB
    subgraph Client["Client (Browser)"]
        RSC["React Components (SSR/CSR)"]
    end

    subgraph "apps/web (Next.js)"
        MW["Middleware (Auth Redirect)"]
        Pages["Pages & Layouts"]
        ClientFetch["HTTP Client (fetch/axios)"]
    end

    subgraph "apps/api (NestJS)"
        Guards["AuthGuard + RolesGuard"]
        Controllers["REST Controllers"]
        NestServices["Service Layer"]
        NestModules["Feature Modules (PPDB, Academic, Employee)"]
    end

    subgraph "packages/database"
        ORM["Prisma ORM"]
        DB[("PostgreSQL")]
    end

    subgraph External["External Services"]
        SupaAuth["Supabase Auth"]
        Storage["Cloudinary"]
        PG["Payment Gateway (Future)"]
    end

    Client --> MW
    MW --> Pages
    Pages --> ClientFetch
    ClientFetch -->|REST API calls| Guards
    Guards -->|Verify Supabase JWT| SupaAuth
    Guards --> Controllers
    Controllers --> NestServices
    NestServices --> NestModules
    NestModules --> ORM
    ORM --> DB
    NestServices --> Storage
```

### 1.2 Keputusan Arsitektur

| Keputusan                          | Pilihan              | Alasan                                                                                      |
| ---------------------------------- | -------------------- | ------------------------------------------------------------------------------------------- |
| Arsitektur                         | Turborepo Monorepo   | Pemisahan Frontend/Backend, deploy independen, hemat resource                               |
| Frontend                           | Next.js App Router   | SSR/SSG bawaan, UI rendering only, tidak mengakses database langsung                       |
| Backend                            | NestJS               | Dependency Injection, modular architecture, Guards, Interceptors, hemat memori              |
| ORM                                | Prisma               | Type-safe, Developer experience (DX) sangat baik, migrasi otomatis                         |
| Database                           | PostgreSQL           | Relasional, mendukung multi-tenant, open source                                             |
| Object Storage                     | S3-compatible (Cloudinary)| Untuk file upload (berkas PPDB, logo, TTD). Cloudinary untuk dev, S3 untuk prod                  |
| PDF Generation                     | `@react-pdf/renderer`| React-based, server-side rendering, sesuai dengan stack                                     |
| Validasi                           | Zod                  | Type inference TypeScript, composable schemas, standar di ekosistem Next.js                 |
| Auth                               | Supabase Auth (JWT)  | Lightweight, managed auth, SSR cookie integration, JWT verification di NestJS               |
| Multi-tenant                       | Shared DB + tenant_id| Sederhana, satu database, isolasi data via tenant column + RLS                              |

---

## 2. Struktur Direktori

```
sim-alfida/
├── apps/
│   ├── web/                      # Next.js Frontend
│   │   ├── src/
│   │   │   ├── app/              # Next.js App Router (Pages & Layouts)
│   │   │   │   ├── (auth)/       # Route group: halaman auth (login, register)
│   │   │   │   ├── (dashboard)/  # Route group: halaman terautentikasi
│   │   │   │   │   ├── modules/  # Dashboard Pilih Modul
│   │   │   │   │   ├── admin/    # Super admin pages
│   │   │   │   │   ├── unit/     # Admin unit pages
│   │   │   │   │   ├── ppdb/     # Portal PPDB (orang tua)
│   │   │   │   │   ├── academic/ # Modul Akademik
│   │   │   │   │   └── layout.tsx
│   │   │   │   ├── layout.tsx    # Root layout
│   │   │   │   └── page.tsx      # Landing page
│   │   │   ├── components/       # UI Components
│   │   │   │   ├── ui/           # Primitif (Button, Input, Card, etc.)
│   │   │   │   ├── layout/       # Shell, Sidebar, Header, etc.
│   │   │   │   └── features/     # Komponen domain-specific
│   │   │   ├── lib/              # Client-side utilities
│   │   │   │   ├── api.ts        # Centralized HTTP client wrapper untuk NestJS
│   │   │   │   ├── supabase/     # Supabase Auth client
│   │   │   │   └── utils.ts      # Helper functions
│   │   │   └── hooks/            # Custom React hooks
│   │   ├── public/               # Aset statis
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   └── package.json
│   └── api/                      # NestJS Backend
│       ├── src/
│       │   ├── modules/
│       │   │   ├── auth/         # AuthModule (Supabase JWT Guard)
│       │   │   ├── unit/         # UnitModule (CRUD unit pendidikan)
│       │   │   ├── ppdb/         # PPDBModule (seluruh alur PPDB)
│       │   │   ├── academic/     # AcademicModule (nilai, absensi, LHBS)
│       │   │   ├── employee/     # EmployeeModule (GPS, cuti, liqo)
│       │   │   ├── file/         # FileModule (Cloudinary upload)
│       │   │   └── pdf/          # PDFModule (react-pdf generation)
│       │   ├── common/           # Guards, Interceptors, Filters, Pipes
│       │   │   ├── guards/
│       │   │   │   ├── auth.guard.ts
│       │   │   │   └── roles.guard.ts
│       │   │   ├── interceptors/
│       │   │   └── filters/
│       │   ├── app.module.ts
│       │   └── main.ts
│       ├── test/                  # NestJS unit & integration tests
│       └── package.json
├── packages/
│   ├── database/                 # Prisma schema & client
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts
│   │   ├── src/
│   │   │   └── index.ts          # Re-export Prisma Client
│   │   └── package.json
│   └── shared/                   # Shared types, Zod schemas, utils
│       ├── src/
│       │   ├── types/
│       │   │   ├── auth.ts
│       │   │   ├── unit.ts
│       │   │   └── ppdb.ts
│       │   ├── validators/
│       │   │   ├── auth.ts
│       │   │   ├── ppdb.ts
│       │   │   └── academic.ts
│       │   └── utils.ts
│       └── package.json
├── tests/
│   └── e2e/                      # Playwright E2E tests
├── turbo.json                    # Turborepo pipeline configuration
├── docker-compose.yml            # PostgreSQL + NestJS + Next.js
├── package.json                  # Root workspace config
├── pnpm-workspace.yaml
├── docs/
│   ├── PRD.md
│   ├── TDD.md
│   └── SPRINT-PLAN.md
├── AGENTS.md
├── DESIGN.md
└── PROJECTS.md
```

---

## 3. Database Schema

### 3.1 Entity Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ USER_ROLES : has
    USERS ||--o{ REGISTRATIONS : creates
    UNITS ||--o{ USER_ROLES : scoped_to
    UNITS ||--o{ ACADEMIC_YEARS : has
    UNITS ||--o{ UNIT_SETTINGS : has
    ACADEMIC_YEARS ||--o{ REGISTRATIONS : accepts
    REGISTRATIONS ||--|| PAYMENTS : requires
    REGISTRATIONS ||--|| STUDENT_DATA : contains
    REGISTRATIONS ||--o{ PARENT_DATA : contains
    REGISTRATIONS ||--o{ DOCUMENTS : uploads
    REGISTRATIONS ||--|| MEDICAL_REFERRAL : generates
    REGISTRATIONS ||--o{ OBSERVATION_BOOKINGS : books
    OBSERVATION_SCHEDULES ||--o{ OBSERVATION_BOOKINGS : available_in
    OBSERVATION_BOOKINGS ||--o| OBSERVATION_RESULTS : produces
    REGISTRATIONS ||--o| CLASS_ASSIGNMENTS : assigned_to
    CLASSES ||--o{ CLASS_ASSIGNMENTS : receives

    USERS {
        uuid id PK
        string name
        string email UK
        string phone
        string password_hash
        timestamp created_at
        timestamp updated_at
    }

    UNITS {
        uuid id PK
        string name
        string slug UK
        enum level "tk | sd | smp | sma | pesantren"
        boolean is_active
        timestamp created_at
    }

    UNIT_SETTINGS {
        uuid id PK
        uuid unit_id FK
        string logo_url
        string principal_signature_url
        timestamp updated_at
    }

    USER_ROLES {
        uuid id PK
        uuid user_id FK
        uuid unit_id FK "nullable - null for super_admin"
        enum role "super_admin | admin_unit | guru | karyawan | orang_tua | observer | tim_ppdb | admin_kepegawaian | admin_bpi | admin_bidang | murobbi"
        timestamp created_at
    }

    ACADEMIC_YEARS {
        uuid id PK
        uuid unit_id FK
        string name "e.g. 2026/2027"
        date start_date
        date end_date
        boolean ppdb_active
        integer ppdb_quota
        integer ppdb_registered
        timestamp created_at
    }

    REGISTRATIONS {
        uuid id PK
        uuid user_id FK "orang tua"
        uuid academic_year_id FK
        uuid unit_id FK
        string registration_number UK
        enum status "pending_payment | payment_uploaded | payment_verified | form_filling | documents_uploaded | medical_pending | medical_uploaded | verification | observation_scheduled | observation_done | accepted | rejected | enrolled"
        timestamp created_at
        timestamp updated_at
    }

    PAYMENTS {
        uuid id PK
        uuid registration_id FK
        decimal amount
        string proof_url
        enum status "pending | uploaded | verified | rejected"
        uuid verified_by FK "nullable → users.id"
        timestamp verified_at
        timestamp created_at
    }

    STUDENT_DATA {
        uuid id PK
        uuid registration_id FK
        string full_name
        string nickname
        enum gender "male | female"
        string religion
        string birth_place
        date birth_date
        string nisn
        integer sibling_count
        text address
        string transportation
        string hobby
        string aspiration
        timestamp created_at
    }

    PARENT_DATA {
        uuid id PK
        uuid registration_id FK
        enum type "father | mother | guardian"
        string full_name
        string nik
        string birth_place
        date birth_date
        string education
        string occupation
        string phone
        string income_range
        text address
        timestamp created_at
    }

    DOCUMENTS {
        uuid id PK
        uuid registration_id FK
        enum doc_type "photo | school_certificate | birth_certificate | family_card | father_id | mother_id | medical_result"
        string file_url
        string file_name
        integer file_size
        string mime_type
        timestamp uploaded_at
    }

    MEDICAL_REFERRAL {
        uuid id PK
        uuid registration_id FK
        string pdf_url
        timestamp generated_at
    }

    OBSERVATION_SCHEDULES {
        uuid id PK
        uuid academic_year_id FK
        uuid unit_id FK
        date schedule_date
        integer daily_quota
        integer booked_count
        timestamp created_at
    }

    OBSERVATION_BOOKINGS {
        uuid id PK
        uuid registration_id FK
        uuid schedule_id FK
        timestamp booked_at
    }

    OBSERVATION_RESULTS {
        uuid id PK
        uuid booking_id FK
        uuid observer_id FK "→ users.id"
        decimal score
        text notes
        integer rank "computed"
        timestamp created_at
    }

    CLASSES {
        uuid id PK
        uuid unit_id FK
        uuid academic_year_id FK
        string name "e.g. 1A, 1B"
        integer capacity
        timestamp created_at
    }

    CLASS_ASSIGNMENTS {
        uuid id PK
        uuid registration_id FK
        uuid class_id FK
        timestamp assigned_at
    }

    FOUNDATION_SETTINGS {
        uuid id PK
        string foundation_name
        string logo_url
        string bank_name
        string bank_account_number
        string bank_account_holder
        timestamp updated_at
    }
```

### 3.2 ERD — Modul Akademik

```mermaid
erDiagram
    UNITS ||--o{ SUBJECTS : offers
    UNITS ||--o{ EXTRACURRICULARS : offers
    CLASSES ||--o{ CLASS_SCHEDULES : has
    CLASSES ||--|| HOMEROOM_ASSIGNMENTS : has_homeroom
    SUBJECTS ||--o{ TEACHER_ASSIGNMENTS : taught_by
    SUBJECTS ||--o{ CLASS_SCHEDULES : scheduled_in
    SUBJECTS ||--o{ GRADES : graded_in
    SUBJECTS ||--o{ ATTENDANCES : tracked_in
    SUBJECTS ||--o{ TEACHING_JOURNALS : logged_in
    SUBJECTS ||--o{ LESSON_PLANS : planned_in
    USERS ||--o{ TEACHER_ASSIGNMENTS : teaches
    USERS ||--o{ HOMEROOM_ASSIGNMENTS : is_homeroom
    USERS ||--o{ EXTRACURRICULAR_COACHES : coaches
    STUDENT_ENROLLMENTS ||--o{ GRADES : receives
    STUDENT_ENROLLMENTS ||--o{ ATTENDANCES : recorded
    STUDENT_ENROLLMENTS ||--o{ EXTRACURRICULAR_MEMBERS : joins
    STUDENT_ENROLLMENTS ||--o{ EXTRACURRICULAR_GRADES : graded
    STUDENT_ENROLLMENTS ||--o| PROMOTION_DECISIONS : decides
    STUDENT_ENROLLMENTS ||--o{ SPP_INVOICES : billed
    STUDENT_ENROLLMENTS ||--o{ LHBS_REPORTS : reported
    REGISTRATIONS ||--o| STUDENT_ENROLLMENTS : enrolls_as
    CLASSES ||--o{ STUDENT_ENROLLMENTS : contains
    EXTRACURRICULARS ||--o{ EXTRACURRICULAR_COACHES : coached_by
    EXTRACURRICULARS ||--o{ EXTRACURRICULAR_MEMBERS : joined_by
    EXTRACURRICULARS ||--o{ EXTRACURRICULAR_SCHEDULES : scheduled
    EXTRACURRICULARS ||--o{ EXTRACURRICULAR_JOURNALS : logged
    EXTRACURRICULARS ||--o{ EXTRACURRICULAR_GRADES : graded_in

    STUDENT_ENROLLMENTS {
        uuid id PK
        uuid registration_id FK "nullable — siswa baru dari PPDB"
        uuid class_id FK
        uuid academic_year_id FK
        uuid student_data_id FK
        uuid parent_id FK "users.id orang tua"
        enum status "active | re_enrolled | graduated | dropped"
        enum enrollment_type "new_ppdb | re_enrollment"
        timestamp created_at
    }

    SUBJECTS {
        uuid id PK
        uuid unit_id FK
        string code "e.g. MTK, IPA, BIG"
        string name "e.g. Matematika"
        enum level "1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | all"
        boolean is_active
        timestamp created_at
    }

    TEACHER_ASSIGNMENTS {
        uuid id PK
        uuid subject_id FK
        uuid teacher_id FK "users.id"
        uuid class_id FK
        uuid academic_year_id FK
        timestamp created_at
    }

    HOMEROOM_ASSIGNMENTS {
        uuid id PK
        uuid teacher_id FK "users.id"
        uuid class_id FK
        uuid academic_year_id FK
        timestamp created_at
    }

    GRADES {
        uuid id PK
        uuid enrollment_id FK
        uuid subject_id FK
        uuid teacher_id FK "users.id"
        uuid academic_year_id FK
        enum type "daily | exam | ats | aas"
        string label "e.g. UH-1, Tugas-3"
        decimal score "0–100"
        timestamp created_at
    }

    ATTENDANCES {
        uuid id PK
        uuid enrollment_id FK
        uuid subject_id FK
        uuid teacher_id FK
        date date
        enum status "present | sick | permitted | absent"
        text notes "nullable"
        timestamp created_at
    }

    TEACHING_JOURNALS {
        uuid id PK
        uuid subject_id FK
        uuid teacher_id FK
        uuid class_id FK
        date date
        text material
        text method
        text reflection "nullable"
        timestamp created_at
    }

    LESSON_PLANS {
        uuid id PK
        uuid subject_id FK
        uuid teacher_id FK
        uuid academic_year_id FK
        enum type "prota | promes | rpp"
        string title
        text content "JSON or rich text"
        string pdf_url "nullable — generated PDF"
        timestamp created_at
        timestamp updated_at
    }

    CLASS_SCHEDULES {
        uuid id PK
        uuid class_id FK
        uuid subject_id FK
        uuid teacher_id FK
        enum day "monday | tuesday | wednesday | thursday | friday | saturday"
        time start_time
        time end_time
        timestamp created_at
    }

    EXTRACURRICULARS {
        uuid id PK
        uuid unit_id FK
        uuid academic_year_id FK
        string name
        text description "nullable"
        integer quota
        boolean is_active
        timestamp created_at
    }

    EXTRACURRICULAR_COACHES {
        uuid id PK
        uuid extracurricular_id FK
        uuid coach_id FK "users.id"
        timestamp created_at
    }

    EXTRACURRICULAR_SCHEDULES {
        uuid id PK
        uuid extracurricular_id FK
        enum day "monday | tuesday | wednesday | thursday | friday | saturday"
        time start_time
        time end_time
        string location "nullable"
        timestamp created_at
    }

    EXTRACURRICULAR_MEMBERS {
        uuid id PK
        uuid extracurricular_id FK
        uuid enrollment_id FK
        timestamp joined_at
    }

    EXTRACURRICULAR_JOURNALS {
        uuid id PK
        uuid extracurricular_id FK
        uuid coach_id FK
        date date
        text material
        text participation_notes "nullable"
        timestamp created_at
    }

    EXTRACURRICULAR_GRADES {
        uuid id PK
        uuid extracurricular_id FK
        uuid enrollment_id FK
        uuid coach_id FK
        string predicate "e.g. A, B, C"
        text notes "nullable"
        timestamp created_at
    }

    SPP_INVOICES {
        uuid id PK
        uuid enrollment_id FK
        uuid academic_year_id FK
        integer month "1–12"
        integer year
        decimal amount
        string proof_url "nullable"
        enum status "unpaid | uploaded | verified | rejected"
        uuid verified_by FK "nullable → users.id"
        timestamp verified_at "nullable"
        timestamp created_at
    }

    LHBS_REPORTS {
        uuid id PK
        uuid enrollment_id FK
        uuid homeroom_teacher_id FK
        uuid academic_year_id FK
        enum semester "mid | final"
        jsonb grades_snapshot "snapshot of all subject grades"
        jsonb extracurricular_snapshot "snapshot of ekskul grades"
        jsonb attendance_summary "H/I/S/A counts"
        text homeroom_notes "nullable"
        string pdf_url "nullable"
        timestamp generated_at
    }

    PROMOTION_DECISIONS {
        uuid id PK
        uuid enrollment_id FK
        uuid homeroom_teacher_id FK
        enum decision "promoted | retained"
        text notes "nullable"
        string pdf_url "nullable"
        timestamp decided_at
    }
```

### 3.3 ERD — Modul Manajemen Karyawan

```mermaid
erDiagram
    USERS ||--o{ ATTENDANCE_GPS : logs
    USERS ||--o{ LEAVE_REQUESTS : submits
    USERS ||--o{ WORK_PROGRAMS : manages
    USERS ||--o{ WAJIBAT_REPORTS : reports
    DEPARTMENTS ||--o{ USERS : belongs_to
    LIQO_GROUPS ||--o{ USERS : members
    USERS ||--o{ LIQO_GROUPS : mentors

    DEPARTMENTS {
        uuid id PK
        string name
        string description
        timestamp created_at
    }

    LIQO_GROUPS {
        uuid id PK
        string name
        uuid murobbi_id FK "users.id"
        timestamp created_at
    }

    ATTENDANCE_GPS {
        uuid id PK
        uuid user_id FK
        date date
        time check_in
        time check_out
        decimal latitude
        decimal longitude
        boolean is_valid
        timestamp created_at
    }

    LEAVE_REQUESTS {
        uuid id PK
        uuid user_id FK
        enum type "cuti | sakit | izin"
        date start_date
        date end_date
        string reason
        enum status "pending | approved | rejected"
        timestamp created_at
    }

    WORK_PROGRAMS {
        uuid id PK
        uuid department_id FK
        uuid user_id FK
        string title
        text description
        enum type "weekly | monthly"
        enum status "planned | ongoing | completed"
        timestamp created_at
    }

    WAJIBAT_REPORTS {
        uuid id PK
        uuid user_id FK
        date date
        boolean sholat_wajib
        boolean puasa_kamis
        boolean infaq
        boolean baca_alquran
        boolean sholat_sunnah
        timestamp created_at
    }
```

### 3.4 Catatan Desain Database

- **UUID** sebagai primary key untuk semua tabel — menghindari enumerable ID dan aman untuk distributed systems
- **Multi-tenant via `unit_id`** — setiap row yang bersifat per-unit memiliki kolom `unit_id` sebagai foreign key
- **Soft delete** tidak digunakan di fase awal; jika diperlukan nanti, gunakan kolom `deleted_at`
- **Enum sebagai string** — tipe enum disimpan sebagai PostgreSQL native enum untuk type safety di database level
- **Timestamps** — semua tabel memiliki `created_at`; tabel yang bisa diupdate memiliki `updated_at`

---

## 4. Autentikasi & Otorisasi

### 4.1 Auth Flow

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant MW as Middleware
    participant NA as NextAuth
    participant DB as Database

    U->>MW: Request halaman
    MW->>NA: Cek session
    NA->>DB: Validasi session token
    DB-->>NA: User + Roles
    NA-->>MW: Session data (user, roles, unit_id)
    alt Authenticated & Authorized
        MW-->>U: Render halaman
    else Not authenticated
        MW-->>U: Redirect ke /login
    else Not authorized
        MW-->>U: 403 Forbidden
    end
```

### 4.2 Strategi Autentikasi

| Aspek              | Detail                                                                 |
| ------------------ | ---------------------------------------------------------------------- |
| **Library**        | NextAuth.js v5 (Auth.js)                                               |
| **Provider**       | Credentials (email + password) — fase awal                             |
| **Session**        | Database session (bukan JWT) — memudahkan invalidasi                   |
| **Password Hash**  | bcrypt dengan salt rounds ≥ 12                                         |
| **Rate Limiting**  | Max 5 login attempts per 15 menit per IP                               |

### 4.3 Middleware Authorization

```typescript
// Pseudocode middleware pattern
type RouteRule = {
  pattern: string;
  roles: Role[];
  requireUnitId?: boolean;
};

const ROUTE_RULES: RouteRule[] = [
  { pattern: "/admin/**",         roles: ["super_admin"] },
  { pattern: "/unit/:unitId/**",  roles: ["admin_unit", "tim_ppdb", "observer"], requireUnitId: true },
  { pattern: "/ppdb/**",          roles: ["orang_tua"] },
  { pattern: "/karyawan/**",      roles: ["guru", "karyawan"] },
];
```

### 4.4 RBAC Matrix — Modul PPDB

| Endpoint / Aksi                    | Super Admin | Admin Unit | Tim PPDB | Observer | Orang Tua |
| ----------------------------------- | :---------: | :--------: | :------: | :------: | :-------: |
| Buat unit baru                      | ✅          | ❌         | ❌       | ❌       | ❌        |
| Assign admin unit                   | ✅          | ❌         | ❌       | ❌       | ❌        |
| Upload logo yayasan                 | ✅          | ❌         | ❌       | ❌       | ❌        |
| Upload logo unit & TTD              | ✅          | ✅         | ❌       | ❌       | ❌        |
| Aktifkan tahun ajaran & kuota       | ❌          | ✅         | ❌       | ❌       | ❌        |
| Verifikasi pembayaran               | ❌          | ✅         | ❌       | ❌       | ❌        |
| Verifikasi berkas pendaftar         | ❌          | ❌         | ✅       | ❌       | ❌        |
| Atur jadwal observasi               | ❌          | ✅         | ❌       | ❌       | ❌        |
| Input hasil observasi               | ❌          | ❌         | ❌       | ✅       | ❌        |
| Assign siswa ke kelas               | ❌          | ✅         | ❌       | ❌       | ❌        |
| Registrasi akun & pilih unit        | ❌          | ❌         | ❌       | ❌       | ✅        |
| Upload bukti bayar & berkas         | ❌          | ❌         | ❌       | ❌       | ✅        |
| Isi formulir siswa & ortu           | ❌          | ❌         | ❌       | ❌       | ✅        |
| Download surat pengantar & kelulusan| ❌          | ❌         | ❌       | ❌       | ✅        |
| Pilih jadwal observasi              | ❌          | ❌         | ❌       | ❌       | ✅        |

### 4.5 RBAC Matrix — Modul Akademik

| Endpoint / Aksi                          | Admin Unit | Guru Mapel | Wali Kelas | Pembina Ekskul | Orang Tua |
| ---------------------------------------- | :--------: | :--------: | :--------: | :------------: | :-------: |
| Tambah / kelola mata pelajaran           | ✅         | ❌         | ❌         | ❌             | ❌        |
| Assign guru ke mata pelajaran            | ✅         | ❌         | ❌         | ❌             | ❌        |
| Assign wali kelas                        | ✅         | ❌         | ❌         | ❌             | ❌        |
| Tambah guru baru                         | ✅         | ❌         | ❌         | ❌             | ❌        |
| Tambah / kelola ekstrakurikuler          | ✅         | ❌         | ❌         | ❌             | ❌        |
| Assign pembina ekskul                    | ✅         | ❌         | ❌         | ❌             | ❌        |
| Verifikasi pembayaran SPP               | ✅         | ❌         | ❌         | ❌             | ❌        |
| Input nilai (harian, ujian, ATS, AAS)    | ❌         | ✅         | ❌         | ❌             | ❌        |
| Input absensi siswa                      | ❌         | ✅         | ❌         | ❌             | ❌        |
| Isi jurnal pembelajaran                  | ❌         | ✅         | ❌         | ❌             | ❌        |
| Input Prota / Promes / RPP              | ❌         | ✅         | ❌         | ❌             | ❌        |
| Input jadwal pelajaran                   | ✅         | ❌         | ✅         | ❌             | ❌        |
| Generate LHBS                            | ❌         | ❌         | ✅         | ❌             | ❌        |
| Tentukan kenaikan kelas                  | ❌         | ❌         | ✅         | ❌             | ❌        |
| Input jadwal ekskul                      | ❌         | ❌         | ❌         | ✅             | ❌        |
| Isi jurnal ekskul                        | ❌         | ❌         | ❌         | ✅             | ❌        |
| Input nilai ekskul                       | ❌         | ❌         | ❌         | ✅             | ❌        |
| Daftar ulang                             | ❌         | ❌         | ❌         | ❌             | ✅        |
| Bayar SPP & upload bukti                 | ❌         | ❌         | ❌         | ❌             | ✅        |
| Pilih ekskul untuk anak                  | ❌         | ❌         | ❌         | ❌             | ✅        |
| Lihat jadwal, LHBS, kenaikan kelas      | ❌         | ❌         | ❌         | ❌             | ✅        |
| Download PDF (jadwal, LHBS, keputusan)   | ❌         | ❌         | ✅         | ❌             | ✅        |

### 4.6 RBAC Matrix — Modul Manajemen Karyawan

| Endpoint / Aksi                          | Admin Kepegawaian | Admin BPI | Admin Bidang | Murobbi | Karyawan / Guru |
| ---------------------------------------- | :---------------: | :-------: | :----------: | :-----: | :-------------: |
| Tambah guru/karyawan baru                | ✅                | ❌        | ❌           | ❌      | ❌              |
| Kelola departemen & unit kerja           | ✅                | ❌        | ❌           | ❌      | ❌              |
| Assign Karyawan ke departemen / unit     | ✅                | ❌        | ✅           | ❌      | ❌              |
| Kelola grup UPA/Liqo                     | ❌                | ✅        | ❌           | ❌      | ❌              |
| Approval cuti/izin/sakit                 | ✅                | ❌        | ✅           | ❌      | ❌              |
| Review laporan wajibat                   | ❌                | ✅        | ❌           | ✅      | ❌              |
| Input absensi GPS                        | ❌                | ❌        | ❌           | ❌      | ✅              |
| Ajukan cuti/izin/sakit                   | ❌                | ❌        | ❌           | ❌      | ✅              |
| Input laporan program kerja mingguan     | ❌                | ❌        | ❌           | ❌      | ✅              |
| Input mutaba'ah wajibat                  | ❌                | ❌        | ❌           | ❌      | ✅              |

---

## 5. API Design

### 5.1 Konvensi

- **NestJS REST Controllers** sebagai primary pattern untuk seluruh operasi data (CRUD, mutasi, kalkulasi)
- **Next.js** tidak lagi berisi logika database. Semua request data dilakukan via HTTP ke NestJS API
- Semua input divalidasi dengan **Zod schema** atau **class-validator** di NestJS sebelum masuk ke service layer
- Response menggunakan pattern konsisten:

```typescript
// Success
type SuccessResponse<T> = {
  success: true;
  data: T;
};

// Error
type ErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>; // field-level validation errors
  };
};
```

### 5.2 Server Actions — Modul PPDB

| Action                           | File                           | Input Schema               | Keterangan                                  |
| -------------------------------- | ------------------------------ | -------------------------- | ------------------------------------------- |
| `createUnit`                     | `actions/unit.ts`              | `CreateUnitSchema`         | Super admin membuat unit baru               |
| `updateUnitSettings`             | `actions/unit.ts`              | `UpdateUnitSettingsSchema` | Upload logo unit, TTD                       |
| `activateAcademicYear`           | `actions/ppdb.ts`              | `AcademicYearSchema`       | Admin unit aktifkan tahun ajaran + kuota    |
| `registerParent`                 | `actions/auth.ts`              | `RegisterParentSchema`     | Registrasi akun orang tua                   |
| `selectUnit`                     | `actions/ppdb.ts`              | `SelectUnitSchema`         | Orang tua pilih unit pendaftaran            |
| `uploadPaymentProof`             | `actions/ppdb.ts`              | `PaymentProofSchema`       | Upload bukti transfer                       |
| `verifyPayment`                  | `actions/ppdb.ts`              | `VerifyPaymentSchema`      | Admin verifikasi pembayaran                 |
| `submitStudentForm`              | `actions/ppdb.ts`              | `StudentFormSchema`        | Isi data calon siswa                        |
| `submitParentForm`               | `actions/ppdb.ts`              | `ParentFormSchema`         | Isi data ayah / ibu / wali                  |
| `uploadDocument`                 | `actions/ppdb.ts`              | `UploadDocumentSchema`     | Unggah berkas persyaratan                   |
| `generateMedicalReferral`        | `actions/ppdb.ts`              | `MedicalReferralSchema`    | Generate surat pengantar IMC (PDF)          |
| `uploadMedicalResult`            | `actions/ppdb.ts`              | `UploadDocumentSchema`     | Upload hasil pemeriksaan                    |
| `verifyDocuments`                | `actions/ppdb.ts`              | `VerifyDocumentsSchema`    | Tim PPDB verifikasi berkas                  |
| `createObservationSchedule`      | `actions/ppdb.ts`              | `ObservationScheduleSchema`| Admin atur jadwal observasi                 |
| `bookObservation`                | `actions/ppdb.ts`              | `BookObservationSchema`    | Orang tua pilih jadwal                      |
| `submitObservationResult`        | `actions/ppdb.ts`              | `ObservationResultSchema`  | Observer input skor                         |
| `assignToClass`                  | `actions/ppdb.ts`              | `ClassAssignmentSchema`    | Admin assign siswa ke kelas                 |

### 5.3 Server Actions — Modul Akademik

| Action                              | File                             | Input Schema                    | Keterangan                                    |
| ----------------------------------- | -------------------------------- | ------------------------------- | --------------------------------------------- |
| `processReEnrollment`               | `actions/academic.ts`            | `ReEnrollmentSchema`            | Orang tua daftar ulang siswa                  |
| `createSubject`                     | `actions/academic.ts`            | `SubjectSchema`                 | Admin unit tambah mata pelajaran              |
| `assignTeacherToSubject`            | `actions/academic.ts`            | `TeacherAssignmentSchema`       | Admin assign guru ke mapel per kelas          |
| `assignHomeroom`                    | `actions/academic.ts`            | `HomeroomAssignmentSchema`      | Admin assign wali kelas                       |
| `submitGrade`                       | `actions/academic.ts`            | `GradeSchema`                   | Guru input nilai (daily/exam/ats/aas)         |
| `submitAttendance`                  | `actions/academic.ts`            | `AttendanceSchema`              | Guru input absensi per mapel per hari         |
| `submitTeachingJournal`             | `actions/academic.ts`            | `TeachingJournalSchema`         | Guru isi jurnal pembelajaran                  |
| `submitLessonPlan`                  | `actions/academic.ts`            | `LessonPlanSchema`              | Guru input Prota/Promes/RPP                   |
| `upsertClassSchedule`              | `actions/academic.ts`            | `ClassScheduleSchema`           | Wali kelas / admin input jadwal               |
| `createExtracurricular`             | `actions/academic.ts`            | `ExtracurricularSchema`         | Admin unit tambah ekskul                      |
| `assignCoach`                       | `actions/academic.ts`            | `CoachAssignmentSchema`         | Admin assign pembina ekskul                   |
| `upsertExtracurricularSchedule`     | `actions/academic.ts`            | `ExtraScheduleSchema`           | Pembina input jadwal ekskul                   |
| `joinExtracurricular`               | `actions/academic.ts`            | `JoinExtraSchema`               | Orang tua daftarkan anak ke ekskul            |
| `submitExtracurricularJournal`      | `actions/academic.ts`            | `ExtraJournalSchema`            | Pembina isi jurnal ekskul                     |
| `submitExtracurricularGrade`        | `actions/academic.ts`            | `ExtraGradeSchema`              | Pembina input nilai/predikat ekskul           |
| `uploadSppProof`                    | `actions/academic.ts`            | `SppProofSchema`                | Orang tua upload bukti bayar SPP              |
| `verifySppPayment`                  | `actions/academic.ts`            | `VerifySppSchema`               | Admin verifikasi SPP                          |
| `generateLhbs`                      | `actions/academic.ts`            | `GenerateLhbsSchema`            | Wali kelas generate rapor (mid/final)         |
| `decidePromotion`                   | `actions/academic.ts`            | `PromotionDecisionSchema`       | Wali kelas tentukan naik/tinggal kelas        |

### 5.4 API Route Handlers — Modul Manajemen Karyawan

Berbeda dengan modul lainnya yang mayoritas menggunakan Server Actions, modul Manajemen Karyawan menyediakan REST API routes terdedikasi untuk integrasi tertentu:

| Endpoint                  | Method | Keterangan                                  |
| ------------------------- | ------ | ------------------------------------------- |
| `/api/attendance/gps`     | POST   | Check-in/out absensi dengan koordinat GPS dan radius validation |
| `/api/departments`        | GET, POST, PUT, DELETE | CRUD Departemen (Bidang) |
| `/api/liqo`               | GET, POST, PUT, DELETE | Manajemen grup UPA/Liqo mentoring agama |
| `/api/leave-requests`     | GET, POST, PUT, DELETE | Pengajuan dan approval cuti, sakit, izin |
| `/api/work-programs`      | GET, POST, PUT, DELETE | Pelaporan program kerja mingguan/bulanan |
| `/api/wajibat`            | GET, POST, PUT | Pelaporan mutaba'ah amal yaumi (wajibat) |

### 5.5 Contoh Zod Schema

```typescript
// src/lib/validators/ppdb.ts

import { z } from "zod";

export const StudentFormSchema = z.object({
  registrationId: z.string().uuid(),
  fullName: z.string().min(3).max(100),
  nickname: z.string().min(1).max(50),
  gender: z.enum(["male", "female"]),
  religion: z.literal("Islam"),
  birthPlace: z.string().min(2).max(100),
  birthDate: z.coerce.date(),
  nisn: z.string().regex(/^\d{10}$/, "NISN harus 10 digit"),
  siblingCount: z.number().int().min(0).max(20),
  address: z.string().min(10).max(500),
  transportation: z.string().min(1).max(50),
  hobby: z.string().max(200).optional(),
  aspiration: z.string().max(200).optional(),
});

export const ParentFormSchema = z.object({
  registrationId: z.string().uuid(),
  type: z.enum(["father", "mother", "guardian"]),
  fullName: z.string().min(3).max(100),
  nik: z.string().regex(/^\d{16}$/, "NIK harus 16 digit"),
  birthPlace: z.string().min(2).max(100),
  birthDate: z.coerce.date(),
  education: z.string().min(1).max(50),
  occupation: z.string().min(1).max(100),
  phone: z.string().min(10).max(15),
  incomeRange: z.string().min(1),
  address: z.string().min(10).max(500),
});

export const UploadDocumentSchema = z.object({
  registrationId: z.string().uuid(),
  docType: z.enum([
    "photo",
    "school_certificate",
    "birth_certificate",
    "family_card",
    "father_id",
    "mother_id",
    "medical_result",
  ]),
  file: z.instanceof(File).refine(
    (f) => f.size <= 5 * 1024 * 1024,
    "Ukuran file maksimal 5MB"
  ),
});
```

---

## 6. File Upload & Storage

### 6.1 Strategi

| Aspek                | Detail                                                              |
| -------------------- | ------------------------------------------------------------------- |
| **Storage**          | S3-compatible (Cloudinary untuk dev, AWS S3 / Cloudflare R2 untuk prod)  |
| **Upload Method**    | Presigned URL — client upload langsung ke storage, server hanya generate URL |
| **Max File Size**    | 5 MB per file                                                       |
| **Allowed Types**    | `image/jpeg`, `image/png`, `application/pdf`                        |
| **Path Convention**  | `{unit_id}/{academic_year}/{registration_id}/{doc_type}/{filename}` |
| **Virus Scan**       | ClamAV scan sebelum file dipindahkan ke bucket permanen (future)    |

### 6.2 Upload Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant S as Server Action
    participant ST as Object Storage

    C->>S: Request presigned upload URL (doc_type, mime_type)
    S->>S: Validasi auth, role, file constraints
    S->>ST: Generate presigned PUT URL (expires 5 min)
    ST-->>S: Presigned URL
    S-->>C: Presigned URL + file key
    C->>ST: PUT file ke presigned URL
    ST-->>C: 200 OK
    C->>S: Confirm upload (file key)
    S->>S: Update database (documents table)
    S-->>C: Success
```

---

## 7. PDF Generation

### 7.1 Surat Pengantar Pemeriksaan Klinik IMC

| Komponen                | Sumber Data                                  |
| ----------------------- | -------------------------------------------- |
| Logo yayasan            | `foundation_settings.logo_url`               |
| Logo unit               | `unit_settings.logo_url`                     |
| Nama unit               | `units.name`                                 |
| Data calon siswa        | `student_data.*`                             |
| Tanggal surat           | Generated (current date)                     |
| Tanda tangan kepsek     | `unit_settings.principal_signature_url`      |

### 7.2 Surat Keterangan Kelulusan

| Komponen                | Sumber Data                                  |
| ----------------------- | -------------------------------------------- |
| Logo yayasan + unit     | `foundation_settings` + `unit_settings`      |
| Data siswa              | `student_data.*`                             |
| Nomor pendaftaran       | `registrations.registration_number`          |
| Kelas penempatan        | `classes.name` via `class_assignments`       |
| Tanda tangan kepsek     | `unit_settings.principal_signature_url`      |

### 7.3 Dokumen PDF — Modul Akademik

| Dokumen                  | Sumber Data Utama                                          | Kop Surat        |
| ------------------------ | ---------------------------------------------------------- | ---------------- |
| Program Tahunan (Prota)  | `lesson_plans` (type=prota)                                | Logo unit + yayasan |
| Program Semester (Promes)| `lesson_plans` (type=promes)                               | Logo unit + yayasan |
| RPP                      | `lesson_plans` (type=rpp)                                  | Logo unit + yayasan |
| Jadwal Pelajaran         | `class_schedules` + `subjects` + `teacher_assignments`     | Logo unit + yayasan |
| Jadwal Ekstrakurikuler   | `extracurricular_schedules` + `extracurriculars`           | Logo unit + yayasan |
| LHBS Tengah Semester     | `lhbs_reports` (semester=mid) — snapshot data              | Logo unit + yayasan |
| LHBS Akhir Semester      | `lhbs_reports` (semester=final) — snapshot data            | Logo unit + yayasan |
| Keputusan Kenaikan Kelas | `promotion_decisions` + `student_data`                     | Logo unit + yayasan |

### 7.4 Implementasi

```typescript
// Pseudocode — src/server/services/pdf-service.ts
import { renderToBuffer } from "@react-pdf/renderer";
import { MedicalReferralTemplate } from "@/components/pdf/medical-referral";

export async function generateMedicalReferralPDF(
  registration: Registration,
  unit: Unit,
  foundation: FoundationSettings
): Promise<Buffer> {
  const buffer = await renderToBuffer(
    <MedicalReferralTemplate
      student={registration.studentData}
      unit={unit}
      foundation={foundation}
    />
  );
  // Upload ke S3, simpan URL ke medical_referral table
  return buffer;
}
```

---

## 8. State Machine — Status Pendaftaran PPDB

Alur status pendaftaran dimodelkan sebagai finite state machine untuk memastikan transisi yang valid.

```mermaid
stateDiagram-v2
    [*] --> pending_payment : Orang tua pilih unit

    pending_payment --> payment_uploaded : Upload bukti bayar
    payment_uploaded --> payment_verified : Admin verifikasi ✅
    payment_uploaded --> pending_payment : Admin tolak ❌

    payment_verified --> form_filling : Otomatis
    form_filling --> documents_uploaded : Semua form & berkas lengkap

    documents_uploaded --> medical_pending : Download surat pengantar IMC
    medical_pending --> medical_uploaded : Upload hasil pemeriksaan

    medical_uploaded --> verification : Otomatis
    verification --> observation_scheduled : Tim PPDB loloskan ✅
    verification --> rejected : Tim PPDB tolak ❌

    observation_scheduled --> observation_done : Observer input skor

    observation_done --> accepted : Skor masuk kuota
    observation_done --> rejected : Skor di bawah kuota

    accepted --> enrolled : Admin assign ke kelas
    rejected --> [*]
    enrolled --> [*]
```

### 8.1 Transisi yang Diizinkan

| From                     | To                       | Trigger                          | Aktor       |
| ------------------------ | ------------------------ | -------------------------------- | ----------- |
| `pending_payment`        | `payment_uploaded`       | Upload bukti bayar               | Orang Tua   |
| `payment_uploaded`       | `payment_verified`       | Verifikasi OK                    | Admin Unit  |
| `payment_uploaded`       | `pending_payment`        | Verifikasi ditolak               | Admin Unit  |
| `payment_verified`       | `form_filling`           | Otomatis setelah verifikasi      | Sistem      |
| `form_filling`           | `documents_uploaded`     | Semua form & dokumen lengkap     | Orang Tua   |
| `documents_uploaded`     | `medical_pending`        | Surat pengantar di-generate      | Orang Tua   |
| `medical_pending`        | `medical_uploaded`       | Upload hasil pemeriksaan         | Orang Tua   |
| `medical_uploaded`       | `verification`           | Otomatis                         | Sistem      |
| `verification`           | `observation_scheduled`  | Tim PPDB loloskan                | Tim PPDB    |
| `verification`           | `rejected`               | Tim PPDB tolak                   | Tim PPDB    |
| `observation_scheduled`  | `observation_done`       | Observer input skor              | Observer    |
| `observation_done`       | `accepted`               | Skor di atas threshold           | Sistem      |
| `observation_done`       | `rejected`               | Skor di bawah threshold          | Sistem      |
| `accepted`               | `enrolled`               | Admin assign kelas               | Admin Unit  |

---

## 9. Halaman & Routing

### 9.1 Public & Base Protected Routes

| Path               | Halaman                     | Keterangan                           |
| ------------------ | --------------------------- | ------------------------------------ |
| `/`                | Landing page                | Informasi umum SIM-Alfida           |
| `/login`           | Login                       | Email + password                     |
| `/register`        | Registrasi orang tua        | Form pendaftaran akun                |
| `/modules`         | Dashboard Pilihan Modul     | Menampilkan modul yang diizinkan (Role-based)|

### 9.2 Protected Routes — Super Admin

| Path                          | Halaman                        |
| ----------------------------- | ------------------------------ |
| `/admin`                      | Dashboard super admin          |
| `/admin/units`                | Daftar & kelola unit           |
| `/admin/units/new`            | Buat unit baru                 |
| `/admin/units/[id]`           | Detail & settings unit         |
| `/admin/users`                | Kelola user & roles            |
| `/admin/settings`             | Settings yayasan (logo, bank)  |

### 9.3 Protected Routes — Admin Unit

| Path                                  | Halaman                              |
| ------------------------------------- | ------------------------------------ |
| `/unit/[unitId]`                      | Dashboard unit                       |
| `/unit/[unitId]/settings`             | Settings unit (logo, TTD)            |
| `/unit/[unitId]/ppdb`                 | Overview PPDB                        |
| `/unit/[unitId]/ppdb/academic-years`  | Kelola tahun ajaran & kuota          |
| `/unit/[unitId]/ppdb/registrations`   | Daftar pendaftaran                   |
| `/unit/[unitId]/ppdb/payments`        | Verifikasi pembayaran                |
| `/unit/[unitId]/ppdb/verification`    | Verifikasi berkas (Tim PPDB)         |
| `/unit/[unitId]/ppdb/observations`    | Jadwal & hasil observasi             |
| `/unit/[unitId]/ppdb/classes`         | Penempatan kelas                     |

### 9.4 Protected Routes — Orang Tua (Portal PPDB)

| Path                           | Halaman                                |
| ------------------------------ | -------------------------------------- |
| `/ppdb`                        | Dashboard orang tua                    |
| `/ppdb/select-unit`            | Pilih unit pendaftaran                 |
| `/ppdb/[regId]/payment`        | Pembayaran pendaftaran                 |
| `/ppdb/[regId]/form/student`   | Formulir data siswa                    |
| `/ppdb/[regId]/form/parents`   | Formulir data orang tua                |
| `/ppdb/[regId]/documents`      | Upload berkas                          |
| `/ppdb/[regId]/medical`        | Surat pengantar & hasil pemeriksaan    |
| `/ppdb/[regId]/observation`    | Pilih jadwal & status observasi        |
| `/ppdb/[regId]/result`         | Hasil seleksi & surat kelulusan        |

### 9.5 Protected Routes — Modul Akademik (Admin Unit)

| Path                                          | Halaman                                |
| --------------------------------------------- | -------------------------------------- |
| `/unit/[unitId]/academic`                      | Dashboard akademik unit                |
| `/unit/[unitId]/academic/subjects`             | Kelola mata pelajaran                  |
| `/unit/[unitId]/academic/teachers`             | Assign guru mapel & wali kelas         |
| `/unit/[unitId]/academic/extracurriculars`     | Kelola ekskul & assign pembina         |
| `/unit/[unitId]/academic/spp`                  | Verifikasi SPP                         |

### 9.6 Protected Routes — Guru Mata Pelajaran

| Path                                          | Halaman                                |
| --------------------------------------------- | -------------------------------------- |
| `/teacher`                                     | Dashboard guru                         |
| `/teacher/grades`                              | Input nilai (per kelas & mapel)        |
| `/teacher/attendance`                          | Input absensi siswa                    |
| `/teacher/journal`                             | Jurnal pembelajaran harian             |
| `/teacher/planning`                            | Prota / Promes / RPP                   |

### 9.7 Protected Routes — Wali Kelas

| Path                                          | Halaman                                |
| --------------------------------------------- | -------------------------------------- |
| `/homeroom`                                    | Dashboard wali kelas                   |
| `/homeroom/schedule`                           | Input jadwal pelajaran                 |
| `/homeroom/lhbs`                               | Generate & kelola LHBS                 |
| `/homeroom/promotion`                          | Kenaikan kelas                         |

### 9.8 Protected Routes — Pembina Ekstrakurikuler

| Path                                          | Halaman                                |
| --------------------------------------------- | -------------------------------------- |
| `/coach`                                       | Dashboard pembina ekskul               |
| `/coach/schedule`                              | Input jadwal ekskul                    |
| `/coach/journal`                               | Jurnal kegiatan ekskul                 |
| `/coach/grades`                                | Input nilai/predikat ekskul            |

### 9.9 Protected Routes — Orang Tua (Portal Akademik)

| Path                                          | Halaman                                |
| --------------------------------------------- | -------------------------------------- |
| `/academic`                                    | Dashboard akademik orang tua           |
| `/academic/re-enrollment`                      | Daftar ulang siswa                     |
| `/academic/spp`                                | Pembayaran SPP & riwayat               |
| `/academic/extracurricular`                    | Pilih ekskul untuk anak                |
| `/academic/schedule`                           | Lihat & cetak jadwal pelajaran         |
| `/academic/extracurricular-schedule`           | Lihat & cetak jadwal ekskul            |
| `/academic/lhbs`                               | Lihat & cetak LHBS                     |
| `/academic/promotion`                          | Lihat keputusan kenaikan kelas         |

---

## 10. Environment Variables

```bash
# .env.example

# ── App ──────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="SIM-Alfida"

# ── Database ─────────────────────────────────
DATABASE_URL=postgresql://user:password@localhost:5432/sim_alfida

# ── Auth ─────────────────────────────────────
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-a-secure-random-string

# ── Object Storage (Cloudinary) ───────────
CLOUDINARY_CLOUD_NAME=hb1ropwm
CLOUDINARY_API_KEY=219453755147514
CLOUDINARY_API_SECRET=QSQ-HbPN10B20hHzIz-sZ9LgJvo1

# ── Email (future) ──────────────────────────
# SMTP_HOST=
# SMTP_PORT=
# SMTP_USER=
# SMTP_PASSWORD=

# ── Payment Gateway (future) ────────────────
# PAYMENT_GATEWAY_KEY=
# PAYMENT_GATEWAY_SECRET=
# PAYMENT_GATEWAY_CALLBACK_URL=
```

---

## 11. Testing Strategy

### 11.1 Unit Tests (Vitest)

| Layer          | Target                                      | Contoh                                                |
| -------------- | ------------------------------------------- | ----------------------------------------------------- |
| Validators     | Zod schemas                                 | `StudentFormSchema.test.ts` — valid/invalid input     |
| Services       | Business logic                              | `ppdb-service.test.ts` — state transitions            |
| Utils          | Helper functions                            | `utils.test.ts` — formatting, calculations            |

### 11.2 E2E Tests (Playwright)

| Test Suite                    | Critical Path                                         |
| ----------------------------- | ----------------------------------------------------- |
| Auth flow                     | Register → Login → Redirect                           |
| PPDB registration             | Pilih unit → Bayar → Form → Upload → Submit           |
| Admin payment verification    | Login admin → Lihat payment → Verifikasi              |
| Observation flow              | Jadwal → Booking → Input skor → Peringkat             |
| Academic re-enrollment        | Login ortu → Daftar ulang → Konfirmasi                |
| Grade input                   | Login guru → Pilih kelas → Input nilai → Simpan       |
| LHBS generation               | Login wali kelas → Generate LHBS → Download PDF      |
| SPP payment                   | Login ortu → Lihat tagihan → Upload bukti → Verifikasi|
| Extracurricular flow          | Admin buat ekskul → Ortu daftar → Pembina input nilai |

### 11.3 Lokasi File Test

```
src/lib/validators/ppdb.test.ts          # co-located unit test
src/lib/validators/academic.test.ts      # co-located unit test
src/server/services/ppdb-service.test.ts  # co-located unit test
src/server/services/academic-service.test.ts # co-located unit test
tests/e2e/ppdb-registration.spec.ts       # E2E test
tests/e2e/admin-payment.spec.ts           # E2E test
tests/e2e/academic-grades.spec.ts         # E2E test
tests/e2e/academic-lhbs.spec.ts           # E2E test
tests/e2e/academic-spp.spec.ts            # E2E test
```

---

## 12. Deployment & Infrastructure

Proyek ini menggunakan arsitektur **Hybrid Monorepo** dengan pemisahan hosting Frontend dan Backend.

### 12.1 Environments & Layanan

| Komponen            | Layanan / Provider               | Deskripsi                                             |
| ------------------- | -------------------------------- | ----------------------------------------------------- |
| **Frontend (web)**  | Vercel (Free tier)               | Hosting Next.js — murni UI rendering, tanpa DB ops    |
| **Backend (api)**   | Render / Railway / Koyeb / VPS   | Hosting NestJS — persistent server, connection pool   |
| **Database**        | PostgreSQL (Docker / Supabase)   | Skema Prisma di-push via koneksi langsung             |
| **Authentication**  | Supabase Auth                    | Identity Provider — JWT token verification            |
| **Object Storage**  | Cloudinary                       | Penyimpanan media (logo, PDF, bukti bayar)            |

### 12.2 Arsitektur Infrastruktur

```mermaid
graph TB
    subgraph "Client Side"
        Browser["Web Browser"]
    end

    subgraph "Vercel (Free Tier)"
        NextApp["Next.js (UI Only)"]
    end

    subgraph "Render / Railway / VPS"
        NestApp["NestJS API Server"]
    end

    subgraph "Database"
        DB[("PostgreSQL (Docker / Supabase)")]
    end

    subgraph "External"
        Auth["Supabase Auth"]
        CDN["Cloudinary"]
    end

    Browser -->|HTTPS| NextApp
    NextApp -->|REST API| NestApp
    NestApp -->|Prisma| DB
    NestApp -->|Upload/Get| CDN
    NextApp -.->|Verify cookie| Auth
    NestApp -.->|Verify JWT| Auth
```

### 12.3 CI/CD Pipeline

```mermaid
flowchart LR
    A["Push to GitHub"] --> B["Turborepo Build"]
    B --> C["Lint + Type Check (all workspaces)"]
    C --> D["Prisma Generate"]
    D --> E{"Workspace?"}
    E -- apps/web --> F["Vercel Auto Deploy"]
    E -- apps/api --> G["Render/Railway Auto Deploy"]
```

---

## 13. Security Checklist

- [ ] Semua API route / Server Action memvalidasi auth + authorization
- [ ] Input divalidasi dengan Zod sebelum diproses
- [ ] Password di-hash dengan bcrypt (salt rounds ≥ 12)
- [ ] File upload divalidasi: tipe MIME, ukuran, ekstensi
- [ ] Presigned URL expire dalam 5 menit
- [ ] Rate limiting pada endpoint login dan registrasi
- [ ] CSRF protection via Next.js built-in
- [ ] HTTP-only secure cookies untuk session
- [ ] Environment variables tidak di-commit (`.env.local` di `.gitignore`)
- [ ] SQL injection dicegah via Drizzle parameterized queries
- [ ] XSS dicegah via React auto-escaping + CSP headers
- [ ] Tenant isolation: setiap query di-scope ke `unit_id` user

---

## 14. Referensi

| Dokumen                                                                    | Konten                                  |
| -------------------------------------------------------------------------- | --------------------------------------- |
| [PRD.md](file:///home/alchemista/projects/sim-alfida/docs/PRD.md)          | Product requirements & fitur detail     |
| [AGENTS.md](file:///home/alchemista/projects/sim-alfida/AGENTS.md)         | Stack, code style, konvensi development |
| [DESIGN.md](file:///home/alchemista/projects/sim-alfida/DESIGN.md)         | Design system, warna, tipografi         |
| [PROJECTS.md](file:///home/alchemista/projects/sim-alfida/PROJECTS.md)     | Deskripsi project & alur bisnis         |
