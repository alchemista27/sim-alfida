import React from "react";
import { getDepartments } from "@/actions/departments";
import { prisma } from "@/lib/prisma";
import { DepartmentClient } from "./department-client";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@sim/database";

export default async function AdminDepartmentsPage() {
  await requireRole([UserRole.super_admin, UserRole.admin_kepegawaian]);

  const departments = await getDepartments();
  const units = await prisma.unit.findMany({ orderBy: { name: "asc" } });
  const users = await prisma.user.findMany({ orderBy: { fullName: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-bold text-2xl text-primary">
          Kelola Bidang (Departemen)
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Daftar bidang atau departemen di Yayasan Alfida.
        </p>
      </div>

      <DepartmentClient departments={departments} units={units} users={users} />
    </div>
  );
}
