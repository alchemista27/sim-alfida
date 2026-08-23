"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/actions/user";
import { UserRole, LeaveStatus, LeaveType } from "@prisma/client";
import { requireRole } from "@/lib/auth-guard";

export async function getAllLeaveRequests() {
  await requireRole([UserRole.super_admin, UserRole.admin_kepegawaian]);

  return await prisma.leaveRequest.findMany({
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
  await requireRole([UserRole.super_admin, UserRole.admin_kepegawaian]);

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
  await requireRole([UserRole.super_admin, UserRole.admin_kepegawaian]);

  await prisma.leaveRequest.update({
    where: { id: leaveId },
    data: {
      status: LeaveStatus.rejected,
      approvedById: approver.id,
    }
  });

  return { success: true };
}
