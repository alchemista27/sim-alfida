# Technical Design Document (TDD)

## SIM-Alfida — Sistem Informasi Manajemen Yayasan Alfida

| Atribut         | Detail                                          |
| --------------- | ----------------------------------------------- |
| **Versi**       | 0.1.0-alpha                                     |
| **Tanggal**     | 6 Agustus 2026                                  |
| **Penulis**     | Tim Pengembangan SIM-Alfida                     |
| **Status**      | Draft                                           |
| **Referensi**   | [PRD.md](file:///home/alchemista/projects/sim-alfida/docs/PRD.md) · [AGENTS.md](file:///home/alchemista/projects/sim-alfida/AGENTS.md) · [DESIGN.md](file:///home/alchemista/projects/sim-alfida/DESIGN.md) |

---

## 1. Arsitektur Sistem

### 1.1 Gambaran Umum

SIM-Alfida menggunakan arsitektur **monolitik modular** berbasis Next.js App Router. Seluruh modul (PPDB, Akademik, Surat Menyurat, dll.) hidup dalam satu codebase Next.js namun diorganisir sebagai feature modules yang independen.

```mermaid
graph TB
    subgraph Client["Client (Browser)"]
        RSC["React Server Components"]
        RCC["React Client Components"]
    end

    subgraph NextJS["Next.js App Router"]
        MW["Middleware (Auth + Tenant)"]
        API["API Route Handlers"]
        SC["Server Components"]
        SA["Server Actions"]
    end

    subgraph Services["Service Layer"]
        AuthSvc["Auth Service"]
        PPDBSvc["PPDB Service"]
        UnitSvc["Unit Service"]
        FileSvc["File Service"]
        PDFSvc["PDF Service"]
    end

    subgraph Data["Data Layer"]
        ORM["Prisma ORM"]
        DB[("PostgreSQL")]
        S3["Object Storage (S3/MinIO)"]
    end

    subgraph External["Integrasi Eksternal"]
        WP["WordPress (SSO)"]
        MDL["Moodle (SSO)"]
        PG["Payment Gateway"]
    end

    Client --> MW
    MW --> API
    MW --> SC
    SC --> SA
    SA --> Services
    API --> Services
    Services --> ORM
    ORM --> DB
    FileSvc --> S3
    PDFSvc --> S3
    AuthSvc --> WP
    AuthSvc --> MDL
    PPDBSvc --> PG
```

### 1.2 Keputusan Arsitektur

| Keputusan                          | Pilihan              | Alasan                                                                                      |
| ---------------------------------- | -------------------- | ------------------------------------------------------------------------------------------- |
| Arsitektur                         | Monolitik modular    | Tim kecil, satu domain bisnis, deploy sederhana                                             |
| Framework                          | Next.js App Router   | SSR/SSG bawaan, Server Components, Server Actions, API Routes terpadu                       |
| ORM                                | Prisma               | Type-safe, Developer experience (DX) sangat baik, migrasi otomatis, populer di Next.js      |
| Database                           | PostgreSQL           | Relasional, mendukung multi-tenant, open source                                             |
| Object Storage                     | S3-compatible (MinIO)| Untuk file upload (berkas PPDB, logo, TTD). MinIO untuk dev, S3 untuk prod                  |
| PDF Generation                     | `@react-pdf/renderer`| React-based, server-side rendering, sesuai dengan stack                                     |
| Validasi                           | Zod                  | Type inference TypeScript, composable schemas, standar di ekosistem Next.js                 |
| Auth                               | NextAuth.js (Auth.js)| Multi-provider, session management bawaan, mendukung SSO custom                             |
| Multi-tenant                       | Shared DB + tenant_id| Sederhana, satu database, isolasi data via tenant column + RLS                              |

---

## 2. Struktur Direktori

```
sim-alfida/
├── docs/                         # Dokumentasi project
│   ├── PRD.md
│   └── TDD.md
├── public/                       # Aset statis
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/               # Route group: halaman auth (login, register)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/          # Route group: halaman terautentikasi
│   │   │   ├── modules/          # Halaman Dashboard Pilih Modul
│   │   │   │   └── page.tsx
│   │   │   ├── admin/            # Super admin pages
│   │   │   │   ├── units/
│   │   │   │   └── users/
│   │   │   ├── unit/             # Admin unit pages
│   │   │   │   ├── settings/
│   │   │   │   └── ppdb/
│   │   │   ├── ppdb/             # Portal PPDB (orang tua)
│   │   │   │   ├── register/
│   │   │   │   ├── payment/
│   │   │   │   ├── form/
│   │   │   │   ├── documents/
│   │   │   │   ├── observation/
│   │   │   │   └── result/
│   │   │   └── layout.tsx
│   │   ├── api/                  # API Route Handlers
│   │   │   ├── auth/
│   │   │   ├── units/
│   │   │   ├── ppdb/
│   │   │   └── upload/
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Landing page
│   ├── components/               # Komponen UI reusable
│   │   ├── ui/                   # Primitif (Button, Input, Card, etc.)
│   │   ├── layout/               # Shell, Sidebar, Header, etc.
│   │   └── features/             # Komponen domain-specific
│   │       └── ppdb/
│   ├── lib/                      # Utility & konfigurasi
│   │   ├── auth.ts               # Konfigurasi NextAuth
│   │   ├── prisma.ts             # Instansiasi Prisma Client
│   │   ├── validators/           # Zod schemas
│   │   │   ├── auth.ts
│   │   │   ├── unit.ts
│   │   │   └── ppdb.ts
│   │   └── utils.ts              # Helper functions
│   ├── server/                   # Server-only code
│   │   ├── actions/              # Server Actions
│   │   │   ├── auth.ts
│   │   │   ├── unit.ts
│   │   │   └── ppdb.ts
│   │   └── services/             # Business logic layer
│   │       ├── auth-service.ts
│   │       ├── unit-service.ts
│   │       ├── ppdb-service.ts
│   │       ├── file-service.ts
│   │       └── pdf-service.ts
│   ├── hooks/                    # Custom React hooks
│   ├── types/                    # Shared TypeScript types
│   │   ├── auth.ts
│   │   ├── unit.ts
│   │   └── ppdb.ts
│   └── config/                   # App configuration
│       ├── site.ts
│       └── navigation.ts
├── tests/
│   └── e2e/                      # Playwright E2E tests
├── prisma/                       # Prisma ORM
│   ├── schema.prisma             # Skema Prisma
│   ├── migrations/               # Prisma migrations
│   └── seed.ts                   # Seed script
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── .env.example
├── .env.local                    # (gitignored)
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
        enum role "super_admin | admin_unit | guru | karyawan | orang_tua | observer | tim_ppdb"
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

### 3.2 Catatan Desain Database

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

---

## 5. API Design

### 5.1 Konvensi

- **Server Actions** sebagai primary pattern untuk mutasi data dari React Server Components
- **API Route Handlers** (`app/api/`) hanya untuk: webhook, integrasi pihak ketiga, dan endpoint yang dikonsumsi di luar Next.js
- Semua input divalidasi dengan **Zod schema** sebelum masuk ke service layer
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

### 5.3 Contoh Zod Schema

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
| **Storage**          | S3-compatible (MinIO untuk dev, AWS S3 / Cloudflare R2 untuk prod)  |
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

### 7.3 Implementasi

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

# ── Object Storage (S3-compatible) ───────────
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET_NAME=sim-alfida
S3_REGION=us-east-1

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

### 11.3 Lokasi File Test

```
src/lib/validators/ppdb.test.ts          # co-located unit test
src/server/services/ppdb-service.test.ts  # co-located unit test
tests/e2e/ppdb-registration.spec.ts       # E2E test
tests/e2e/admin-payment.spec.ts           # E2E test
```

---

## 12. Deployment & Infrastructure

### 12.1 Environments

| Environment | Tujuan                    | Database           | Storage        | Host      |
| ----------- | ------------------------- | ------------------ | -------------- | --------- |
| **Local**   | Development               | PostgreSQL (Docker)| MinIO (Docker) | Localhost |
| **Staging** | QA & UAT                  | PostgreSQL (Docker)| MinIO (Docker) | VPS       |
| **Prod**    | Production                | PostgreSQL (Docker)| MinIO (Docker) | VPS       |

### 12.2 VPS Stack (Docker Compose)

```mermaid
graph TB
    subgraph VPS["VPS (Ubuntu/Debian)"]
        NG["Nginx Reverse Proxy\n+ SSL (Let's Encrypt)"]
        subgraph Docker["Docker Compose"]
            APP["Next.js App\n(Node.js container)"]
            DB[("PostgreSQL 16")]
            MINIO["MinIO\n(Object Storage)"]
        end
    end

    Internet --> NG
    NG --> APP
    APP --> DB
    APP --> MINIO
```

### 12.3 CI/CD Pipeline

```mermaid
flowchart LR
    A["Push to branch"] --> B["Lint (ESLint)"]
    B --> C["Type Check (tsc)"]
    C --> D["Unit Tests (Vitest)"]
    D --> E["Build (next build)"]
    E --> F["E2E Tests (Playwright)"]
    F --> G{"Branch?"}
    G -- main --> H["SSH Deploy to VPS (Staging)"]
    G -- release/* --> I["SSH Deploy to VPS (Production)"]
```

### 12.4 Rekomendasi Spesifikasi VPS

| Komponen     | Minimum            | Rekomendasi         |
| ------------ | ------------------ | ------------------- |
| **CPU**      | 2 vCPU             | 4 vCPU              |
| **RAM**      | 4 GB               | 8 GB                |
| **Storage**  | 40 GB SSD          | 80 GB NVMe SSD      |
| **OS**       | Ubuntu 22.04 LTS   | Ubuntu 24.04 LTS    |
| **Bandwidth**| 1 TB/bulan         | Unmetered            |

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
