"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { GradeType } from "@/generated/client";
import { submitBatchGrade } from "@/actions/academic";
import { Input } from "@/components/ui/input";

export function GradeClient({ academicYearId, assignments, students }: any) {
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("");
  const [gradeType, setGradeType] = useState<GradeType>(GradeType.daily);
  const [label, setLabel] = useState("Tugas 1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data nilai lokal: enrollmentId -> score
  const [gradeData, setGradeData] = useState<Record<string, number | "">>({});

  const selectedAssignment = useMemo(() => 
    assignments.find((a: any) => a.id === selectedAssignmentId)
  , [assignments, selectedAssignmentId]);

  const classStudents = useMemo(() => {
    if (!selectedAssignment) return [];
    return students.filter((s: any) => s.classId === selectedAssignment.classId);
  }, [students, selectedAssignment]);

  useMemo(() => {
    if (classStudents.length > 0) {
      const initial: any = {};
      classStudents.forEach((s: any) => {
        initial[s.id] = "";
      });
      setGradeData(initial);
    } else {
      setGradeData({});
    }
  }, [classStudents]);

  const handleScoreChange = (enrollmentId: string, value: string) => {
    let score: number | "" = value === "" ? "" : Number(value);
    if (typeof score === 'number') {
      if (score > 100) score = 100;
      if (score < 0) score = 0;
    }
    setGradeData(prev => ({
      ...prev,
      [enrollmentId]: score
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    
    // Validate empty
    const missing = Object.keys(gradeData).find(k => gradeData[k] === "");
    if (missing) {
      setError("Semua nilai siswa harus diisi. Isi dengan 0 jika tidak ada nilai.");
      return;
    }
    
    if (!label.trim()) {
      setError("Label penilaian tidak boleh kosong.");
      return;
    }

    setLoading(true);
    setError(null);

    const grades = Object.keys(gradeData).map(enrollmentId => ({
      enrollmentId,
      score: gradeData[enrollmentId] as number,
    }));

    const payload = {
      subjectId: selectedAssignment.subjectId,
      classId: selectedAssignment.classId,
      type: gradeType,
      label: label.trim(),
      grades,
    };

    const res = await submitBatchGrade(payload, academicYearId);
    if (res.success) {
      alert("Nilai berhasil disimpan!");
      // Reset label for the next input? Or keep it to allow editing.
    } else {
      setError(res.error);
    }
    setLoading(false);
  };

  if (assignments.length === 0) {
    return (
      <div className="p-6 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg">
        Anda belum memiliki penugasan jadwal mengajar untuk tahun ajaran ini.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Pilih Kelas & Mata Pelajaran</label>
          <select 
            value={selectedAssignmentId} 
            onChange={e => setSelectedAssignmentId(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
          >
            <option value="">-- Pilih --</option>
            {assignments.map((a: any) => (
              <option key={a.id} value={a.id}>
                {a.class.name} — {a.subject.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Jenis Penilaian</label>
          <select 
            value={gradeType} 
            onChange={e => setGradeType(e.target.value as GradeType)}
            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
          >
            <option value={GradeType.daily}>Nilai Harian / Tugas</option>
            <option value={GradeType.exam}>Ujian Formatf / UH</option>
            <option value={GradeType.ats}>Asesmen Tengah Semester (ATS)</option>
            <option value={GradeType.aas}>Asesmen Akhir Semester (AAS)</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Label Penilaian</label>
          <Input 
            placeholder="Contoh: Tugas 1, UH 1..." 
            value={label} 
            onChange={e => setLabel(e.target.value)} 
          />
        </div>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">{error}</div>}

      {selectedAssignment && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-800">
                <tr>
                  <th className="p-4 font-semibold w-10">No</th>
                  <th className="p-4 font-semibold">Nama Siswa</th>
                  <th className="p-4 font-semibold w-48">Nilai (0-100)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {classStudents.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-6 text-center text-gray-500">Belum ada siswa di kelas ini.</td>
                  </tr>
                ) : classStudents.map((student: any, idx: number) => (
                  <tr key={student.id} className="hover:bg-gray-50/50">
                    <td className="p-4 text-center">{idx + 1}</td>
                    <td className="p-4 font-medium text-gray-900">{student.studentData.fullName}</td>
                    <td className="p-4">
                      <Input 
                        type="number"
                        min="0" max="100" step="0.01"
                        placeholder="0"
                        className="w-24 text-center font-bold text-teal-700"
                        value={gradeData[student.id] ?? ""}
                        onChange={(e) => handleScoreChange(student.id, e.target.value)}
                        required
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {classStudents.length > 0 && (
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <Button type="submit" disabled={loading} className="px-8">
                {loading ? "Menyimpan..." : "Simpan Nilai"}
              </Button>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
