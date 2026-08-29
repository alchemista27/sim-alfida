"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@sim/database";
import { LessonPlanSchema } from "@sim/shared";
import { z } from "zod";

export async function getLessonPlans(subjectId?: string, academicYearId?: string) {
  try {
    const user = await requireRole([UserRole.guru, UserRole.admin_unit, UserRole.super_admin]);
    const isGuru = user.roles.some(r => r.role === UserRole.guru);
    
    const whereClause: any = {};
    if (subjectId) whereClause.subjectId = subjectId;
    if (academicYearId) whereClause.academicYearId = academicYearId;
    
    if (isGuru) {
      whereClause.teacherId = user.id;
    }
    
    const plans = await prisma.lessonPlan.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        subject: true,
        academicYear: true,
      }
    });
    
    return { success: true, data: plans };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function upsertLessonPlan(formData: z.infer<typeof LessonPlanSchema>) {
  try {
    const user = await requireRole([UserRole.guru, UserRole.admin_unit]);
    const parsed = LessonPlanSchema.parse(formData);
    const isGuru = user.roles.some(r => r.role === UserRole.guru);
    const teacherId = user.id;

    if (parsed.id) {
      const plan = await prisma.lessonPlan.findUnique({ where: { id: parsed.id } });
      if (!plan) throw new Error("Rencana ajar tidak ditemukan.");
      if (isGuru && plan.teacherId !== user.id) {
        throw new Error("Anda tidak berhak mengedit dokumen ini.");
      }

      await prisma.lessonPlan.update({
        where: { id: parsed.id },
        data: {
          type: parsed.type,
          title: parsed.title,
          content: parsed.content, // JSON stringified from client
        }
      });
    } else {
      await prisma.lessonPlan.create({
        data: {
          subjectId: parsed.subjectId,
          academicYearId: parsed.academicYearId,
          teacherId: teacherId,
          type: parsed.type,
          title: parsed.title,
          content: parsed.content,
        }
      });
    }
    
    revalidatePath("/teacher/lesson-plans");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menyimpan rencana ajar." };
  }
}

export async function deleteLessonPlan(id: string) {
  try {
    const user = await requireRole([UserRole.guru, UserRole.admin_unit]);
    const isGuru = user.roles.some(r => r.role === UserRole.guru);
    
    const plan = await prisma.lessonPlan.findUnique({ where: { id } });
    if (!plan) throw new Error("Dokumen tidak ditemukan");
    
    if (isGuru && plan.teacherId !== user.id) {
      throw new Error("Anda tidak berhak menghapus dokumen ini.");
    }
    
    await prisma.lessonPlan.delete({ where: { id } });
    revalidatePath("/teacher/lesson-plans");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menghapus dokumen." };
  }
}
