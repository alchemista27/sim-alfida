"use client";

import { useState } from "react";

export function ParentLhbsClient({ 
  enrollments,
  academicYear
}: { 
  enrollments: any[],
  academicYear: any
}) {
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string>(
    enrollments.length > 0 ? enrollments[0].id : ""
  );
  const [semester, setSemester] = useState<"mid" | "final">("mid");

  const selectedEnrollment = enrollments.find(e => e.id === selectedEnrollmentId);
  const activeReport = selectedEnrollment?.lhbsReports?.find((r: any) => r.semester === semester);
  
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4">
        {enrollments.length > 1 && (
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Anak</label>
            <select 
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500"
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
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Semester</label>
          <select 
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500"
            value={semester}
            onChange={(e) => setSemester(e.target.value as "mid" | "final")}
          >
            <option value="mid">Tengah Semester (ATS)</option>
            <option value="final">Akhir Semester (AAS)</option>
          </select>
        </div>
      </div>

      {!activeReport ? (
        <div className="bg-white p-12 text-center rounded-xl border border-dashed border-gray-300 shadow-sm">
          <span className="text-4xl block mb-4">📄</span>
          <h3 className="text-lg font-bold text-gray-800 mb-1">Rapor {semester === 'mid' ? 'Tengah' : 'Akhir'} Semester Belum Tersedia</h3>
          <p className="text-gray-500 text-sm">LHBS (Laporan Hasil Belajar Siswa) untuk {selectedEnrollment?.studentData?.fullName} belum diterbitkan oleh Wali Kelas.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden print:shadow-none print:border-none">
          {/* Header Rapor */}
          <div className="p-8 border-b-4 border-teal-600 bg-teal-50">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-wider">Laporan Hasil Belajar (LHBS)</h2>
              <p className="text-teal-700 font-semibold mt-1">Penilaian {semester === 'mid' ? 'Tengah' : 'Akhir'} Semester ({semester === 'mid' ? 'ATS' : 'AAS'})</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-8">
              <div className="space-y-2">
                <div className="grid grid-cols-[120px_1fr]"><span className="text-gray-500 font-medium">Nama Siswa</span> <span className="font-bold">: {selectedEnrollment?.studentData?.fullName}</span></div>
                <div className="grid grid-cols-[120px_1fr]"><span className="text-gray-500 font-medium">NISN</span> <span>: {selectedEnrollment?.studentData?.nisn || "-"}</span></div>
                <div className="grid grid-cols-[120px_1fr]"><span className="text-gray-500 font-medium">Unit Pendidikan</span> <span>: {selectedEnrollment?.class?.unit?.name}</span></div>
              </div>
              <div className="space-y-2">
                <div className="grid grid-cols-[120px_1fr]"><span className="text-gray-500 font-medium">Kelas</span> <span className="font-bold">: {selectedEnrollment?.class?.name}</span></div>
                <div className="grid grid-cols-[120px_1fr]"><span className="text-gray-500 font-medium">Tahun Ajaran</span> <span>: {academicYear.name}</span></div>
                <div className="grid grid-cols-[120px_1fr]"><span className="text-gray-500 font-medium">Wali Kelas</span> <span>: {selectedEnrollment?.class?.homeroomAssignments?.[0]?.teacher?.fullName || "-"}</span></div>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Tabel Akademik */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-4 border-l-4 border-teal-600 pl-3">A. Sikap dan Akademik</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 text-sm">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="border border-gray-300 px-4 py-2 text-center w-12" rowSpan={2}>No</th>
                      <th className="border border-gray-300 px-4 py-2" rowSpan={2}>Mata Pelajaran</th>
                      <th className="border border-gray-300 px-4 py-2 text-center" colSpan={4}>Komponen Nilai</th>
                    </tr>
                    <tr>
                      <th className="border border-gray-300 px-4 py-2 text-center text-xs w-20">Harian (Rata-rata)</th>
                      <th className="border border-gray-300 px-4 py-2 text-center text-xs w-20">Ujian (Rata-rata)</th>
                      <th className="border border-gray-300 px-4 py-2 text-center text-xs w-20">{semester === 'mid' ? 'ATS' : 'AAS'}</th>
                      <th className="border border-gray-300 px-4 py-2 text-center font-bold bg-teal-50 w-24">Nilai Akhir</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeReport.gradesSnapshot && (activeReport.gradesSnapshot as any[]).map((grade, idx) => (
                      <tr key={grade.subjectId} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2 text-center">{idx + 1}</td>
                        <td className="border border-gray-300 px-4 py-2 font-medium">{grade.subjectName}</td>
                        <td className="border border-gray-300 px-4 py-2 text-center text-gray-600">{grade.avgDaily}</td>
                        <td className="border border-gray-300 px-4 py-2 text-center text-gray-600">{grade.avgExam}</td>
                        <td className="border border-gray-300 px-4 py-2 text-center text-gray-600">{grade.summative}</td>
                        <td className="border border-gray-300 px-4 py-2 text-center font-bold text-teal-700 bg-teal-50">{grade.finalScore}</td>
                      </tr>
                    ))}
                    {(!activeReport.gradesSnapshot || (activeReport.gradesSnapshot as any[]).length === 0) && (
                      <tr><td colSpan={6} className="border border-gray-300 px-4 py-4 text-center text-gray-500">Belum ada nilai akademik yang tercatat.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Tabel Ekstrakurikuler */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-l-4 border-blue-600 pl-3">B. Ekstrakurikuler</h3>
                <table className="w-full border-collapse border border-gray-300 text-sm">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="border border-gray-300 px-4 py-2 w-10 text-center">No</th>
                      <th className="border border-gray-300 px-4 py-2">Kegiatan</th>
                      <th className="border border-gray-300 px-4 py-2 text-center w-24">Predikat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeReport.extraSnapshot && (activeReport.extraSnapshot as any[]).map((ex, idx) => (
                      <tr key={idx}>
                        <td className="border border-gray-300 px-4 py-2 text-center">{idx + 1}</td>
                        <td className="border border-gray-300 px-4 py-2">{ex.extraName}</td>
                        <td className="border border-gray-300 px-4 py-2 text-center font-bold">{ex.score}</td>
                      </tr>
                    ))}
                    {(!activeReport.extraSnapshot || (activeReport.extraSnapshot as any[]).length === 0) && (
                      <tr><td colSpan={3} className="border border-gray-300 px-4 py-4 text-center text-gray-500">Tidak mengikuti ekstrakurikuler.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Tabel Kehadiran */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-l-4 border-amber-600 pl-3">C. Ketidakhadiran</h3>
                <table className="w-full border-collapse border border-gray-300 text-sm">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="border border-gray-300 px-4 py-2">Alasan</th>
                      <th className="border border-gray-300 px-4 py-2 text-center w-24">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Sakit</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">{(activeReport.attendanceSum as any)?.sick || 0} hari</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Izin</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">{(activeReport.attendanceSum as any)?.permitted || 0} hari</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Tanpa Keterangan</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">{(activeReport.attendanceSum as any)?.absent || 0} hari</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="mt-12 pt-6 border-t text-right text-sm text-gray-400 italic">
              Rapor digital ini digenerate secara otomatis pada {new Date(activeReport.issuedAt).toLocaleString('id-ID')}
            </div>

            <div className="mt-4 flex justify-end print:hidden">
              <a 
                href={`/api/pdf/lhbs/${activeReport.id}`}
                target="_blank"
                rel="noreferrer"
                className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
              >
                <span>🖨️</span> Cetak / Simpan PDF
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
