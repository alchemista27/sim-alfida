import React from "react";
import { requireRole } from "@/lib/auth-guard";
import { UserRole, RegistrationStatus } from "@/generated/client";
import { resolveUnitId } from "@/lib/unit-context";
import { prisma } from "@/lib/prisma";
import { VerificationClient } from "@/components/unit/ppdb-verification-client";
import { Icon } from "@/components/ui/icon";

export default async function UnitPpdbVerificationPage() {
  await requireRole([UserRole.admin_unit, UserRole.super_admin]);
  const unitId = await resolveUnitId();

  // Fetch all registrations in verification state
  const registrations = await prisma.registration.findMany({
    where: {
      academicYear: { unitId },
      status: RegistrationStatus.verification,
    },
    include: {
      studentData: true,
      documents: true,
    },
    orderBy: { createdAt: "asc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <p className="text-xs text-tertiary font-semibold uppercase tracking-wider mb-1">
            Tim PPDB
          </p>
          <h1 className="font-heading font-bold text-2xl text-primary">
            Verifikasi Berkas Calon Siswa
          </h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
            <Icon name="info" className="text-[16px]" />
            Periksa seluruh dokumen pendaftar dan hasil tes medis (IMC).
          </p>
        </div>
      </div>

      <VerificationClient registrations={registrations} />
    </div>
  );
}
