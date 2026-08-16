# Database Schema

## SIM-Alfida — Sistem Informasi Manajemen Yayasan Alfida

| Atribut         | Detail                                          |
| --------------- | ----------------------------------------------- |
| **Versi**       | 0.1.0-alpha                                     |
| **Tanggal**     | 6 Agustus 2026                                  |
| **Database**    | Supabase PostgreSQL 15+                         |
| **ORM**         | Prisma (via Connection Pooler)                  |
| **Referensi**   | [PRD.md](file:///home/alchemista/projects/sim-alfida/docs/PRD.md) · [TDD.md](file:///home/alchemista/projects/sim-alfida/docs/TDD.md) |

---

> [!IMPORTANT]
> **Koneksi Supabase:**
> Prisma terhubung ke Supabase dengan dua *connection strings*:
> - `DATABASE_URL`: Menggunakan Transaction Pooler (Port `6543`) untuk operasional *runtime*.
> - `DIRECT_URL`: Menggunakan Direct Connection (Port `5432`) untuk menjalankan migrasi Prisma.
> 
> Pengguna pada aplikasi (tabel `users`) akan dikelola secara SSR menggunakan **Supabase Auth** (`auth.users`).

---

## 1. Konvensi

| Aspek                  | Aturan                                                                   |
| ---------------------- | ------------------------------------------------------------------------ |
| **Naming**             | `snake_case` untuk tabel dan kolom                                       |
| **Primary Key**        | `UUID v7` (time-sortable) — kolom `id`                                   |
| **Foreign Key**        | `{referenced_table_singular}_id`, misal `unit_id`                        |
| **Timestamps**         | `created_at` (NOT NULL, DEFAULT NOW), `updated_at` (nullable, auto-set) |
| **Soft Delete**        | Tidak digunakan pada fase awal                                           |
| **Enum**               | PostgreSQL native enum type                                              |
| **Index Naming**       | `idx_{table}_{column(s)}`                                                |
| **Unique Constraint**  | `uq_{table}_{column(s)}`                                                |
| **Check Constraint**   | `ck_{table}_{description}`                                               |

---

## 2. Entity Relationship Diagram

### 2.1 ERD — Modul Foundation & PPDB

```mermaid
erDiagram
    foundation_settings ||--|| foundation_settings : singleton

    users ||--o{ user_roles : "has many"
    users ||--o{ registrations : "creates (as parent)"
    users ||--o{ sessions : "has many"

    units ||--o{ user_roles : "scoped to"
    units ||--|| unit_settings : "has one"
    units ||--o{ academic_years : "has many"
    units ||--o{ classes : "has many"

    academic_years ||--o{ registrations : "receives"
    academic_years ||--o{ observation_schedules : "has many"

    registrations ||--|| payments : "has one"
    registrations ||--|| student_data : "has one"
    registrations ||--o{ parent_data : "has many"
    registrations ||--o{ documents : "has many"
    registrations ||--o| medical_referrals : "has zero or one"
    registrations ||--o| observation_bookings : "has zero or one"
    registrations ||--o| class_assignments : "has zero or one"

    observation_schedules ||--o{ observation_bookings : "has many"
    observation_bookings ||--o| observation_results : "has zero or one"
    classes ||--o{ class_assignments : "has many"
```

### 2.2 ERD — Modul Akademik

```mermaid
erDiagram
    units ||--o{ subjects : offers
    units ||--o{ extracurriculars : offers
    classes ||--o{ class_schedules : has
    classes ||--|| homeroom_assignments : has_homeroom
    subjects ||--o{ teacher_assignments : taught_by
    subjects ||--o{ class_schedules : scheduled_in
    subjects ||--o{ grades : graded_in
    subjects ||--o{ attendances : tracked_in
    subjects ||--o{ teaching_journals : logged_in
    subjects ||--o{ lesson_plans : planned_in
    users ||--o{ teacher_assignments : teaches
    users ||--o{ homeroom_assignments : is_homeroom
    users ||--o{ extracurricular_coaches : coaches
    student_enrollments ||--o{ grades : receives
    student_enrollments ||--o{ attendances : recorded
    student_enrollments ||--o{ extracurricular_members : joins
    student_enrollments ||--o{ extracurricular_grades : graded
    student_enrollments ||--o| promotion_decisions : decides
    student_enrollments ||--o{ spp_invoices : billed
    student_enrollments ||--o{ lhbs_reports : reported
    registrations ||--o| student_enrollments : enrolls_as
    classes ||--o{ student_enrollments : contains
    extracurriculars ||--o{ extracurricular_coaches : coached_by
    extracurriculars ||--o{ extracurricular_members : joined_by
    extracurriculars ||--o{ extracurricular_schedules : scheduled
    extracurriculars ||--o{ extracurricular_journals : logged
    extracurriculars ||--o{ extracurricular_grades : graded_in
```

---

## 3. Enum Types

```sql
-- ── Enum: Jenjang unit pendidikan ──
CREATE TYPE unit_level AS ENUM (
    'tk',
    'sd',
    'smp',
    'sma',
    'pesantren'
);

-- ── Enum: Peran pengguna ──
CREATE TYPE user_role AS ENUM (
    'super_admin',
    'admin_unit',
    'guru',
    'karyawan',
    'orang_tua',
    'observer',
    'tim_ppdb'
);

-- ── Enum: Status pendaftaran PPDB ──
CREATE TYPE registration_status AS ENUM (
    'pending_payment',
    'payment_uploaded',
    'payment_verified',
    'form_filling',
    'documents_uploaded',
    'medical_pending',
    'medical_uploaded',
    'verification',
    'observation_scheduled',
    'observation_done',
    'accepted',
    'rejected',
    'enrolled'
);

-- ── Enum: Status pembayaran ──
CREATE TYPE payment_status AS ENUM (
    'pending',
    'uploaded',
    'verified',
    'rejected'
);

-- ── Enum: Jenis kelamin ──
CREATE TYPE gender AS ENUM (
    'male',
    'female'
);

-- ── Enum: Tipe orang tua / wali ──
CREATE TYPE parent_type AS ENUM (
    'father',
    'mother',
    'guardian'
);

-- ── Enum: Tipe dokumen ──
CREATE TYPE document_type AS ENUM (
    'photo',
    'school_certificate',
    'birth_certificate',
    'family_card',
    'father_id',
    'mother_id',
    'medical_result'
);

-- ── Enum: Status Enrollment Siswa ──
CREATE TYPE enrollment_status AS ENUM (
    'active',
    're_enrolled',
    'graduated',
    'dropped'
);

-- ── Enum: Tipe Enrollment ──
CREATE TYPE enrollment_type AS ENUM (
    'new_ppdb',
    're_enrollment'
);

-- ── Enum: Level Mata Pelajaran ──
CREATE TYPE subject_level AS ENUM (
    '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'all'
);

-- ── Enum: Tipe Nilai ──
CREATE TYPE grade_type AS ENUM (
    'daily',
    'exam',
    'ats',
    'aas'
);

-- ── Enum: Status Absensi ──
CREATE TYPE attendance_status AS ENUM (
    'present',
    'sick',
    'permitted',
    'absent'
);

-- ── Enum: Tipe Rencana Pembelajaran ──
CREATE TYPE lesson_plan_type AS ENUM (
    'prota',
    'promes',
    'rpp'
);

-- ── Enum: Hari ──
CREATE TYPE day_of_week AS ENUM (
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday'
);

-- ── Enum: Status SPP ──
CREATE TYPE spp_status AS ENUM (
    'unpaid',
    'uploaded',
    'verified',
    'rejected'
);

-- ── Enum: Semester ──
CREATE TYPE semester_type AS ENUM (
    'mid',
    'final'
);

-- ── Enum: Keputusan Kenaikan Kelas ──
CREATE TYPE promotion_decision AS ENUM (
    'promoted',
    'retained'
);
```

---

## 4. Tabel — Foundation & Unit

### 4.1 `foundation_settings`

Settings global yayasan. Tabel singleton (hanya 1 row).

```sql
CREATE TABLE foundation_settings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    foundation_name VARCHAR(200)  NOT NULL DEFAULT 'Yayasan Alfida',
    logo_url        TEXT,
    bank_name       VARCHAR(100),
    bank_account_number VARCHAR(50),
    bank_account_holder VARCHAR(200),
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ
);

-- Pastikan hanya ada 1 row
CREATE UNIQUE INDEX uq_foundation_settings_singleton ON foundation_settings ((true));
```

| Kolom                  | Tipe           | Nullable | Keterangan                            |
| ---------------------- | -------------- | :------: | ------------------------------------- |
| `id`                   | UUID           | ❌       | PK                                    |
| `foundation_name`      | VARCHAR(200)   | ❌       | Nama yayasan                          |
| `logo_url`             | TEXT           | ✅       | URL logo yayasan di Cloudinary    |
| `bank_name`            | VARCHAR(100)   | ✅       | Nama bank rekening yayasan            |
| `bank_account_number`  | VARCHAR(50)    | ✅       | Nomor rekening                        |
| `bank_account_holder`  | VARCHAR(200)   | ✅       | Nama pemilik rekening                 |
| `created_at`           | TIMESTAMPTZ    | ❌       | DEFAULT NOW()                         |
| `updated_at`           | TIMESTAMPTZ    | ✅       | Auto-set on update                    |

---

### 4.2 `units`

Daftar unit pendidikan di bawah yayasan.

```sql
CREATE TABLE units (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(200)  NOT NULL,
    slug            VARCHAR(100)  NOT NULL,
    level           unit_level    NOT NULL,
    is_active       BOOLEAN       NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ,

    CONSTRAINT uq_units_slug UNIQUE (slug)
);

CREATE INDEX idx_units_level ON units (level);
CREATE INDEX idx_units_is_active ON units (is_active) WHERE is_active = true;
```

| Kolom       | Tipe          | Nullable | Keterangan                                    |
| ----------- | ------------- | :------: | --------------------------------------------- |
| `id`        | UUID          | ❌       | PK                                            |
| `name`      | VARCHAR(200)  | ❌       | Nama lengkap unit, misal "SD Islam Terpadu Iqra 1" |
| `slug`      | VARCHAR(100)  | ❌       | URL-safe identifier, UNIQUE                   |
| `level`     | unit_level    | ❌       | Jenjang: tk, sd, smp, sma, pesantren          |
| `is_active` | BOOLEAN       | ❌       | DEFAULT true                                  |
| `created_at`| TIMESTAMPTZ   | ❌       | DEFAULT NOW()                                 |
| `updated_at`| TIMESTAMPTZ   | ✅       | Auto-set on update                            |

**Seed data awal:**

| name                            | slug                   | level      |
| ------------------------------- | ---------------------- | ---------- |
| TK Islam Terpadu Auladuna 1     | tkit-auladuna-1        | tk         |
| TK Islam Terpadu Auladuna 2     | tkit-auladuna-2        | tk         |
| SD Islam Terpadu Iqra 1         | sdit-iqra-1            | sd         |
| SD Islam Terpadu Iqra 2         | sdit-iqra-2            | sd         |
| SD Islam Terpadu Iqra 3         | sdit-iqra-3            | sd         |
| SMP Islam Terpadu Iqra          | smpit-iqra             | smp        |
| SMA Islam Terpadu Iqra          | smait-iqra             | sma        |
| Pesantren Quran Alfida          | pesantren-quran-alfida | pesantren  |

---

### 4.3 `unit_settings`

Konfigurasi per-unit (logo, tanda tangan kepala sekolah).

```sql
CREATE TABLE unit_settings (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id                  UUID          NOT NULL,
    logo_url                 TEXT,
    principal_name           VARCHAR(200),
    principal_nip            VARCHAR(50),
    principal_signature_url  TEXT,
    created_at               TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMPTZ,

    CONSTRAINT fk_unit_settings_unit FOREIGN KEY (unit_id)
        REFERENCES units (id) ON DELETE CASCADE,
    CONSTRAINT uq_unit_settings_unit UNIQUE (unit_id)
);
```

| Kolom                      | Tipe          | Nullable | Keterangan                              |
| -------------------------- | ------------- | :------: | --------------------------------------- |
| `id`                       | UUID          | ❌       | PK                                      |
| `unit_id`                  | UUID          | ❌       | FK → units.id, UNIQUE (one-to-one)      |
| `logo_url`                 | TEXT          | ✅       | URL logo unit di Cloudinary         |
| `principal_name`           | VARCHAR(200)  | ✅       | Nama kepala sekolah                     |
| `principal_nip`            | VARCHAR(50)   | ✅       | NIP kepala sekolah                      |
| `principal_signature_url`  | TEXT          | ✅       | URL gambar tanda tangan kepala sekolah  |
| `created_at`               | TIMESTAMPTZ   | ❌       | DEFAULT NOW()                           |
| `updated_at`               | TIMESTAMPTZ   | ✅       | Auto-set on update                      |

---

## 5. Tabel — Auth & Users

### 5.1 `users`

```sql
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(200)  NOT NULL,
    email           VARCHAR(255)  NOT NULL,
    phone           VARCHAR(20),
    password_hash   TEXT          NOT NULL,
    is_active       BOOLEAN       NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ,

    CONSTRAINT uq_users_email UNIQUE (email)
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_is_active ON users (is_active) WHERE is_active = true;
```

| Kolom          | Tipe          | Nullable | Keterangan                           |
| -------------- | ------------- | :------: | ------------------------------------ |
| `id`           | UUID          | ❌       | PK                                   |
| `name`         | VARCHAR(200)  | ❌       | Nama lengkap                         |
| `email`        | VARCHAR(255)  | ❌       | Email unik untuk login               |
| `phone`        | VARCHAR(20)   | ✅       | No. WA/HP                           |
| `password_hash`| TEXT          | ❌       | bcrypt hash (salt ≥ 12)              |
| `is_active`    | BOOLEAN       | ❌       | DEFAULT true                         |
| `created_at`   | TIMESTAMPTZ   | ❌       | DEFAULT NOW()                        |
| `updated_at`   | TIMESTAMPTZ   | ✅       | Auto-set on update                   |

---

### 5.2 `user_roles`

Mapping user ke role per-unit. User bisa memiliki multiple roles.

```sql
CREATE TABLE user_roles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL,
    unit_id     UUID,                     -- NULL untuk super_admin
    role        user_role   NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_user_roles_unit FOREIGN KEY (unit_id)
        REFERENCES units (id) ON DELETE CASCADE,
    CONSTRAINT uq_user_roles_user_unit_role UNIQUE (user_id, unit_id, role),
    CONSTRAINT ck_user_roles_super_admin_no_unit
        CHECK (
            (role = 'super_admin' AND unit_id IS NULL)
            OR (role != 'super_admin' AND unit_id IS NOT NULL)
        )
);

CREATE INDEX idx_user_roles_user ON user_roles (user_id);
CREATE INDEX idx_user_roles_unit ON user_roles (unit_id);
CREATE INDEX idx_user_roles_role ON user_roles (role);
```

| Kolom       | Tipe       | Nullable | Keterangan                                            |
| ----------- | ---------- | :------: | ----------------------------------------------------- |
| `id`        | UUID       | ❌       | PK                                                    |
| `user_id`   | UUID       | ❌       | FK → users.id                                         |
| `unit_id`   | UUID       | ✅       | FK → units.id, NULL jika `super_admin`                |
| `role`      | user_role  | ❌       | Peran user di unit tersebut                           |
| `created_at`| TIMESTAMPTZ| ❌       | DEFAULT NOW()                                         |

> [!IMPORTANT]
> Check constraint `ck_user_roles_super_admin_no_unit` memastikan bahwa `super_admin` tidak memiliki `unit_id`, dan semua role lain **wajib** memiliki `unit_id`.

---

### 5.3 `sessions`

Sesi autentikasi (NextAuth database strategy).

```sql
CREATE TABLE sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID          NOT NULL,
    session_token   VARCHAR(500)  NOT NULL,
    expires_at      TIMESTAMPTZ   NOT NULL,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_sessions_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT uq_sessions_token UNIQUE (session_token)
);

CREATE INDEX idx_sessions_user ON sessions (user_id);
CREATE INDEX idx_sessions_expires ON sessions (expires_at);
```

| Kolom           | Tipe          | Nullable | Keterangan                     |
| --------------- | ------------- | :------: | ------------------------------ |
| `id`            | UUID          | ❌       | PK                             |
| `user_id`       | UUID          | ❌       | FK → users.id                  |
| `session_token` | VARCHAR(500)  | ❌       | Token sesi, UNIQUE             |
| `expires_at`    | TIMESTAMPTZ   | ❌       | Waktu kedaluwarsa              |
| `created_at`    | TIMESTAMPTZ   | ❌       | DEFAULT NOW()                  |

---

## 6. Tabel — PPDB

### 6.1 `academic_years`

Tahun ajaran per-unit. Mengontrol PPDB aktif dan kuota.

```sql
CREATE TABLE academic_years (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id          UUID          NOT NULL,
    name             VARCHAR(20)   NOT NULL,  -- e.g. "2026/2027"
    start_date       DATE          NOT NULL,
    end_date         DATE          NOT NULL,
    ppdb_active      BOOLEAN       NOT NULL DEFAULT false,
    ppdb_quota       INTEGER       NOT NULL DEFAULT 0,
    ppdb_registered  INTEGER       NOT NULL DEFAULT 0,
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ,

    CONSTRAINT fk_academic_years_unit FOREIGN KEY (unit_id)
        REFERENCES units (id) ON DELETE CASCADE,
    CONSTRAINT uq_academic_years_unit_name UNIQUE (unit_id, name),
    CONSTRAINT ck_academic_years_dates CHECK (start_date < end_date),
    CONSTRAINT ck_academic_years_quota CHECK (ppdb_quota >= 0),
    CONSTRAINT ck_academic_years_registered CHECK (ppdb_registered >= 0)
);

CREATE INDEX idx_academic_years_unit ON academic_years (unit_id);
CREATE INDEX idx_academic_years_ppdb_active ON academic_years (ppdb_active) WHERE ppdb_active = true;
```

| Kolom             | Tipe          | Nullable | Keterangan                                |
| ----------------- | ------------- | :------: | ----------------------------------------- |
| `id`              | UUID          | ❌       | PK                                        |
| `unit_id`         | UUID          | ❌       | FK → units.id                             |
| `name`            | VARCHAR(20)   | ❌       | Nama tahun ajaran, e.g. "2026/2027"       |
| `start_date`      | DATE          | ❌       | Tanggal mulai tahun ajaran                |
| `end_date`        | DATE          | ❌       | Tanggal akhir tahun ajaran                |
| `ppdb_active`     | BOOLEAN       | ❌       | Apakah PPDB sedang aktif                  |
| `ppdb_quota`      | INTEGER       | ❌       | Kuota penerimaan siswa baru               |
| `ppdb_registered` | INTEGER       | ❌       | Counter siswa yang sudah terdaftar        |
| `created_at`      | TIMESTAMPTZ   | ❌       | DEFAULT NOW()                             |
| `updated_at`      | TIMESTAMPTZ   | ✅       | Auto-set on update                        |

---

### 6.2 `registrations`

Pendaftaran PPDB oleh orang tua.

```sql
CREATE TABLE registrations (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id              UUID                NOT NULL,  -- orang tua
    academic_year_id     UUID                NOT NULL,
    unit_id              UUID                NOT NULL,
    registration_number  VARCHAR(30)         NOT NULL,
    status               registration_status NOT NULL DEFAULT 'pending_payment',
    created_at           TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ,

    CONSTRAINT fk_registrations_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT fk_registrations_academic_year FOREIGN KEY (academic_year_id)
        REFERENCES academic_years (id) ON DELETE RESTRICT,
    CONSTRAINT fk_registrations_unit FOREIGN KEY (unit_id)
        REFERENCES units (id) ON DELETE RESTRICT,
    CONSTRAINT uq_registrations_number UNIQUE (registration_number),
    CONSTRAINT uq_registrations_user_year UNIQUE (user_id, academic_year_id)
);

CREATE INDEX idx_registrations_user ON registrations (user_id);
CREATE INDEX idx_registrations_unit ON registrations (unit_id);
CREATE INDEX idx_registrations_academic_year ON registrations (academic_year_id);
CREATE INDEX idx_registrations_status ON registrations (status);
```

| Kolom                 | Tipe                 | Nullable | Keterangan                                          |
| --------------------- | -------------------- | :------: | --------------------------------------------------- |
| `id`                  | UUID                 | ❌       | PK                                                  |
| `user_id`             | UUID                 | ❌       | FK → users.id (orang tua)                           |
| `academic_year_id`    | UUID                 | ❌       | FK → academic_years.id                              |
| `unit_id`             | UUID                 | ❌       | FK → units.id (denormalized untuk query cepat)      |
| `registration_number` | VARCHAR(30)          | ❌       | Nomor registrasi unik, e.g. "PPDB-SDIT1-2026-0001" |
| `status`              | registration_status  | ❌       | Status pendaftaran (state machine)                  |
| `created_at`          | TIMESTAMPTZ          | ❌       | DEFAULT NOW()                                       |
| `updated_at`          | TIMESTAMPTZ          | ✅       | Auto-set on update                                  |

> [!NOTE]
> Unique constraint `uq_registrations_user_year` mencegah satu orang tua mendaftar dua kali di tahun ajaran yang sama pada unit yang sama.

**Format `registration_number`:** `PPDB-{SLUG_UNIT}-{TAHUN}-{SEQUENCE_4_DIGIT}`
Contoh: `PPDB-SDIT1-2026-0042`

---

### 6.3 `payments`

Pembayaran pendaftaran PPDB.

```sql
CREATE TABLE payments (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id  UUID            NOT NULL,
    amount           DECIMAL(12, 2)  NOT NULL,
    proof_url        TEXT,
    status           payment_status  NOT NULL DEFAULT 'pending',
    verified_by      UUID,
    rejection_reason TEXT,
    verified_at      TIMESTAMPTZ,
    created_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ,

    CONSTRAINT fk_payments_registration FOREIGN KEY (registration_id)
        REFERENCES registrations (id) ON DELETE CASCADE,
    CONSTRAINT fk_payments_verified_by FOREIGN KEY (verified_by)
        REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT uq_payments_registration UNIQUE (registration_id),
    CONSTRAINT ck_payments_amount CHECK (amount > 0)
);

CREATE INDEX idx_payments_status ON payments (status);
CREATE INDEX idx_payments_registration ON payments (registration_id);
```

| Kolom              | Tipe           | Nullable | Keterangan                              |
| ------------------ | -------------- | :------: | --------------------------------------- |
| `id`               | UUID           | ❌       | PK                                      |
| `registration_id`  | UUID           | ❌       | FK → registrations.id, UNIQUE           |
| `amount`           | DECIMAL(12,2)  | ❌       | Nominal pembayaran                      |
| `proof_url`        | TEXT           | ✅       | URL bukti transfer di Cloudinary    |
| `status`           | payment_status | ❌       | Status verifikasi                       |
| `verified_by`      | UUID           | ✅       | FK → users.id (admin yang verifikasi)   |
| `rejection_reason` | TEXT           | ✅       | Alasan penolakan (jika ditolak)         |
| `verified_at`      | TIMESTAMPTZ    | ✅       | Waktu verifikasi                        |
| `created_at`       | TIMESTAMPTZ    | ❌       | DEFAULT NOW()                           |
| `updated_at`       | TIMESTAMPTZ    | ✅       | Auto-set on update                      |

---

### 6.4 `student_data`

Data calon peserta didik baru.

```sql
CREATE TABLE student_data (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id  UUID          NOT NULL,
    full_name        VARCHAR(200)  NOT NULL,
    nickname         VARCHAR(50)   NOT NULL,
    gender           gender        NOT NULL,
    religion         VARCHAR(20)   NOT NULL DEFAULT 'Islam',
    birth_place      VARCHAR(100)  NOT NULL,
    birth_date       DATE          NOT NULL,
    nisn             VARCHAR(10),
    sibling_count    INTEGER       NOT NULL DEFAULT 0,
    address          TEXT          NOT NULL,
    transportation   VARCHAR(100),
    hobby            VARCHAR(200),
    aspiration       VARCHAR(200),
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ,

    CONSTRAINT fk_student_data_registration FOREIGN KEY (registration_id)
        REFERENCES registrations (id) ON DELETE CASCADE,
    CONSTRAINT uq_student_data_registration UNIQUE (registration_id),
    CONSTRAINT ck_student_data_sibling CHECK (sibling_count >= 0)
);

CREATE INDEX idx_student_data_registration ON student_data (registration_id);
CREATE INDEX idx_student_data_nisn ON student_data (nisn) WHERE nisn IS NOT NULL;
```

| Kolom             | Tipe          | Nullable | Keterangan                                   |
| ----------------- | ------------- | :------: | -------------------------------------------- |
| `id`              | UUID          | ❌       | PK                                           |
| `registration_id` | UUID          | ❌       | FK → registrations.id, UNIQUE                |
| `full_name`       | VARCHAR(200)  | ❌       | Nama lengkap siswa                           |
| `nickname`        | VARCHAR(50)   | ❌       | Nama panggilan                               |
| `gender`          | gender        | ❌       | Jenis kelamin                                |
| `religion`        | VARCHAR(20)   | ❌       | DEFAULT 'Islam'                              |
| `birth_place`     | VARCHAR(100)  | ❌       | Tempat lahir                                 |
| `birth_date`      | DATE          | ❌       | Tanggal lahir                                |
| `nisn`            | VARCHAR(10)   | ✅       | NISN (nullable untuk TK yang belum punya)    |
| `sibling_count`   | INTEGER       | ❌       | Jumlah saudara                               |
| `address`         | TEXT          | ❌       | Alamat lengkap                               |
| `transportation`  | VARCHAR(100)  | ✅       | Alat transportasi ke sekolah                 |
| `hobby`           | VARCHAR(200)  | ✅       | Hobi                                         |
| `aspiration`      | VARCHAR(200)  | ✅       | Cita-cita                                    |
| `created_at`      | TIMESTAMPTZ   | ❌       | DEFAULT NOW()                                |
| `updated_at`      | TIMESTAMPTZ   | ✅       | Auto-set on update                           |

---

### 6.5 `parent_data`

Data orang tua / wali calon siswa. Satu registrasi bisa punya data ayah, ibu, dan/atau wali.

```sql
CREATE TABLE parent_data (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id  UUID          NOT NULL,
    type             parent_type   NOT NULL,
    full_name        VARCHAR(200)  NOT NULL,
    nik              VARCHAR(16)   NOT NULL,
    birth_place      VARCHAR(100),
    birth_date       DATE,
    education        VARCHAR(50),
    occupation       VARCHAR(100),
    phone            VARCHAR(20),
    income_range     VARCHAR(50),
    address          TEXT,
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ,

    CONSTRAINT fk_parent_data_registration FOREIGN KEY (registration_id)
        REFERENCES registrations (id) ON DELETE CASCADE,
    CONSTRAINT uq_parent_data_registration_type UNIQUE (registration_id, type)
);

CREATE INDEX idx_parent_data_registration ON parent_data (registration_id);
```

| Kolom             | Tipe          | Nullable | Keterangan                                         |
| ----------------- | ------------- | :------: | -------------------------------------------------- |
| `id`              | UUID          | ❌       | PK                                                 |
| `registration_id` | UUID          | ❌       | FK → registrations.id                              |
| `type`            | parent_type   | ❌       | father / mother / guardian                         |
| `full_name`       | VARCHAR(200)  | ❌       | Nama lengkap orang tua                             |
| `nik`             | VARCHAR(16)   | ❌       | NIK (16 digit)                                     |
| `birth_place`     | VARCHAR(100)  | ✅       | Tempat lahir                                       |
| `birth_date`      | DATE          | ✅       | Tanggal lahir                                      |
| `education`       | VARCHAR(50)   | ✅       | Pendidikan terakhir                                |
| `occupation`      | VARCHAR(100)  | ✅       | Pekerjaan                                          |
| `phone`           | VARCHAR(20)   | ✅       | Nomor telepon                                      |
| `income_range`    | VARCHAR(50)   | ✅       | Kisaran penghasilan (e.g. "< 2 Juta", "2-5 Juta") |
| `address`         | TEXT          | ✅       | Alamat lengkap                                     |
| `created_at`      | TIMESTAMPTZ   | ❌       | DEFAULT NOW()                                      |
| `updated_at`      | TIMESTAMPTZ   | ✅       | Auto-set on update                                 |

> [!NOTE]
> Unique constraint `uq_parent_data_registration_type` memastikan satu registrasi hanya boleh punya satu entri per tipe (satu ayah, satu ibu, satu wali).

---

### 6.6 `documents`

Berkas yang diunggah oleh orang tua.

```sql
CREATE TABLE documents (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id  UUID           NOT NULL,
    doc_type         document_type  NOT NULL,
    file_url         TEXT           NOT NULL,
    file_name        VARCHAR(255)   NOT NULL,
    file_size        INTEGER        NOT NULL,  -- dalam byte
    mime_type        VARCHAR(100)   NOT NULL,
    uploaded_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_documents_registration FOREIGN KEY (registration_id)
        REFERENCES registrations (id) ON DELETE CASCADE,
    CONSTRAINT uq_documents_registration_type UNIQUE (registration_id, doc_type),
    CONSTRAINT ck_documents_file_size CHECK (file_size > 0 AND file_size <= 5242880),
    CONSTRAINT ck_documents_mime_type CHECK (
        mime_type IN ('image/jpeg', 'image/png', 'application/pdf')
    )
);

CREATE INDEX idx_documents_registration ON documents (registration_id);
```

| Kolom             | Tipe           | Nullable | Keterangan                                 |
| ----------------- | -------------- | :------: | ------------------------------------------ |
| `id`              | UUID           | ❌       | PK                                         |
| `registration_id` | UUID           | ❌       | FK → registrations.id                      |
| `doc_type`        | document_type  | ❌       | Jenis dokumen                              |
| `file_url`        | TEXT           | ❌       | URL file di Cloudinary                 |
| `file_name`       | VARCHAR(255)   | ❌       | Nama file asli                             |
| `file_size`       | INTEGER        | ❌       | Ukuran file dalam byte (max 5MB)           |
| `mime_type`       | VARCHAR(100)   | ❌       | MIME type (jpeg, png, pdf)                 |
| `uploaded_at`     | TIMESTAMPTZ    | ❌       | DEFAULT NOW()                              |

---

### 6.7 `medical_referrals`

Surat pengantar pemeriksaan ke Klinik IMC.

```sql
CREATE TABLE medical_referrals (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id  UUID        NOT NULL,
    pdf_url          TEXT        NOT NULL,
    generated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_medical_referrals_registration FOREIGN KEY (registration_id)
        REFERENCES registrations (id) ON DELETE CASCADE,
    CONSTRAINT uq_medical_referrals_registration UNIQUE (registration_id)
);
```

| Kolom             | Tipe        | Nullable | Keterangan                           |
| ----------------- | ----------- | :------: | ------------------------------------ |
| `id`              | UUID        | ❌       | PK                                   |
| `registration_id` | UUID        | ❌       | FK → registrations.id, UNIQUE        |
| `pdf_url`         | TEXT        | ❌       | URL PDF surat pengantar              |
| `generated_at`    | TIMESTAMPTZ | ❌       | DEFAULT NOW()                        |

---

## 7. Tabel — Observasi

### 7.1 `observation_schedules`

Jadwal observasi yang dibuat oleh admin unit.

```sql
CREATE TABLE observation_schedules (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_year_id UUID        NOT NULL,
    unit_id          UUID        NOT NULL,
    schedule_date    DATE        NOT NULL,
    daily_quota      INTEGER     NOT NULL,
    booked_count     INTEGER     NOT NULL DEFAULT 0,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_observation_schedules_academic_year FOREIGN KEY (academic_year_id)
        REFERENCES academic_years (id) ON DELETE CASCADE,
    CONSTRAINT fk_observation_schedules_unit FOREIGN KEY (unit_id)
        REFERENCES units (id) ON DELETE CASCADE,
    CONSTRAINT uq_observation_schedules_unit_date UNIQUE (unit_id, academic_year_id, schedule_date),
    CONSTRAINT ck_observation_schedules_quota CHECK (daily_quota > 0),
    CONSTRAINT ck_observation_schedules_booked CHECK (booked_count >= 0 AND booked_count <= daily_quota)
);

CREATE INDEX idx_observation_schedules_unit ON observation_schedules (unit_id);
CREATE INDEX idx_observation_schedules_date ON observation_schedules (schedule_date);
```

| Kolom              | Tipe        | Nullable | Keterangan                                   |
| ------------------ | ----------- | :------: | -------------------------------------------- |
| `id`               | UUID        | ❌       | PK                                           |
| `academic_year_id` | UUID        | ❌       | FK → academic_years.id                       |
| `unit_id`          | UUID        | ❌       | FK → units.id                                |
| `schedule_date`    | DATE        | ❌       | Tanggal observasi                            |
| `daily_quota`      | INTEGER     | ❌       | Kuota harian                                 |
| `booked_count`     | INTEGER     | ❌       | Counter booking (≤ daily_quota)              |
| `created_at`       | TIMESTAMPTZ | ❌       | DEFAULT NOW()                                |

---

### 7.2 `observation_bookings`

Booking jadwal observasi oleh orang tua.

```sql
CREATE TABLE observation_bookings (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id  UUID        NOT NULL,
    schedule_id      UUID        NOT NULL,
    booked_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_observation_bookings_registration FOREIGN KEY (registration_id)
        REFERENCES registrations (id) ON DELETE CASCADE,
    CONSTRAINT fk_observation_bookings_schedule FOREIGN KEY (schedule_id)
        REFERENCES observation_schedules (id) ON DELETE CASCADE,
    CONSTRAINT uq_observation_bookings_registration UNIQUE (registration_id)
);

CREATE INDEX idx_observation_bookings_schedule ON observation_bookings (schedule_id);
```

| Kolom             | Tipe        | Nullable | Keterangan                         |
| ----------------- | ----------- | :------: | ---------------------------------- |
| `id`              | UUID        | ❌       | PK                                 |
| `registration_id` | UUID        | ❌       | FK → registrations.id, UNIQUE      |
| `schedule_id`     | UUID        | ❌       | FK → observation_schedules.id      |
| `booked_at`       | TIMESTAMPTZ | ❌       | DEFAULT NOW()                      |

---

### 7.3 `observation_results`

Hasil observasi yang diinput oleh observer.

```sql
CREATE TABLE observation_results (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id   UUID           NOT NULL,
    observer_id  UUID           NOT NULL,
    score        DECIMAL(5, 2)  NOT NULL,
    notes        TEXT,
    rank         INTEGER,       -- computed after all scores submitted
    created_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ,

    CONSTRAINT fk_observation_results_booking FOREIGN KEY (booking_id)
        REFERENCES observation_bookings (id) ON DELETE CASCADE,
    CONSTRAINT fk_observation_results_observer FOREIGN KEY (observer_id)
        REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT uq_observation_results_booking UNIQUE (booking_id),
    CONSTRAINT ck_observation_results_score CHECK (score >= 0 AND score <= 100)
);

CREATE INDEX idx_observation_results_observer ON observation_results (observer_id);
CREATE INDEX idx_observation_results_score ON observation_results (score DESC);
```

| Kolom         | Tipe          | Nullable | Keterangan                                 |
| ------------- | ------------- | :------: | ------------------------------------------ |
| `id`          | UUID          | ❌       | PK                                         |
| `booking_id`  | UUID          | ❌       | FK → observation_bookings.id, UNIQUE       |
| `observer_id` | UUID          | ❌       | FK → users.id (observer yang menilai)      |
| `score`       | DECIMAL(5,2)  | ❌       | Skor observasi (0.00–100.00)               |
| `notes`       | TEXT          | ✅       | Catatan dari observer                      |
| `rank`        | INTEGER       | ✅       | Peringkat (dihitung setelah semua skor masuk) |
| `created_at`  | TIMESTAMPTZ   | ❌       | DEFAULT NOW()                              |
| `updated_at`  | TIMESTAMPTZ   | ✅       | Auto-set on update                         |

---

## 8. Tabel — Kelas

### 8.1 `classes`

Kelas paralel di setiap unit.

```sql
CREATE TABLE classes (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id          UUID         NOT NULL,
    academic_year_id UUID         NOT NULL,
    name             VARCHAR(10)  NOT NULL,  -- e.g. "1A", "1B"
    grade            INTEGER      NOT NULL,  -- e.g. 1, 2, 3
    capacity         INTEGER      NOT NULL DEFAULT 30,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_classes_unit FOREIGN KEY (unit_id)
        REFERENCES units (id) ON DELETE CASCADE,
    CONSTRAINT fk_classes_academic_year FOREIGN KEY (academic_year_id)
        REFERENCES academic_years (id) ON DELETE CASCADE,
    CONSTRAINT uq_classes_unit_year_name UNIQUE (unit_id, academic_year_id, name),
    CONSTRAINT ck_classes_capacity CHECK (capacity > 0),
    CONSTRAINT ck_classes_grade CHECK (grade > 0)
);

CREATE INDEX idx_classes_unit ON classes (unit_id);
CREATE INDEX idx_classes_academic_year ON classes (academic_year_id);
```

| Kolom              | Tipe        | Nullable | Keterangan                              |
| ------------------ | ----------- | :------: | --------------------------------------- |
| `id`               | UUID        | ❌       | PK                                      |
| `unit_id`          | UUID        | ❌       | FK → units.id                           |
| `academic_year_id` | UUID        | ❌       | FK → academic_years.id                  |
| `name`             | VARCHAR(10) | ❌       | Nama kelas, e.g. "1A", "1B"            |
| `grade`            | INTEGER     | ❌       | Tingkat kelas (1, 2, 3, dst.)           |
| `capacity`         | INTEGER     | ❌       | Kapasitas kelas, DEFAULT 30             |
| `created_at`       | TIMESTAMPTZ | ❌       | DEFAULT NOW()                           |

---

### 8.2 `class_assignments`

Penempatan siswa baru ke kelas.

```sql
CREATE TABLE class_assignments (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id  UUID        NOT NULL,
    class_id         UUID        NOT NULL,
    assigned_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    assigned_by      UUID        NOT NULL,

    CONSTRAINT fk_class_assignments_registration FOREIGN KEY (registration_id)
        REFERENCES registrations (id) ON DELETE CASCADE,
    CONSTRAINT fk_class_assignments_class FOREIGN KEY (class_id)
        REFERENCES classes (id) ON DELETE CASCADE,
    CONSTRAINT fk_class_assignments_assigned_by FOREIGN KEY (assigned_by)
        REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT uq_class_assignments_registration UNIQUE (registration_id)
);

CREATE INDEX idx_class_assignments_class ON class_assignments (class_id);
```

| `id`              | UUID        | ❌       | PK                                         |
| `registration_id` | UUID        | ❌       | FK → registrations.id, UNIQUE              |
| `class_id`        | UUID        | ❌       | FK → classes.id                            |
| `assigned_at`     | TIMESTAMPTZ | ❌       | DEFAULT NOW()                              |
| `assigned_by`     | UUID        | ❌       | FK → users.id (admin yang assign)          |

---

## 9. Tabel — Akademik (Enrollment & Mapel)

### 9.1 `student_enrollments`

Data enrollment siswa aktif.

```sql
CREATE TABLE student_enrollments (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id  UUID,                     -- NULL jika bukan dari PPDB
    class_id         UUID                NOT NULL,
    academic_year_id UUID                NOT NULL,
    student_data_id  UUID                NOT NULL,
    parent_id        UUID                NOT NULL, -- users.id orang tua
    status           enrollment_status   NOT NULL DEFAULT 'active',
    enrollment_type  enrollment_type     NOT NULL,
    created_at       TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ,

    CONSTRAINT fk_enrollments_registration FOREIGN KEY (registration_id)
        REFERENCES registrations (id) ON DELETE SET NULL,
    CONSTRAINT fk_enrollments_class FOREIGN KEY (class_id)
        REFERENCES classes (id) ON DELETE RESTRICT,
    CONSTRAINT fk_enrollments_academic_year FOREIGN KEY (academic_year_id)
        REFERENCES academic_years (id) ON DELETE RESTRICT,
    CONSTRAINT fk_enrollments_student_data FOREIGN KEY (student_data_id)
        REFERENCES student_data (id) ON DELETE CASCADE,
    CONSTRAINT fk_enrollments_parent FOREIGN KEY (parent_id)
        REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT uq_enrollments_student_year UNIQUE (student_data_id, academic_year_id)
);

CREATE INDEX idx_enrollments_class ON student_enrollments (class_id);
CREATE INDEX idx_enrollments_parent ON student_enrollments (parent_id);
```

### 9.2 `subjects`

Mata pelajaran per unit.

```sql
CREATE TABLE subjects (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id          UUID                NOT NULL,
    code             VARCHAR(20)         NOT NULL,
    name             VARCHAR(100)        NOT NULL,
    level            subject_level       NOT NULL,
    is_active        BOOLEAN             NOT NULL DEFAULT true,
    created_at       TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ,

    CONSTRAINT fk_subjects_unit FOREIGN KEY (unit_id)
        REFERENCES units (id) ON DELETE CASCADE,
    CONSTRAINT uq_subjects_unit_code UNIQUE (unit_id, code)
);
```

### 9.3 `teacher_assignments`

Penugasan guru ke mata pelajaran dan kelas.

```sql
CREATE TABLE teacher_assignments (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id       UUID                NOT NULL,
    teacher_id       UUID                NOT NULL, -- users.id
    class_id         UUID                NOT NULL,
    academic_year_id UUID                NOT NULL,
    created_at       TIMESTAMPTZ         NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_teacher_assignments_subject FOREIGN KEY (subject_id)
        REFERENCES subjects (id) ON DELETE CASCADE,
    CONSTRAINT fk_teacher_assignments_teacher FOREIGN KEY (teacher_id)
        REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_teacher_assignments_class FOREIGN KEY (class_id)
        REFERENCES classes (id) ON DELETE CASCADE,
    CONSTRAINT fk_teacher_assignments_year FOREIGN KEY (academic_year_id)
        REFERENCES academic_years (id) ON DELETE CASCADE,
    CONSTRAINT uq_teacher_assignments_unique UNIQUE (subject_id, teacher_id, class_id, academic_year_id)
);
```

### 9.4 `homeroom_assignments`

Penugasan wali kelas.

```sql
CREATE TABLE homeroom_assignments (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id       UUID                NOT NULL, -- users.id
    class_id         UUID                NOT NULL,
    academic_year_id UUID                NOT NULL,
    created_at       TIMESTAMPTZ         NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_homeroom_assignments_teacher FOREIGN KEY (teacher_id)
        REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_homeroom_assignments_class FOREIGN KEY (class_id)
        REFERENCES classes (id) ON DELETE CASCADE,
    CONSTRAINT fk_homeroom_assignments_year FOREIGN KEY (academic_year_id)
        REFERENCES academic_years (id) ON DELETE CASCADE,
    CONSTRAINT uq_homeroom_assignments_class_year UNIQUE (class_id, academic_year_id)
);
```

---

## 10. Tabel — Akademik (Penilaian & Jurnal)

### 10.1 `grades`

Nilai per mata pelajaran.

```sql
CREATE TABLE grades (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id    UUID                NOT NULL,
    subject_id       UUID                NOT NULL,
    teacher_id       UUID                NOT NULL,
    academic_year_id UUID                NOT NULL,
    type             grade_type          NOT NULL,
    label            VARCHAR(50)         NOT NULL,
    score            DECIMAL(5, 2)       NOT NULL,
    created_at       TIMESTAMPTZ         NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_grades_enrollment FOREIGN KEY (enrollment_id)
        REFERENCES student_enrollments (id) ON DELETE CASCADE,
    CONSTRAINT fk_grades_subject FOREIGN KEY (subject_id)
        REFERENCES subjects (id) ON DELETE CASCADE,
    CONSTRAINT fk_grades_teacher FOREIGN KEY (teacher_id)
        REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT fk_grades_year FOREIGN KEY (academic_year_id)
        REFERENCES academic_years (id) ON DELETE RESTRICT,
    CONSTRAINT ck_grades_score CHECK (score >= 0 AND score <= 100)
);
```

### 10.2 `attendances`

Presensi siswa.

```sql
CREATE TABLE attendances (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id    UUID                NOT NULL,
    subject_id       UUID                NOT NULL,
    teacher_id       UUID                NOT NULL,
    date             DATE                NOT NULL,
    status           attendance_status   NOT NULL,
    notes            TEXT,
    created_at       TIMESTAMPTZ         NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_attendances_enrollment FOREIGN KEY (enrollment_id)
        REFERENCES student_enrollments (id) ON DELETE CASCADE,
    CONSTRAINT fk_attendances_subject FOREIGN KEY (subject_id)
        REFERENCES subjects (id) ON DELETE CASCADE,
    CONSTRAINT uq_attendances_enrollment_subject_date UNIQUE (enrollment_id, subject_id, date)
);
```

### 10.3 `teaching_journals`

Jurnal mengajar guru.

```sql
CREATE TABLE teaching_journals (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id       UUID                NOT NULL,
    teacher_id       UUID                NOT NULL,
    class_id         UUID                NOT NULL,
    date             DATE                NOT NULL,
    material         TEXT                NOT NULL,
    method           TEXT                NOT NULL,
    reflection       TEXT,
    created_at       TIMESTAMPTZ         NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_journals_subject FOREIGN KEY (subject_id)
        REFERENCES subjects (id) ON DELETE CASCADE,
    CONSTRAINT fk_journals_teacher FOREIGN KEY (teacher_id)
        REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_journals_class FOREIGN KEY (class_id)
        REFERENCES classes (id) ON DELETE CASCADE
);
```

### 10.4 `lesson_plans`

Prota, Promes, RPP.

```sql
CREATE TABLE lesson_plans (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id       UUID                NOT NULL,
    teacher_id       UUID                NOT NULL,
    academic_year_id UUID                NOT NULL,
    type             lesson_plan_type    NOT NULL,
    title            VARCHAR(255)        NOT NULL,
    content          TEXT                NOT NULL, -- JSON or rich text
    pdf_url          TEXT,
    created_at       TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ,

    CONSTRAINT fk_lesson_plans_subject FOREIGN KEY (subject_id)
        REFERENCES subjects (id) ON DELETE CASCADE,
    CONSTRAINT fk_lesson_plans_teacher FOREIGN KEY (teacher_id)
        REFERENCES users (id) ON DELETE CASCADE
);
```

### 10.5 `class_schedules`

Jadwal pelajaran kelas.

```sql
CREATE TABLE class_schedules (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id         UUID                NOT NULL,
    subject_id       UUID                NOT NULL,
    teacher_id       UUID                NOT NULL,
    day              day_of_week         NOT NULL,
    start_time       TIME                NOT NULL,
    end_time         TIME                NOT NULL,
    created_at       TIMESTAMPTZ         NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_class_schedules_class FOREIGN KEY (class_id)
        REFERENCES classes (id) ON DELETE CASCADE,
    CONSTRAINT fk_class_schedules_subject FOREIGN KEY (subject_id)
        REFERENCES subjects (id) ON DELETE CASCADE,
    CONSTRAINT fk_class_schedules_teacher FOREIGN KEY (teacher_id)
        REFERENCES users (id) ON DELETE CASCADE
);
```

---

## 11. Tabel — Akademik (Ekstrakurikuler)

### 11.1 `extracurriculars`

Data kegiatan ekstrakurikuler.

```sql
CREATE TABLE extracurriculars (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id          UUID                NOT NULL,
    academic_year_id UUID                NOT NULL,
    name             VARCHAR(100)        NOT NULL,
    description      TEXT,
    quota            INTEGER             NOT NULL,
    is_active        BOOLEAN             NOT NULL DEFAULT true,
    created_at       TIMESTAMPTZ         NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_extracurriculars_unit FOREIGN KEY (unit_id)
        REFERENCES units (id) ON DELETE CASCADE,
    CONSTRAINT fk_extracurriculars_year FOREIGN KEY (academic_year_id)
        REFERENCES academic_years (id) ON DELETE CASCADE
);
```

### 11.2 `extracurricular_coaches`

Pembina ekstrakurikuler.

```sql
CREATE TABLE extracurricular_coaches (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    extracurricular_id UUID                NOT NULL,
    coach_id           UUID                NOT NULL, -- users.id
    created_at         TIMESTAMPTZ         NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_extra_coaches_extra FOREIGN KEY (extracurricular_id)
        REFERENCES extracurriculars (id) ON DELETE CASCADE,
    CONSTRAINT fk_extra_coaches_coach FOREIGN KEY (coach_id)
        REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT uq_extra_coaches UNIQUE (extracurricular_id, coach_id)
);
```

### 11.3 `extracurricular_schedules`

Jadwal ekstrakurikuler.

```sql
CREATE TABLE extracurricular_schedules (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    extracurricular_id UUID                NOT NULL,
    day                day_of_week         NOT NULL,
    start_time         TIME                NOT NULL,
    end_time           TIME                NOT NULL,
    location           VARCHAR(200),
    created_at         TIMESTAMPTZ         NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_extra_schedules_extra FOREIGN KEY (extracurricular_id)
        REFERENCES extracurriculars (id) ON DELETE CASCADE
);
```

### 11.4 `extracurricular_members`

Siswa yang mengikuti ekstrakurikuler.

```sql
CREATE TABLE extracurricular_members (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    extracurricular_id UUID                NOT NULL,
    enrollment_id      UUID                NOT NULL,
    joined_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_extra_members_extra FOREIGN KEY (extracurricular_id)
        REFERENCES extracurriculars (id) ON DELETE CASCADE,
    CONSTRAINT fk_extra_members_enrollment FOREIGN KEY (enrollment_id)
        REFERENCES student_enrollments (id) ON DELETE CASCADE,
    CONSTRAINT uq_extra_members UNIQUE (extracurricular_id, enrollment_id)
);
```

### 11.5 `extracurricular_journals`

Jurnal kegiatan ekstrakurikuler.

```sql
CREATE TABLE extracurricular_journals (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    extracurricular_id  UUID                NOT NULL,
    coach_id            UUID                NOT NULL,
    date                DATE                NOT NULL,
    material            TEXT                NOT NULL,
    participation_notes TEXT,
    created_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_extra_journals_extra FOREIGN KEY (extracurricular_id)
        REFERENCES extracurriculars (id) ON DELETE CASCADE,
    CONSTRAINT fk_extra_journals_coach FOREIGN KEY (coach_id)
        REFERENCES users (id) ON DELETE CASCADE
);
```

### 11.6 `extracurricular_grades`

Nilai/predikat ekstrakurikuler per siswa.

```sql
CREATE TABLE extracurricular_grades (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    extracurricular_id UUID                NOT NULL,
    enrollment_id      UUID                NOT NULL,
    coach_id           UUID                NOT NULL,
    predicate          VARCHAR(10)         NOT NULL, -- e.g. A, B, C
    notes              TEXT,
    created_at         TIMESTAMPTZ         NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_extra_grades_extra FOREIGN KEY (extracurricular_id)
        REFERENCES extracurriculars (id) ON DELETE CASCADE,
    CONSTRAINT fk_extra_grades_enrollment FOREIGN KEY (enrollment_id)
        REFERENCES student_enrollments (id) ON DELETE CASCADE,
    CONSTRAINT fk_extra_grades_coach FOREIGN KEY (coach_id)
        REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT uq_extra_grades UNIQUE (extracurricular_id, enrollment_id)
);
```

---

## 12. Tabel — Akademik (SPP & Kenaikan Kelas)

### 12.1 `spp_invoices`

Tagihan SPP bulanan.

```sql
CREATE TABLE spp_invoices (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id    UUID                NOT NULL,
    academic_year_id UUID                NOT NULL,
    month            INTEGER             NOT NULL,
    year             INTEGER             NOT NULL,
    amount           DECIMAL(12, 2)      NOT NULL,
    proof_url        TEXT,
    status           spp_status          NOT NULL DEFAULT 'unpaid',
    verified_by      UUID,               -- users.id
    verified_at      TIMESTAMPTZ,
    created_at       TIMESTAMPTZ         NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_spp_invoices_enrollment FOREIGN KEY (enrollment_id)
        REFERENCES student_enrollments (id) ON DELETE CASCADE,
    CONSTRAINT fk_spp_invoices_year FOREIGN KEY (academic_year_id)
        REFERENCES academic_years (id) ON DELETE RESTRICT,
    CONSTRAINT fk_spp_invoices_verified_by FOREIGN KEY (verified_by)
        REFERENCES users (id) ON DELETE SET NULL,
    CONSTRAINT uq_spp_invoices_month UNIQUE (enrollment_id, month, year),
    CONSTRAINT ck_spp_invoices_month CHECK (month >= 1 AND month <= 12)
);
```

### 12.2 `lhbs_reports`

Laporan Hasil Belajar Siswa (Rapor).

```sql
CREATE TABLE lhbs_reports (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id            UUID                NOT NULL,
    homeroom_teacher_id      UUID                NOT NULL,
    academic_year_id         UUID                NOT NULL,
    semester                 semester_type       NOT NULL,
    grades_snapshot          JSONB               NOT NULL,
    extracurricular_snapshot JSONB               NOT NULL,
    attendance_summary       JSONB               NOT NULL,
    homeroom_notes           TEXT,
    pdf_url                  TEXT,
    generated_at             TIMESTAMPTZ         NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_lhbs_reports_enrollment FOREIGN KEY (enrollment_id)
        REFERENCES student_enrollments (id) ON DELETE CASCADE,
    CONSTRAINT fk_lhbs_reports_teacher FOREIGN KEY (homeroom_teacher_id)
        REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT fk_lhbs_reports_year FOREIGN KEY (academic_year_id)
        REFERENCES academic_years (id) ON DELETE RESTRICT,
    CONSTRAINT uq_lhbs_reports_semester UNIQUE (enrollment_id, semester)
);
```

### 12.3 `promotion_decisions`

Keputusan Kenaikan Kelas.

```sql
CREATE TABLE promotion_decisions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id       UUID                NOT NULL,
    homeroom_teacher_id UUID                NOT NULL,
    decision            promotion_decision  NOT NULL,
    notes               TEXT,
    pdf_url             TEXT,
    decided_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_promotion_decisions_enrollment FOREIGN KEY (enrollment_id)
        REFERENCES student_enrollments (id) ON DELETE CASCADE,
    CONSTRAINT fk_promotion_decisions_teacher FOREIGN KEY (homeroom_teacher_id)
        REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT uq_promotion_decisions_enrollment UNIQUE (enrollment_id)
);
```

---

## 13. Ringkasan Tabel

| #  | Tabel                    | Deskripsi                                       | Relasi Utama                  |
| -- | ------------------------ | ----------------------------------------------- | ----------------------------- |
| 1  | `foundation_settings`   | Settings yayasan (singleton)                    | —                             |
| 2  | `units`                 | Unit pendidikan                                 | —                             |
| 3  | `unit_settings`         | Settings per-unit (logo, TTD)                   | → units                      |
| 4  | `users`                 | Akun pengguna                                   | —                             |
| 5  | `user_roles`            | Mapping user-role-unit                          | → users, → units             |
| 6  | `sessions`              | Sesi autentikasi                                | → users                      |
| 7  | `academic_years`        | Tahun ajaran per-unit                           | → units                      |
| 8  | `registrations`         | Pendaftaran PPDB                                | → users, → academic_years, → units |
| 9  | `payments`              | Pembayaran pendaftaran                          | → registrations, → users     |
| 10 | `student_data`          | Data calon siswa                                | → registrations              |
| 11 | `parent_data`           | Data orang tua/wali                             | → registrations              |
| 12 | `documents`             | Berkas yang diunggah                            | → registrations              |
| 13 | `medical_referrals`     | Surat pengantar klinik IMC                      | → registrations              |
| 14 | `observation_schedules` | Jadwal observasi                                | → academic_years, → units    |
| 15 | `observation_bookings`  | Booking observasi                               | → registrations, → observation_schedules |
| 16 | `observation_results`   | Hasil observasi                                 | → observation_bookings, → users |
| 17 | `classes`               | Kelas paralel                                   | → units, → academic_years    |
| 18 | `class_assignments`     | Penempatan siswa ke kelas                       | → registrations, → classes, → users |
| 19 | `student_enrollments`   | Data enrollment siswa aktif                     | → registrations, → classes, → academic_years, → student_data, → users |
| 20 | `subjects`              | Mata pelajaran per unit                         | → units                      |
| 21 | `teacher_assignments`   | Penugasan guru mapel                            | → subjects, → users, → classes, → academic_years |
| 22 | `homeroom_assignments`  | Penugasan wali kelas                            | → users, → classes, → academic_years |
| 23 | `grades`                | Nilai per mata pelajaran                        | → student_enrollments, → subjects, → users, → academic_years |
| 24 | `attendances`           | Presensi siswa per mapel                        | → student_enrollments, → subjects |
| 25 | `teaching_journals`     | Jurnal mengajar guru                            | → subjects, → users, → classes |
| 26 | `lesson_plans`          | Prota, Promes, RPP                              | → subjects, → users          |
| 27 | `class_schedules`       | Jadwal pelajaran kelas                          | → classes, → subjects, → users |
| 28 | `extracurriculars`      | Data ekstrakurikuler                            | → units, → academic_years    |
| 29 | `extracurricular_coaches` | Pembina ekstrakurikuler                       | → extracurriculars, → users  |
| 30 | `extracurricular_schedules` | Jadwal ekstrakurikuler                        | → extracurriculars           |
| 31 | `extracurricular_members` | Siswa peserta ekstrakurikuler                 | → extracurriculars, → student_enrollments |
| 32 | `extracurricular_journals` | Jurnal kegiatan ekskul                       | → extracurriculars, → users  |
| 33 | `extracurricular_grades` | Nilai/predikat ekskul per siswa                | → extracurriculars, → student_enrollments, → users |
| 34 | `spp_invoices`          | Tagihan SPP bulanan                             | → student_enrollments, → academic_years, → users |
| 35 | `lhbs_reports`          | Laporan Hasil Belajar (Rapor)                   | → student_enrollments, → users, → academic_years |
| 36 | `promotion_decisions`   | Keputusan kenaikan kelas                        | → student_enrollments, → users |

**Total: 36 tabel**

---

## 14. Prisma Schema

Implementasi schema database menggunakan Prisma ORM akan disimpan di `prisma/schema.prisma`. Semua model akan didefinisikan dalam satu file tersebut sesuai standar Prisma, dan migrasi akan di-generate otomatis melalui Prisma CLI.

---

## 15. Migration Strategy

| Langkah | Perintah                              | Keterangan                              |
| ------- | ------------------------------------- | --------------------------------------- |
| 1       | `pnpm drizzle-kit generate`           | Generate SQL migration dari schema diff |
| 2       | Review migration file di `src/db/migrations/` | Pastikan SQL aman dan benar        |
| 3       | `pnpm drizzle-kit migrate`            | Jalankan migration ke database          |
| 4       | `pnpm drizzle-kit studio`             | Buka Drizzle Studio untuk inspeksi      |

> [!WARNING]
> Selalu review migration file yang di-generate sebelum menjalankannya, terutama jika ada perubahan destruktif (drop column, rename table, dll.).

---

## 16. Seed Data

```sql
-- ── Foundation Settings ──
INSERT INTO foundation_settings (foundation_name, bank_name, bank_account_number, bank_account_holder)
VALUES ('Yayasan Alfida', NULL, NULL, NULL);

-- ── Units ──
INSERT INTO units (name, slug, level) VALUES
    ('TK Islam Terpadu Auladuna 1',  'tkit-auladuna-1',        'tk'),
    ('TK Islam Terpadu Auladuna 2',  'tkit-auladuna-2',        'tk'),
    ('SD Islam Terpadu Iqra 1',      'sdit-iqra-1',            'sd'),
    ('SD Islam Terpadu Iqra 2',      'sdit-iqra-2',            'sd'),
    ('SD Islam Terpadu Iqra 3',      'sdit-iqra-3',            'sd'),
    ('SMP Islam Terpadu Iqra',       'smpit-iqra',             'smp'),
    ('SMA Islam Terpadu Iqra',       'smait-iqra',             'sma'),
    ('Pesantren Quran Alfida',       'pesantren-quran-alfida', 'pesantren');

-- ── Unit Settings (satu per unit) ──
INSERT INTO unit_settings (unit_id)
SELECT id FROM units;

-- ── Super Admin (password: hash dari password sementara) ──
INSERT INTO users (name, email, phone, password_hash)
VALUES ('Super Admin', 'admin@alfida.sch.id', NULL, '$2b$12$placeholder_hash');

INSERT INTO user_roles (user_id, unit_id, role)
SELECT u.id, NULL, 'super_admin'
FROM users u WHERE u.email = 'admin@alfida.sch.id';
```

---

## 17. Referensi

| Dokumen                                                                | Konten                                 |
| ---------------------------------------------------------------------- | -------------------------------------- |
| [PRD.md](file:///home/alchemista/projects/sim-alfida/docs/PRD.md)      | Fitur detail & user stories            |
| [TDD.md](file:///home/alchemista/projects/sim-alfida/docs/TDD.md)      | Arsitektur teknis & API design         |
| [DESIGN.md](file:///home/alchemista/projects/sim-alfida/DESIGN.md)     | Design system                          |
