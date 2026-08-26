"use client";

import { useState } from "react";
import { DayOfWeek } from "@/generated/client";

export function ParentScheduleClient({ 
  enrollments, 
  schedules 
}: { 
  enrollments: any[], 
  schedules: any[] 
}) {
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string>(
    enrollments.length > 0 ? enrollments[0].id : ""
  );

  const selectedEnrollment = enrollments.find(e => e.id === selectedEnrollmentId);
  const classId = selectedEnrollment?.classId;
  
  const classSchedules = schedules.filter(s => s.classId === classId);

  const dayLabels: Record<DayOfWeek, string> = {
    monday: "Senin",
    tuesday: "Selasa",
    wednesday: "Rabu",
    thursday: "Kamis",
    friday: "Jumat",
    saturday: "Sabtu"
  };

  const groupedSchedules = Object.values(DayOfWeek).reduce((acc, currentDay) => {
    acc[currentDay] = classSchedules.filter(s => s.day === currentDay);
    return acc;
  }, {} as Record<DayOfWeek, any[]>);

  return (
    <div className="space-y-6">
      {enrollments.length > 1 && (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Anak</label>
          <select 
            className="w-full sm:w-1/2 p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            value={selectedEnrollmentId}
            onChange={(e) => setSelectedEnrollmentId(e.target.value)}
          >
            {enrollments.map(e => (
              <option key={e.id} value={e.id}>
                {e.studentData?.fullName} - {e.class?.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedEnrollment && classId && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <div>
              <h2 className="font-semibold text-gray-800">
                Jadwal Kelas: {selectedEnrollment.class?.name}
              </h2>
              <p className="text-xs text-gray-500">{selectedEnrollment.studentData?.fullName}</p>
            </div>
            <a 
              href={`/api/pdf/class-schedule/${classId}`} 
              target="_blank" 
              rel="noreferrer"
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2"
            >
              Cetak PDF
            </a>
          </div>
          
          <div className="p-6 overflow-x-auto">
            <div className="min-w-[800px] grid grid-cols-6 gap-4">
              {Object.values(DayOfWeek).map(day => (
                <div key={day} className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden flex flex-col">
                  <div className="bg-teal-600 py-2 text-center font-bold text-white text-sm border-b border-teal-700">
                    {dayLabels[day]}
                  </div>
                  <div className="p-2 flex-1 space-y-2">
                    {groupedSchedules[day].map(s => (
                      <div key={s.id} className="bg-white p-3 border border-gray-200 rounded-md shadow-sm hover:border-teal-400 transition-colors">
                        <div className="text-[10px] font-bold text-teal-600 mb-1">{s.startTime} - {s.endTime}</div>
                        <div className="font-semibold text-sm text-gray-800 leading-tight mb-1">{s.subject?.name}</div>
                        <div className="text-xs text-gray-500">{s.teacher?.fullName}</div>
                      </div>
                    ))}
                    {groupedSchedules[day].length === 0 && (
                      <div className="text-center text-gray-400 text-xs py-6 italic flex items-center justify-center h-full">
                        Tidak ada jadwal
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
