"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function assignToClass(registrationId: string, classId: string) {
  try {
    return await prisma.$transaction(async (tx) => {
      const reg = await tx.registration.findUnique({
        where: { id: registrationId }
      });

      if (!reg || reg.status !== "accepted") {
        throw new Error("Pendaftar belum lulus/diterima.");
      }

      const targetClass = await tx.class.findUnique({
        where: { id: classId }
      });

      if (!targetClass) {
        throw new Error("Kelas tidak ditemukan.");
      }

      if (targetClass.assigned >= targetClass.capacity) {
        throw new Error(`Kelas ${targetClass.name} sudah penuh!`);
      }

      // 1. Buat Assignment
      const assignment = await tx.classAssignment.create({
        data: {
          registrationId,
          classId
        }
      });

      // 2. Tambah kuota terisi
      await tx.class.update({
        where: { id: classId },
        data: {
          assigned: { increment: 1 }
        }
      });

      // 3. Ubah status jadi enrolled
      await tx.registration.update({
        where: { id: registrationId },
        data: { status: "enrolled" }
      });

      revalidatePath("/admin/ppdb/classes/assignments");
      revalidatePath("/admin/ppdb/classes");
      return { success: true, data: assignment };
    });
  } catch (error: any) {
    console.error("Failed to assign class:", error);
    return { success: false, error: error.message || "Gagal menetapkan kelas" };
  }
}
