"use client";

import { useState } from "react";
import { createSchedule, deleteSchedule } from "@/actions/observation-schedule";

export function ObservationScheduleClient({ schedules, academicYearId }: { schedules: any[], academicYearId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("12:00");
  const [quota, setQuota] = useState(10);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await createSchedule({
      academicYearId,
      date: new Date(date),
      startTime,
      endTime,
      quota,
    });
    setLoading(false);
    if (res.success) {
      setIsOpen(false);
      setDate("");
    } else {
      alert(res.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Hapus jadwal ini?")) {
      const res = await deleteSchedule(id);
      if (!res.success) alert(res.error);
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => setIsOpen(true)} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center">
          <span className="material-symbols-rounded mr-2">add</span> Tambah Jadwal
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-800">
            <tr>
              <th className="p-4 font-semibold">Tanggal</th>
              <th className="p-4 font-semibold">Waktu</th>
              <th className="p-4 font-semibold">Kuota Harian</th>
              <th className="p-4 font-semibold">Sudah Booking</th>
              <th className="p-4 font-semibold">Sisa</th>
              <th className="p-4 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {schedules.map((sch) => (
              <tr key={sch.id} className="hover:bg-gray-50/50">
                <td className="p-4">{new Date(sch.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                <td className="p-4">{sch.startTime} - {sch.endTime}</td>
                <td className="p-4">{sch.quota}</td>
                <td className="p-4">{sch.booked}</td>
                <td className="p-4 font-medium text-teal-600">{sch.quota - sch.booked}</td>
                <td className="p-4 text-right">
                  <button onClick={() => handleDelete(sch.id)} className="text-red-500 hover:bg-red-50 p-2 rounded">
                    <span className="material-symbols-rounded text-lg">delete</span>
                  </button>
                </td>
              </tr>
            ))}
            {schedules.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">Belum ada jadwal observasi yang dibuat.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-900">Tambah Jadwal Baru</h3>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                <span className="material-symbols-rounded">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Observasi</label>
                <input type="date" required value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jam Mulai</label>
                  <input type="time" required value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jam Selesai</label>
                  <input type="time" required value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kuota Harian</label>
                <input type="number" min="1" required value={quota} onChange={e => setQuota(Number(e.target.value))} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none" />
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setIsOpen(false)} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Batal</button>
                <button type="submit" disabled={loading} className="px-5 py-2.5 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors disabled:opacity-50">
                  {loading ? "Menyimpan..." : "Simpan Jadwal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
