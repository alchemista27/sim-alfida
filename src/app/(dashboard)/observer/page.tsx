import { prisma } from "@/lib/prisma";
import { ObserverInputClient } from "@/components/observer/observer-input-client";

export default async function ObserverDashboard() {
  const observerId = "dummy-observer-id"; // Placeholder auth

  // Get all bookings that need to be observed today or past but status is still scheduled
  const pendingBookings = await prisma.observationBooking.findMany({
    where: {
      registration: {
        status: "observation_scheduled"
      },
      // Note: we can optionally filter by today's date
    },
    include: {
      registration: {
        include: {
          studentData: true,
          unit: true
        }
      },
      schedule: true
    },
    orderBy: {
      schedule: {
        date: "asc"
      }
    }
  });

  const formattedBookings = pendingBookings.map(b => ({
    id: b.id, // Booking ID
    registrationNumber: b.registration.registrationNumber,
    studentName: b.registration.studentData?.fullName || "-",
    unitName: b.registration.unit?.name || "-",
    date: b.schedule.date,
    time: `${b.schedule.startTime} - ${b.schedule.endTime}`,
  }));

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Portal Observer</h1>
      <p className="text-gray-600 mb-6">Input nilai observasi calon siswa.</p>

      {formattedBookings.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-gray-200 text-center">
          <span className="material-symbols-rounded text-4xl text-gray-400 mb-2">event_available</span>
          <h3 className="font-semibold text-gray-800">Tidak ada jadwal</h3>
          <p className="text-sm text-gray-500">Saat ini tidak ada siswa yang menunggu untuk diobservasi.</p>
        </div>
      ) : (
        <ObserverInputClient observerId={observerId} bookings={JSON.parse(JSON.stringify(formattedBookings))} />
      )}
    </div>
  );
}
