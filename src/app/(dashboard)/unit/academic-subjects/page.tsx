import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@prisma/client";
import { resolveUnitId } from "@/lib/unit-context";
import { SubjectClient } from "./subject-client";

export const metadata = {
  title: "Manajemen Mata Pelajaran | SIM-Alfida",
};

export default async function AcademicSubjectsPage() {
  await requireRole([UserRole.admin_unit, UserRole.super_admin]);
  const unitId = await resolveUnitId();

  const subjects = await prisma.subject.findMany({
    where: { unitId },
    orderBy: [
      { level: 'asc' },
      { name: 'asc' }
    ]
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <SubjectClient initialData={subjects} />
    </div>
  );
}
