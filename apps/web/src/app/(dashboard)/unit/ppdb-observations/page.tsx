import { prisma } from "@/lib/prisma";
import { resolveUnitId } from "@/lib/unit-context";
import { ObservationScheduleClient } from "@/components/unit/observation-schedule-client";

export default async function ObservationSchedulesPage() {
  const unitId = await resolveUnitId();

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
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Observasi</h1>
          <p className="text-sm text-gray-500 mt-1">Tahun Ajaran: {activeYear.name}</p>
        </div>
      </div>

      <div className="flex border-b border-border mb-6">
        <a href="/unit/ppdb-observations" className="px-6 py-3 border-b-2 border-tertiary text-tertiary font-medium">Jadwal Observasi</a>
        <a href="/unit/ppdb-observations/results" className="px-6 py-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium transition-colors">Hasil Observasi</a>
      </div>

      {/* Client component for the table and create modal */}
      <ObservationScheduleClient 
        schedules={JSON.parse(JSON.stringify(schedules))} 
        academicYearId={activeYear.id} 
      />
    </div>
  );
}
