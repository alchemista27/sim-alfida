import { z } from "zod";
import { SubjectLevel, GradeType, AttendanceStatus } from "@/generated/client";

export const BatchAttendanceSchema = z.object({
  subjectId: z.string().uuid(),
  classId: z.string().uuid(),
  date: z.string(), // Format YYYY-MM-DD
  attendances: z.array(
    z.object({
      enrollmentId: z.string().uuid(),
      status: z.nativeEnum(AttendanceStatus),
      notes: z.string().optional(),
    })
  ),
});

export const BatchGradeSchema = z.object({
  subjectId: z.string().uuid(),
  classId: z.string().uuid(),
  type: z.nativeEnum(GradeType),
  label: z.string().min(1, "Label wajib diisi"),
  grades: z.array(
    z.object({
      enrollmentId: z.string().uuid(),
      score: z.number().min(0, "Nilai minimal 0").max(100, "Nilai maksimal 100"),
    })
  ),
});

export const ReEnrollmentSchema = z.object({
  currentEnrollmentId: z.string().uuid("ID enrollment tidak valid"),
  nextAcademicYearId: z.string().uuid("ID tahun ajaran baru tidak valid"),
  address: z.string().min(5, "Alamat terlalu pendek").max(500, "Alamat terlalu panjang"),
  transportation: z.string().max(100).optional(),
});

export type ReEnrollmentInput = z.infer<typeof ReEnrollmentSchema>;

export const SubjectSchema = z.object({
  id: z.string().uuid().optional(),
  code: z.string().min(2, "Kode mapel minimal 2 karakter").max(20),
  name: z.string().min(3, "Nama mapel minimal 3 karakter").max(100),
  level: z.nativeEnum(SubjectLevel),
  isActive: z.boolean().default(true),
});

export const TeacherAssignmentSchema = z.object({
  subjectId: z.string().uuid(),
  teacherId: z.string().uuid(),
  classId: z.string().uuid(),
});

export const HomeroomAssignmentSchema = z.object({
  teacherId: z.string().uuid(),
  classId: z.string().uuid(),
});
