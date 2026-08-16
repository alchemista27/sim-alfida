"use client";

import { useState } from "react";
import { assignToClass } from "@/actions/class-assignment";

export function ClassAssignmentClient({ students, classes }: { students: any[], classes: any[] }) {
  const [loadingIds, setLoadingIds] = useState<string[]>([]);

  const handleAssign = async (registrationId: string, classId: string) => {
    if (!classId) return;

    // Cari sisa kapasitas kelas yang dipilih
    const targetClass = classes.find(c => c.id === classId);
    if (!targetClass) return;

    if (targetClass.assigned >= targetClass.capacity) {
      alert(`Gagal: Kapasitas kelas ${targetClass.name} sudah penuh!`);
      return;
    }

    setLoadingIds(prev => [...prev, registrationId]);
    const res = await assignToClass(registrationId, classId);
    setLoadingIds(prev => prev.filter(id => id !== registrationId));

    if (!res.success) {
      alert((res as any).error);
    } else {
      // Refresh component implicitly through server action revalidatePath
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <table className="w-full text-left text-sm text-gray-600">
        <thead className="bg-gray-50 border-b border-gray-200 text-gray-800">
          <tr>
            <th className="p-4 font-semibold">Peringkat PPDB</th>
            <th className="p-4 font-semibold">No. Daftar</th>
            <th className="p-4 font-semibold">Nama Siswa</th>
            <th className="p-4 font-semibold">Skor Tes</th>
            <th className="p-4 font-semibold">Status</th>
            <th className="p-4 font-semibold">Kelas</th>
            <th className="p-4 font-semibold text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {students.map((student) => {
            const isLoading = loadingIds.includes(student.id);
            const isEnrolled = student.status === 'enrolled';
            
            return (
              <tr key={student.id} className="hover:bg-gray-50/50">
                <td className="p-4 font-bold text-gray-900">{student.rank !== 999 ? student.rank : "-"}</td>
                <td className="p-4 font-mono text-xs">{student.registrationNumber}</td>
                <td className="p-4 font-medium text-gray-900">{student.name}</td>
                <td className="p-4 font-bold text-teal-600">{student.score}</td>
                <td className="p-4">
                  {isEnrolled ? (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Enrolled</span>
                  ) : (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Lulus</span>
                  )}
                </td>
                <td className="p-4">
                  {isEnrolled ? (
                    <span className="font-bold text-gray-900 px-3 py-1 bg-gray-100 rounded-md">{student.assignedClassName}</span>
                  ) : (
                    <select
                      id={`class-select-${student.id}`}
                      className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md outline-none focus:border-teal-500 w-32"
                      disabled={isLoading}
                    >
                      <option value="">-- Pilih --</option>
                      {classes.map(cls => (
                        <option 
                          key={cls.id} 
                          value={cls.id} 
                          disabled={cls.assigned >= cls.capacity}
                        >
                          {cls.name} ({cls.capacity - cls.assigned} sisa)
                        </option>
                      ))}
                    </select>
                  )}
                </td>
                <td className="p-4 text-right">
                  {!isEnrolled && (
                    <button 
                      onClick={() => {
                        const selectEl = document.getElementById(`class-select-${student.id}`) as HTMLSelectElement;
                        handleAssign(student.id, selectEl.value);
                      }}
                      disabled={isLoading}
                      className="bg-teal-50 hover:bg-teal-100 text-teal-700 px-4 py-1.5 rounded-md font-medium text-xs transition disabled:opacity-50"
                    >
                      {isLoading ? 'Loading...' : 'Simpan'}
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
          {students.length === 0 && (
            <tr>
              <td colSpan={7} className="p-8 text-center text-gray-500">Belum ada siswa yang lulus untuk ditempatkan.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
