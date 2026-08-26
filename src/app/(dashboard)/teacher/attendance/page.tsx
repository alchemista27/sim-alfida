import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@/generated/client";
import { createClient } from "@/lib/supabase/server";
import { AttendanceClient } from "./attendance-client";

export const metadata = {
  title: "Input Absensi Harian | SIM-Alfida",
};

export default async function TeacherAttendancePage() {
  await requireRole([UserRole.guru, UserRole.admin_unit, UserRole.super_admin]);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return <div>Unauthorized</div>;

  // Find active academic year based on teacher's assignments (simplification: get latest academic year globally)
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

  // Get teacher's subject assignments
  const assignments = await prisma.teacherAssignment.findMany({
    where: { 
      teacherId: user.id,
      academicYearId: activeYear.id,
    },
    include: {
      subject: true,
      class: true,
    }
  });

  // Get enrolled students for the classes assigned to this teacher
  // For optimization, we can prefetch students for all these classes, or fetch them client side.
  // We'll fetch them here so it's SSR ready.
  const classIds = assignments.map(a => a.classId);
  const students = await prisma.studentEnrollment.findMany({
    where: {
      academicYearId: activeYear.id,
      classId: { in: classIds },
      status: 'active',
    },
    include: {
      studentData: {
        select: { id: true, fullName: true, nisn: true }
      }
    },
    orderBy: { studentData: { fullName: 'asc' } }
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Input Absensi Harian</h1>
        <p className="text-sm text-gray-500 mt-1">Tahun Ajaran: {activeYear.name}</p>
      </div>

      <AttendanceClient 
        academicYearId={activeYear.id}
        assignments={assignments}
        students={students}
      />
    </div>
  );
}
