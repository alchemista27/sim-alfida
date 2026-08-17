"use client";

import { useState, useEffect } from "react";
import { getClassSchedules, upsertClassSchedule, deleteClassSchedule } from "@/actions/schedules";
import { DayOfWeek } from "@prisma/client";

export function ScheduleManager({ 
  classes, 
  subjects, 
  teachers 
}: { 
  classes: any[], 
  subjects: any[], 
  teachers: any[] 
}) {
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [day, setDay] = useState<DayOfWeek>(DayOfWeek.monday);
  const [startTime, setStartTime] = useState("07:00");
  const [endTime, setEndTime] = useState("08:30");
  const [subjectId, setSubjectId] = useState("");
  const [teacherId, setTeacherId] = useState("");

  const selectedClass = classes.find(c => c.id === selectedClassId);

  useEffect(() => {
    if (selectedClassId) {
      loadSchedules(selectedClassId);
    } else {
      setSchedules([]);
    }
  }, [selectedClassId]);

  const loadSchedules = async (classId: string) => {
    setLoading(true);
    const res = await getClassSchedules(classId);
    if (res.success && res.data) setSchedules(res.data);
    setLoading(false);
  };

  const handleOpenForm = (schedule?: any) => {
    if (schedule) {
      setEditingId(schedule.id);
      setDay(schedule.day);
      setStartTime(schedule.startTime);
      setEndTime(schedule.endTime);
      setSubjectId(schedule.subjectId);
      setTeacherId(schedule.teacherId);
    } else {
      setEditingId(null);
      // Defaults
      setDay(DayOfWeek.monday);
      setStartTime("07:00");
      setEndTime("08:30");
      setSubjectId(subjects.length > 0 ? subjects[0].id : "");
      setTeacherId(teachers.length > 0 ? teachers[0].id : "");
    }
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassId) return;
    
    if (startTime >= endTime) {
      alert("Jam selesai harus setelah jam mulai.");
      return;
    }
    
    setLoading(true);
    const res = await upsertClassSchedule({
      id: editingId || undefined,
      classId: selectedClassId,
      subjectId,
      teacherId,
      day,
      startTime,
      endTime
    });
    
    if (res.success) {
      alert("Jadwal berhasil disimpan");
      setIsFormOpen(false);
      loadSchedules(selectedClassId);
    } else {
      alert("Error: " + res.error);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus jadwal ini?")) return;
    
    setLoading(true);
    const res = await deleteClassSchedule(id);
    if (res.success && selectedClassId) {
      loadSchedules(selectedClassId);
    } else {
      alert("Error: " + res.error);
    }
    setLoading(false);
  };

  const dayLabels: Record<DayOfWeek, string> = {
    monday: "Senin",
    tuesday: "Selasa",
    wednesday: "Rabu",
    thursday: "Kamis",
    friday: "Jumat",
    saturday: "Sabtu"
  };

  // Group schedules by day
  const groupedSchedules = Object.values(DayOfWeek).reduce((acc, currentDay) => {
    acc[currentDay] = schedules.filter(s => s.day === currentDay);
    return acc;
  }, {} as Record<DayOfWeek, any[]>);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="w-full sm:w-1/2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Kelas</label>
          <select 
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
          >
            <option value="">-- Pilih Kelas --</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        {selectedClassId && (
          <a
            href={`/api/pdf/class-schedule/${selectedClassId}`}
            target="_blank"
            rel="noreferrer"
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-200"
          >
            Cetak PDF
          </a>
        )}
      </div>

      {selectedClassId && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h2 className="font-semibold text-gray-800">Jadwal Kelas: {selectedClass?.name}</h2>
            <button 
              onClick={() => handleOpenForm()}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              + Tambah Jadwal
            </button>
          </div>
          
          <div className="p-6 overflow-x-auto">
            <div className="min-w-[800px] grid grid-cols-6 gap-4">
              {Object.values(DayOfWeek).map(day => (
                <div key={day} className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-200 py-2 text-center font-bold text-gray-700 text-sm border-b border-gray-300">
                    {dayLabels[day]}
                  </div>
                  <div className="p-2 space-y-2 min-h-[200px]">
                    {groupedSchedules[day].map(s => (
                      <div key={s.id} className="bg-white p-2 text-xs border border-teal-200 rounded shadow-sm hover:border-teal-400 group relative">
                        <div className="font-bold text-teal-800">{s.startTime} - {s.endTime}</div>
                        <div className="font-semibold mt-1 truncate" title={s.subject?.name}>{s.subject?.name}</div>
                        <div className="text-gray-500 truncate mt-0.5" title={s.teacher?.fullName}>{s.teacher?.fullName}</div>
                        
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity bg-white/80 p-0.5 rounded">
                          <button onClick={() => handleOpenForm(s)} className="text-blue-600 hover:text-blue-800 p-0.5" title="Edit">✏️</button>
                          <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:text-red-800 p-0.5" title="Hapus">🗑️</button>
                        </div>
                      </div>
                    ))}
                    {groupedSchedules[day].length === 0 && (
                      <div className="text-center text-gray-400 text-xs py-4">Kosong</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg">{editingId ? "Edit Jam Pelajaran" : "Tambah Jam Pelajaran"}</h3>
              <button onClick={() => setIsFormOpen(false)} className="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mata Pelajaran</label>
                <select required value={subjectId} onChange={e => setSubjectId(e.target.value)} className="w-full p-2 border rounded-md">
                  <option value="">-- Pilih Mata Pelajaran --</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Guru Pengampu</label>
                <select required value={teacherId} onChange={e => setTeacherId(e.target.value)} className="w-full p-2 border rounded-md">
                  <option value="">-- Pilih Guru --</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.fullName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hari</label>
                <select required value={day} onChange={e => setDay(e.target.value as DayOfWeek)} className="w-full p-2 border rounded-md">
                  {Object.values(DayOfWeek).map(d => (
                    <option key={d} value={d}>{dayLabels[d]}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jam Mulai</label>
                  <input required type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full p-2 border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jam Selesai</label>
                  <input required type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full p-2 border rounded-md" />
                </div>
              </div>
              
              <div className="pt-4 flex justify-end gap-2 border-t mt-4">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">Batal</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50">
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
