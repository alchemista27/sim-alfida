import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@prisma/client";
import { createClient } from "@/lib/supabase/server";
import { ScheduleManager } from "@/components/schedules/schedule-manager";

export const metadata = {
  title: "Jadwal Wali Kelas | SIM-Alfida",
};

export default async function TeacherSchedulesPage() {
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

  // Fetch classes where this teacher is a homeroom teacher
  const homeroomAssignments = await prisma.homeroomAssignment.findMany({
    where: {
      teacherId: user.id,
      academicYearId: activeYear.id
    },
    include: {
      class: {
        include: { unit: true }
      }
    }
  });

  if (homeroomAssignments.length === 0) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="p-6 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg">
          Anda tidak ditugaskan sebagai Wali Kelas pada tahun ajaran ini sehingga tidak memiliki akses untuk mengatur jadwal.
        </div>
      </div>
    );
  }

  const classes = homeroomAssignments.map(ha => ha.class);
  const unitIds = Array.from(new Set(classes.map(c => c.unitId)));

  // Fetch subjects available in these units
  const subjects = await prisma.subject.findMany({
    where: { unitId: { in: unitIds }, isActive: true },
    orderBy: { name: 'asc' }
  });

  // Fetch teachers assigned to any subjects in these units for this academic year
  const teacherAssignments = await prisma.teacherAssignment.findMany({
    where: {
      academicYearId: activeYear.id,
      subject: { unitId: { in: unitIds } }
    },
    include: { teacher: true }
  });

  const teachersMap = new Map();
  teacherAssignments.forEach(ta => {
    if (!teachersMap.has(ta.teacherId)) {
      teachersMap.set(ta.teacherId, ta.teacher);
    }
  });
  const teachers = Array.from(teachersMap.values());

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Jadwal Kelas (Wali Kelas)</h1>
        <p className="text-sm text-gray-500 mt-1">Susun jadwal pelajaran untuk kelas perwalian Anda.</p>
      </div>

      <ScheduleManager 
        classes={classes}
        subjects={subjects}
        teachers={teachers}
      />
    </div>
  );
}
