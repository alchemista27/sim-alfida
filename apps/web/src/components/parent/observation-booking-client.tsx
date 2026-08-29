"use client";

import React, { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { bookSchedule } from "@/actions/observation-booking";
import { useRouter } from "next/navigation";

export function ObservationBookingClient({ 
  registrationId, 
  availableSchedules 
}: { 
  registrationId: string;
  availableSchedules: any[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const router = useRouter();

  const handleBooking = async () => {
    if (!selectedId) return;
    setIsSubmitting(true);
    try {
      const res = await bookSchedule(registrationId, selectedId);
      if (res.success) {
        setShowSuccessModal(true);
        // Refresh dipanggil setelah orang tua menutup modal
      } else {
        alert((res as any).error);
      }
    } catch (e: any) {
      alert("Terjadi kesalahan sistem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {availableSchedules.length === 0 ? (
          <div className="col-span-full p-6 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed">
            Belum ada jadwal observasi yang tersedia saat ini. Silakan cek kembali nanti atau hubungi pihak sekolah.
          </div>
        ) : availableSchedules.map(schedule => {
          const sisa = schedule.quota - schedule.booked;
          const isSelected = selectedId === schedule.id;
          return (
            <div 
              key={schedule.id}
              onClick={() => setSelectedId(schedule.id)}
              className={`p-5 rounded-xl border cursor-pointer transition-all ${isSelected ? 'border-tertiary bg-teal-50 ring-1 ring-tertiary shadow-sm' : 'border-gray-200 hover:border-teal-300'}`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2 text-primary font-bold">
                  <Icon name="event" />
                  {new Date(schedule.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                {isSelected && <Icon name="check_circle" className="text-tertiary" />}
              </div>
              <div className="space-y-1 text-sm text-gray-600 ml-7">
                <div className="flex items-center gap-2">
                  <Icon name="schedule" className="text-sm" /> 
                  {schedule.startTime} - {schedule.endTime} WIB
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="group" className="text-sm" /> 
                  Sisa Kuota: <span className="font-bold text-primary">{sisa}</span> dari {schedule.quota}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {availableSchedules.length > 0 && (
        <div className="flex justify-end border-t pt-6 mt-6">
          <Button 
            variant="primary" 
            disabled={!selectedId || isSubmitting}
            onClick={handleBooking}
          >
            {isSubmitting ? "Memproses..." : "Konfirmasi Jadwal"}
          </Button>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-2xl text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4">
              <Icon name="check_circle" className="text-4xl" />
            </div>
            <h3 className="font-bold text-lg text-primary mb-2">Jadwal Terkonfirmasi!</h3>
            <p className="text-sm text-gray-600 mb-6">
              Anda telah berhasil memilih jadwal observasi untuk calon siswa. Harap hadir tepat waktu sesuai jadwal yang dipilih.
            </p>
            <Button 
              variant="primary" 
              className="w-full"
              onClick={() => {
                setShowSuccessModal(false);
                router.refresh();
              }}
            >
              Tutup & Lihat Jadwal
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
