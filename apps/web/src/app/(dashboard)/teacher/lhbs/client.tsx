"use client";

import { useState } from "react";
import { generateLhbsReport } from "@/actions/lhbs";

export function TeacherLhbsClient({ 
  enrollments, 
  homeroomClasses 
}: { 
  enrollments: any[], 
  homeroomClasses: any[]
}) {
  const [loading, setLoading] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string>(homeroomClasses.length > 0 ? homeroomClasses[0].id : "");
  const [semester, setSemester] = useState<"mid" | "final">("mid");

  const handleGenerate = async (enrollmentId: string) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("enrollmentId", enrollmentId);
    formData.append("semester", semester);
    
    const res = await generateLhbsReport(formData);
    setLoading(false);
    
    if (res.success) {
      window.location.reload();
    } else {
      alert("Error: " + res.error);
    }
  };

  const handleBulkGenerate = async () => {
    if (!confirm("Generate rapor untuk seluruh siswa di kelas ini? Proses ini mungkin membutuhkan waktu beberapa saat.")) return;
    
    setLoading(true);
    let successCount = 0;
    
    for (const e of filteredEnrollments) {
      const formData = new FormData();
      formData.append("enrollmentId", e.id);
      formData.append("semester", semester);
      
      const res = await generateLhbsReport(formData);
      if (res.success) successCount++;
    }
    
    setLoading(false);
    alert(`Berhasil meng-generate ${successCount} dari ${filteredEnrollments.length} rapor.`);
    window.location.reload();
  };

  const filteredEnrollments = enrollments.filter(e => e.classId === selectedClassId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Kelas Perwalian</label>
            <select 
              value={selectedClassId} 
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-teal-500 w-full sm:w-64"
            >
              {homeroomClasses.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Semester</label>
            <select 
              value={semester} 
              onChange={(e) => setSemester(e.target.value as "mid" | "final")}
              className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-teal-500 w-full sm:w-64"
            >
              <option value="mid">Tengah Semester (ATS)</option>
              <option value="final">Akhir Semester (AAS)</option>
            </select>
          </div>
        </div>

        <button 
          onClick={handleBulkGenerate}
          disabled={loading || filteredEnrollments.length === 0}
          className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg transition-colors w-full sm:w-auto disabled:opacity-50 flex items-center gap-2 justify-center"
        >
          {loading ? 'Memproses...' : '⚡ Generate Masal Semua Siswa'}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="bg-gray-50 text-gray-700 uppercase text-xs border-b">
              <tr>
                <th className="px-4 py-3 w-12 text-center">No</th>
                <th className="px-4 py-3">NISN</th>
                <th className="px-4 py-3">Nama Siswa</th>
                <th className="px-4 py-3 text-center">Status Rapor ({semester === 'mid' ? 'ATS' : 'AAS'})</th>
                <th className="px-4 py-3 text-center">Terakhir Diperbarui</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredEnrollments.map((e, index) => {
                const report = e.lhbsReports.find((r: any) => r.semester === semester);
                
                return (
                  <tr key={e.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-center">{index + 1}</td>
                    <td className="px-4 py-3 text-gray-500">{e.studentData.nisn || "-"}</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{e.studentData.fullName}</td>
                    <td className="px-4 py-3 text-center">
                      {report ? (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold border border-green-200">Tersedia</span>
                      ) : (
                        <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-bold border border-amber-200">Belum Ada</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-xs">
                      {report ? new Date(report.issuedAt).toLocaleString('id-ID') : "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button 
                        disabled={loading}
                        onClick={() => handleGenerate(e.id)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded transition-colors disabled:opacity-50 ${
                          report 
                          ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200' 
                          : 'bg-teal-600 text-white hover:bg-teal-700'
                        }`}
                      >
                        {report ? 'Update (Regenerate)' : 'Generate Rapor'}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredEnrollments.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">Tidak ada siswa di kelas ini.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
