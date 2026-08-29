import React from "react";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@sim/database";
import { getActiveRegistration } from "@/actions/parent";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { ObservationBookingClient } from "@/components/parent/observation-booking-client";

export default async function ParentObservationPage() {
  await requireRole([UserRole.orang_tua]);
  const reg = await getActiveRegistration();

  if (!reg) {
    redirect("/parent/dashboard");
  }

  // Cek apakah pendaftaran sudah di tahap verifikasi atau lebih
  const allowedStatuses = [
    "verification", 
    "observation_scheduled", 
    "observation_done", 
    "accepted", 
    "enrolled"
  ];
  
  if (!allowedStatuses.includes(reg.status)) {
    return (
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="font-heading font-bold text-2xl text-primary">Jadwal Observasi</h1>
          <p className="text-gray-500 mt-1">Pemilihan jadwal tes / observasi calon siswa.</p>
        </div>
        <Card className="p-8 text-center text-gray-500 bg-neutral/30 border-dashed">
          <Icon name="lock" className="text-4xl text-gray-300 mb-2 block mx-auto" />
          <p>Halaman ini belum dapat diakses. Berkas pendaftaran Anda masih dalam tahap antrian atau belum lengkap.</p>
        </Card>
      </div>
    );
  }

  // Jika sudah memiliki booking, tampilkan jadwalnya
  if (reg.observationBooking) {
    const booking = reg.observationBooking;
    return (
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="font-heading font-bold text-2xl text-primary">Jadwal Observasi Anda</h1>
          <p className="text-gray-500 mt-1">Jadwal tes dan wawancara calon siswa telah ditetapkan.</p>
        </div>
        
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-tertiary/30 rounded-xl p-8 relative overflow-hidden">
          <Icon name="event_available" className="absolute -right-6 -bottom-6 text-9xl text-teal-500/10" />
          
          <h3 className="text-lg font-bold text-primary mb-6 flex items-center gap-2">
            <Icon name="check_circle" className="text-tertiary" /> Jadwal Terkonfirmasi
          </h3>
          
          <div className="space-y-4 relative z-10">
            <div>
              <p className="text-sm text-gray-500 mb-1">Nama Calon Siswa</p>
              <p className="font-bold text-gray-900">{reg.studentData?.fullName || "-"}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Tanggal</p>
                <p className="font-bold text-gray-900">
                  {new Date(booking.schedule.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Waktu (WIB)</p>
                <p className="font-bold text-gray-900">
                  {booking.schedule.startTime} - {booking.schedule.endTime}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-teal-200/50 flex gap-2">
            <Icon name="info" className="text-teal-600 text-sm mt-0.5" />
            <p className="text-sm text-teal-800">
              Harap hadir tepat waktu bersama calon siswa. Membawa bukti cetak pendaftaran dan peralatan tulis (jika diinstruksikan).
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Jika belum punya booking, tampilkan daftar yang bisa dipilih
  const schedules = await prisma.observationSchedule.findMany({
    where: {
      academicYearId: reg.academicYearId,
      // date: { gte: new Date() }, // Optional: hanya yang di masa depan
    },
    orderBy: [
      { date: 'asc' },
      { startTime: 'asc' }
    ]
  });

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="font-heading font-bold text-2xl text-primary">Pilih Jadwal Observasi</h1>
        <p className="text-gray-500 mt-1">Silakan pilih jadwal untuk tes dan observasi calon siswa.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <ObservationBookingClient 
          registrationId={reg.id} 
          availableSchedules={schedules.filter(s => s.booked < s.quota)} 
        />
      </div>
    </div>
  );
}
