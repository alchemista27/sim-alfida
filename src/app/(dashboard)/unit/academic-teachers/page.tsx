import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@prisma/client";
import { resolveUnitId } from "@/lib/unit-context";
import { TeacherClient } from "./teacher-client";

export const metadata = {
  title: "Penugasan Guru & Wali Kelas | SIM-Alfida",
};

export default async function AcademicTeachersPage() {
  await requireRole([UserRole.admin_unit, UserRole.super_admin]);
  const unitId = await resolveUnitId();

  // Ambil tahun ajaran aktif (sementara ambil yang terbaru berdasarkan startDate)
  const activeYear = await prisma.academicYear.findFirst({
    where: { unitId },
    orderBy: { startDate: 'desc' }
  });

  if (!activeYear) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800">Penugasan Guru</h1>
        <div className="mt-6 p-6 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-lg">
          Tahun Ajaran belum diatur. Silakan buat Tahun Ajaran terlebih dahulu.
        </div>
      </div>
    );
  }

  // Data master
  const classes = await prisma.class.findMany({
    where: { unitId, academicYearId: activeYear.id },
    orderBy: { name: 'asc' }
  });

  const subjects = await prisma.subject.findMany({
    where: { unitId, isActive: true },
    orderBy: { name: 'asc' }
  });

  const teachers = await prisma.user.findMany({
    where: {
      roles: {
        some: {
          role: UserRole.guru,
          unitId: unitId // Asumsi guru di-assign ke unit
        }
      },
      isActive: true
    },
    orderBy: { fullName: 'asc' }
  });

  // Data penugasan saat ini
  const teacherAssignments = await prisma.teacherAssignment.findMany({
    where: { academicYearId: activeYear.id },
    include: {
      subject: true,
      teacher: true,
      class: true
    }
  });

  const homeroomAssignments = await prisma.homeroomAssignment.findMany({
    where: { academicYearId: activeYear.id },
    include: {
      teacher: true,
      class: true
    }
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Penugasan Guru & Wali Kelas</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola penugasan untuk Tahun Ajaran: {activeYear.name}</p>
      </div>

      <TeacherClient 
        academicYearId={activeYear.id}
        classes={classes}
        subjects={subjects}
        teachers={teachers}
        teacherAssignments={teacherAssignments}
        homeroomAssignments={homeroomAssignments}
      />
    </div>
  );
}
