import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth"; // Assuming a helper exists
import { ObservationScheduleClient } from "@/components/unit/observation-schedule-client";

export default async function ObservationSchedulesPage() {
  // Mocking auth check for Admin Unit
  // const session = await requireRole(["admin_unit"]);
  // const unitId = session.unitId;
  const unitId = "dummy-unit-id"; // Placeholder until actual auth integration is clear

  // Cari tahun ajaran aktif untuk unit ini
  const activeYear = await prisma.academicYear.findFirst({
    where: { unitId, ppdbActive: true },
  });

  if (!activeYear) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Jadwal Observasi</h1>
        <div className="bg-amber-50 text-amber-800 p-4 rounded-lg">
          Belum ada Tahun Ajaran aktif untuk PPDB. Aktifkan PPDB terlebih dahulu di menu Overview.
        </div>
      </div>
    );
  }

  // Ambil data jadwal
  const schedules = await prisma.observationSchedule.findMany({
    where: { academicYearId: activeYear.id },
    orderBy: { date: "asc" },
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Jadwal Observasi</h1>
          <p className="text-sm text-gray-500 mt-1">Tahun Ajaran: {activeYear.name}</p>
        </div>
      </div>

      {/* Client component for the table and create modal */}
      <ObservationScheduleClient 
        schedules={JSON.parse(JSON.stringify(schedules))} 
        academicYearId={activeYear.id} 
      />
    </div>
  );
}
