import React from "react";
import { PpdbOverviewClient } from "@/components/unit/ppdb-overview-client";
import { requireRole } from "@/lib/auth-guard";
import { resolveUnitId } from "@/lib/unit-context";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@sim/database";

export default async function UnitPpdbOverviewPage() {
  await requireRole([UserRole.admin_unit, UserRole.super_admin]);
  const unitId = await resolveUnitId();

  const unit = await prisma.unit.findUnique({ where: { id: unitId } });

  const academicYears = await prisma.academicYear.findMany({
    where: { unitId },
    orderBy: { startDate: "desc" },
  });

  const activeYear = academicYears.find((ay) => ay.ppdbActive) ?? null;
  const pastYears = academicYears.filter((ay) => !ay.ppdbActive);

  const mapYear = (ay: (typeof academicYears)[0]) => ({
    id: ay.id,
    name: ay.name,
    startDate: ay.startDate.toISOString(),
    endDate: ay.endDate.toISOString(),
    quota: ay.quota,
    registered: ay.registered,
    ppdbActive: ay.ppdbActive,
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-tertiary font-semibold uppercase tracking-wider mb-1">
          PPDB · {unit?.name}
        </p>
        <h1 className="font-heading font-bold text-2xl text-primary">Overview PPDB</h1>
        <p className="text-sm text-gray-500 mt-1">
          Kelola periode pendaftaran dan tahun ajaran untuk unit Anda.
        </p>
      </div>

      <PpdbOverviewClient
        unitId={unitId}
        unitName={unit?.name ?? ""}
        activeYear={activeYear ? mapYear(activeYear) : null}
        pastYears={pastYears.map(mapYear)}
      />
    </div>
  );
}
