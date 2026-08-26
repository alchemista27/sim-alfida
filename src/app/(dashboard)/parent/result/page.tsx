import React from "react";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@/generated/client";
import { getActiveRegistration } from "@/actions/parent";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";

export default async function ParentResultPage() {
  await requireRole([UserRole.orang_tua]);
  const reg = await getActiveRegistration();

  if (!reg) {
    redirect("/parent/dashboard");
  }

  // Cek apakah pendaftaran sudah di tahap pengumuman (accepted, rejected, enrolled)
  const isFinalized = ["accepted", "rejected", "enrolled"].includes(reg.status);
  
  if (!isFinalized) {
    return (
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="font-heading font-bold text-2xl text-primary">Hasil Seleksi</h1>
          <p className="text-gray-500 mt-1">Pengumuman hasil akhir PPDB calon siswa.</p>
        </div>
        <Card className="p-12 text-center text-gray-500 bg-neutral/30 border-dashed">
          <Icon name="schedule" className="text-5xl text-gray-300 mb-4 block mx-auto" />
          <h2 className="text-lg font-bold text-gray-700 mb-2">Proses Seleksi Sedang Berlangsung</h2>
          <p className="max-w-md mx-auto">
            Hasil seleksi penerimaan peserta didik baru untuk ananda <strong>{reg.studentData?.fullName || "-"}</strong> belum dapat diakses saat ini. Harap tunggu pengumuman resmi dari pihak sekolah.
          </p>
        </Card>
      </div>
    );
  }

  const isAccepted = reg.status === "accepted" || reg.status === "enrolled";

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="font-heading font-bold text-2xl text-primary">Pengumuman Hasil Seleksi</h1>
        <p className="text-gray-500 mt-1">Status penerimaan peserta didik baru.</p>
      </div>
      
      {isAccepted ? (
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 rounded-xl p-8 relative overflow-hidden shadow-sm">
          <Icon name="workspace_premium" className="absolute -right-6 -bottom-6 text-9xl text-green-500/10" />
          
          <div className="text-center space-y-4 relative z-10 py-6">
            <div className="mx-auto w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 mb-6">
              <Icon name="check" className="text-4xl" />
            </div>
            <h2 className="text-3xl font-bold font-heading text-green-800">Selamat!</h2>
            <p className="text-lg text-green-700 max-w-xl mx-auto leading-relaxed">
              Ananda <strong>{reg.studentData?.fullName}</strong> dinyatakan <span className="font-bold">LULUS</span> seleksi penerimaan peserta didik baru di <span className="font-bold">{reg.academicYear.unit.name}</span>.
            </p>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-5 mt-6 border border-green-100 relative z-10 flex flex-col sm:flex-row gap-4 items-start justify-between">
            <div className="flex gap-4 items-start">
              <Icon name="info" className="text-green-600 shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-green-800 mb-1">Langkah Selanjutnya</h4>
                <p className="text-sm text-green-700">
                  {reg.status === "enrolled" 
                    ? "Ananda telah berhasil ditempatkan di dalam kelas. Silakan menunggu informasi lebih lanjut mengenai jadwal hari pertama sekolah dari wali kelas terkait."
                    : "Silakan hubungi pihak sekolah untuk prosedur daftar ulang dan pengambilan seragam. Proses pembagian kelas akan segera diinformasikan."}
                </p>
              </div>
            </div>
            
            <a 
              href={`/api/pdf/acceptance?id=${reg.id}`} 
              target="_blank"
              className="whitespace-nowrap shrink-0 flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <Icon name="download" className="text-base" />
              Surat Kelulusan
            </a>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-xl p-8 relative overflow-hidden shadow-sm">
          <Icon name="cancel" className="absolute -right-6 -bottom-6 text-9xl text-red-500/5" />
          
          <div className="text-center space-y-4 relative z-10 py-6">
            <div className="mx-auto w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6">
              <Icon name="close" className="text-4xl" />
            </div>
            <h2 className="text-2xl font-bold font-heading text-red-800">Mohon Maaf</h2>
            <p className="text-red-700 max-w-xl mx-auto leading-relaxed">
              Berdasarkan hasil seleksi dan kuota yang tersedia, ananda <strong>{reg.studentData?.fullName}</strong> dinyatakan <span className="font-bold">TIDAK LULUS</span>.
            </p>
            {reg.rejectionReason && (
              <div className="mt-4 inline-block text-left bg-white/50 backdrop-blur-sm px-6 py-4 rounded-lg border border-red-100 max-w-md w-full">
                <p className="text-xs font-bold text-red-800 mb-1 uppercase tracking-wider">Catatan Pihak Sekolah:</p>
                <p className="text-sm text-red-700 italic">&quot;{reg.rejectionReason}&quot;</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
