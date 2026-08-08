import { prisma } from "@/lib/prisma";
import { ObservationResultsClient } from "@/components/unit/observation-results-client";

export default async function ObservationResultsPage() {
  const unitId = "dummy-unit-id"; // Placeholder auth

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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Hasil Observasi & Seleksi</h1>
      <ObservationResultsClient results={JSON.parse(JSON.stringify(formattedResults))} />
    </div>
  );
}
