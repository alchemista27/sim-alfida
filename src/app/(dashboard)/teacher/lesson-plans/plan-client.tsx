"use client";

import { useState, useEffect } from "react";
import { getLessonPlans, upsertLessonPlan, deleteLessonPlan } from "@/actions/lesson-plans";
import { LessonPlanType } from "@prisma/client";

export function PlanClient({ academicYearId, subjects }: { academicYearId: string, subjects: any[] }) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [type, setType] = useState<LessonPlanType>(LessonPlanType.rpp);
  const [title, setTitle] = useState("");
  
  // Structured Content State
  const [contentGoal, setContentGoal] = useState("");
  const [contentSteps, setContentSteps] = useState("");
  const [contentAssessment, setContentAssessment] = useState("");

  useEffect(() => {
    if (selectedSubjectId) {
      loadPlans(selectedSubjectId);
    } else {
      setPlans([]);
    }
  }, [selectedSubjectId]);

  const loadPlans = async (subjectId: string) => {
    setLoading(true);
    const res = await getLessonPlans(subjectId, academicYearId);
    if (res.success && res.data) setPlans(res.data);
    setLoading(false);
  };

  const handleOpenForm = (plan?: any) => {
    if (plan) {
      setEditingId(plan.id);
      setType(plan.type);
      setTitle(plan.title);
      
      try {
        const parsedContent = JSON.parse(plan.content);
        setContentGoal(parsedContent.tujuan || "");
        setContentSteps(parsedContent.langkah || "");
        setContentAssessment(parsedContent.asesmen || "");
      } catch (e) {
        // Fallback if not json
        setContentGoal(plan.content);
        setContentSteps("");
        setContentAssessment("");
      }
    } else {
      setEditingId(null);
      setType(LessonPlanType.rpp);
      setTitle("");
      setContentGoal("");
      setContentSteps("");
      setContentAssessment("");
    }
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId) return;
    
    setLoading(true);
    const structuredContent = JSON.stringify({
      tujuan: contentGoal,
      langkah: contentSteps,
      asesmen: contentAssessment
    });
    
    const res = await upsertLessonPlan({
      id: editingId || undefined,
      subjectId: selectedSubjectId,
      academicYearId,
      type,
      title,
      content: structuredContent,
    });
    
    if (res.success) {
      alert("Dokumen berhasil disimpan");
      setIsFormOpen(false);
      loadPlans(selectedSubjectId);
    } else {
      alert("Error: " + res.error);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus dokumen perencanaan ini?")) return;
    
    setLoading(true);
    const res = await deleteLessonPlan(id);
    if (res.success && selectedSubjectId) {
      loadPlans(selectedSubjectId);
    } else {
      alert("Error: " + res.error);
    }
    setLoading(false);
  };

  const typeLabels = {
    prota: "Program Tahunan",
    promes: "Program Semester",
    rpp: "RPP"
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Mata Pelajaran</label>
        <select 
          className="w-full sm:w-1/2 p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
          value={selectedSubjectId}
          onChange={(e) => setSelectedSubjectId(e.target.value)}
        >
          <option value="">-- Pilih Mata Pelajaran --</option>
          {subjects.map(s => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {selectedSubjectId && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h2 className="font-semibold text-gray-800">Dokumen Perencanaan</h2>
            <button 
              onClick={() => handleOpenForm()}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              + Tambah Dokumen
            </button>
          </div>
          
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3 border-b">Tipe</th>
                  <th className="px-6 py-3 border-b">Judul</th>
                  <th className="px-6 py-3 border-b">Tanggal Dibuat</th>
                  <th className="px-6 py-3 border-b">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading && plans.length === 0 ? (
                  <tr><td colSpan={4} className="p-6 text-center text-gray-500">Memuat data...</td></tr>
                ) : plans.length === 0 ? (
                  <tr><td colSpan={4} className="p-6 text-center text-gray-500">Belum ada dokumen.</td></tr>
                ) : (
                  plans.map(p => (
                    <tr key={p.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-teal-700">
                        {typeLabels[p.type as keyof typeof typeLabels]}
                      </td>
                      <td className="px-6 py-4">{p.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{new Date(p.createdAt).toLocaleDateString('id-ID')}</td>
                      <td className="px-6 py-4 flex gap-3">
                        <a 
                          href={`/api/pdf/lesson-plan/${p.id}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Cetak PDF
                        </a>
                        <button onClick={() => handleOpenForm(p)} className="text-teal-600 hover:text-teal-800 font-medium">Edit</button>
                        <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-800 font-medium">Hapus</button>
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 flex-shrink-0">
              <h3 className="font-bold text-lg">{editingId ? "Edit Perencanaan" : "Tambah Perencanaan"}</h3>
              <button onClick={() => setIsFormOpen(false)} className="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Perencanaan</label>
                  <select required value={type} onChange={e => setType(e.target.value as LessonPlanType)} className="w-full p-2 border rounded-md">
                    <option value={LessonPlanType.rpp}>RPP (Rencana Pelaksanaan Pembelajaran)</option>
                    <option value={LessonPlanType.prota}>Program Tahunan (Prota)</option>
                    <option value={LessonPlanType.promes}>Program Semester (Promes)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Judul Dokumen</label>
                  <input required placeholder="Contoh: RPP Bab 1 - Tata Surya" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border rounded-md" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tujuan Pembelajaran</label>
                <textarea required value={contentGoal} onChange={e => setContentGoal(e.target.value)} rows={3} className="w-full p-2 border rounded-md"></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Langkah-langkah Kegiatan</label>
                <textarea required value={contentSteps} onChange={e => setContentSteps(e.target.value)} rows={4} className="w-full p-2 border rounded-md placeholder-gray-400" placeholder="1. Pendahuluan...&#10;2. Kegiatan Inti...&#10;3. Penutup..."></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Penilaian / Asesmen</label>
                <textarea required value={contentAssessment} onChange={e => setContentAssessment(e.target.value)} rows={3} className="w-full p-2 border rounded-md"></textarea>
              </div>
              
              <div className="pt-4 flex justify-end gap-2 border-t mt-4">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">Batal</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50">
                  {loading ? "Menyimpan..." : "Simpan Dokumen"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
