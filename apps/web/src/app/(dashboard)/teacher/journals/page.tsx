import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@sim/database";
import { createClient } from "@/lib/supabase/server";
import { JournalClient } from "./journal-client";

export const metadata = {
  title: "Jurnal Pembelajaran | SIM-Alfida",
};

export default async function TeacherJournalsPage() {
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Jurnal Pembelajaran Harian</h1>
        <p className="text-sm text-gray-500 mt-1">Catat aktivitas mengajar Anda secara rutin.</p>
      </div>

      <JournalClient assignments={assignments} />
    </div>
  );
}
