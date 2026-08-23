import React from "react";
import { getStaffAssignments } from "@/actions/staff";
import { prisma } from "@/lib/prisma";
import { StaffClient } from "./staff-client";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@prisma/client";
import { getCurrentUser } from "@/actions/user";

export default async function AdminStaffPage() {
  await requireRole([UserRole.super_admin, UserRole.admin_kepegawaian, UserRole.admin_unit, UserRole.admin_unit_nondik]);

  const user = await getCurrentUser();
  if (!user) return null;

  const isSuperAdmin = user.roles.some((r: any) => r.role === "super_admin");
  const isAdminKepegawaian = user.roles.some((r: any) => r.role === "admin_kepegawaian");

  const adminUnitRoleIds = user.roles
    .filter((r: any) => (r.role === "admin_unit" || r.role === "admin_unit_nondik") && r.unitId)
    .map((r: any) => r.unitId as string);

  const staff = await getStaffAssignments();
  
  let units;
  if (isSuperAdmin || isAdminKepegawaian) {
    units = await prisma.unit.findMany({ orderBy: { name: "asc" } });
  } else {
    units = await prisma.unit.findMany({
      where: { id: { in: adminUnitRoleIds } },
      orderBy: { name: "asc" }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-bold text-2xl text-primary">
          Kelola Staf & Guru
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Daftar staf, karyawan, dan guru serta penempatan unit.
        </p>
      </div>

      <StaffClient staff={staff} units={units} />
    </div>
  );
}
