"use client";

import { useState } from "react";
import { joinExtracurricular, leaveExtracurricular } from "@/actions/extracurricular";

export function ParentExtracurricularClient({ 
  enrollments, 
  extras,
  academicYearId
}: { 
  enrollments: any[], 
  extras: any[],
  academicYearId: string
}) {
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string>(
    enrollments.length > 0 ? enrollments[0].id : ""
  );
  const [loading, setLoading] = useState(false);

  const selectedEnrollment = enrollments.find(e => e.id === selectedEnrollmentId);
  
  // Filter extras based on the unit of the selected enrollment
  const unitExtras = extras.filter(ex => ex.unitId === selectedEnrollment?.class?.unitId);

  // Helper to check if child is joined
  const getMembership = (extraId: string) => {
    return selectedEnrollment?.extraMemberships?.find((m: any) => m.extraId === extraId);
  };

  const handleJoin = async (extraId: string) => {
    if (!selectedEnrollmentId) return;
    setLoading(true);
    const res = await joinExtracurricular(extraId, selectedEnrollmentId, academicYearId);
    if (res.success) {
      window.location.reload();
    } else {
      alert("Error: " + res.error);
      setLoading(false);
    }
  };

  const handleLeave = async (memberId: string) => {
    if (!confirm("Apakah Anda yakin ingin membatalkan keikutsertaan ekskul ini?")) return;
    setLoading(true);
    const res = await leaveExtracurricular(memberId);
    if (res.success) {
      window.location.reload();
    } else {
      alert("Error: " + res.error);
      setLoading(false);
    }
  };

  const dayLabels = {
    monday: "Senin", tuesday: "Selasa", wednesday: "Rabu",
    thursday: "Kamis", friday: "Jumat", saturday: "Sabtu"
  };

  // Get consolidated schedules for joined extras
  const joinedExtras = unitExtras.filter(ex => getMembership(ex.id));
  const consolidatedSchedules = joinedExtras.flatMap(ex => 
    ex.schedules.map((s: any) => ({
      ...s,
      extraName: ex.name
    }))
  ).sort((a, b) => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    if (days.indexOf(a.day) !== days.indexOf(b.day)) return days.indexOf(a.day) - days.indexOf(b.day);
    return a.startTime.localeCompare(b.startTime);
  });

  return (
    <div className="space-y-6">
      {enrollments.length > 1 && (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Anak</label>
          <select 
            className="w-full sm:w-1/2 p-2 border border-gray-300 rounded-md focus:ring-teal-500"
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

      {selectedEnrollment && (
        <>
          {joinedExtras.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                  <span>📅</span> Ringkasan Jadwal Ekstrakurikuler
                </h2>
                <a 
                  href={`/api/pdf/extra-schedule/${selectedEnrollmentId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                >
                  Cetak Jadwal (PDF)
                </a>
              </div>
              <div className="p-0 sm:p-4">
                {consolidatedSchedules.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-600">
                      <thead className="bg-gray-50 text-gray-700 uppercase text-xs border-b">
                        <tr>
                          <th className="px-4 py-3">Hari</th>
                          <th className="px-4 py-3">Jam</th>
                          <th className="px-4 py-3">Ekstrakurikuler</th>
                          <th className="px-4 py-3">Lokasi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {consolidatedSchedules.map((s, index) => (
                          <tr key={s.id || index} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-800">{dayLabels[s.day as keyof typeof dayLabels]}</td>
                            <td className="px-4 py-3">{s.startTime} - {s.endTime}</td>
                            <td className="px-4 py-3 font-semibold text-teal-700">{s.extraName}</td>
                            <td className="px-4 py-3">{s.location || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500 text-sm italic">
                    Ekstrakurikuler yang diikuti belum memiliki jadwal.
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {unitExtras.map(ex => {
              const membership = getMembership(ex.id);
              const isJoined = !!membership;

              return (
                <div key={ex.id} className={`border ${isJoined ? 'border-teal-400 bg-teal-50/20' : 'border-gray-200 bg-white'} rounded-xl p-5 transition-colors shadow-sm relative flex flex-col`}>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-800">{ex.name}</h3>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-3">{ex.description || "Tidak ada deskripsi."}</p>
                    
                    <div className="mt-4 space-y-2">
                      <div className="text-xs text-gray-500">
                        <span className="font-semibold text-gray-700">Pembina:</span>{' '}
                        {ex.coaches.length > 0 ? ex.coaches.map((c: any) => c.coach.fullName).join(', ') : '-'}
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        <span className="font-semibold text-gray-700">Jadwal:</span>{' '}
                        {ex.schedules.length > 0 ? (
                          <ul className="mt-1 list-disc list-inside">
                            {ex.schedules.map((s: any) => (
                              <li key={s.id}>{dayLabels[s.day as keyof typeof dayLabels]}, {s.startTime}-{s.endTime}</li>
                            ))}
                          </ul>
                        ) : (
                          "Belum ditentukan"
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col gap-2">
                    {isJoined ? (
                      <div className="flex flex-col gap-2">
                        <div className="text-sm font-bold text-teal-700 bg-teal-100 px-3 py-2 rounded-lg text-center flex items-center justify-center gap-1">
                          <span>✅</span> Telah Bergabung
                        </div>
                        <button 
                          disabled={loading}
                          onClick={() => handleLeave(membership.id)} 
                          className="text-xs text-red-600 hover:text-red-800 font-medium text-center py-1 disabled:opacity-50"
                        >
                          Batalkan Pendaftaran
                        </button>
                      </div>
                    ) : (
                      <button 
                        disabled={loading}
                        onClick={() => handleJoin(ex.id)} 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                      >
                        Daftar Ekstrakurikuler
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            
            {unitExtras.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500 border border-dashed rounded-xl">
                Belum ada program ekstrakurikuler yang tersedia di unit pendidikan ini.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
