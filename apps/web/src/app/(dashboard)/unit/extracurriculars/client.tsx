"use client";

import { useState } from "react";
import { upsertExtracurricular, assignCoach, removeCoach } from "@/actions/extracurricular";

export function ExtracurricularAdminClient({ 
  extras, 
  teachers,
  academicYearId 
}: { 
  extras: any[], 
  teachers: any[],
  academicYearId: string
}) {
  const [loading, setLoading] = useState(false);
  
  // Extra Form State
  const [isExtraFormOpen, setIsExtraFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Coach Assignment State
  const [isCoachFormOpen, setIsCoachFormOpen] = useState(false);
  const [selectedExtraId, setSelectedExtraId] = useState<string>("");
  const [selectedCoachId, setSelectedCoachId] = useState("");

  const handleOpenExtraForm = (extra?: any) => {
    if (extra) {
      setEditingId(extra.id);
      setName(extra.name);
      setDescription(extra.description || "");
      setIsActive(extra.isActive);
    } else {
      setEditingId(null);
      setName("");
      setDescription("");
      setIsActive(true);
    }
    setIsExtraFormOpen(true);
  };

  const handleOpenCoachForm = (extraId: string) => {
    setSelectedExtraId(extraId);
    setSelectedCoachId("");
    setIsCoachFormOpen(true);
  };

  const submitExtra = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await upsertExtracurricular({
      id: editingId || undefined,
      name,
      description,
      isActive
    });
    
    if (res.success) {
      alert("Berhasil disimpan");
      setIsExtraFormOpen(false);
    } else {
      alert("Error: " + res.error);
    }
    setLoading(false);
  };

  const submitCoach = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCoachId || !selectedExtraId) return;
    
    setLoading(true);
    const res = await assignCoach({
      extraId: selectedExtraId,
      coachId: selectedCoachId
    }, academicYearId);
    
    if (res.success) {
      alert("Pembina berhasil ditugaskan");
      setIsCoachFormOpen(false);
    } else {
      alert("Error: " + res.error);
    }
    setLoading(false);
  };

  const handleRemoveCoach = async (assignmentId: string) => {
    if (!confirm("Cabut pembina ini?")) return;
    setLoading(true);
    const res = await removeCoach(assignmentId);
    if (!res.success) alert("Error: " + res.error);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="font-semibold text-gray-800">Daftar Program Ekstrakurikuler</h2>
          <button 
            onClick={() => handleOpenExtraForm()}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + Tambah Program
          </button>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {extras.map(ex => (
            <div key={ex.id} className="border border-gray-200 rounded-xl p-5 hover:border-teal-300 transition-colors shadow-sm bg-white relative">
              <div className="absolute top-4 right-4">
                <span className={`px-2 py-1 text-[10px] font-bold rounded-full ${ex.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {ex.isActive ? 'AKTIF' : 'NONAKTIF'}
                </span>
              </div>
              
              <h3 className="font-bold text-lg text-gray-800 pr-16">{ex.name}</h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2 h-10">{ex.description || "Tidak ada deskripsi."}</p>
              
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                <div className="text-gray-600 font-medium flex items-center gap-1">
                  <span className="text-teal-600 font-bold">{ex._count.members}</span> Siswa Terdaftar
                </div>
                <button onClick={() => handleOpenExtraForm(ex)} className="text-blue-600 hover:text-blue-800 font-medium">Edit Info</button>
              </div>
              
              <div className="mt-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-gray-500 uppercase">Daftar Pembina</span>
                  <button onClick={() => handleOpenCoachForm(ex.id)} className="text-xs text-teal-600 hover:text-teal-800 font-medium">+ Tambah</button>
                </div>
                {ex.coaches.length > 0 ? (
                  <ul className="space-y-1">
                    {ex.coaches.map((c: any) => (
                      <li key={c.id} className="text-sm flex justify-between items-center bg-white border border-gray-100 p-1 px-2 rounded">
                        <span className="truncate">{c.coach.fullName}</span>
                        <button onClick={() => handleRemoveCoach(c.id)} className="text-red-500 hover:text-red-700 text-xs ml-2" title="Cabut">✕</button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-xs text-gray-400 italic">Belum ada pembina</div>
                )}
              </div>
            </div>
          ))}
          {extras.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500 border border-dashed rounded-xl">
              Belum ada program ekstrakurikuler yang terdaftar.
            </div>
          )}
        </div>
      </div>

      {/* Extra Form Modal */}
      {isExtraFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg">{editingId ? "Edit Ekstrakurikuler" : "Program Baru"}</h3>
              <button onClick={() => setIsExtraFormOpen(false)} className="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
            </div>
            <form onSubmit={submitExtra} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Program</label>
                <input required value={name} onChange={e => setName(e.target.value)} placeholder="Contoh: Pramuka, Futsal" className="w-full p-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi (Opsional)</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full p-2 border rounded-md"></textarea>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="isActive" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500" />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">Program Aktif</label>
              </div>
              
              <div className="pt-4 flex justify-end gap-2 border-t mt-4">
                <button type="button" onClick={() => setIsExtraFormOpen(false)} className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">Batal</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coach Assignment Modal */}
      {isCoachFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg">Tugaskan Pembina</h3>
              <button onClick={() => setIsCoachFormOpen(false)} className="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
            </div>
            <form onSubmit={submitCoach} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Guru</label>
                <select required value={selectedCoachId} onChange={e => setSelectedCoachId(e.target.value)} className="w-full p-2 border rounded-md focus:ring-teal-500">
                  <option value="">-- Pilih Guru --</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.fullName}</option>
                  ))}
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-2 border-t mt-4">
                <button type="button" onClick={() => setIsCoachFormOpen(false)} className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">Batal</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50">Tugaskan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
