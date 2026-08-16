"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createClass(data: {
  unitId: string;
  academicYearId: string;
  name: string;
  capacity: number;
}) {
  try {
    const newClass = await prisma.class.create({
      data: {
        unitId: data.unitId,
        academicYearId: data.academicYearId,
        name: data.name,
        capacity: data.capacity,
      },
    });

    revalidatePath("/admin/ppdb/classes");
    return { success: true, data: newClass };
  } catch (error) {
    console.error("Failed to create class:", error);
    return { success: false, error: "Gagal membuat kelas baru" };
  }
}

export async function updateClass(
  id: string,
  data: {
    name?: string;
    capacity?: number;
  }
) {
  try {
    if (data.capacity !== undefined) {
      const current = await prisma.class.findUnique({
        where: { id },
        select: { assigned: true },
      });
      if (current && data.capacity < current.assigned) {
        return { success: false, error: "Kapasitas kelas tidak boleh lebih kecil dari jumlah siswa yang sudah masuk" };
      }
    }

    const updated = await prisma.class.update({
      where: { id },
      data,
    });

    revalidatePath("/admin/ppdb/classes");
    return { success: true, data: updated };
  } catch (error) {
    console.error("Failed to update class:", error);
    return { success: false, error: "Gagal memperbarui kelas" };
  }
}

export async function deleteClass(id: string) {
  try {
    const current = await prisma.class.findUnique({
      where: { id },
      select: { assigned: true },
    });
    
    if (current && current.assigned > 0) {
      return { success: false, error: "Kelas tidak bisa dihapus karena sudah ada siswa di dalamnya" };
    }

    await prisma.class.delete({
      where: { id },
    });

    revalidatePath("/admin/ppdb/classes");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete class:", error);
    return { success: false, error: "Gagal menghapus kelas" };
  }
}
