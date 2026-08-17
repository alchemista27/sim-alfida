import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@prisma/client";
import { createClient } from "@/lib/supabase/server";
import { PlanClient } from "./plan-client";

export const metadata = {
  title: "Perencanaan Pembelajaran | SIM-Alfida",
};

export default async function TeacherLessonPlansPage() {
  await requireRole([UserRole.guru, UserRole.admin_unit, UserRole.super_admin]);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return <div>Unauthorized</div>;

  const activeYear = await prisma.academicYear.findFirst({
    orderBy: { startDate: 'desc' }
  });

  if (!activeYear) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="p-6 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-lg">
          Tidak ada Tahun Ajaran aktif.
        </div>
      </div>
    );
  }

  // Find unique subjects assigned to this teacher for the active year
  const assignments = await prisma.teacherAssignment.findMany({
    where: { 
      teacherId: user.id,
      academicYearId: activeYear.id,
    },
    include: {
      subject: true,
    }
  });

  // Get unique subjects
  const subjectsMap = new Map();
  assignments.forEach(a => {
    if (!subjectsMap.has(a.subjectId)) {
      subjectsMap.set(a.subjectId, a.subject);
    }
  });
  const subjects = Array.from(subjectsMap.values());

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Perencanaan Pembelajaran</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola Prota, Promes, dan RPP Anda.</p>
      </div>

      <PlanClient 
        academicYearId={activeYear.id} 
        subjects={subjects} 
      />
    </div>
  );
}
