"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@prisma/client";
import { resolveUnitId } from "@/lib/unit-context";
import { 
  ExtracurricularSchema, 
  CoachAssignmentSchema, 
  ExtracurricularScheduleSchema, 
  ExtracurricularJournalSchema,
  ExtracurricularGradeSchema
} from "@/lib/validators/extracurricular";
import { z } from "zod";

// --- UNIT ADMIN ACTIONS ---

export async function upsertExtracurricular(formData: z.infer<typeof ExtracurricularSchema>) {
  try {
    await requireRole([UserRole.admin_unit, UserRole.super_admin]);
    const unitId = await resolveUnitId();
    const parsed = ExtracurricularSchema.parse(formData);
    
    if (parsed.id) {
      await prisma.extracurricular.update({
        where: { id: parsed.id },
        data: {
          name: parsed.name,
          description: parsed.description,
          isActive: parsed.isActive
        }
      });
    } else {
      await prisma.extracurricular.create({
        data: {
          unitId,
          name: parsed.name,
          description: parsed.description,
          isActive: parsed.isActive
        }
      });
    }
    revalidatePath("/unit/extracurriculars");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function assignCoach(formData: z.infer<typeof CoachAssignmentSchema>, academicYearId: string) {
  try {
    await requireRole([UserRole.admin_unit, UserRole.super_admin]);
    const parsed = CoachAssignmentSchema.parse(formData);
    
    await prisma.extracurricularCoach.create({
      data: {
        extraId: parsed.extraId,
        coachId: parsed.coachId,
        academicYearId
      }
    });
    revalidatePath("/unit/extracurriculars");
    return { success: true };
  } catch (error: any) {
    // Unique constraint error if already assigned
    if (error.code === 'P2002') {
      return { success: false, error: "Guru ini sudah ditugaskan sebagai pembina di program ekskul tersebut tahun ajaran ini." };
    }
    return { success: false, error: error.message };
  }
}

export async function removeCoach(id: string) {
  try {
    await requireRole([UserRole.admin_unit, UserRole.super_admin]);
    await prisma.extracurricularCoach.delete({ where: { id } });
    revalidatePath("/unit/extracurriculars");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- COACH (TEACHER) ACTIONS ---

async function requireCoachAccess(extraId: string) {
  const user = await requireRole([UserRole.guru, UserRole.admin_unit, UserRole.super_admin]);
  const isGuru = user.roles.some(r => r.role === UserRole.guru);
  
  if (isGuru) {
    const isCoach = await prisma.extracurricularCoach.findFirst({
      where: { extraId, coachId: user.id }
    });
    if (!isCoach) {
      throw new Error("Anda tidak memiliki akses pembina untuk ekstrakurikuler ini.");
    }
  }
  return user;
}

export async function upsertExtraSchedule(formData: z.infer<typeof ExtracurricularScheduleSchema>) {
  try {
    const parsed = ExtracurricularScheduleSchema.parse(formData);
    await requireCoachAccess(parsed.extraId);
    
    if (parsed.id) {
      await prisma.extracurricularSchedule.update({
        where: { id: parsed.id },
        data: {
          day: parsed.day,
          startTime: parsed.startTime,
          endTime: parsed.endTime,
          location: parsed.location
        }
      });
    } else {
      await prisma.extracurricularSchedule.create({
        data: {
          extraId: parsed.extraId,
          day: parsed.day,
          startTime: parsed.startTime,
          endTime: parsed.endTime,
          location: parsed.location
        }
      });
    }
    revalidatePath("/teacher/extracurriculars");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteExtraSchedule(id: string) {
  try {
    const schedule = await prisma.extracurricularSchedule.findUnique({ where: { id } });
    if (!schedule) throw new Error("Jadwal tidak ditemukan.");
    
    await requireCoachAccess(schedule.extraId);
    await prisma.extracurricularSchedule.delete({ where: { id } });
    revalidatePath("/teacher/extracurriculars");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function upsertExtraJournal(formData: z.infer<typeof ExtracurricularJournalSchema>) {
  try {
    const parsed = ExtracurricularJournalSchema.parse(formData);
    const user = await requireCoachAccess(parsed.extraId);
    
    // For coachId, we use the logged in user if they are a guru, else admin. 
    // Wait, journals strictly need coachId. Let's get the user id.
    
    if (parsed.id) {
      await prisma.extracurricularJournal.update({
        where: { id: parsed.id },
        data: {
          date: parsed.date,
          activity: parsed.activity,
          attendance: parsed.attendance,
          notes: parsed.notes
        }
      });
    } else {
      await prisma.extracurricularJournal.create({
        data: {
          extraId: parsed.extraId,
          coachId: user.id,
          date: parsed.date,
          activity: parsed.activity,
          attendance: parsed.attendance,
          notes: parsed.notes
        }
      });
    }
    revalidatePath("/teacher/extracurriculars");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteExtraJournal(id: string) {
  try {
    const journal = await prisma.extracurricularJournal.findUnique({ where: { id } });
    if (!journal) throw new Error("Jurnal tidak ditemukan.");
    
    await requireCoachAccess(journal.extraId);
    await prisma.extracurricularJournal.delete({ where: { id } });
    revalidatePath("/teacher/extracurriculars");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function upsertExtraGrade(formData: z.infer<typeof ExtracurricularGradeSchema>) {
  try {
    const parsed = ExtracurricularGradeSchema.parse(formData);
    
    // Member must exist, and coach must have access to that extra
    const member = await prisma.extracurricularMember.findUnique({
      where: { id: parsed.memberId }
    });
    
    if (!member) throw new Error("Anggota tidak ditemukan.");
    
    await requireCoachAccess(member.extraId);
    
    if (parsed.id) {
      await prisma.extracurricularGrade.update({
        where: { id: parsed.id },
        data: {
          score: parsed.score,
          notes: parsed.notes
        }
      });
    } else {
      await prisma.extracurricularGrade.create({
        data: {
          memberId: parsed.memberId,
          enrollmentId: parsed.enrollmentId,
          semester: parsed.semester as any,
          score: parsed.score,
          notes: parsed.notes
        }
      });
    }
    
    revalidatePath("/teacher/extracurriculars");
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: "Nilai untuk semester ini sudah ada." };
    }
    return { success: false, error: error.message };
  }
}

// --- PARENT ACTIONS ---

export async function joinExtracurricular(extraId: string, enrollmentId: string, academicYearId: string) {
  try {
    const user = await requireRole([UserRole.orang_tua]);
    
    // Verify the parent actually owns this enrollment
    const enrollment = await prisma.studentEnrollment.findUnique({
      where: { id: enrollmentId }
    });
    
    if (!enrollment || enrollment.parentId !== user.id) {
      throw new Error("Akses ditolak: Siswa ini bukan anak Anda.");
    }

    await prisma.extracurricularMember.create({
      data: {
        extraId,
        enrollmentId,
        academicYearId
      }
    });
    
    revalidatePath("/parent/extracurriculars");
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: "Anak Anda sudah terdaftar di ekstrakurikuler ini." };
    }
    return { success: false, error: error.message };
  }
}

export async function leaveExtracurricular(memberId: string) {
  try {
    const user = await requireRole([UserRole.orang_tua]);
    
    const member = await prisma.extracurricularMember.findUnique({ 
      where: { id: memberId },
      include: { enrollment: true }
    });
    
    if (!member || member.enrollment.parentId !== user.id) {
      throw new Error("Akses ditolak atau data tidak ditemukan.");
    }

    await prisma.extracurricularMember.delete({ where: { id: memberId } });
    revalidatePath("/parent/extracurriculars");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
