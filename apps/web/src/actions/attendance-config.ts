"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@sim/database";
import { revalidatePath } from "next/cache";
import { GpsConfigSchema, HolidaySchema, type GpsConfigInput, type HolidayInput } from "@sim/shared";

// ── GPS Config ──

export async function getGpsConfigs() {
  await requireRole([UserRole.super_admin, UserRole.admin_kepegawaian, UserRole.admin_unit, UserRole.admin_unit_nondik]);
  return await prisma.gpsAttendanceConfig.findMany({
    include: {
      unit: true
    }
  });
}

export async function upsertGpsConfig(data: GpsConfigInput) {
  await requireRole([UserRole.super_admin, UserRole.admin_kepegawaian, UserRole.admin_unit, UserRole.admin_unit_nondik]);
  const parsed = GpsConfigSchema.parse(data);

  await prisma.gpsAttendanceConfig.upsert({
    where: { unitId: parsed.unitId },
    update: {
      latitude: parsed.latitude,
      longitude: parsed.longitude,
      radiusMeters: parsed.radiusMeters,
    },
    create: {
      unitId: parsed.unitId,
      latitude: parsed.latitude,
      longitude: parsed.longitude,
      radiusMeters: parsed.radiusMeters,
    }
  });

  revalidatePath("/admin/attendance-settings");
}

// ── Holidays ──

export async function getHolidays(month: number, year: number, unitId?: string) {
  await requireRole([UserRole.super_admin, UserRole.admin_kepegawaian, UserRole.admin_unit, UserRole.admin_unit_nondik]);
  
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const whereClause: any = {
    date: {
      gte: startDate,
      lte: endDate
    }
  };

  // If unitId is provided, fetch global holidays (unitId = null) OR specific to unit
  if (unitId) {
    whereClause.OR = [
      { unitId: null },
      { unitId: unitId }
    ];
  }

  return await prisma.holiday.findMany({
    where: whereClause,
    orderBy: { date: 'asc' },
    include: {
      unit: true
    }
  });
}

export async function upsertHoliday(data: HolidayInput) {
  await requireRole([UserRole.super_admin, UserRole.admin_kepegawaian, UserRole.admin_unit, UserRole.admin_unit_nondik]);
  const parsed = HolidaySchema.parse(data);

  if (parsed.id) {
    await prisma.holiday.update({
      where: { id: parsed.id },
      data: {
        date: parsed.date,
        name: parsed.name,
        description: parsed.description,
        unitId: parsed.unitId,
      }
    });
  } else {
    await prisma.holiday.create({
      data: {
        date: parsed.date,
        name: parsed.name,
        description: parsed.description,
        unitId: parsed.unitId,
      }
    });
  }

  revalidatePath("/admin/attendance-settings");
}

export async function deleteHoliday(id: string) {
  await requireRole([UserRole.super_admin, UserRole.admin_kepegawaian, UserRole.admin_unit, UserRole.admin_unit_nondik]);
  await prisma.holiday.delete({ where: { id } });
  revalidatePath("/admin/attendance-settings");
}
