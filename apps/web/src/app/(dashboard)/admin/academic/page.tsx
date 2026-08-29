import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@sim/database";
import { AdminAcademicClient } from "./client";

export const metadata = {
  title: "Pantauan Akademik (Super Admin) | SIM-Alfida",
};

export default async function AdminAcademicPage() {
  await requireRole([UserRole.super_admin]);
  
  const activeYear = await prisma.academicYear.findFirst({
    orderBy: { startDate: 'desc' }
  });

  const units = await prisma.unit.findMany({
    orderBy: { level: 'asc' }
  });

  if (!activeYear) {
    return <div className="p-6">Tidak ada Tahun Ajaran aktif.</div>;
  }

  // To keep it performant, we will fetch data in the client or pass a pre-loaded summary
  // Or fetch everything here since it's server component
  
  // 1. Fetch Teachers per unit (with their lesson plans and journals count)
  const teachers = await prisma.user.findMany({
    where: { roles: { some: { role: 'guru' } } },
    include: {
      roles: true,
      lessonPlans: {
        where: { academicYearId: activeYear.id },
        select: { type: true, id: true }
      },
      teachingJournals: {
        where: { class: { academicYearId: activeYear.id } },
        select: { id: true }
      }
    }
  });

  // 2. Fetch Enrollments per unit (with attendance and grades snapshot)
  const enrollments = await prisma.studentEnrollment.findMany({
    where: { academicYearId: activeYear.id, status: 'active' },
    include: {
      studentData: { select: { fullName: true, nisn: true } },
      class: { select: { name: true, unitId: true } },
      lhbsReports: { select: { semester: true, id: true, attendanceSum: true, gradesSnapshot: true } },
      attendances: { select: { status: true } }, // fallback if no lhbs report
    }
  });

  // 3. Fetch Extracurricular summary per unit
  const extracurriculars = await prisma.extracurricular.findMany({
    include: {
      schedules: true,
      members: {
        where: { enrollment: { academicYearId: activeYear.id, status: 'active' } }
      }
    }
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Pantauan Akademik Global</h1>
        <p className="text-sm text-gray-500 mt-1">Super Admin Dashboard: Monitor kepatuhan guru, performa siswa, dan ekskul per unit.</p>
      </div>

      <AdminAcademicClient 
        units={units}
        teachers={teachers}
        enrollments={enrollments}
        extracurriculars={extracurriculars}
        activeYear={activeYear}
      />
    </div>
  );
}
