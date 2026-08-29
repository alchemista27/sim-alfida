import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@sim/database";
import { resolveUnitId } from "@/lib/unit-context";
import { ExtracurricularAdminClient } from "./client";

export const metadata = {
  title: "Manajemen Ekstrakurikuler | SIM-Alfida",
};

export default async function UnitExtracurricularsPage() {
  await requireRole([UserRole.admin_unit, UserRole.super_admin]);
  const unitId = await resolveUnitId();
  
  const activeYear = await prisma.academicYear.findFirst({
    orderBy: { startDate: 'desc' }
  });

  if (!activeYear) {
    return (
      <div className="p-6">
        <div className="p-6 bg-yellow-50 text-yellow-800 rounded-lg">Tidak ada Tahun Ajaran aktif.</div>
      </div>
    );
  }

  // Fetch all extracurriculars for this unit
  const extras = await prisma.extracurricular.findMany({
    where: { unitId },
    include: {
      _count: {
        select: { members: { where: { academicYearId: activeYear.id } } }
      },
      coaches: {
        where: { academicYearId: activeYear.id },
        include: { coach: { select: { id: true, fullName: true } } }
      }
    },
    orderBy: { name: 'asc' }
  });

  // Fetch all teachers that can be assigned as coaches
  // Assuming all teachers in the DB can be coaches, or just fetch Users with Role.guru
  const teachers = await prisma.user.findMany({
    where: {
      roles: {
        some: { role: UserRole.guru }
      }
    },
    select: { id: true, fullName: true },
    orderBy: { fullName: 'asc' }
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Ekstrakurikuler</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola program ekstrakurikuler, tugaskan pembina, dan pantau pendaftar.</p>
      </div>

      <ExtracurricularAdminClient 
        extras={extras}
        teachers={teachers}
        academicYearId={activeYear.id}
      />
    </div>
  );
}
