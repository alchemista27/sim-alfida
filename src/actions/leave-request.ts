import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/actions/user";
import { LeaveRequestSchema, type LeaveRequestInput } from "@/lib/validators/leave-request";
import { UserRole } from "@prisma/client";
import { requireRole } from "@/lib/auth-guard";

export async function getMyLeaveRequests() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  await requireRole([UserRole.karyawan, UserRole.guru]);

  return await prisma.leaveRequest.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
}

export async function createLeaveRequest(data: LeaveRequestInput) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  await requireRole([UserRole.karyawan, UserRole.guru]);

  const parsed = LeaveRequestSchema.parse(data);

  const leave = await prisma.leaveRequest.create({
    data: {
      userId: user.id,
      type: parsed.type,
      startDate: parsed.startDate,
      endDate: parsed.endDate,
      reason: parsed.reason,
      attachmentUrl: parsed.attachmentUrl,
    }
  });

  return { success: true, id: leave.id };
}
