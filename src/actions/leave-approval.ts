"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/actions/user";
import { UserRole, LeaveStatus, LeaveType } from "@/generated/client";
import { requireRole } from "@/lib/auth-guard";

export async function getAllLeaveRequests() {
  await requireRole([UserRole.super_admin, UserRole.admin_kepegawaian, UserRole.admin_unit, UserRole.admin_unit_nondik]);

  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");
  
  const isGlobalAdmin = currentUser.roles.some((r: any) => 
    r.role === "super_admin" || r.role === "admin_kepegawaian"
  );
  
  const adminUnitIds = currentUser.roles
    .filter((r: any) => (r.role === "admin_unit" || r.role === "admin_unit_nondik") && r.unitId)
    .map((r: any) => r.unitId as string);

  let whereClause: any = {};
  if (!isGlobalAdmin) {
    if (adminUnitIds.length === 0) return [];
    whereClause = { user: { roles: { some: { unitId: { in: adminUnitIds } } } } };
  }

  return await prisma.leaveRequest.findMany({
    where: whereClause,
    include: {
      user: {
        select: {
          fullName: true,
          leaveQuota: true,
        }
      }
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function approveLeaveRequest(leaveId: string) {
  const approver = await getCurrentUser();
  if (!approver) throw new Error("Unauthorized");
  await requireRole([UserRole.super_admin, UserRole.admin_kepegawaian, UserRole.admin_unit, UserRole.admin_unit_nondik]);

  const leave = await prisma.leaveRequest.findUnique({
    where: { id: leaveId }
  });

  if (!leave) throw new Error("Leave request not found");
  if (leave.status !== LeaveStatus.pending) throw new Error("Leave request already processed");

  // Calculate days (simple difference)
  const days = Math.ceil((leave.endDate.getTime() - leave.startDate.getTime()) / (1000 * 3600 * 24)) + 1;

  // Use transaction if it's a 'cuti' to subtract quota
  if (leave.type === LeaveType.cuti) {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: leave.userId },
        data: { leaveQuota: { decrement: days } }
      }),
      prisma.leaveRequest.update({
        where: { id: leaveId },
        data: {
          status: LeaveStatus.approved,
          approvedById: approver.id,
        }
      })
    ]);
  } else {
    // If it's 'sakit' or 'izin', just approve it without quota deduction
    await prisma.leaveRequest.update({
      where: { id: leaveId },
      data: {
        status: LeaveStatus.approved,
        approvedById: approver.id,
      }
    });
  }

  return { success: true };
}

export async function rejectLeaveRequest(leaveId: string) {
  const approver = await getCurrentUser();
  if (!approver) throw new Error("Unauthorized");
  await requireRole([UserRole.super_admin, UserRole.admin_kepegawaian, UserRole.admin_unit, UserRole.admin_unit_nondik]);

  await prisma.leaveRequest.update({
    where: { id: leaveId },
    data: {
      status: LeaveStatus.rejected,
      approvedById: approver.id,
    }
  });

  return { success: true };
}
