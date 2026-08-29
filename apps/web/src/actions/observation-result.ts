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

      // 4. Kalkulasi ulang ranking (Auto-Ranking) menggunakan 1 SQL Query (Sangat Cepat)
      await tx.$executeRaw`
        WITH RankedResults AS (
          SELECT r.id, ROW_NUMBER() OVER (ORDER BY r.score DESC) as new_rank
          FROM sim.observation_results r
          JOIN sim.observation_bookings b ON r.observation_booking_id = b.id
          JOIN sim.ppdb_registrations p ON b.registration_id = p.id
          WHERE p.academic_year_id = ${booking.registration.academicYearId}::uuid
        )
        UPDATE sim.observation_results
        SET rank = RankedResults.new_rank
        FROM RankedResults
        WHERE sim.observation_results.id = RankedResults.id
      `;

      revalidatePath("/observer");
      revalidatePath("/admin/ppdb/observations/results");
      return { success: true, data: result };
    });
  } catch (error: any) {
    console.error("Failed to submit observation result:", error);
    return { success: false, error: error.message || "Gagal menyimpan hasil observasi" };
  }
}
