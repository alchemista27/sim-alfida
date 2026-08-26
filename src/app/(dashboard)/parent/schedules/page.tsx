import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@/generated/client";
import { createClient } from "@/lib/supabase/server";
import { ParentScheduleClient } from "./parent-schedule-client";

export const metadata = {
  title: "Jadwal Pelajaran Anak | SIM-Alfida",
};

export default async function ParentSchedulesPage() {
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

  const enrollments = await prisma.studentEnrollment.findMany({
    where: {
      parentId: user.id,
      academicYearId: activeYear.id,
      status: 'active'
    },
    include: {
      studentData: { select: { fullName: true } },
      class: {
        include: { unit: true }
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

  // Pre-fetch schedules for all enrolled classes to pass to the client
  const classIds = enrollments.map(e => e.classId).filter(Boolean) as string[];
  const schedules = await prisma.classSchedule.findMany({
    where: { classId: { in: classIds } },
    include: {
      subject: true,
      teacher: true,
    },
    orderBy: [
      { day: 'asc' },
      { startTime: 'asc' }
    ]
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Jadwal Pelajaran Mingguan</h1>
        <p className="text-sm text-gray-500 mt-1">Pantau jadwal kegiatan belajar mengajar anak Anda di sekolah.</p>
      </div>

      <ParentScheduleClient 
        enrollments={enrollments}
        schedules={schedules}
      />
    </div>
  );
}
