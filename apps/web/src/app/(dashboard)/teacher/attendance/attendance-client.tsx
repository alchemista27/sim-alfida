"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { AttendanceStatus } from "@sim/database";
import { submitBatchAttendance } from "@/actions/academic";
import { Input } from "@/components/ui/input";

export function AttendanceClient({ academicYearId, assignments, students }: any) {
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data attendance lokal
  const [attendanceData, setAttendanceData] = useState<Record<string, { status: AttendanceStatus, notes: string }>>({});

  const selectedAssignment = useMemo(() => 
    assignments.find((a: any) => a.id === selectedAssignmentId)
  , [assignments, selectedAssignmentId]);

  const classStudents = useMemo(() => {
    if (!selectedAssignment) return [];
    return students.filter((s: any) => s.classId === selectedAssignment.classId);
  }, [students, selectedAssignment]);

  // Initialize attendance data when class changes
  useMemo(() => {
    if (classStudents.length > 0) {
      const initial: any = {};
      classStudents.forEach((s: any) => {
        initial[s.id] = { status: AttendanceStatus.present, notes: "" };
      });
      setAttendanceData(initial);
    } else {
      setAttendanceData({});
    }
  }, [classStudents]);

  const handleStatusChange = (enrollmentId: string, status: AttendanceStatus) => {
    setAttendanceData(prev => ({
      ...prev,
      [enrollmentId]: { ...prev[enrollmentId], status }
    }));
  };

  const handleNotesChange = (enrollmentId: string, notes: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [enrollmentId]: { ...prev[enrollmentId], notes }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    setLoading(true);
    setError(null);

    const attendances = Object.keys(attendanceData).map(enrollmentId => ({
      enrollmentId,
      status: attendanceData[enrollmentId].status,
      notes: attendanceData[enrollmentId].notes,
    }));

    const payload = {
      subjectId: selectedAssignment.subjectId,
      classId: selectedAssignment.classId,
      date,
      attendances,
    };

    const res = await submitBatchAttendance(payload, academicYearId);
    if (res.success) {
      alert("Absensi berhasil disimpan!");
      // window.location.reload(); 
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
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 space-y-1">
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
        <div className="md:w-48 space-y-1">
          <label className="text-sm font-medium text-gray-700">Tanggal Pertemuan</label>
          <Input 
            type="date" 
            value={date} 
            onChange={e => setDate(e.target.value)} 
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
                  <th className="p-4 font-semibold text-center min-w-[300px]">Status Kehadiran</th>
                  <th className="p-4 font-semibold">Catatan (Opsional)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {classStudents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-gray-500">Belum ada siswa di kelas ini.</td>
                  </tr>
                ) : classStudents.map((student: any, idx: number) => {
                  const currentData = attendanceData[student.id];
                  if (!currentData) return null;
                  
                  return (
                    <tr key={student.id} className="hover:bg-gray-50/50">
                      <td className="p-4 text-center">{idx + 1}</td>
                      <td className="p-4 font-medium text-gray-900">{student.studentData.fullName}</td>
                      <td className="p-4">
                        <div className="flex justify-center gap-4">
                          {[
                            { val: AttendanceStatus.present, label: 'Hadir', color: 'text-green-600' },
                            { val: AttendanceStatus.sick, label: 'Sakit', color: 'text-yellow-600' },
                            { val: AttendanceStatus.permitted, label: 'Izin', color: 'text-blue-600' },
                            { val: AttendanceStatus.absent, label: 'Alpa', color: 'text-red-600' },
                          ].map(opt => (
                            <label key={opt.val} className={`flex items-center gap-1.5 cursor-pointer ${opt.color}`}>
                              <input 
                                type="radio" 
                                name={`status-${student.id}`} 
                                value={opt.val}
                                checked={currentData.status === opt.val}
                                onChange={() => handleStatusChange(student.id, opt.val)}
                                className="w-4 h-4 text-current focus:ring-current"
                              />
                              <span className="font-medium text-xs uppercase">{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <Input 
                          placeholder="Catatan..." 
                          className="h-8 text-sm"
                          value={currentData.notes}
                          onChange={(e) => handleNotesChange(student.id, e.target.value)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {classStudents.length > 0 && (
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <Button type="submit" disabled={loading} className="px-8">
                {loading ? "Menyimpan..." : "Simpan Absensi"}
              </Button>
            </div>
          )}
        </form>
      )}
    </div>
  );
}
