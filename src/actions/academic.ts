"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@prisma/client";
import { resolveUnitId } from "@/lib/unit-context";
import { 
  SubjectSchema, 
  TeacherAssignmentSchema, 
  HomeroomAssignmentSchema 
} from "@/lib/validators/academic";
import { ensureUserRole } from "@/lib/ensure-role";

// --- Subject Management ---

export async function createSubject(formData: any) {
  try {
    await requireRole([UserRole.admin_unit, UserRole.super_admin]);
    const unitId = await resolveUnitId();
    
    const parsed = SubjectSchema.parse(formData);
    
    await prisma.subject.create({
      data: {
        unitId,
        code: parsed.code,
        name: parsed.name,
        level: parsed.level,
        isActive: parsed.isActive,
      }
    });
    
    revalidatePath("/unit/academic-subjects");
    return { success: true };
  } catch (error: any) {
    console.error("createSubject error:", error);
    return { success: false, error: error.message || "Gagal membuat mata pelajaran." };
  }
}

export async function updateSubject(id: string, formData: any) {
  try {
    await requireRole([UserRole.admin_unit, UserRole.super_admin]);
    const unitId = await resolveUnitId();
    
    const parsed = SubjectSchema.parse(formData);
    
    // Verify ownership
    const existing = await prisma.subject.findUnique({ where: { id } });
    if (!existing || existing.unitId !== unitId) {
      throw new Error("Mata pelajaran tidak ditemukan atau bukan milik unit Anda.");
    }

    await prisma.subject.update({
      where: { id },
      data: {
        code: parsed.code,
        name: parsed.name,
        level: parsed.level,
        isActive: parsed.isActive,
      }
    });
    
    revalidatePath("/unit/academic-subjects");
    return { success: true };
  } catch (error: any) {
    console.error("updateSubject error:", error);
    return { success: false, error: error.message || "Gagal memperbarui mata pelajaran." };
  }
}

export async function deleteSubject(id: string) {
  try {
    await requireRole([UserRole.admin_unit, UserRole.super_admin]);
    const unitId = await resolveUnitId();
    
    const existing = await prisma.subject.findUnique({ where: { id } });
    if (!existing || existing.unitId !== unitId) {
      throw new Error("Mata pelajaran tidak ditemukan atau bukan milik unit Anda.");
    }

    await prisma.subject.delete({ where: { id } });
    revalidatePath("/unit/academic-subjects");
    return { success: true };
  } catch (error: any) {
    console.error("deleteSubject error:", error);
    return { success: false, error: "Gagal menghapus mata pelajaran. Pastikan mapel ini belum digunakan (assigned)." };
  }
}


// --- Teacher Assignment ---

export async function assignTeacherToSubject(formData: any, academicYearId: string) {
  try {
    await requireRole([UserRole.admin_unit, UserRole.super_admin]);
    const unitId = await resolveUnitId(); // check context
    
    const parsed = TeacherAssignmentSchema.parse(formData);
    
    // Validasi duplikasi
    const existing = await prisma.teacherAssignment.findUnique({
      where: {
        subjectId_teacherId_classId_academicYearId: {
          subjectId: parsed.subjectId,
          teacherId: parsed.teacherId,
          classId: parsed.classId,
          academicYearId: academicYearId,
        }
      }
    });

    if (existing) {
      throw new Error("Guru ini sudah ditugaskan untuk mata pelajaran dan kelas tersebut.");
    }

    await prisma.teacherAssignment.create({
      data: {
        subjectId: parsed.subjectId,
        teacherId: parsed.teacherId,
        classId: parsed.classId,
        academicYearId: academicYearId,
      }
    });
    
    // Pastikan guru punya UserRoleAssignment "guru" di unit terkait
    const subject = await prisma.subject.findUnique({ where: { id: parsed.subjectId } });
    if (subject) {
      await ensureUserRole(parsed.teacherId, UserRole.guru, subject.unitId);
    }
    
    revalidatePath("/unit/academic-teachers");
    return { success: true };
  } catch (error: any) {
    console.error("assignTeacherToSubject error:", error);
    return { success: false, error: error.message || "Gagal menugaskan guru mapel." };
  }
}

export async function removeTeacherAssignment(id: string) {
  try {
    await requireRole([UserRole.admin_unit, UserRole.super_admin]);
    // Optionally verify unitId if needed via joins
    await prisma.teacherAssignment.delete({ where: { id } });
    revalidatePath("/unit/academic-teachers");
    return { success: true };
  } catch (error: any) {
    console.error("removeTeacherAssignment error:", error);
    return { success: false, error: "Gagal menghapus penugasan guru mapel." };
  }
}


// --- Homeroom Assignment ---

export async function assignHomeroomTeacher(formData: any, academicYearId: string) {
  try {
    await requireRole([UserRole.admin_unit, UserRole.super_admin]);
    
    const parsed = HomeroomAssignmentSchema.parse(formData);
    
    // Hanya bisa ada 1 wali kelas per kelas per tahun ajaran
    const existing = await prisma.homeroomAssignment.findUnique({
      where: {
        classId_academicYearId: {
          classId: parsed.classId,
          academicYearId: academicYearId,
        }
      }
    });

    if (existing) {
      throw new Error("Kelas ini sudah memiliki wali kelas untuk tahun ajaran tersebut.");
    }

    await prisma.homeroomAssignment.create({
      data: {
        teacherId: parsed.teacherId,
        classId: parsed.classId,
        academicYearId: academicYearId,
      }
    });
    
    // Pastikan wali kelas punya UserRoleAssignment "guru" di unit terkait
    const classRoom = await prisma.classRoom.findUnique({
      where: { id: parsed.classId },
      include: { unit: true }
    });
    if (classRoom) {
      await ensureUserRole(parsed.teacherId, UserRole.guru, classRoom.unitId);
    }
    
    revalidatePath("/unit/academic-teachers");
    return { success: true };
  } catch (error: any) {
    console.error("assignHomeroomTeacher error:", error);
    return { success: false, error: error.message || "Gagal menugaskan wali kelas." };
  }
}

export async function removeHomeroomAssignment(id: string) {
  try {
    await requireRole([UserRole.admin_unit, UserRole.super_admin]);
    await prisma.homeroomAssignment.delete({ where: { id } });
    revalidatePath("/unit/academic-teachers");
    return { success: true };
  } catch (error: any) {
    console.error("removeHomeroomAssignment error:", error);
    return { success: false, error: "Gagal menghapus penugasan wali kelas." };
  }
}

// --- Attendance & Grades ---

import { BatchAttendanceSchema, BatchGradeSchema } from "@/lib/validators/academic";
import { createClient } from "@/lib/supabase/server";

export async function submitBatchAttendance(formData: any, academicYearId: string) {
  try {
    await requireRole([UserRole.guru, UserRole.admin_unit, UserRole.super_admin]);
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const parsed = BatchAttendanceSchema.parse(formData);
    
    // Gunakan transaksi untuk memastikan semua tersimpan
    await prisma.$transaction(async (tx) => {
      for (const item of parsed.attendances) {
        // Cek jika sudah ada berdasarkan composite unique
        const existing = await tx.attendance.findUnique({
          where: {
            enrollmentId_subjectId_date: {
              enrollmentId: item.enrollmentId,
              subjectId: parsed.subjectId,
              date: new Date(parsed.date),
            }
          }
        });

        if (existing) {
          await tx.attendance.update({
            where: { id: existing.id },
            data: { status: item.status, notes: item.notes }
          });
        } else {
          await tx.attendance.create({
            data: {
              enrollmentId: item.enrollmentId,
              subjectId: parsed.subjectId,
              teacherId: user.id, // Guru yang input
              date: new Date(parsed.date),
              status: item.status,
              notes: item.notes,
            }
          });
        }
      }
    });

    revalidatePath("/teacher/attendance");
    return { success: true };
  } catch (error: any) {
    console.error("submitBatchAttendance error:", error);
    return { success: false, error: error.message || "Gagal menyimpan absensi." };
  }
}

export async function submitBatchGrade(formData: any, academicYearId: string) {
  try {
    await requireRole([UserRole.guru, UserRole.admin_unit, UserRole.super_admin]);
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const parsed = BatchGradeSchema.parse(formData);

    await prisma.$transaction(async (tx) => {
      for (const item of parsed.grades) {
        // Cari nilai yang sudah ada untuk (enrollmentId, subjectId, type, label) di tahun ajaran ini
        // Karena tabel Grade tidak punya composite unique untuk keempat itu (hanya id PK),
        // kita cari secara manual lalu update/create
        const existingList = await tx.grade.findMany({
          where: {
            enrollmentId: item.enrollmentId,
            subjectId: parsed.subjectId,
            academicYearId: academicYearId,
            type: parsed.type,
            label: parsed.label
          }
        });

        if (existingList.length > 0) {
          // Update yang pertama ketemu
          await tx.grade.update({
            where: { id: existingList[0].id },
            data: { score: item.score }
          });
        } else {
          await tx.grade.create({
            data: {
              enrollmentId: item.enrollmentId,
              subjectId: parsed.subjectId,
              teacherId: user.id,
              academicYearId: academicYearId,
              type: parsed.type,
              label: parsed.label,
              score: item.score
            }
          });
        }
      }
    });

    revalidatePath("/teacher/grades");
    return { success: true };
  } catch (error: any) {
    console.error("submitBatchGrade error:", error);
    return { success: false, error: error.message || "Gagal menyimpan nilai." };
  }
}
