import React from "react";
import { getStaffAssignments } from "@/actions/staff";
import { prisma } from "@/lib/prisma";
import { StaffClient } from "./staff-client";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@prisma/client";

export default async function AdminStaffPage() {
  await requireRole([UserRole.super_admin, UserRole.admin_kepegawaian]);

  const staff = await getStaffAssignments();
  const units = await prisma.unit.findMany({ orderBy: { name: "asc" } });

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
