"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitObservationResult(data: {
  observationBookingId: string;
  observerId: string;
  score: number;
  notes: string;
}) {
  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Cek Booking
      const booking = await tx.observationBooking.findUnique({
        where: { id: data.observationBookingId },
        include: { registration: true },
      });

      if (!booking) {
        throw new Error("Data booking observasi tidak ditemukan");
      }

      // 2. Simpan atau Update Hasil
      const result = await tx.observationResult.upsert({
        where: { observationBookingId: data.observationBookingId },
        create: {
          observationBookingId: data.observationBookingId,
          observerId: data.observerId,
          score: data.score,
          notes: data.notes,
        },
        update: {
          observerId: data.observerId,
          score: data.score,
          notes: data.notes,
        },
      });

      // 3. Update status pendaftaran menjadi observation_done
      await tx.registration.update({
        where: { id: booking.registrationId },
        data: {
          status: "observation_done",
        },
      });

      // 4. Kalkulasi ulang ranking (Auto-Ranking)
      // Ambil seluruh hasil observasi di tahun ajaran yang sama
      const allResults = await tx.observationResult.findMany({
        where: {
          booking: {
            registration: {
              academicYearId: booking.registration.academicYearId,
            },
          },
        },
        orderBy: {
          score: "desc",
        },
      });

      // Update ranking
      for (let i = 0; i < allResults.length; i++) {
        await tx.observationResult.update({
          where: { id: allResults[i].id },
          data: { rank: i + 1 },
        });
      }

      revalidatePath("/observer");
      revalidatePath("/admin/ppdb/observations/results");
      return { success: true, data: result };
    });
  } catch (error: any) {
    console.error("Failed to submit observation result:", error);
    return { success: false, error: error.message || "Gagal menyimpan hasil observasi" };
  }
}
