"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/actions/user";
import { Prisma, UserRole, GpsAttendanceStatus, LeaveStatus } from "@prisma/client";
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
  await requireRole([UserRole.super_admin, UserRole.admin_kepegawaian, UserRole.admin_unit, UserRole.admin_unit_nondik]);

  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");
  
  const isGlobalAdmin = currentUser.roles.some((r: any) => 
    r.role === "super_admin" || r.role === "admin_kepegawaian"
  );
  
  const adminUnitIds = currentUser.roles
    .filter((r: any) => (r.role === "admin_unit" || r.role === "admin_unit_nondik") && r.unitId)
    .map((r: any) => r.unitId as string);

  let userWhere: any = {};

  if (!isGlobalAdmin) {
    if (adminUnitIds.length === 0) return []; // No access
    userWhere = { roles: { some: { unitId: { in: adminUnitIds } } } };
  } else if (unitId) {
    userWhere = { roles: { some: { unitId } } };
  }

  // Get all active users matching the access criteria
  const users = await prisma.user.findMany({
    where: { isActive: true, ...userWhere },
    select: { id: true }
  });

  if (users.length === 0) return [];

  const userIds = users.map(u => u.id);

  // Use Raw SQL for heavy aggregations inside the DB (prevents Node.js memory spikes)
  const recap = await prisma.$queryRaw<any[]>`
    SELECT 
      u.id as "userId",
      u.full_name as "fullName",
      COUNT(a.id) FILTER (WHERE a.status = 'present')::int as present,
      COUNT(a.id) FILTER (WHERE a.status = 'late')::int as late,
      COALESCE((
        SELECT SUM(
          (LEAST(l.end_date, ${endDate}::date) - GREATEST(l.start_date, ${startDate}::date)) + 1
        )
        FROM sim.leave_requests l
        WHERE l.user_id = u.id 
          AND l.status = 'approved'
          AND l.start_date <= ${endDate}::date
          AND l.end_date >= ${startDate}::date
      ), 0)::int as leave,
      0 as absent
    FROM shared.users u
    LEFT JOIN sim.gps_attendances a ON a.user_id = u.id AND a.date >= ${startDate}::date AND a.date <= ${endDate}::date
    WHERE u.id IN (${Prisma.join(userIds)})
    GROUP BY u.id, u.full_name
  `;

  return recap;
}
