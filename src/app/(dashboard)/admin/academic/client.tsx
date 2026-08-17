"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";

export function AdminAcademicClient({ 
  units,
  teachers,
  enrollments,
  extracurriculars,
  activeYear
}: { 
  units: any[],
  teachers: any[],
  enrollments: any[],
  extracurriculars: any[],
  activeYear: any
}) {
  const [selectedUnitId, setSelectedUnitId] = useState<string>(units[0]?.id || "");
  const [activeTab, setActiveTab] = useState<"guru" | "siswa" | "ekskul">("guru");

  const selectedUnit = units.find(u => u.id === selectedUnitId);

  // Filter Data
  const unitTeachers = teachers.filter(t => t.roles.some((r: any) => r.unitId === selectedUnitId && r.role === 'guru'));
  const unitEnrollments = enrollments.filter(e => e.class.unitId === selectedUnitId);
  const unitEkskul = extracurriculars.filter(e => e.unitId === selectedUnitId);

  return (
    <div className="space-y-6">
      {/* Unit Selector */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="w-full sm:w-1/3">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter Unit Pendidikan</label>
          <select 
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-teal-500 bg-gray-50"
            value={selectedUnitId}
            onChange={(e) => setSelectedUnitId(e.target.value)}
          >
            {units.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
        <div className="w-full sm:w-auto mt-4 sm:mt-0 flex gap-2 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('guru')}
            className={`px-4 py-2 flex items-center gap-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'guru' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            <Icon name="groups" className="text-base" />
            Kepatuhan Guru
          </button>
          <button 
            onClick={() => setActiveTab('siswa')}
            className={`px-4 py-2 flex items-center gap-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'siswa' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            <Icon name="school" className="text-base" />
            Rapor & Siswa
          </button>
          <button 
            onClick={() => setActiveTab('ekskul')}
            className={`px-4 py-2 flex items-center gap-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === 'ekskul' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            <Icon name="sports_soccer" className="text-base" />
            Ekstrakurikuler
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-800 border-b pb-4 mb-4">
          {activeTab === 'guru' ? 'Status Kelengkapan Dokumen & RPP Guru' : 
           activeTab === 'siswa' ? 'Pantauan Performa Siswa (Rapor & Kehadiran)' : 
           'Rekapitulasi Ekstrakurikuler'}
        </h3>

        {activeTab === 'guru' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-4 py-3">Nama Guru</th>
                  <th className="px-4 py-3 text-center">Prota</th>
                  <th className="px-4 py-3 text-center">Promes</th>
                  <th className="px-4 py-3 text-center">Total RPP</th>
                  <th className="px-4 py-3 text-center">Jurnal Dibuat</th>
                  <th className="px-4 py-3 text-center">Aksi (Unduh)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {unitTeachers.map(t => {
                  const hasProta = t.lessonPlans.some((lp: any) => lp.type === 'prota');
                  const hasPromes = t.lessonPlans.some((lp: any) => lp.type === 'promes');
                  const rppCount = t.lessonPlans.filter((lp: any) => lp.type === 'rpp').length;
                  const journalCount = t.teachingJournals.length;

                  return (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{t.fullName}</td>
                      <td className="px-4 py-3 text-center">
                        {hasProta ? <span className="text-green-600 font-bold">✓ Ada</span> : <span className="text-red-500">✗ Kosong</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {hasPromes ? <span className="text-green-600 font-bold">✓ Ada</span> : <span className="text-red-500">✗ Kosong</span>}
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-teal-700">{rppCount} Dokumen</td>
                      <td className="px-4 py-3 text-center font-bold text-blue-700">{journalCount} Catatan</td>
                      <td className="px-4 py-3 text-center">
                        <a 
                          href={`/api/pdf/teacher-lesson-plans/${t.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded text-xs font-semibold"
                        >
                          Unduh RPP
                        </a>
                      </td>
                    </tr>
                  )
                })}
                {unitTeachers.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-400">Tidak ada data guru di unit ini.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'siswa' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-4 py-3">NISN / Nama Siswa</th>
                  <th className="px-4 py-3">Kelas</th>
                  <th className="px-4 py-3 text-center">Rata-Rata Nilai (ATS)</th>
                  <th className="px-4 py-3 text-center">Rekap Kehadiran (H/S/I/A)</th>
                  <th className="px-4 py-3 text-center">Rapor ATS</th>
                  <th className="px-4 py-3 text-center">Rapor AAS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {unitEnrollments.map(e => {
                  const midReport = e.lhbsReports.find((r: any) => r.semester === 'mid');
                  const finalReport = e.lhbsReports.find((r: any) => r.semester === 'final');
                  
                  // Hitung rata-rata nilai dari midReport jika ada
                  let avgScore = "-";
                  if (midReport?.gradesSnapshot) {
                    const grades = midReport.gradesSnapshot as any[];
                    if (grades.length > 0) {
                      const total = grades.reduce((acc, g) => acc + (g.finalScore || 0), 0);
                      avgScore = (total / grades.length).toFixed(2);
                    }
                  }

                  // Rekap Kehadiran (H/S/I/A)
                  let hadir = 0;
                  let sakit = 0;
                  let izin = 0;
                  let alpa = 0;
                  
                  if (midReport?.attendanceSum) {
                    const sum = midReport.attendanceSum as any;
                    hadir = sum.present || 0;
                    sakit = sum.sick || 0;
                    izin = sum.permitted || 0;
                    alpa = sum.absent || 0;
                  } else if (e.attendances && e.attendances.length > 0) {
                    hadir = e.attendances.filter((a: any) => a.status === 'present').length;
                    sakit = e.attendances.filter((a: any) => a.status === 'sick').length;
                    izin = e.attendances.filter((a: any) => a.status === 'permitted').length;
                    alpa = e.attendances.filter((a: any) => a.status === 'absent').length;
                  }

                  return (
                    <tr key={e.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800">{e.studentData.fullName}</div>
                        <div className="text-xs text-gray-500">{e.studentData.nisn || "No NISN"}</div>
                      </td>
                      <td className="px-4 py-3">{e.class.name}</td>
                      <td className="px-4 py-3 text-center font-bold text-teal-700">{avgScore}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex gap-2 justify-center text-xs font-semibold">
                          <span className="text-green-600" title="Hadir">H: {hadir}</span>
                          <span className="text-blue-600" title="Sakit">S: {sakit}</span>
                          <span className="text-amber-600" title="Izin">I: {izin}</span>
                          <span className="text-red-600" title="Alpa">A: {alpa}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {midReport ? (
                          <a href={`/api/pdf/lhbs/${midReport.id}`} target="_blank" className="text-blue-600 hover:underline text-xs font-bold">Cetak ATS</a>
                        ) : <span className="text-gray-400 text-xs">Belum ada</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {finalReport ? (
                          <a href={`/api/pdf/lhbs/${finalReport.id}`} target="_blank" className="text-blue-600 hover:underline text-xs font-bold">Cetak AAS</a>
                        ) : <span className="text-gray-400 text-xs">Belum ada</span>}
                      </td>
                    </tr>
                  )
                })}
                {unitEnrollments.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-400">Tidak ada data siswa aktif di unit ini.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'ekskul' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {unitEkskul.map(ex => (
              <div key={ex.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-blue-100 text-blue-700 p-2 rounded-lg">
                    <Icon name="sports_soccer" className="text-xl" />
                  </div>
                  <h4 className="font-bold text-gray-800">{ex.name}</h4>
                </div>
                <p className="text-sm text-gray-600 mb-4 h-10 overflow-hidden">{ex.description || "Tidak ada deskripsi."}</p>
                
                <div className="flex justify-between items-center bg-white border border-gray-200 rounded p-3 text-center">
                  <div>
                    <div className="text-2xl font-bold text-teal-600">{ex.members.length}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Anggota Aktif</div>
                  </div>
                  <div className="h-10 w-px bg-gray-200"></div>
                  <div>
                    <div className="text-2xl font-bold text-amber-600">{ex.schedules ? ex.schedules.length : 0}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Hari / Minggu</div>
                  </div>
                </div>
                {ex.schedules && ex.schedules.length > 0 && (
                  <div className="mt-3 text-xs text-gray-500 flex flex-wrap gap-1">
                    {ex.schedules.map((s: any) => (
                      <span key={s.id} className="bg-gray-200 px-2 py-1 rounded">
                        {s.day} ({s.startTime}-{s.endTime})
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {unitEkskul.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                Belum ada program ekstrakurikuler di unit ini.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
