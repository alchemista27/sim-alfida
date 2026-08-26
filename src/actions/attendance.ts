"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { UserRole, GpsAttendanceStatus } from "@/generated/client";
import { revalidatePath } from "next/cache";
import { GpsCheckInOutSchema, type GpsCheckInOutInput } from "@/lib/validators/staff-attendance";
import { calculateDistance } from "@/lib/haversine";
import { getCurrentUser } from "@/actions/user";

/**
 * Mendapatkan konfigurasi unit tempat user terdaftar, 
 * beserta pengecekan hari libur hari ini.
 */
export async function getTodayAttendanceContext() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  // Get user role assignment to know their unit
  const assignment = await prisma.userRoleAssignment.findFirst({
    where: {
      userId: user.id,
      role: {
        in: [UserRole.guru, UserRole.karyawan]
      }
    },
    include: {
      unit: {
        include: {
          gpsAttendanceConfig: true
        }
      }
    }
  });

  if (!assignment || !assignment.unit) {
    throw new Error("Anda belum ditugaskan ke Unit Pendidikan/Kantor manapun.");
  }

  const unit = assignment.unit;
  const config = unit.gpsAttendanceConfig;
  
  if (!config) {
    throw new Error(`Konfigurasi GPS untuk unit ${unit.name} belum diatur oleh admin.`);
  }

  // Check if today is a holiday
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const holiday = await prisma.holiday.findFirst({
    where: {
      date: today,
      OR: [
        { unitId: null },
        { unitId: unit.id }
      ]
    }
  });

  // Check if user has already checked in today
  const attendance = await prisma.gpsAttendance.findUnique({
    where: {
      userId_date: {
        userId: user.id,
        date: today
      }
    }
  });

  return {
    unitId: unit.id,
    unitName: unit.name,
    config,
    holiday,
    attendance
  };
}

/**
 * API Check In
 */
export async function checkIn(data: GpsCheckInOutInput) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  await requireRole([UserRole.guru, UserRole.karyawan]);

  const parsed = GpsCheckInOutSchema.parse(data);
  const context = await getTodayAttendanceContext();
  
  if (context.holiday) {
    throw new Error("Hari ini adalah hari libur, tidak perlu melakukan absensi.");
  }
  if (context.attendance?.checkInTime) {
    throw new Error("Anda sudah melakukan check in hari ini.");
  }

  // Validate distance
  const distance = calculateDistance(
    parsed.latitude,
    parsed.longitude,
    context.config.latitude,
    context.config.longitude
  );

  if (distance > context.config.radiusMeters) {
    throw new Error(`Anda berada di luar jangkauan radius absensi. (Jarak Anda: ${Math.round(distance)} meter dari titik pusat)`);
  }

  // Determine status: Late if after 07:15 AM
  const now = new Date();
  const cutoff = new Date();
  cutoff.setHours(7, 15, 0, 0);

  const status = now > cutoff ? GpsAttendanceStatus.late : GpsAttendanceStatus.present;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.gpsAttendance.create({
    data: {
      userId: user.id,
      unitId: context.unitId,
      date: today,
      checkInTime: now,
      latitude: parsed.latitude,
      longitude: parsed.longitude,
      status: status
    }
  });

  revalidatePath("/staff/attendance");
}

/**
 * API Check Out
 */
export async function checkOut(data: GpsCheckInOutInput) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  await requireRole([UserRole.guru, UserRole.karyawan]);

  const parsed = GpsCheckInOutSchema.parse(data);
  const context = await getTodayAttendanceContext();

  if (!context.attendance?.checkInTime) {
    throw new Error("Anda belum melakukan check in hari ini.");
  }
  if (context.attendance.checkOutTime) {
    throw new Error("Anda sudah melakukan check out hari ini.");
  }

  // Validate distance
  const distance = calculateDistance(
    parsed.latitude,
    parsed.longitude,
    context.config.latitude,
    context.config.longitude
  );

  if (distance > context.config.radiusMeters) {
    throw new Error(`Anda berada di luar jangkauan radius absensi. (Jarak Anda: ${Math.round(distance)} meter)`);
  }

  await prisma.gpsAttendance.update({
    where: { id: context.attendance.id },
    data: {
      checkOutTime: new Date(),
    }
  });

  revalidatePath("/staff/attendance");
}

/**
 * History
 */
export async function getMyAttendanceHistory(month: number, year: number) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  await requireRole([UserRole.guru, UserRole.karyawan]);

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  return await prisma.gpsAttendance.findMany({
    where: {
      userId: user.id,
      date: {
        gte: startDate,
        lte: endDate
      }
    },
    orderBy: { date: 'desc' }
  });
}
