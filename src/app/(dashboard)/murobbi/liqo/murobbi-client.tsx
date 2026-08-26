"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { DayOfWeek, AttendanceStatus } from "@/generated/client";
import { updateLiqoSchedule, createLiqoMeeting, saveLiqoAttendance } from "@/actions/murobbi";

const DAYS: Record<string, string> = {
  monday: "Senin",
  tuesday: "Selasa",
  wednesday: "Rabu",
  thursday: "Kamis",
  friday: "Jumat",
  saturday: "Sabtu",
};

export function MurobbiLiqoClient({ group, mutabaahStats = [] }: { group: any; mutabaahStats?: any[] }) {
  const [activeTab, setActiveTab] = useState<"jadwal" | "mutabaah">("jadwal");

  // schedule states
  const [day, setDay] = useState<DayOfWeek | "">(group.scheduleDay || "");
  const [time, setTime] = useState(group.scheduleTime || "");
  const [location, setLocation] = useState(group.scheduleLocation || "");
  const [whatsappLink, setWhatsappLink] = useState(group.whatsappLink || "");
  const [isUpdating, setIsUpdating] = useState(false);

  // modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [date, setDate] = useState("");
  const [materialTitle, setMaterialTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // attendance states
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [selectedMeetingId, setSelectedMeetingId] = useState("");
  const [attendanceData, setAttendanceData] = useState<Record<string, { status: AttendanceStatus; notes: string }>>({});
  const [isSubmittingAttendance, setIsSubmittingAttendance] = useState(false);

  const handleUpdateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!day || !time) return;
    setIsUpdating(true);
    try {
      await updateLiqoSchedule(group.id, {
        scheduleDay: day as DayOfWeek,
        scheduleTime: time,
        scheduleLocation: location,
        whatsappLink: whatsappLink,
      });
      alert("Jadwal berhasil diperbarui");
    } catch (error) {
      alert("Gagal memperbarui jadwal");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !materialTitle) return;
    setIsSubmitting(true);
    try {
      await createLiqoMeeting(group.id, {
        date: new Date(date),
        materialTitle,
        summary,
      });
      setIsModalOpen(false);
      setDate("");
      setMaterialTitle("");
      setSummary("");
    } catch (error) {
      alert("Gagal menambahkan pertemuan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAttendanceModal = (meetingId: string) => {
    setSelectedMeetingId(meetingId);
    
    // Check if we already have attendances for this meeting
    const meeting = group.meetings.find((m: any) => m.id === meetingId);
    const initialData: Record<string, { status: AttendanceStatus; notes: string }> = {};
    
    group.members.forEach((member: any) => {
      const existing = meeting?.attendances?.find((a: any) => a.userId === member.userId);
      initialData[member.userId] = {
        status: existing?.status || "present",
        notes: existing?.notes || "",
      };
    });
    
    setAttendanceData(initialData);
    setIsAttendanceModalOpen(true);
  };

  const handleAttendanceChange = (userId: string, field: "status" | "notes", value: any) => {
    setAttendanceData(prev => ({
      ...prev,
      [userId]: { ...prev[userId], [field]: value }
    }));
  };

  const handleSaveAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMeetingId) return;
    
    setIsSubmittingAttendance(true);
    try {
      const attendances = Object.entries(attendanceData).map(([userId, data]) => ({
        userId,
        status: data.status,
        notes: data.notes,
      }));
      
      await saveLiqoAttendance(group.id, {
        meetingId: selectedMeetingId,
        attendances,
      });
      alert("Absensi berhasil disimpan");
      setIsAttendanceModalOpen(false);
    } catch (error) {
      console.error(error);
      alert("Gagal menyimpan absensi");
    } finally {
      setIsSubmittingAttendance(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex border-b border-border mb-6">
        <button
          onClick={() => setActiveTab("jadwal")}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === "jadwal" ? "border-b-2 border-primary text-primary" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Manajemen Liqo
        </button>
        <button
          onClick={() => setActiveTab("mutabaah")}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === "mutabaah" ? "border-b-2 border-primary text-primary" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Mutabaah Wajibat Anggota
        </button>
      </div>

      {activeTab === "jadwal" ? (
        <>
          {/* Pengaturan Jadwal */}
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Jadwal</CardTitle>
            </CardHeader>
            <form onSubmit={handleUpdateSchedule} className="space-y-4 px-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-primary">Hari</label>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value as DayOfWeek)}
                className="w-full px-3 py-2 text-sm bg-surface border border-border rounded text-primary focus:outline-none focus:border-secondary transition-colors"
                required
              >
                <option value="">Pilih Hari</option>
                {Object.entries(DAYS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
            <Input
              type="time"
              label="Waktu"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
            <Input
              type="text"
              label="Lokasi"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <Input
              type="url"
              label="Link WhatsApp Grup"
              placeholder="https://chat.whatsapp.com/..."
              value={whatsappLink}
              onChange={(e) => setWhatsappLink(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={isUpdating}>
            {isUpdating ? "Menyimpan..." : "Simpan Jadwal"}
          </Button>
        </form>
      </Card>

      {/* Daftar Anggota */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Anggota</CardTitle>
        </CardHeader>
        <Table>
          <Thead>
            <Tr>
              <Th>No</Th>
              <Th>Nama</Th>
              <Th>Email</Th>
            </Tr>
          </Thead>
          <Tbody>
            {group.members.length === 0 ? (
              <Tr>
                <Td colSpan={3} className="text-center text-gray-500">Belum ada anggota</Td>
              </Tr>
            ) : (
              group.members.map((member: any, i: number) => (
                <Tr key={member.id}>
                  <Td>{i + 1}</Td>
                  <Td>{member.user.fullName}</Td>
                  <Td>{member.user.email}</Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Card>

      {/* Riwayat Pertemuan */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Pertemuan</CardTitle>
          <Button onClick={() => setIsModalOpen(true)} size="sm">
            Laporan Pertemuan
          </Button>
        </CardHeader>
        <Table>
          <Thead>
            <Tr>
              <Th>Tanggal</Th>
              <Th>Materi</Th>
              <Th>Ringkasan</Th>
              <Th className="text-right">Aksi</Th>
            </Tr>
          </Thead>
          <Tbody>
            {group.meetings.length === 0 ? (
              <Tr>
                <Td colSpan={4} className="text-center text-gray-500">Belum ada riwayat pertemuan</Td>
              </Tr>
            ) : (
              group.meetings.map((meeting: any) => (
                <Tr key={meeting.id}>
                  <Td>{new Date(meeting.date).toLocaleDateString("id-ID")}</Td>
                  <Td>{meeting.materialTitle}</Td>
                  <Td>{meeting.summary || "-"}</Td>
                  <Td className="text-right">
                    <Button variant="outline" size="sm" onClick={() => openAttendanceModal(meeting.id)}>
                      Isi Absensi
                    </Button>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Card>
      </>
      ) : (
        <div className="bg-surface border border-border rounded shadow-sm overflow-hidden">
          <Table>
            <Thead>
              <Tr>
                <Th>Nama Anggota</Th>
                <Th>Total Jamaah</Th>
                <Th>Total Rawatib</Th>
                <Th>% Dhuha</Th>
                <Th>% Tahajud</Th>
                <Th>Total Tilawah</Th>
                <Th>% Puasa</Th>
                <Th>% Infaq</Th>
              </Tr>
            </Thead>
            <Tbody>
              {mutabaahStats.length === 0 ? (
                <Tr>
                  <Td colSpan={8} className="text-center py-8 text-gray-500">Belum ada data mutabaah.</Td>
                </Tr>
              ) : (
                mutabaahStats.map((stat: any) => {
                   const total = stat.records.length;
                   const sums = stat.records.reduce((acc: any, curr: any) => ({
                      jamaah: acc.jamaah + curr.sholatJamaah,
                      rawatib: acc.rawatib + curr.sholatRawatib,
                      dhuha: acc.dhuha + (curr.sholatDhuha ? 1 : 0),
                      tahajud: acc.tahajud + (curr.sholatTahajud ? 1 : 0),
                      tilawah: acc.tilawah + curr.tilawahPages,
                      puasa: acc.puasa + (curr.puasaSunnah ? 1 : 0),
                      infaq: acc.infaq + (curr.infaq ? 1 : 0),
                   }), { jamaah: 0, rawatib: 0, dhuha: 0, tahajud: 0, tilawah: 0, puasa: 0, infaq: 0 });

                   return (
                     <Tr key={stat.userId}>
                       <Td className="font-semibold">{stat.fullName}</Td>
                       <Td>{sums.jamaah}</Td>
                       <Td>{sums.rawatib}</Td>
                       <Td>{total > 0 ? Math.round((sums.dhuha / total) * 100) : 0}%</Td>
                       <Td>{total > 0 ? Math.round((sums.tahajud / total) * 100) : 0}%</Td>
                       <Td>{sums.tilawah}</Td>
                       <Td>{total > 0 ? Math.round((sums.puasa / total) * 100) : 0}%</Td>
                       <Td>{total > 0 ? Math.round((sums.infaq / total) * 100) : 0}%</Td>
                     </Tr>
                   );
                })
              )}
            </Tbody>
          </Table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Buat Laporan Pertemuan">
        <form onSubmit={handleCreateMeeting} className="space-y-4">
          <Input
            type="date"
            label="Tanggal Pertemuan"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <Input
            type="text"
            label="Judul Materi"
            value={materialTitle}
            onChange={(e) => setMaterialTitle(e.target.value)}
            required
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-primary">Ringkasan (Opsional)</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-surface border border-border rounded text-primary placeholder:text-gray-400 focus:outline-none focus:border-secondary transition-colors resize-y min-h-[80px]"
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan Laporan"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Absensi */}
      <Modal isOpen={isAttendanceModalOpen} onClose={() => setIsAttendanceModalOpen(false)} title="Isi Absensi Pertemuan">
        <form onSubmit={handleSaveAttendance} className="space-y-4">
          {group.members.length === 0 ? (
            <p className="text-sm text-gray-500">Belum ada anggota di kelompok ini.</p>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {group.members.map((member: any) => {
                const data = attendanceData[member.userId];
                if (!data) return null;
                
                return (
                  <div key={member.userId} className="p-4 border border-border rounded bg-surface space-y-3">
                    <p className="font-semibold text-primary">{member.user.fullName}</p>
                    
                    <div className="flex flex-wrap gap-4">
                      {[
                        { val: AttendanceStatus.present, label: 'Hadir' },
                        { val: AttendanceStatus.sick, label: 'Sakit' },
                        { val: AttendanceStatus.permitted, label: 'Izin' },
                        { val: AttendanceStatus.absent, label: 'Alpa' },
                      ].map(opt => (
                        <label key={opt.val} className="flex items-center gap-1.5 text-sm cursor-pointer">
                          <input
                            type="radio"
                            name={`status-${member.userId}`}
                            value={opt.val}
                            checked={data.status === opt.val}
                            onChange={() => handleAttendanceChange(member.userId, "status", opt.val)}
                            className="text-secondary focus:ring-secondary"
                          />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                    
                    <Input
                      type="text"
                      placeholder="Catatan (opsional)"
                      value={data.notes}
                      onChange={(e) => handleAttendanceChange(member.userId, "notes", e.target.value)}
                    />
                  </div>
                );
              })}
            </div>
          )}
          
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border">
            <Button type="button" variant="ghost" onClick={() => setIsAttendanceModalOpen(false)}>Batal</Button>
            <Button type="submit" disabled={isSubmittingAttendance}>
              {isSubmittingAttendance ? "Menyimpan..." : "Simpan Absensi"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
