"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Modal } from "@/components/ui/modal";
import { assignHomeroomTeacher, removeHomeroomAssignment, assignTeacherToSubject, removeTeacherAssignment } from "@/actions/academic";

export function TeacherClient({
  academicYearId,
  classes,
  subjects,
  teachers,
  teacherAssignments,
  homeroomAssignments,
}: any) {
  const [activeTab, setActiveTab] = useState<"homeroom" | "subject">("homeroom");
  const [loading, setLoading] = useState(false);

  // State untuk Wali Kelas
  const [homeroomModal, setHomeroomModal] = useState(false);
  const [hrForm, setHrForm] = useState({ classId: "", teacherId: "" });

  // State untuk Guru Mapel
  const [subjectModal, setSubjectModal] = useState(false);
  const [subForm, setSubForm] = useState({ classId: "", subjectId: "", teacherId: "" });

  const handleAssignHomeroom = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await assignHomeroomTeacher(hrForm, academicYearId);
    if (res.success) {
      window.location.reload();
    } else {
      alert(res.error);
      setLoading(false);
    }
  };

  const handleRemoveHomeroom = async (id: string) => {
    if (!confirm("Hapus penugasan wali kelas ini?")) return;
    setLoading(true);
    const res = await removeHomeroomAssignment(id);
    if (res.success) window.location.reload();
    else { alert(res.error); setLoading(false); }
  };

  const handleAssignSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await assignTeacherToSubject(subForm, academicYearId);
    if (res.success) {
      window.location.reload();
    } else {
      alert(res.error);
      setLoading(false);
    }
  };

  const handleRemoveSubject = async (id: string) => {
    if (!confirm("Hapus penugasan guru mapel ini?")) return;
    setLoading(true);
    const res = await removeTeacherAssignment(id);
    if (res.success) window.location.reload();
    else { alert(res.error); setLoading(false); }
  };

  return (
    <div>
      <div className="flex border-b mb-6">
        <button 
          onClick={() => setActiveTab("homeroom")}
          className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${activeTab === "homeroom" ? "border-teal-600 text-teal-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
        >
          Wali Kelas
        </button>
        <button 
          onClick={() => setActiveTab("subject")}
          className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${activeTab === "subject" ? "border-teal-600 text-teal-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
        >
          Guru Mata Pelajaran
        </button>
      </div>

      {activeTab === "homeroom" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-700">Daftar Wali Kelas</h2>
            <Button onClick={() => setHomeroomModal(true)} className="flex items-center gap-2">
              <Icon name="add" className="text-lg" /> Assign Wali Kelas
            </Button>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-800">
                <tr>
                  <th className="p-4 font-semibold">Kelas</th>
                  <th className="p-4 font-semibold">Wali Kelas</th>
                  <th className="p-4 font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {homeroomAssignments.length === 0 ? (
                  <tr><td colSpan={3} className="p-6 text-center text-gray-500">Belum ada wali kelas yang ditugaskan.</td></tr>
                ) : homeroomAssignments.map((ha: any) => (
                  <tr key={ha.id} className="hover:bg-gray-50/50">
                    <td className="p-4 font-medium text-gray-900">{ha.class.name}</td>
                    <td className="p-4">{ha.teacher.fullName}</td>
                    <td className="p-4">
                      <button onClick={() => handleRemoveHomeroom(ha.id)} className="text-red-600 hover:text-red-800">
                        <Icon name="delete" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "subject" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-700">Daftar Guru Mata Pelajaran</h2>
            <Button onClick={() => setSubjectModal(true)} className="flex items-center gap-2">
              <Icon name="add" className="text-lg" /> Assign Guru Mapel
            </Button>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-800">
                <tr>
                  <th className="p-4 font-semibold">Kelas</th>
                  <th className="p-4 font-semibold">Mata Pelajaran</th>
                  <th className="p-4 font-semibold">Guru Pengajar</th>
                  <th className="p-4 font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {teacherAssignments.length === 0 ? (
                  <tr><td colSpan={4} className="p-6 text-center text-gray-500">Belum ada guru mapel yang ditugaskan.</td></tr>
                ) : teacherAssignments.map((ta: any) => (
                  <tr key={ta.id} className="hover:bg-gray-50/50">
                    <td className="p-4 font-medium text-gray-900">{ta.class.name}</td>
                    <td className="p-4">{ta.subject.name} ({ta.subject.code})</td>
                    <td className="p-4">{ta.teacher.fullName}</td>
                    <td className="p-4">
                      <button onClick={() => handleRemoveSubject(ta.id)} className="text-red-600 hover:text-red-800">
                        <Icon name="delete" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Wali Kelas */}
      <Modal isOpen={homeroomModal} onClose={() => !loading && setHomeroomModal(false)} title="Assign Wali Kelas">
        <form onSubmit={handleAssignHomeroom} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Kelas</label>
            <select
              value={hrForm.classId}
              onChange={e => setHrForm({...hrForm, classId: e.target.value})}
              required
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            >
              <option value="">-- Pilih Kelas --</option>
              {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Guru</label>
            <select
              value={hrForm.teacherId}
              onChange={e => setHrForm({...hrForm, teacherId: e.target.value})}
              required
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            >
              <option value="">-- Pilih Guru --</option>
              {teachers.map((t: any) => <option key={t.id} value={t.id}>{t.fullName}</option>)}
            </select>
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t">
            <Button variant="outline" type="button" onClick={() => setHomeroomModal(false)} disabled={loading}>Batal</Button>
            <Button type="submit" disabled={loading}>Simpan</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Guru Mapel */}
      <Modal isOpen={subjectModal} onClose={() => !loading && setSubjectModal(false)} title="Assign Guru Mata Pelajaran">
        <form onSubmit={handleAssignSubject} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Kelas</label>
            <select
              value={subForm.classId}
              onChange={e => setSubForm({...subForm, classId: e.target.value})}
              required
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            >
              <option value="">-- Pilih Kelas --</option>
              {classes.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Mata Pelajaran</label>
            <select
              value={subForm.subjectId}
              onChange={e => setSubForm({...subForm, subjectId: e.target.value})}
              required
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            >
              <option value="">-- Pilih Mapel --</option>
              {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Guru Pengajar</label>
            <select
              value={subForm.teacherId}
              onChange={e => setSubForm({...subForm, teacherId: e.target.value})}
              required
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            >
              <option value="">-- Pilih Guru --</option>
              {teachers.map((t: any) => <option key={t.id} value={t.id}>{t.fullName}</option>)}
            </select>
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t">
            <Button variant="outline" type="button" onClick={() => setSubjectModal(false)} disabled={loading}>Batal</Button>
            <Button type="submit" disabled={loading}>Simpan</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
