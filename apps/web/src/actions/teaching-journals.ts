"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@sim/database";
import { TeachingJournalSchema } from "@sim/shared";
import { z } from "zod";

export async function getTeachingJournals(classId: string, subjectId: string) {
  try {
    const user = await requireRole([UserRole.guru, UserRole.admin_unit, UserRole.super_admin]);
    
    const isGuru = user.roles.some(r => r.role === UserRole.guru);
    
    // Admin can see everything, teacher can see their own
    const whereClause: any = { classId, subjectId };
    
    if (isGuru) {
      whereClause.teacherId = user.id;
    }
    
    const journals = await prisma.teachingJournal.findMany({
      where: whereClause,
      orderBy: { date: "desc" },
    });
    
    return { success: true, data: journals };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function upsertTeachingJournal(formData: z.infer<typeof TeachingJournalSchema>) {
  try {
    const user = await requireRole([UserRole.guru, UserRole.admin_unit]);
    
    const parsed = TeachingJournalSchema.parse(formData);
    const isGuru = user.roles.some(r => r.role === UserRole.guru);
    
    // Ensure the teacher is assigned to this class and subject if they are a teacher
    if (isGuru) {
      const assignment = await prisma.teacherAssignment.findFirst({
        where: {
          teacherId: user.id,
          classId: parsed.classId,
          subjectId: parsed.subjectId,
        }
      });
      
      if (!assignment) {
        throw new Error("Anda tidak ditugaskan untuk mata pelajaran ini di kelas tersebut.");
      }
    }
    
    const teacherId = user.id;

    if (parsed.id) {
      await prisma.teachingJournal.update({
        where: { id: parsed.id },
        data: {
          date: parsed.date,
          material: parsed.material,
          method: parsed.method,
          reflection: parsed.reflection,
        }
      });
    } else {
      await prisma.teachingJournal.create({
        data: {
          classId: parsed.classId,
          subjectId: parsed.subjectId,
          teacherId: teacherId,
          date: parsed.date,
          material: parsed.material,
          method: parsed.method,
          reflection: parsed.reflection,
        }
      });
    }
    
    revalidatePath("/teacher/journals");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menyimpan jurnal." };
  }
}

export async function deleteTeachingJournal(id: string) {
  try {
    const user = await requireRole([UserRole.guru, UserRole.admin_unit]);
    const isGuru = user.roles.some(r => r.role === UserRole.guru);
    
    const journal = await prisma.teachingJournal.findUnique({ where: { id } });
    if (!journal) throw new Error("Jurnal tidak ditemukan");
    
    if (isGuru && journal.teacherId !== user.id) {
      throw new Error("Anda tidak berhak menghapus jurnal ini.");
    }
    
    await prisma.teachingJournal.delete({ where: { id } });
    revalidatePath("/teacher/journals");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menghapus jurnal." };
  }
}
