"use server";

import { prisma } from "@/lib/prisma";
import { UserRole, GpsAttendanceStatus, LeaveStatus, WorkProgramStatus } from "@/generated/client";
import { requireRole } from "@/lib/auth-guard";
import { unstable_cache } from "next/cache";

const getCachedBpiOverview = unstable_cache(
  async () => {
    // Liqo Attendance Rate (Global)
    const liqoAttendances = await prisma.liqoAttendance.groupBy({
      by: ['status'],
      _count: { id: true }
    });

    let totalLiqo = 0;
    let presentLiqo = 0;
    liqoAttendances.forEach(a => {
      totalLiqo += a._count.id;
      if (a.status === 'present') presentLiqo += a._count.id;
    });
    
    const liqoAttendanceRate = totalLiqo > 0 ? Math.round((presentLiqo / totalLiqo) * 100) : 0;

    // Mutabaah Aggregates
    const mutabaahAgg = await prisma.mutabaahRecord.aggregate({
      _avg: {
        sholatJamaah: true,
        tilawahPages: true
      }
    });

    return {
      liqoAttendanceRate,
      avgJamaah: mutabaahAgg._avg.sholatJamaah || 0,
      avgTilawah: mutabaahAgg._avg.tilawahPages || 0
    };
  },
  ['super-dashboard-bpi-overview'],
  { revalidate: 60 }
);

export async function getBpiOverview() {
  await requireRole([UserRole.super_admin]);
  return getCachedBpiOverview();
}

const getCachedDepartmentOverview = unstable_cache(
  async () => {
    const workPrograms = await prisma.workProgram.groupBy({
      by: ['status'],
      _count: { id: true }
    });

    let planned = 0, ongoing = 0, completed = 0;
    workPrograms.forEach(wp => {
      if (wp.status === WorkProgramStatus.planned) planned = wp._count.id;
      if (wp.status === WorkProgramStatus.ongoing) ongoing = wp._count.id;
      if (wp.status === WorkProgramStatus.completed) completed = wp._count.id;
    });

    const totalReports = await prisma.activityReport.count();

    return { planned, ongoing, completed, totalReports };
  },
  ['super-dashboard-dept-overview'],
  { revalidate: 60 }
);

export async function getDepartmentOverview() {
  await requireRole([UserRole.super_admin]);
  return getCachedDepartmentOverview();
}

const getCachedAttendanceOverview = unstable_cache(
  async () => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const attendances = await prisma.gpsAttendance.groupBy({
      by: ['status'],
      where: {
        date: {
          gte: today,
          lt: tomorrow
        }
      },
      _count: { id: true }
    });

    let present = 0, late = 0, absent = 0;
    attendances.forEach(a => {
      if (a.status === GpsAttendanceStatus.present) present = a._count.id;
      if (a.status === GpsAttendanceStatus.late) late = a._count.id;
      if (a.status === GpsAttendanceStatus.absent) absent = a._count.id;
    });

    const activeLeaves = await prisma.leaveRequest.count({
      where: {
        status: LeaveStatus.approved,
        startDate: { lte: today },
        endDate: { gte: today }
      }
    });

    return { present, late, absent, activeLeaves };
  },
  ['super-dashboard-att-overview'],
  { revalidate: 60 }
);

export async function getAttendanceOverview() {
  await requireRole([UserRole.super_admin]);
  return getCachedAttendanceOverview();
}
