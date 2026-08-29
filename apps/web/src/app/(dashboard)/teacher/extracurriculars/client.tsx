"use client";

import { useState } from "react";
import { upsertExtraSchedule, deleteExtraSchedule, upsertExtraJournal, deleteExtraJournal, upsertExtraGrade } from "@/actions/extracurricular";
import { DayOfWeek } from "@sim/database";

export function ExtracurricularCoachClient({ extras }: { extras: any[] }) {
  const [selectedExtraId, setSelectedExtraId] = useState<string>(extras.length > 0 ? extras[0].id : "");
  const [activeTab, setActiveTab] = useState<"schedules" | "journals" | "grades">("schedules");
  const [loading, setLoading] = useState(false);

  // Modal States
  const [isScheduleFormOpen, setIsScheduleFormOpen] = useState(false);
  const [isJournalFormOpen, setIsJournalFormOpen] = useState(false);
  const [isGradeFormOpen, setIsGradeFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Schedule Form
  const [day, setDay] = useState<DayOfWeek>(DayOfWeek.monday);
  const [startTime, setStartTime] = useState("15:00");
  const [endTime, setEndTime] = useState("16:30");
  const [location, setLocation] = useState("");

  // Journal Form
  const [date, setDate] = useState("");
  const [activity, setActivity] = useState("");
  const [attendance, setAttendance] = useState(0);
  const [notes, setNotes] = useState("");

  // Grade Form
  const [gradeMemberId, setGradeMemberId] = useState("");
  const [gradeEnrollmentId, setGradeEnrollmentId] = useState("");
  const [gradeSemester, setGradeSemester] = useState<"ganjil" | "genap">("ganjil");
  const [gradeScore, setGradeScore] = useState<"A" | "B" | "C" | "D">("A");
  const [gradeNotes, setGradeNotes] = useState("");
  
  // Filter state for grades list
  const [selectedSemester, setSelectedSemester] = useState<"ganjil" | "genap">("ganjil");

  const extra = extras.find(e => e.id === selectedExtraId);

  const openScheduleForm = (sched?: any) => {
    if (sched) {
      setEditingId(sched.id);
      setDay(sched.day);
      setStartTime(sched.startTime);
      setEndTime(sched.endTime);
      setLocation(sched.location || "");
    } else {
      setEditingId(null);
      setDay(DayOfWeek.monday);
      setStartTime("15:00");
      setEndTime("16:30");
      setLocation("");
    }
    setIsScheduleFormOpen(true);
  };

  const openJournalForm = (jour?: any) => {
    if (jour) {
      setEditingId(jour.id);
      setDate(new Date(jour.date).toISOString().split('T')[0]);
      setActivity(jour.activity);
      setAttendance(jour.attendance);
      setNotes(jour.notes || "");
    } else {
      setEditingId(null);
      setDate(new Date().toISOString().split('T')[0]);
      setActivity("");
      setAttendance(0);
      setNotes("");
    }
    setIsJournalFormOpen(true);
  };

  const openGradeForm = (member: any, grade?: any) => {
    setGradeMemberId(member.id);
    setGradeEnrollmentId(member.enrollmentId);
    
    if (grade) {
      setEditingId(grade.id);
      setGradeSemester(grade.semester);
      setGradeScore(grade.score as any);
      setGradeNotes(grade.notes || "");
    } else {
      setEditingId(null);
      setGradeSemester(selectedSemester);
      setGradeScore("A");
      setGradeNotes("");
    }
    setIsGradeFormOpen(true);
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (startTime >= endTime) return alert("Jam selesai harus setelah jam mulai.");
    setLoading(true);
    const res = await upsertExtraSchedule({
      id: editingId || undefined,
      extraId: selectedExtraId,
      day, startTime, endTime, location
    });
    setLoading(false);
    if (res.success) {
      setIsScheduleFormOpen(false);
      window.location.reload(); 
    } else alert(res.error);
  };

  const handleJournalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await upsertExtraJournal({
      id: editingId || undefined,
      extraId: selectedExtraId,
      date: new Date(date),
      activity, attendance, notes
    });
    setLoading(false);
    if (res.success) {
      setIsJournalFormOpen(false);
      window.location.reload();
    } else alert(res.error);
  };

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await upsertExtraGrade({
      id: editingId || undefined,
      memberId: gradeMemberId,
      enrollmentId: gradeEnrollmentId,
      semester: gradeSemester,
      score: gradeScore,
      notes: gradeNotes
    });
    setLoading(false);
    if (res.success) {
      setIsGradeFormOpen(false);
      window.location.reload();
    } else alert(res.error);
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm("Hapus jadwal ini?")) return;
    setLoading(true);
    const res = await deleteExtraSchedule(id);
    if (res.success) window.location.reload();
    else alert(res.error);
    setLoading(false);
  };

  const handleDeleteJournal = async (id: string) => {
    if (!confirm("Hapus jurnal ini?")) return;
    setLoading(true);
    const res = await deleteExtraJournal(id);
    if (res.success) window.location.reload();
    else alert(res.error);
    setLoading(false);
  };

  const dayLabels = {
    monday: "Senin", tuesday: "Selasa", wednesday: "Rabu",
    thursday: "Kamis", friday: "Jumat", saturday: "Sabtu"
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Program Ekstrakurikuler</label>
        <select 
          className="w-full sm:w-1/2 p-2 border border-gray-300 rounded-md focus:ring-teal-500"
          value={selectedExtraId}
          onChange={(e) => setSelectedExtraId(e.target.value)}
        >
          {extras.map(e => (
            <option key={e.id} value={e.id}>{e.name} ({e._count.members} Anggota)</option>
          ))}
        </select>
      </div>

      {extra && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="flex border-b border-gray-200">
            <button 
              className={`flex-1 py-3 font-medium text-sm transition-colors ${activeTab === 'schedules' ? 'border-b-2 border-teal-600 text-teal-700 bg-teal-50/30' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
              onClick={() => setActiveTab('schedules')}
            >
              Jadwal Rutin
            </button>
            <button 
              className={`flex-1 py-3 font-medium text-sm transition-colors ${activeTab === 'journals' ? 'border-b-2 border-teal-600 text-teal-700 bg-teal-50/30' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
              onClick={() => setActiveTab('journals')}
            >
              Jurnal Kegiatan
            </button>
            <button 
              className={`flex-1 py-3 font-medium text-sm transition-colors ${activeTab === 'grades' ? 'border-b-2 border-teal-600 text-teal-700 bg-teal-50/30' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
              onClick={() => setActiveTab('grades')}
            >
              Penilaian
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'schedules' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-800">Jadwal Pertemuan Mingguan</h3>
                  <button onClick={() => openScheduleForm()} className="text-sm bg-teal-100 text-teal-700 hover:bg-teal-200 px-3 py-1.5 rounded-md font-medium">
                    + Tambah Jadwal
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {extra.schedules.map((s: any) => (
                    <div key={s.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50 relative group">
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-2 transition-opacity">
                        <button onClick={() => openScheduleForm(s)} className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                        <button onClick={() => handleDeleteSchedule(s.id)} className="text-red-600 hover:text-red-800 text-sm">Hapus</button>
                      </div>
                      <div className="font-bold text-lg text-teal-800">{dayLabels[s.day as keyof typeof dayLabels]}</div>
                      <div className="text-sm text-gray-700 font-medium">{s.startTime} - {s.endTime}</div>
                      {s.location && <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">📍 {s.location}</div>}
                    </div>
                  ))}
                  {extra.schedules.length === 0 && <div className="col-span-full py-8 text-center text-gray-400 border-2 border-dashed rounded-lg">Belum ada jadwal yang diatur.</div>}
                </div>
              </div>
            )}
            
            {activeTab === 'journals' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-800">Jurnal & Absensi Kegiatan</h3>
                  <button onClick={() => openJournalForm()} className="text-sm bg-teal-100 text-teal-700 hover:bg-teal-200 px-3 py-1.5 rounded-md font-medium">
                    + Tulis Jurnal
                  </button>
                </div>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full text-sm text-left text-gray-600">
                    <thead className="bg-gray-50 text-gray-700 uppercase text-xs border-b">
                      <tr>
                        <th className="px-4 py-3">Tanggal</th>
                        <th className="px-4 py-3">Aktivitas</th>
                        <th className="px-4 py-3 text-center">Kehadiran</th>
                        <th className="px-4 py-3">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {extra.journals.map((j: any) => (
                        <tr key={j.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap">{new Date(j.date).toLocaleDateString('id-ID')}</td>
                          <td className="px-4 py-3"><div className="font-medium text-gray-800 line-clamp-1">{j.activity}</div>{j.notes && <div className="text-xs text-gray-500 line-clamp-1">{j.notes}</div>}</td>
                          <td className="px-4 py-3 text-center"><span className="bg-green-100 text-green-800 py-0.5 px-2 rounded-full font-bold text-xs">{j.attendance} Siswa</span></td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <button onClick={() => openJournalForm(j)} className="text-blue-600 hover:text-blue-800 mr-3">Edit</button>
                            <button onClick={() => handleDeleteJournal(j.id)} className="text-red-600 hover:text-red-800">Hapus</button>
                          </td>
                        </tr>
                      ))}
                      {extra.journals.length === 0 && <tr><td colSpan={4} className="text-center py-8 text-gray-400">Belum ada jurnal yang ditulis.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'grades' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-800">Penilaian Akhir Semester</h3>
                  <select 
                    className="p-1.5 border border-gray-300 rounded text-sm focus:ring-teal-500"
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value as "ganjil" | "genap")}
                  >
                    <option value="ganjil">Semester Ganjil</option>
                    <option value="genap">Semester Genap</option>
                  </select>
                </div>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full text-sm text-left text-gray-600">
                    <thead className="bg-gray-50 text-gray-700 uppercase text-xs border-b">
                      <tr>
                        <th className="px-4 py-3 w-12 text-center">No</th>
                        <th className="px-4 py-3">Nama Siswa</th>
                        <th className="px-4 py-3 text-center">Nilai</th>
                        <th className="px-4 py-3">Catatan</th>
                        <th className="px-4 py-3 w-24">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {extra.members.map((m: any, index: number) => {
                        const grade = m.grades.find((g: any) => g.semester === selectedSemester);
                        
                        return (
                          <tr key={m.id} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3 text-center">{index + 1}</td>
                            <td className="px-4 py-3 font-medium text-gray-800">{m.enrollment.studentData.fullName}</td>
                            <td className="px-4 py-3 text-center">
                              {grade ? (
                                <span className="font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded border border-teal-200">
                                  {grade.score}
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-xs">{grade?.notes || "-"}</td>
                            <td className="px-4 py-3">
                              <button onClick={() => openGradeForm(m, grade)} className="text-blue-600 hover:text-blue-800 text-xs font-medium border border-blue-200 bg-blue-50 px-2 py-1 rounded">
                                {grade ? "Edit Nilai" : "Beri Nilai"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {extra.members.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-gray-400">Belum ada siswa yang mendaftar.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Schedule Form Modal */}
      {isScheduleFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg">{editingId ? "Edit Jadwal" : "Tambah Jadwal Ekskul"}</h3>
              <button type="button" onClick={() => setIsScheduleFormOpen(false)} className="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
            </div>
            <form onSubmit={handleScheduleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hari</label>
                <select required value={day} onChange={e => setDay(e.target.value as DayOfWeek)} className="w-full p-2 border rounded-md">
                  {Object.entries(dayLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi Kumpul</label>
                <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Contoh: Lapangan Utama, Lab Komputer" className="w-full p-2 border rounded-md" />
              </div>
              <div className="pt-4 flex justify-end gap-2 border-t mt-4">
                <button type="button" onClick={() => setIsScheduleFormOpen(false)} className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">Batal</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Journal Form Modal */}
      {isJournalFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg">{editingId ? "Edit Jurnal" : "Tambah Jurnal Kegiatan"}</h3>
              <button type="button" onClick={() => setIsJournalFormOpen(false)} className="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
            </div>
            <form onSubmit={handleJournalSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Kegiatan</label>
                <input required type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aktivitas / Materi</label>
                <textarea required value={activity} onChange={e => setActivity(e.target.value)} rows={2} className="w-full p-2 border rounded-md"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Hadir (Siswa)</label>
                <input required type="number" min="0" value={attendance} onChange={e => setAttendance(parseInt(e.target.value))} className="w-full p-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Tambahan (Opsional)</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full p-2 border rounded-md"></textarea>
              </div>
              <div className="pt-4 flex justify-end gap-2 border-t mt-4">
                <button type="button" onClick={() => setIsJournalFormOpen(false)} className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">Batal</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grade Form Modal */}
      {isGradeFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg">Penilaian Akhir Semester</h3>
              <button type="button" onClick={() => setIsGradeFormOpen(false)} className="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
            </div>
            <form onSubmit={handleGradeSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                <select disabled value={gradeSemester} className="w-full p-2 border rounded-md bg-gray-100 text-gray-600">
                  <option value="ganjil">Semester Ganjil</option>
                  <option value="genap">Semester Genap</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nilai Predikat</label>
                <select required value={gradeScore} onChange={e => setGradeScore(e.target.value as any)} className="w-full p-2 border rounded-md font-bold focus:ring-teal-500">
                  <option value="A">A - Sangat Baik</option>
                  <option value="B">B - Baik</option>
                  <option value="C">C - Cukup</option>
                  <option value="D">D - Kurang</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catatan (Opsional)</label>
                <textarea value={gradeNotes} onChange={e => setGradeNotes(e.target.value)} rows={3} placeholder="Siswa sangat aktif mengikuti kegiatan..." className="w-full p-2 border rounded-md focus:ring-teal-500"></textarea>
              </div>
              <div className="pt-4 flex justify-end gap-2 border-t mt-4">
                <button type="button" onClick={() => setIsGradeFormOpen(false)} className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">Batal</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50">Simpan Nilai</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
