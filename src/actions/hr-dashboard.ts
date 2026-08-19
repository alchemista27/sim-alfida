import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/actions/user";
import { UserRole, GpsAttendanceStatus, LeaveStatus } from "@prisma/client";
import { requireRole } from "@/lib/auth-guard";

export async function getStaffDemographics() {
  await requireRole([UserRole.super_admin, UserRole.admin_kepegawaian]);

  const totalUsers = await prisma.user.count({
    where: { isActive: true }
  });

  const rolesCount = await prisma.userRoleAssignment.groupBy({
    by: ['role'],
    _count: {
      userId: true
    }
  });

  const unitBreakdown = await prisma.userRoleAssignment.groupBy({
    by: ['unitId'],
    _count: {
      userId: true
    },
    where: {
      unitId: { not: null }
    }
  });

  const units = await prisma.unit.findMany({ select: { id: true, name: true } });
  
  const formattedUnitBreakdown = unitBreakdown.map(u => {
    const unitName = units.find(un => un.id === u.unitId)?.name || 'Unknown Unit';
    return { unitName, count: u._count.userId };
  });

  return { totalUsers, rolesCount, formattedUnitBreakdown };
}

export async function getAttendanceRecap(startDate: Date, endDate: Date, unitId?: string) {
  await requireRole([UserRole.super_admin, UserRole.admin_kepegawaian]);

  const userWhere = unitId ? { roles: { some: { unitId } } } : {};

  // Get all active users
  const users = await prisma.user.findMany({
    where: { isActive: true, ...userWhere },
    select: { id: true, fullName: true }
  });

  // Get GPS Attendances for the period
  const attendances = await prisma.gpsAttendance.findMany({
    where: {
      date: { gte: startDate, lte: endDate },
      userId: { in: users.map(u => u.id) }
    },
    select: { userId: true, status: true }
  });

  // Get Approved Leaves for the period
  const leaves = await prisma.leaveRequest.findMany({
    where: {
      status: LeaveStatus.approved,
      startDate: { lte: endDate },
      endDate: { gte: startDate },
      userId: { in: users.map(u => u.id) }
    },
    select: { userId: true, startDate: true, endDate: true }
  });

  const recap = users.map(user => {
    const userAtts = attendances.filter(a => a.userId === user.id);
    const userLeaves = leaves.filter(l => l.userId === user.id);
    
    let presentCount = 0;
    let lateCount = 0;
    
    userAtts.forEach(a => {
      if (a.status === GpsAttendanceStatus.present) presentCount++;
      if (a.status === GpsAttendanceStatus.late) lateCount++;
    });

    let leaveDays = 0;
    userLeaves.forEach(l => {
      const start = l.startDate < startDate ? startDate : l.startDate;
      const end = l.endDate > endDate ? endDate : l.endDate;
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      leaveDays += diffDays;
    });

    return {
      userId: user.id,
      fullName: user.fullName,
      present: presentCount,
      late: lateCount,
      leave: leaveDays,
      absent: 0 // Calculate working days minus (present+late+leave) later if needed
    };
  });

  return recap;
}
