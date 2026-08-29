"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function bookSchedule(registrationId: string, scheduleId: string) {
  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Validasi jadwal dan kuota
      const schedule = await tx.observationSchedule.findUnique({
        where: { id: scheduleId },
      });

      if (!schedule) {
        throw new Error("Jadwal tidak ditemukan");
      }

      if (schedule.booked >= schedule.quota) {
        throw new Error("Kuota jadwal ini sudah penuh");
      }

      // 2. Cek pendaftaran
      const registration = await tx.registration.findUnique({
        where: { id: registrationId },
      });

      if (!registration) {
        throw new Error("Data pendaftaran tidak ditemukan");
      }

      if (registration.status !== "observation_scheduled" && registration.status !== "verification") {
         // Some flexibility in case status wasn't updated yet, but ideally it should be observation_scheduled
      }

      // 3. Buat booking
      const booking = await tx.observationBooking.create({
        data: {
          registrationId,
          observationScheduleId: scheduleId,
        },
      });

      // 4. Update kuota
      await tx.observationSchedule.update({
        where: { id: scheduleId },
        data: {
          booked: {
            increment: 1,
          },
        },
      });

      // 5. Pastikan status registration menjadi observation_scheduled (jika belum)
      await tx.registration.update({
        where: { id: registrationId },
        data: {
          status: "observation_scheduled",
        },
      });

      revalidatePath("/parent/dashboard");
      return { success: true, data: booking };
    });
  } catch (error: any) {
    console.error("Failed to book schedule:", error);
    return { success: false, error: error.message || "Gagal melakukan booking jadwal" };
  }
}
