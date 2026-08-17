import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@prisma/client";
import { UnitPromotionClient } from "./client";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Kenaikan Kelas | SIM-Alfida",
};

export default async function UnitPromotionPage() {
  await requireRole([UserRole.admin_unit]);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div>Unauthorized</div>;

  const activeYear = await prisma.academicYear.findFirst({
    orderBy: { startDate: 'desc' }
  });

  if (!activeYear) {
    return <div className="p-6">Tidak ada Tahun Ajaran aktif.</div>;
  }

  const role = await prisma.userRoleAssignment.findFirst({
    where: { userId: user.id, role: 'admin_unit' }
  });
  
  if (!role || !role.unitId) {
    return <div className="p-6">Anda belum di-assign ke unit manapun.</div>;
  }

  const classes = await prisma.class.findMany({
    where: { unitId: role.unitId, academicYearId: activeYear.id },
    orderBy: { name: 'asc' }
  });

  const enrollments = await prisma.studentEnrollment.findMany({
    where: { 
      class: { unitId: role.unitId, academicYearId: activeYear.id },
      status: 'active'
    },
    include: {
      studentData: { select: { fullName: true, nisn: true } },
      class: { select: { name: true, id: true } },
      promotionDecision: true,
      lhbsReports: {
        where: { semester: 'final' } // check if final report exists
      }
    },
    orderBy: {
      studentData: { fullName: 'asc' }
    }
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Kenaikan Kelas & Kelulusan</h1>
        <p className="text-sm text-gray-500 mt-1">Tetapkan status kenaikan kelas (Naik / Tinggal) di akhir tahun ajaran.</p>
      </div>

      <UnitPromotionClient 
        classes={classes}
        enrollments={enrollments}
      />
    </div>
  );
}
