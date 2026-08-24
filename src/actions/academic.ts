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
    const classRoom = await prisma.class.findUnique({
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
    const targetDate = new Date(parsed.date);
    
    // 1. Ambil semua data absensi yang sudah ada (Bulk Fetch)
    const existingRecords = await prisma.attendance.findMany({
      where: {
        subjectId: parsed.subjectId,
        date: targetDate,
        enrollmentId: { in: parsed.attendances.map((a: any) => a.enrollmentId) }
      }
    });

    const existingMap = new Map(existingRecords.map(r => [r.enrollmentId, r]));

    const toCreate: any[] = [];
    const toUpdate: any[] = [];

    // 2. Pilah mana yang harus dibuat dan diubah
    for (const item of parsed.attendances) {
      const existing = existingMap.get(item.enrollmentId);
      if (existing) {
        toUpdate.push(prisma.attendance.update({
          where: { id: existing.id },
          data: { status: item.status, notes: item.notes }
        }));
      } else {
        toCreate.push({
          enrollmentId: item.enrollmentId,
          subjectId: parsed.subjectId,
          teacherId: user.id,
          date: targetDate,
          status: item.status,
          notes: item.notes,
        });
      }
    }

    // 3. Eksekusi bersamaan (Prisma Transaction API)
    const txOperations = [];
    if (toCreate.length > 0) {
      txOperations.push(prisma.attendance.createMany({ data: toCreate }));
    }
    txOperations.push(...toUpdate);

    if (txOperations.length > 0) {
      await prisma.$transaction(txOperations);
    }

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
    
    // 1. Ambil semua data nilai yang sudah ada di tahun ajaran, subject, type, label ini
    const existingRecords = await prisma.grade.findMany({
      where: {
        academicYearId: academicYearId,
        subjectId: parsed.subjectId,
        type: parsed.type,
        label: parsed.label,
        enrollmentId: { in: parsed.grades.map((g: any) => g.enrollmentId) }
      }
    });

    const existingMap = new Map(existingRecords.map(r => [r.enrollmentId, r]));

    const toCreate: any[] = [];
    const toUpdate: any[] = [];

    // 2. Pilah mana yang harus dibuat dan diubah
    for (const item of parsed.grades) {
      const existing = existingMap.get(item.enrollmentId);
      if (existing) {
        toUpdate.push(prisma.grade.update({
          where: { id: existing.id },
          data: { score: item.score }
        }));
      } else {
        toCreate.push({
          enrollmentId: item.enrollmentId,
          subjectId: parsed.subjectId,
          teacherId: user.id,
          academicYearId: academicYearId,
          type: parsed.type,
          label: parsed.label,
          score: item.score
        });
      }
    }

    // 3. Eksekusi transaksi
    const txOperations = [];
    if (toCreate.length > 0) {
      txOperations.push(prisma.grade.createMany({ data: toCreate }));
    }
    txOperations.push(...toUpdate);

    if (txOperations.length > 0) {
      await prisma.$transaction(txOperations);
    }

    revalidatePath("/teacher/grades");
    return { success: true };
  } catch (error: any) {
    console.error("submitBatchGrade error:", error);
    return { success: false, error: error.message || "Gagal menyimpan nilai." };
  }
}
