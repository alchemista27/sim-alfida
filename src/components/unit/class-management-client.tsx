"use client";

import { useState } from "react";
import { createClass, deleteClass } from "@/actions/classes";

export function ClassManagementClient({ classes, academicYearId, unitId }: { classes: any[], academicYearId: string, unitId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState(30);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await createClass({
      academicYearId,
      unitId,
      name,
      capacity,
    });
    setLoading(false);
    if (res.success) {
      setIsOpen(false);
      setName("");
      setCapacity(30);
    } else {
      alert(res.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus kelas ini?")) {
      const res = await deleteClass(id);
      if (!res.success) alert(res.error);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        {classes.map(cls => (
          <div key={cls.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="font-bold text-lg text-gray-800">{cls.name}</h3>
            <p className="text-sm text-gray-500 mb-3">Kapasitas: {cls.capacity} siswa</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className="bg-teal-500 h-2 rounded-full" 
                style={{ width: `${Math.min((cls.assigned / cls.capacity) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>{cls.assigned} terisi</span>
              <span>{cls.capacity - cls.assigned} sisa</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end mb-4">
        <button onClick={() => setIsOpen(true)} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center">
          <span className="material-symbols-rounded mr-2">add</span> Tambah Kelas
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-800">
            <tr>
              <th className="p-4 font-semibold">Nama Kelas</th>
              <th className="p-4 font-semibold">Kapasitas</th>
              <th className="p-4 font-semibold">Terisi</th>
              <th className="p-4 font-semibold">Sisa Slot</th>
              <th className="p-4 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {classes.map((cls) => (
              <tr key={cls.id} className="hover:bg-gray-50/50">
                <td className="p-4 font-bold text-gray-900">{cls.name}</td>
                <td className="p-4">{cls.capacity}</td>
                <td className="p-4">{cls.assigned}</td>
                <td className="p-4 font-medium text-teal-600">{cls.capacity - cls.assigned}</td>
                <td className="p-4 text-right">
                  <button onClick={() => handleDelete(cls.id)} className="text-red-500 hover:bg-red-50 p-2 rounded">
                    <span className="material-symbols-rounded text-lg">delete</span>
                  </button>
                </td>
              </tr>
            ))}
            {classes.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">Belum ada kelas yang dibuat.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-900">Tambah Kelas Baru</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kelas</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Contoh: 1A" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kapasitas</label>
                <input type="number" min="1" required value={capacity} onChange={e => setCapacity(Number(e.target.value))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all" />
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setIsOpen(false)} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Batal</button>
                <button type="submit" disabled={loading} className="px-5 py-2.5 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors disabled:opacity-50">
                  {loading ? "Menyimpan..." : "Simpan Kelas"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
