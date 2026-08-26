"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Icon } from "@/components/ui/icon";
import { SubjectLevel } from "@/generated/client";
import { createSubject, updateSubject, deleteSubject } from "@/actions/academic";

interface SubjectData {
  id: string;
  code: string;
  name: string;
  level: SubjectLevel;
  isActive: boolean;
}

export function SubjectClient({ initialData }: { initialData: SubjectData[] }) {
  const [subjects, setSubjects] = useState(initialData);
  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<{
    id: string;
    code: string;
    name: string;
    level: SubjectLevel;
    isActive: boolean;
  }>({
    id: "",
    code: "",
    name: "",
    level: SubjectLevel.all,
    isActive: true,
  });

  const openNew = () => {
    setFormData({ id: "", code: "", name: "", level: SubjectLevel.all, isActive: true });
    setIsEdit(false);
    setError(null);
    setIsOpen(true);
  };

  const openEdit = (s: SubjectData) => {
    setFormData({
      id: s.id,
      code: s.code,
      name: s.name,
      level: s.level,
      isActive: s.isActive,
    });
    setIsEdit(true);
    setError(null);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      code: formData.code,
      name: formData.name,
      level: formData.level,
      isActive: formData.isActive,
    };

    let res;
    if (isEdit) {
      res = await updateSubject(formData.id, payload);
    } else {
      res = await createSubject(payload);
    }

    if (res.success) {
      setIsOpen(false);
      window.location.reload(); // Simple refresh to get new server data
    } else {
      setError(res.error || "Gagal menyimpan data.");
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus mapel ini?")) return;
    
    setLoading(true);
    const res = await deleteSubject(id);
    if (res.success) {
      window.location.reload();
    } else {
      alert(res.error);
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Mata Pelajaran</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola data mata pelajaran untuk unit ini.</p>
        </div>
        <Button onClick={openNew} className="flex items-center gap-2">
          <Icon name="add" className="text-lg" /> Tambah Mapel
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-800">
            <tr>
              <th className="p-4 font-semibold">Kode</th>
              <th className="p-4 font-semibold">Nama Mapel</th>
              <th className="p-4 font-semibold">Level/Tingkat</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {subjects.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">Belum ada data mapel.</td>
              </tr>
            ) : subjects.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50/50">
                <td className="p-4 font-medium text-gray-900">{s.code}</td>
                <td className="p-4">{s.name}</td>
                <td className="p-4 uppercase">{s.level.replace('_', ' ')}</td>
                <td className="p-4">
                  {s.isActive ? (
                    <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full border border-green-200">Aktif</span>
                  ) : (
                    <span className="px-2 py-0.5 bg-gray-50 text-gray-600 text-xs rounded-full border border-gray-200">Nonaktif</span>
                  )}
                </td>
                <td className="p-4 flex gap-2">
                  <button onClick={() => openEdit(s)} className="text-blue-600 hover:text-blue-800" title="Edit">
                    <Icon name="edit" />
                  </button>
                  <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:text-red-800" title="Hapus">
                    <Icon name="delete" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isOpen} onClose={() => !loading && setIsOpen(false)} title={isEdit ? "Edit Mapel" : "Tambah Mapel"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 text-sm text-red-700 bg-red-50 rounded-md">{error}</div>}
          
          <div className="space-y-1">
            <label className="text-sm font-medium">Kode Mapel</label>
            <Input 
              value={formData.code} 
              onChange={e => setFormData({...formData, code: e.target.value})} 
              required 
              placeholder="Contoh: MAT, IPA" 
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Nama Mapel</label>
            <Input 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              required 
              placeholder="Contoh: Matematika" 
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium">Tingkat Kelas</label>
            <select
              value={formData.level}
              onChange={e => setFormData({...formData, level: e.target.value as SubjectLevel})}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="all">Semua Tingkat (All)</option>
              <option value="level_0">TK (Level 0)</option>
              <option value="level_1">Kelas 1</option>
              <option value="level_2">Kelas 2</option>
              <option value="level_3">Kelas 3</option>
              <option value="level_4">Kelas 4</option>
              <option value="level_5">Kelas 5</option>
              <option value="level_6">Kelas 6</option>
              <option value="level_7">Kelas 7</option>
              <option value="level_8">Kelas 8</option>
              <option value="level_9">Kelas 9</option>
              <option value="level_10">Kelas 10</option>
              <option value="level_11">Kelas 11</option>
              <option value="level_12">Kelas 12</option>
              <option value="level_13">Pesantren (Level 13)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <input 
              type="checkbox" 
              id="isActive" 
              checked={formData.isActive}
              onChange={e => setFormData({...formData, isActive: e.target.checked})}
              className="rounded border-gray-300 text-teal-600 focus:ring-teal-600"
            />
            <label htmlFor="isActive" className="text-sm">Status Aktif</label>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t">
            <Button variant="outline" type="button" onClick={() => setIsOpen(false)} disabled={loading}>Batal</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
