import React from "react";
import { resolveUnitId } from "@/lib/unit-context";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@/generated/client";
import { AcademicYearClient } from "./client";
import { Icon } from "@/components/ui/icon";

export const metadata = {
  title: "Tahun Ajaran | SIM Alfida",
};

export default async function AcademicYearsPage() {
  await requireRole([UserRole.admin_unit, UserRole.super_admin]);
  const unitId = await resolveUnitId();

  const unit = await prisma.unit.findUnique({
    where: { id: unitId },
    select: { name: true },
  });

  if (!unit) {
    return <div>Unit tidak ditemukan.</div>;
  }

  const allYears = await prisma.academicYear.findMany({
    where: { unitId },
    orderBy: { startDate: "desc" },
  });

  const formattedYears = allYears.map(y => ({
    ...y,
    startDate: y.startDate.toISOString(),
    endDate: y.endDate.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-2xl text-primary">Tahun Ajaran Akademik</h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola tahun ajaran untuk keperluan akademik dan kelas pada unit {unit.name}.
          </p>
        </div>
      </div>
      
      <AcademicYearClient unitId={unitId} unitName={unit.name} years={formattedYears} />
    </div>
  );
}
