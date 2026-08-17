import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@prisma/client";
import { createClient } from "@/lib/supabase/server";
import { TeacherLhbsClient } from "./client";

export const metadata = {
  title: "LHBS Tengah Semester | SIM-Alfida",
};

export default async function TeacherLhbsPage() {
  await requireRole([UserRole.guru]);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <div>Unauthorized</div>;
  
  const activeYear = await prisma.academicYear.findFirst({
    orderBy: { startDate: 'desc' }
  });

  if (!activeYear) {
    return <div className="p-6">Tidak ada Tahun Ajaran aktif.</div>;
  }

  const homeroomClasses = await prisma.class.findMany({
    where: {
      homeroomAssignments: {
        some: { teacherId: user.id }
      }
    }
  });

  if (homeroomClasses.length === 0) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="p-6 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg">
          Anda tidak ditugaskan sebagai Wali Kelas. Pembuatan Rapor LHBS hanya dapat dilakukan oleh Wali Kelas.
        </div>
      </div>
    );
  }

  // Fetch enrollments for the homeroom classes
  const enrollments = await prisma.studentEnrollment.findMany({
    where: {
      classId: { in: homeroomClasses.map(c => c.id) },
      academicYearId: activeYear.id,
      status: 'active'
    },
    include: {
      studentData: { select: { fullName: true, nisn: true } },
      class: { select: { name: true } },
      lhbsReports: {
        where: {
          academicYearId: activeYear.id
        }
      }
    },
    orderBy: {
      studentData: { fullName: 'asc' }
    }
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Generate Rapor ATS</h1>
        <p className="text-sm text-gray-500 mt-1">Buat dan terbitkan Laporan Hasil Belajar Siswa (Tengah Semester) untuk siswa perwalian Anda.</p>
      </div>

      <TeacherLhbsClient 
        enrollments={enrollments} 
        homeroomClasses={homeroomClasses}
      />
    </div>
  );
}
