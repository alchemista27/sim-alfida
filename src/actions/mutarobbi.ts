"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { getCurrentUser } from "@/actions/user";
import { MutabaahRecordSchema, type MutabaahRecordInput } from "@/lib/validators/mutabaah";
import { UserRole } from "@prisma/client";

export async function getMyLiqoGroup() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  await requireRole([UserRole.guru, UserRole.karyawan]);

  const membership = await prisma.liqoMember.findFirst({
    where: { userId: user.id },
    include: {
      group: {
        include: {
          murobbi: {
            select: { fullName: true }
          },
          meetings: {
            orderBy: { date: 'desc' },
            include: {
              attendances: {
                where: { userId: user.id }
              }
            }
          }
        }
      }
    }
  });

  return membership?.group || null;
}

export async function saveMutabaahRecord(data: MutabaahRecordInput) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  await requireRole([UserRole.karyawan, UserRole.guru]);

  const parsed = MutabaahRecordSchema.parse(data);

  // Normalize date to UTC midnight for unique constraint
  const dateStr = parsed.date.toISOString().split("T")[0];
  const normalizedDate = new Date(`${dateStr}T00:00:00Z`);

  await prisma.mutabaahRecord.upsert({
    where: {
      userId_date: {
        userId: user.id,
        date: normalizedDate,
      }
    },
    update: {
      sholatJamaah: parsed.sholatJamaah,
      sholatRawatib: parsed.sholatRawatib,
      sholatDhuha: parsed.sholatDhuha,
      sholatTahajud: parsed.sholatTahajud,
      tilawahPages: parsed.tilawahPages,
      puasaSunnah: parsed.puasaSunnah,
      infaq: parsed.infaq,
    },
    create: {
      userId: user.id,
      date: normalizedDate,
      sholatJamaah: parsed.sholatJamaah,
      sholatRawatib: parsed.sholatRawatib,
      sholatDhuha: parsed.sholatDhuha,
      sholatTahajud: parsed.sholatTahajud,
      tilawahPages: parsed.tilawahPages,
      puasaSunnah: parsed.puasaSunnah,
      infaq: parsed.infaq,
    }
  });

  return { success: true };
}

export async function getMyMutabaah(startDate: Date, endDate: Date) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  await requireRole([UserRole.karyawan, UserRole.guru]);

  return await prisma.mutabaahRecord.findMany({
    where: {
      userId: user.id,
      date: {
        gte: startDate,
        lte: endDate,
      }
    },
    orderBy: { date: "asc" }
  });
}
