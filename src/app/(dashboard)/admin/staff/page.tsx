import React from "react";
import { getStaffAssignments } from "@/actions/staff";
import { prisma } from "@/lib/prisma";
import { StaffClient } from "./staff-client";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@/generated/client";
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

  const allStaff = await getStaffAssignments();
  
  let visibleStaff = allStaff;
  let units;
  if (isSuperAdmin || isAdminKepegawaian) {
    units = await prisma.unit.findMany({ orderBy: { name: "asc" } });
  } else {
    units = await prisma.unit.findMany({
      where: { id: { in: adminUnitRoleIds } },
      orderBy: { name: "asc" }
    });
    
    // Only show staff that have a role in the admin's unit
    visibleStaff = allStaff.filter((u: any) => 
      u.roles.some((r: any) => adminUnitRoleIds.includes(r.unitId))
    );
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

      <StaffClient staff={visibleStaff} allUsers={allStaff} units={units} />
    </div>
  );
}
