"use client";

import { useState, useEffect } from "react";
import { getTeachingJournals, upsertTeachingJournal, deleteTeachingJournal } from "@/actions/teaching-journals";

export function JournalClient({ assignments }: { assignments: any[] }) {
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>("");
  const [journals, setJournals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [material, setMaterial] = useState("");
  const [method, setMethod] = useState("");
  const [reflection, setReflection] = useState("");

  const selectedAssignment = assignments.find(a => a.id === selectedAssignmentId);

  useEffect(() => {
    if (selectedAssignment) {
      loadJournals(selectedAssignment.classId, selectedAssignment.subjectId);
    } else {
      setJournals([]);
    }
  }, [selectedAssignmentId]);

  const loadJournals = async (classId: string, subjectId: string) => {
    setLoading(true);
    const res = await getTeachingJournals(classId, subjectId);
    if (res.success && res.data) setJournals(res.data);
    setLoading(false);
  };

  const handleOpenForm = (journal?: any) => {
    if (journal) {
      setEditingId(journal.id);
      setDate(new Date(journal.date).toISOString().split('T')[0]);
      setMaterial(journal.material);
      setMethod(journal.method);
      setReflection(journal.reflection || "");
    } else {
      setEditingId(null);
      setDate(new Date().toISOString().split('T')[0]);
      setMaterial("");
      setMethod("");
      setReflection("");
    }
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    
    setLoading(true);
    const res = await upsertTeachingJournal({
      id: editingId || undefined,
      classId: selectedAssignment.classId,
      subjectId: selectedAssignment.subjectId,
      date: new Date(date),
      material,
      method,
      reflection,
    });
    
    if (res.success) {
      alert("Jurnal berhasil disimpan");
      setIsFormOpen(false);
      loadJournals(selectedAssignment.classId, selectedAssignment.subjectId);
    } else {
      alert("Error: " + res.error);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus jurnal ini?")) return;
    
    setLoading(true);
    const res = await deleteTeachingJournal(id);
    if (res.success && selectedAssignment) {
      loadJournals(selectedAssignment.classId, selectedAssignment.subjectId);
    } else {
      alert("Error: " + res.error);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Kelas & Mata Pelajaran</label>
        <select 
          className="w-full sm:w-1/2 p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
          value={selectedAssignmentId}
          onChange={(e) => setSelectedAssignmentId(e.target.value)}
        >
          <option value="">-- Pilih Penugasan --</option>
          {assignments.map(a => (
            <option key={a.id} value={a.id}>
              {a.class.name} - {a.subject.name}
            </option>
          ))}
        </select>
      </div>

      {selectedAssignment && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h2 className="font-semibold text-gray-800">Daftar Jurnal</h2>
            <button 
              onClick={() => handleOpenForm()}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              + Tambah Jurnal
            </button>
          </div>
          
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 border-b">Tanggal</th>
                  <th className="px-6 py-3 border-b">Materi</th>
                  <th className="px-6 py-3 border-b">Metode</th>
                  <th className="px-6 py-3 border-b">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading && journals.length === 0 ? (
                  <tr><td colSpan={4} className="p-6 text-center text-gray-500">Memuat data...</td></tr>
                ) : journals.length === 0 ? (
                  <tr><td colSpan={4} className="p-6 text-center text-gray-500">Belum ada jurnal.</td></tr>
                ) : (
                  journals.map(j => (
                    <tr key={j.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">{new Date(j.date).toLocaleDateString('id-ID')}</td>
                      <td className="px-6 py-4 max-w-xs truncate" title={j.material}>{j.material}</td>
                      <td className="px-6 py-4 max-w-xs truncate" title={j.method}>{j.method}</td>
                      <td className="px-6 py-4 flex gap-2">
                        <button onClick={() => handleOpenForm(j)} className="text-teal-600 hover:text-teal-800 font-medium">Edit</button>
                        <button onClick={() => handleDelete(j.id)} className="text-red-600 hover:text-red-800 font-medium">Hapus</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg">{editingId ? "Edit Jurnal" : "Tambah Jurnal"}</h3>
              <button onClick={() => setIsFormOpen(false)} className="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                <input required type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Materi Pembelajaran</label>
                <textarea required value={material} onChange={e => setMaterial(e.target.value)} rows={3} className="w-full p-2 border rounded-md"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Metode / Aktivitas</label>
                <textarea required value={method} onChange={e => setMethod(e.target.value)} rows={2} className="w-full p-2 border rounded-md"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Refleksi (Opsional)</label>
                <textarea value={reflection} onChange={e => setReflection(e.target.value)} rows={2} className="w-full p-2 border rounded-md"></textarea>
              </div>
              
              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">Batal</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50">
                  {loading ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
