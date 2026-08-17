"use client";

import { useState } from "react";
import Link from "next/link";
import { PpdbStepper } from "@/components/parent/ppdb-stepper";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Card } from "@/components/ui/card";

export function ParentDashboardClient({ 
  ppdbRegistrations,
  enrollments 
}: { 
  ppdbRegistrations: any[],
  enrollments: any[]
}) {
  // Combine all children into one array for the dropdown/tabs
  const allChildren = [
    ...enrollments.map(e => ({ type: 'academic', id: e.id, data: e, name: e.studentData.fullName })),
    ...ppdbRegistrations.map(r => ({ type: 'ppdb', id: r.id, data: r, name: r.studentData?.fullName || "Pendaftaran Baru" }))
  ];

  const [selectedChildId, setSelectedChildId] = useState<string | null>(allChildren.length > 0 ? allChildren[0].id : null);

  if (allChildren.length === 0) {
    return (
      <Card className="p-8 border-dashed border-2 border-gray-300 text-center bg-neutral/30">
        <Icon name="school" className="text-5xl text-gray-300 mb-3 block mx-auto" />
        <h2 className="text-lg font-bold text-primary mb-1">
          Belum Ada Data Anak
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Anda belum mendaftarkan calon siswa ke unit manapun.
        </p>
        <Link href="/parent/select-unit">
          <Button variant="primary">
            <Icon name="add" className="mr-1" /> Mulai Pendaftaran
          </Button>
        </Link>
      </Card>
    );
  }

  const activeChild = allChildren.find(c => c.id === selectedChildId);

  return (
    <div className="space-y-6">
      {/* Child Selector Tabs */}
      {allChildren.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 border-b border-gray-200">
          {allChildren.map(child => (
            <button
              key={child.id}
              onClick={() => setSelectedChildId(child.id)}
              className={`px-4 py-2 rounded-t-lg font-medium text-sm whitespace-nowrap transition-colors flex items-center gap-2 border-b-2 ${
                selectedChildId === child.id 
                  ? 'border-tertiary text-tertiary bg-teal-50/50' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon name={child.type === 'academic' ? 'face' : 'child_care'} className="text-base" />
              {child.name}
            </button>
          ))}
          <Link href="/parent/select-unit" className="px-4 py-2 text-sm text-gray-500 hover:text-tertiary flex items-center gap-1">
            <Icon name="add" className="text-base" /> Tambah Anak
          </Link>
        </div>
      )}

      {/* Render content based on child type */}
      {activeChild?.type === 'ppdb' && (
        <PpdbDashboardView reg={activeChild.data} />
      )}
      
      {activeChild?.type === 'academic' && (
        <AcademicDashboardView enrollment={activeChild.data} />
      )}
    </div>
  );
}

// -------------------------------------------------------------
// PPDB View Component
// -------------------------------------------------------------
function PpdbDashboardView({ reg }: { reg: any }) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 rounded-xl p-6 flex flex-wrap justify-between items-center gap-4">
        <div>
          <p className="text-xs font-mono font-medium text-amber-700 mb-1">
            {reg.registrationNumber}
          </p>
          <h2 className="text-xl font-bold font-heading text-amber-900">
            {reg.academicYear.unit.name}
          </h2>
          <p className="text-sm text-amber-700/80 mt-0.5">
            Tahun Ajaran {reg.academicYear.name} &bull; <span className="font-semibold text-amber-800">Status: Calon Siswa (PPDB)</span>
          </p>
        </div>
        
        {/* Contextual Action Button based on State */}
        {reg.status === "pending_payment" && (
          <Link href="/parent/payment">
            <Button variant="primary">Lakukan Pembayaran</Button>
          </Link>
        )}
        {reg.status === "payment_uploaded" && (
          <div className="px-4 py-2 bg-amber-200/50 text-amber-800 text-sm font-medium rounded-md flex items-center gap-2">
            <Icon name="hourglass_empty" className="text-sm" /> Menunggu Verifikasi Bayar
          </div>
        )}
        {(reg.status === "payment_verified" || reg.status === "form_filling") && (
          <Link href="/parent/form-student">
            <Button variant="primary">Lengkapi Formulir</Button>
          </Link>
        )}
        {reg.status === "documents_uploaded" && (
          <Link href="/parent/documents">
            <Button variant="primary">Upload Berkas</Button>
          </Link>
        )}
        {reg.status === "medical_pending" && (
          <Link href="/parent/medical">
            <Button variant="primary">Proses Tes Medis (IMC)</Button>
          </Link>
        )}
        {reg.status === "medical_uploaded" && (
          <div className="px-4 py-2 bg-amber-200/50 text-amber-800 text-sm font-medium rounded-md flex items-center gap-2">
            <Icon name="hourglass_empty" className="text-sm" /> Antrian Verifikasi Berkas
          </div>
        )}
      </div>

      <PpdbStepper status={reg.status} />

      <Card className="p-6 border-border bg-white shadow-sm">
        <h3 className="text-sm font-bold text-primary mb-2 flex items-center gap-2">
          <Icon name="info" className="text-tertiary" /> Panduan Langkah Selanjutnya
        </h3>
        <div className="text-sm text-gray-600">
          {reg.status === "pending_payment" && "Silakan lakukan pembayaran biaya pendaftaran. Klik tombol 'Lakukan Pembayaran' di atas."}
          {reg.status === "payment_uploaded" && "Bukti pembayaran Anda sedang dicek oleh Admin Unit. Proses ini memakan waktu 1x24 jam kerja."}
          {reg.status === "payment_verified" && "Pembayaran Anda telah diverifikasi! Sistem sedang menyiapkan formulir Anda."}
          {reg.status === "form_filling" && "Harap lengkapi formulir data calon siswa dan data orang tua/wali."}
          {reg.status === "documents_uploaded" && "Formulir lengkap! Silakan unggah dokumen persyaratan seperti KTP, Akte, dan KK."}
          {reg.status === "medical_pending" && "Silakan cetak surat pengantar IMC dan unggah hasil lab untuk melanjutkan."}
          {reg.status === "medical_uploaded" && "Berkas Anda sedang dalam proses verifikasi oleh Tim PPDB."}
          {["verification", "observation_scheduled", "observation_done"].includes(reg.status) && "Proses seleksi sedang berjalan. Harap pantau dashboard ini secara berkala."}
        </div>
      </Card>
    </div>
  );
}

// -------------------------------------------------------------
// Academic View Component
// -------------------------------------------------------------
function AcademicDashboardView({ enrollment }: { enrollment: any }) {
  const unpaidInvoices = enrollment.sppInvoices?.length || 0;
  const todaysSchedules = enrollment.class?.classSchedules || [];

  return (
    <div className="space-y-6">
      {/* Identity Card */}
      <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-tertiary/20 rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-2 border-teal-200 shadow-sm text-teal-600">
            <Icon name="face" className="text-3xl" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-heading text-primary">{enrollment.studentData.fullName}</h2>
            <p className="text-sm text-gray-600">
              NISN: <span className="font-medium text-gray-800">{enrollment.studentData.nisn || "-"}</span> &bull; Kelas <span className="font-bold text-teal-700">{enrollment.class.name}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">{enrollment.class.unit.name} &bull; TA {enrollment.academicYear.name}</p>
          </div>
        </div>
        
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100 flex items-center gap-3 w-full md:w-auto">
          <Icon name="verified" className="text-green-500 text-xl" />
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider font-bold">Status Siswa</div>
            <div className="text-sm font-bold text-gray-800">Aktif</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* SPP Widget */}
        <Card className="p-5 border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Icon name="account_balance_wallet" className="text-tertiary" /> Tagihan SPP
            </h3>
            {unpaidInvoices === 0 ? (
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Lunas</span>
            ) : (
              <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">{unpaidInvoices} Bulan</span>
            )}
          </div>
          <p className="text-sm text-gray-600 mb-4 h-10">
            {unpaidInvoices === 0 
              ? "Tidak ada tagihan tertunggak bulan ini. Terima kasih!" 
              : "Anda memiliki tagihan SPP yang belum dilunasi."}
          </p>
          <Link href="/parent/spp" className="block w-full text-center py-2 bg-gray-50 hover:bg-gray-100 text-tertiary font-bold text-sm rounded border border-gray-200 transition-colors">
            Cek Tagihan
          </Link>
        </Card>

        {/* LHBS Widget */}
        <Card className="p-5 border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Icon name="auto_stories" className="text-blue-600" /> Rapor LHBS
            </h3>
          </div>
          <p className="text-sm text-gray-600 mb-4 h-10">
            Laporan Hasil Belajar Siswa (LHBS) tengah dan akhir semester.
          </p>
          <Link href="/parent/lhbs" className="block w-full text-center py-2 bg-gray-50 hover:bg-gray-100 text-blue-700 font-bold text-sm rounded border border-gray-200 transition-colors">
            Lihat Rapor
          </Link>
        </Card>

        {/* Schedule Widget */}
        <Card className="p-5 border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Icon name="calendar_today" className="text-purple-600" /> Jadwal Hari Ini
            </h3>
            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold">{todaysSchedules.length} Mapel</span>
          </div>
          <div className="h-10 overflow-hidden mb-4">
            {todaysSchedules.length > 0 ? (
              <div className="space-y-1">
                {todaysSchedules.slice(0, 2).map((s: any) => (
                  <div key={s.id} className="text-xs text-gray-600 flex justify-between">
                    <span className="truncate pr-2">{s.subject?.name}</span>
                    <span className="font-mono bg-gray-100 px-1 rounded">{s.startTime?.substring(0,5)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">Libur / Tidak ada jadwal kelas hari ini.</p>
            )}
          </div>
          <button className="block w-full text-center py-2 bg-gray-50 hover:bg-gray-100 text-purple-700 font-bold text-sm rounded border border-gray-200 transition-colors cursor-not-allowed opacity-50">
            Lihat Jadwal Lengkap
          </button>
        </Card>
      </div>
    </div>
  );
}
