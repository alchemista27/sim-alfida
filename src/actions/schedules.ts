"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@prisma/client";
import { ClassScheduleSchema } from "@/lib/validators/schedule";
import { z } from "zod";

export async function getClassSchedules(classId: string) {
  try {
    // Both teacher, admin, and parent can see this. We don't restrict who can view if they have access to the route.
    // The route itself should protect parent vs teacher access.
    
    const schedules = await prisma.classSchedule.findMany({
      where: { classId },
      include: {
        subject: true,
        teacher: { select: { id: true, fullName: true } }
      },
      orderBy: [
        { day: 'asc' },
        { startTime: 'asc' }
      ]
    });
    
    return { success: true, data: schedules };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function upsertClassSchedule(formData: z.infer<typeof ClassScheduleSchema>) {
  try {
    const user = await requireRole([UserRole.guru, UserRole.admin_unit, UserRole.super_admin]);
    const parsed = ClassScheduleSchema.parse(formData);
    
    const isGuru = user.roles.some(r => r.role === UserRole.guru);
    
    if (isGuru) {
      // Check if this teacher is the homeroom teacher for this class
      const homeroom = await prisma.homeroomAssignment.findFirst({
        where: {
          teacherId: user.id,
          classId: parsed.classId
        }
      });
      
      if (!homeroom) {
        throw new Error("Akses ditolak: Hanya Wali Kelas yang dapat mengelola jadwal kelas ini.");
      }
    }
    
    // Check for schedule overlap (same day, overlapping time for this class)
    const existing = await prisma.classSchedule.findFirst({
      where: {
        classId: parsed.classId,
        day: parsed.day,
        id: parsed.id ? { not: parsed.id } : undefined,
        OR: [
          {
            AND: [
              { startTime: { lte: parsed.startTime } },
              { endTime: { gt: parsed.startTime } }
            ]
          },
          {
            AND: [
              { startTime: { lt: parsed.endTime } },
              { endTime: { gte: parsed.endTime } }
            ]
          },
          {
            AND: [
              { startTime: { gte: parsed.startTime } },
              { endTime: { lte: parsed.endTime } }
            ]
          }
        ]
      }
    });

    if (existing) {
      throw new Error(`Terjadi bentrok jadwal dengan mapel lain pada hari dan jam tersebut.`);
    }

    if (parsed.id) {
      await prisma.classSchedule.update({
        where: { id: parsed.id },
        data: {
          subjectId: parsed.subjectId,
          teacherId: parsed.teacherId,
          day: parsed.day,
          startTime: parsed.startTime,
          endTime: parsed.endTime,
        }
      });
    } else {
      await prisma.classSchedule.create({
        data: {
          classId: parsed.classId,
          subjectId: parsed.subjectId,
          teacherId: parsed.teacherId,
          day: parsed.day,
          startTime: parsed.startTime,
          endTime: parsed.endTime,
        }
      });
    }
    
    revalidatePath("/admin/schedules");
    revalidatePath("/teacher/schedules");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menyimpan jadwal." };
  }
}

export async function deleteClassSchedule(id: string) {
  try {
    const user = await requireRole([UserRole.guru, UserRole.admin_unit, UserRole.super_admin]);
    const isGuru = user.roles.some(r => r.role === UserRole.guru);
    
    const schedule = await prisma.classSchedule.findUnique({ where: { id } });
    if (!schedule) throw new Error("Jadwal tidak ditemukan.");
    
    if (isGuru) {
      const homeroom = await prisma.homeroomAssignment.findFirst({
        where: {
          teacherId: user.id,
          classId: schedule.classId
        }
      });
      
      if (!homeroom) {
        throw new Error("Akses ditolak: Hanya Wali Kelas yang dapat menghapus jadwal kelas ini.");
      }
    }
    
    await prisma.classSchedule.delete({ where: { id } });
    
    revalidatePath("/admin/schedules");
    revalidatePath("/teacher/schedules");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menghapus jadwal." };
  }
}
