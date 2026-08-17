import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@prisma/client";
import { createClient } from "@/lib/supabase/server";
import { ParentExtracurricularClient } from "./client";

export const metadata = {
  title: "Pendaftaran Ekstrakurikuler | SIM-Alfida",
};

export default async function ParentExtracurricularsPage() {
  await requireRole([UserRole.orang_tua]);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div>Unauthorized</div>;
  
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

  // Fetch all active enrollments for this parent
  const enrollments = await prisma.studentEnrollment.findMany({
    where: {
      parentId: user.id,
      academicYearId: activeYear.id,
      status: 'active'
    },
    include: {
      studentData: { select: { fullName: true } },
      class: { select: { unitId: true, name: true } },
      extraMemberships: {
        where: { academicYearId: activeYear.id },
        select: { id: true, extraId: true }
      }
    }
  });

  if (enrollments.length === 0) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="p-6 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg">
          Tidak ada data siswa aktif yang terhubung dengan akun Anda pada tahun ajaran ini.
        </div>
      </div>
    );
  }

  const unitIds = Array.from(new Set(enrollments.map(e => e.class.unitId)));

  // Fetch active extracurriculars in these units
  const extras = await prisma.extracurricular.findMany({
    where: {
      unitId: { in: unitIds },
      isActive: true
    },
    include: {
      coaches: {
        where: { academicYearId: activeYear.id },
        include: { coach: { select: { fullName: true } } }
      },
      schedules: true
    },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Pendaftaran Ekstrakurikuler</h1>
        <p className="text-sm text-gray-500 mt-1">Lihat program kegiatan ekstrakurikuler yang tersedia dan daftarkan anak Anda.</p>
      </div>

      <ParentExtracurricularClient 
        enrollments={enrollments}
        extras={extras}
        academicYearId={activeYear.id}
      />
    </div>
  );
}
