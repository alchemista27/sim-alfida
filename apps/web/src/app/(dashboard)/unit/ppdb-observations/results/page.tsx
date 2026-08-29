import { prisma } from "@/lib/prisma";
import { ObservationResultsClient } from "@/components/unit/observation-results-client";
import { resolveUnitId } from "@/lib/unit-context";

export default async function ObservationResultsPage() {
  const unitId = await resolveUnitId();

  const activeYear = await prisma.academicYear.findFirst({
    where: { unitId, ppdbActive: true },
  });

  if (!activeYear) return <div className="p-6">Tahun ajaran tidak aktif.</div>;

  const results = await prisma.observationResult.findMany({
    where: {
      booking: {
        registration: {
          academicYearId: activeYear.id,
        },
      },
    },
    include: {
      booking: {
        include: {
          schedule: true,
          registration: {
            include: {
              studentData: true,
            }
          }
        }
      }
    },
    orderBy: {
      score: "desc"
    }
  });

  // Transform data for easier usage in client
  const formattedResults = results.map(r => ({
    id: r.booking.registrationId, // Used for batch actions
    rank: r.rank,
    registrationNumber: r.booking.registration.registrationNumber,
    studentName: r.booking.registration.studentData?.fullName || "-",
    date: r.booking.schedule.date,
    score: Number(r.score),
    notes: r.notes,
    status: r.booking.registration.status,
  }));

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Observasi</h1>
          <p className="text-sm text-gray-500 mt-1">Tahun Ajaran: {activeYear.name}</p>
        </div>
      </div>

      <div className="flex border-b border-border mb-6">
        <a href="/unit/ppdb-observations" className="px-6 py-3 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium transition-colors">Jadwal Observasi</a>
        <a href="/unit/ppdb-observations/results" className="px-6 py-3 border-b-2 border-tertiary text-tertiary font-medium">Hasil Observasi</a>
      </div>

      <ObservationResultsClient results={JSON.parse(JSON.stringify(formattedResults))} />
    </div>
  );
}
