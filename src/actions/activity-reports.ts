"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/actions/user";
import { UserRole, ReportType } from "@prisma/client";
import { requireRole } from "@/lib/auth-guard";
import { ActivityReportSchema, type ActivityReportInput } from "@/lib/validators/activity-report";

export async function getActivityReports(departmentId?: string, type?: ReportType) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  await requireRole([UserRole.super_admin, UserRole.admin_bidang]);

  let allowedDepartmentIds: string[] = [];

  if (user.roles.some(r => r.role === UserRole.super_admin)) {
    if (departmentId) {
      allowedDepartmentIds = [departmentId];
    } else {
      const allDepts = await prisma.department.findMany({ select: { id: true } });
      allowedDepartmentIds = allDepts.map(d => d.id);
    }
  } else if (user.roles.some(r => r.role === UserRole.admin_bidang)) {
    const userDepts = await prisma.departmentAdmin.findMany({
      where: { userId: user.id },
      select: { departmentId: true }
    });
    allowedDepartmentIds = userDepts.map(d => d.departmentId);
    if (departmentId && allowedDepartmentIds.includes(departmentId)) {
      allowedDepartmentIds = [departmentId];
    } else if (departmentId) {
      throw new Error("Unauthorized access to department");
    }
  }

  return await prisma.activityReport.findMany({
    where: {
      departmentId: { in: allowedDepartmentIds },
      ...(type && { type }),
    },
    include: {
      department: { select: { name: true } },
      submittedBy: { select: { fullName: true } }
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createActivityReport(data: ActivityReportInput) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  await requireRole([UserRole.super_admin, UserRole.admin_bidang]);

  const parsed = ActivityReportSchema.parse(data);

  return await prisma.activityReport.create({
    data: {
      ...parsed,
      submittedById: user.id,
    }
  });
}

export async function deleteActivityReport(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  await requireRole([UserRole.super_admin, UserRole.admin_bidang]);

  return await prisma.activityReport.delete({
    where: { id }
  });
}
