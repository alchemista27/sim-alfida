import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@/generated/client";
import { createClient } from "@/lib/supabase/server";
import { ExtracurricularCoachClient } from "./client";

export const metadata = {
  title: "Pembina Ekstrakurikuler | SIM-Alfida",
};

export default async function TeacherExtracurricularsPage() {
  await requireRole([UserRole.guru]);
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

  // Find extracurriculars where this teacher is a coach
  const coachAssignments = await prisma.extracurricularCoach.findMany({
    where: {
      coachId: user.id,
      academicYearId: activeYear.id
    },
    include: {
      extracurricular: {
        include: {
          schedules: true,
          journals: {
            orderBy: { date: 'desc' }
          },
          members: {
            where: { academicYearId: activeYear.id },
            include: {
              enrollment: {
                include: { studentData: { select: { fullName: true } } }
              },
              grades: true
            }
          },
          _count: {
            select: { members: { where: { academicYearId: activeYear.id } } }
          }
        }
      }
    }
  });

  if (coachAssignments.length === 0) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="p-6 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg">
          Anda tidak ditugaskan sebagai pembina ekstrakurikuler pada tahun ajaran ini.
        </div>
      </div>
    );
  }

  const extras = coachAssignments.map(ca => ca.extracurricular);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Ruang Pembina Ekstrakurikuler</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola jadwal pertemuan dan catat jurnal kegiatan ekstrakurikuler Anda.</p>
      </div>

      <ExtracurricularCoachClient extras={extras} />
    </div>
  );
}
