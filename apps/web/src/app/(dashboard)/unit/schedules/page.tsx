import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@sim/database";
import { ScheduleManager } from "@/components/schedules/schedule-manager";
import { resolveUnitId } from "@/lib/unit-context";

export const metadata = {
  title: "Manajemen Jadwal Kelas | SIM-Alfida",
};

export default async function UnitSchedulesPage() {
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

  // Fetch all classes in unit
  const classes = await prisma.class.findMany({
    where: { 
      unitId,
      academicYearId: activeYear.id
    },
    orderBy: { name: 'asc' }
  });

  // Fetch all subjects in unit
  const subjects = await prisma.subject.findMany({
    where: { unitId, isActive: true },
    orderBy: { name: 'asc' }
  });

  // Fetch all teachers that have roles in this unit
  // Alternatively, just fetch all teachers from TeacherAssignment for this active year and unit
  const teacherAssignments = await prisma.teacherAssignment.findMany({
    where: {
      academicYearId: activeYear.id,
      subject: { unitId }
    },
    include: { teacher: true }
  });

  // Unique teachers
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
        <h1 className="text-2xl font-bold text-gray-800">Manajemen Jadwal Kelas</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola jadwal pelajaran untuk seluruh kelas di unit pendidikan ini.</p>
      </div>

      <ScheduleManager 
        classes={classes}
        subjects={subjects}
        teachers={teachers}
      />
    </div>
  );
}
