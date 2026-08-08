"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createSchedule(data: {
  academicYearId: string;
  date: Date;
  startTime: string;
  endTime: string;
  quota: number;
}) {
  try {
    const schedule = await prisma.observationSchedule.create({
      data: {
        academicYearId: data.academicYearId,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        quota: data.quota,
      },
    });

    revalidatePath("/admin/ppdb/observations");
    return { success: true, data: schedule };
  } catch (error) {
    console.error("Failed to create schedule:", error);
    return { success: false, error: "Gagal membuat jadwal observasi" };
  }
}

export async function updateSchedule(
  id: string,
  data: {
    date?: Date;
    startTime?: string;
    endTime?: string;
    quota?: number;
  }
) {
  try {
    // Check if new quota is less than already booked
    if (data.quota !== undefined) {
      const current = await prisma.observationSchedule.findUnique({
        where: { id },
        select: { booked: true },
      });
      if (current && data.quota < current.booked) {
        return { success: false, error: "Kuota tidak boleh lebih kecil dari jumlah yang sudah mendaftar" };
      }
    }

    const schedule = await prisma.observationSchedule.update({
      where: { id },
      data,
    });

    revalidatePath("/admin/ppdb/observations");
    return { success: true, data: schedule };
  } catch (error) {
    console.error("Failed to update schedule:", error);
    return { success: false, error: "Gagal memperbarui jadwal observasi" };
  }
}

export async function deleteSchedule(id: string) {
  try {
    // Prevent delete if already booked
    const current = await prisma.observationSchedule.findUnique({
      where: { id },
      select: { booked: true },
    });
    
    if (current && current.booked > 0) {
      return { success: false, error: "Jadwal tidak bisa dihapus karena sudah ada pendaftar" };
    }

    await prisma.observationSchedule.delete({
      where: { id },
    });

    revalidatePath("/admin/ppdb/observations");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete schedule:", error);
    return { success: false, error: "Gagal menghapus jadwal observasi" };
  }
}
