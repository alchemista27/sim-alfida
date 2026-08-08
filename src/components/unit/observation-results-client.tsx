"use client";

import { useState } from "react";
import { batchAcceptStudents, batchRejectStudents } from "@/actions/acceptance";

export function ObservationResultsClient({ results }: { results: any[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const handleBatchAccept = async () => {
    if (selectedIds.length === 0) return alert("Pilih minimal satu siswa");
    if (confirm(`Terima ${selectedIds.length} siswa ini?`)) {
      setLoading(true);
      const res = await batchAcceptStudents(selectedIds);
      if (!res.success) alert(res.error);
      setLoading(false);
      setSelectedIds([]);
    }
  };

  const handleBatchReject = async () => {
    if (selectedIds.length === 0) return alert("Pilih minimal satu siswa");
    const reason = prompt("Alasan penolakan:", "Tidak memenuhi standar kelulusan observasi");
    if (reason !== null) {
      setLoading(true);
      const res = await batchRejectStudents(selectedIds, reason);
      if (!res.success) alert(res.error);
      setLoading(false);
      setSelectedIds([]);
    }
  };

  return (
    <div>
      <div className="flex justify-between mb-4">
        <div className="text-sm text-gray-600 self-center">
          {selectedIds.length} baris terpilih
        </div>
        <div className="flex gap-3">
          <button onClick={handleBatchReject} disabled={loading || selectedIds.length === 0} className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 border border-red-200">
            Tolak Terpilih
          </button>
          <button onClick={handleBatchAccept} disabled={loading || selectedIds.length === 0} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50">
            Terima Terpilih
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-800">
            <tr>
              <th className="p-4 w-10">
                <input 
                  type="checkbox" 
                  onChange={(e) => setSelectedIds(e.target.checked ? results.filter(r => r.status === 'observation_done').map(r => r.id) : [])} 
                  checked={selectedIds.length === results.filter(r => r.status === 'observation_done').length && results.length > 0}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500" 
                />
              </th>
              <th className="p-4 font-semibold">Peringkat</th>
              <th className="p-4 font-semibold">No. Daftar</th>
              <th className="p-4 font-semibold">Nama Siswa</th>
              <th className="p-4 font-semibold">Tanggal Observasi</th>
              <th className="p-4 font-semibold">Skor</th>
              <th className="p-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {results.map((res) => (
              <tr key={res.id} className="hover:bg-gray-50/50">
                <td className="p-4">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(res.id)} 
                    onChange={() => toggleSelect(res.id)} 
                    disabled={res.status !== 'observation_done'}
                    className="rounded border-gray-300 text-teal-600 focus:ring-teal-500 disabled:opacity-50" 
                  />
                </td>
                <td className="p-4 font-bold text-gray-900">{res.rank}</td>
                <td className="p-4 font-mono text-xs">{res.registrationNumber}</td>
                <td className="p-4 font-medium text-gray-900">{res.studentName}</td>
                <td className="p-4">{new Date(res.date).toLocaleDateString('id-ID')}</td>
                <td className="p-4 font-bold text-teal-600">{res.score}</td>
                <td className="p-4">
                  {res.status === 'observation_done' && <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Selesai Observasi</span>}
                  {res.status === 'accepted' && <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Diterima</span>}
                  {res.status === 'rejected' && <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Ditolak</span>}
                </td>
              </tr>
            ))}
            {results.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">Belum ada hasil observasi.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
