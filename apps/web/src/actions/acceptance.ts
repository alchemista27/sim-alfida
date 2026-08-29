"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function batchAcceptStudents(registrationIds: string[]) {
  try {
    await prisma.registration.updateMany({
      where: {
        id: { in: registrationIds },
      },
      data: {
        status: "accepted",
      },
    });

    revalidatePath("/admin/ppdb/observations/results");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to batch accept students:", error);
    return { success: false, error: "Gagal menetapkan status Diterima" };
  }
}

export async function batchRejectStudents(registrationIds: string[], reason: string = "Tidak memenuhi standar kelulusan observasi") {
  try {
    await prisma.registration.updateMany({
      where: {
        id: { in: registrationIds },
      },
      data: {
        status: "rejected",
        rejectionReason: reason,
      },
    });

    revalidatePath("/admin/ppdb/observations/results");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to batch reject students:", error);
    return { success: false, error: "Gagal menetapkan status Ditolak" };
  }
}
