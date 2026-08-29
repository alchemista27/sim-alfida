"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { DocumentViewerModal } from "./document-viewer-modal";
import { verifyDocumentsAction } from "@/actions/unit-verification";

export function VerificationClient({ registrations }: { registrations: any[] }) {
  const [selectedReg, setSelectedReg] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApprove = async (regId: string) => {
    setProcessingId(regId);
    try {
      await verifyDocumentsAction(regId, "approve");
      setIsApproving(false);
      setSelectedReg(null);
    } catch (e: any) {
      alert(e.message || "Gagal memproses persetujuan");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (regId: string) => {
    if (!rejectReason) {
      alert("Masukkan alasan penolakan terlebih dahulu");
      return;
    }
    setProcessingId(regId);
    try {
      await verifyDocumentsAction(regId, "reject", rejectReason);
      setIsRejecting(false);
      setRejectReason("");
      setSelectedReg(null);
    } catch (e: any) {
      alert(e.message || "Gagal memproses penolakan");
    } finally {
      setProcessingId(null);
    }
  };

  const openPreview = (reg: any) => setSelectedReg(reg);
  
  return (
    <>
      <div className="bg-surface border rounded-xl overflow-x-auto shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-neutral border-b text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-5 py-3 font-semibold">No. Daftar</th>
              <th className="px-5 py-3 font-semibold">Nama Siswa</th>
              <th className="px-5 py-3 font-semibold">Dokumen Terkumpul</th>
              <th className="px-5 py-3 font-semibold text-center">Status</th>
              <th className="px-5 py-3 font-semibold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {registrations.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-gray-500">
                  Tidak ada pendaftar dalam antrian verifikasi berkas saat ini.
                </td>
              </tr>
            ) : registrations.map((reg) => (
              <tr key={reg.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4 font-mono font-medium text-primary">{reg.registrationNumber}</td>
                <td className="px-5 py-4 font-medium">{reg.studentData?.fullName || "-"}</td>
                <td className="px-5 py-4 text-xs">
                  <div className="flex gap-2">
                    <Badge variant="blue">{reg.documents.length} File</Badge>
                  </div>
                </td>
                <td className="px-5 py-4 text-center">
                  <Badge variant="amber">Menunggu Verifikasi</Badge>
                </td>
                <td className="px-5 py-4 text-center flex items-center justify-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => openPreview(reg)}>
                    <Icon name="visibility" className="text-base" /> Cek
                  </Button>
                  <Button 
                    variant="primary" 
                    size="sm" 
                    onClick={() => { setIsApproving(true); setSelectedReg(reg); }}
                    disabled={processingId === reg.id}
                  >
                    Loloskan
                  </Button>
                  <Button 
                    variant="danger" 
                    size="sm" 
                    onClick={() => { setIsRejecting(true); setSelectedReg(reg); }}
                    disabled={processingId === reg.id}
                  >
                    Tolak
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DocumentViewerModal 
        isOpen={selectedReg !== null && !isRejecting && !isApproving} 
        onClose={() => setSelectedReg(null)} 
        docs={selectedReg?.documents || []} 
      />

      {isApproving && selectedReg && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="font-bold text-lg text-primary mb-2">Terima Berkas</h3>
            <p className="text-sm text-gray-600 mb-6">
              Anda yakin ingin meloloskan verifikasi berkas untuk siswa <strong>{selectedReg.studentData?.fullName}</strong>? Calon siswa akan diteruskan ke tahap observasi/tes wawancara.
            </p>
            <div className="flex justify-end gap-3 mt-5">
              <Button variant="outline" onClick={() => { setIsApproving(false); setSelectedReg(null); }}>Batal</Button>
              <Button variant="primary" onClick={() => handleApprove(selectedReg.id)} disabled={processingId === selectedReg.id}>
                {processingId === selectedReg.id ? "Memproses..." : "Konfirmasi Lolos"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {isRejecting && selectedReg && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-2xl">
            <h3 className="font-bold text-lg text-primary mb-2 text-red-600">Tolak Berkas</h3>
            <p className="text-sm text-gray-600 mb-4">
              Penolakan akan menghentikan proses PPDB bagi siswa <strong>{selectedReg.studentData?.fullName}</strong>.
            </p>
            <textarea
              className="w-full border rounded-lg p-3 text-sm focus:ring-1 focus:ring-tertiary outline-none min-h-[100px]"
              placeholder="Masukkan alasan penolakan (misal: usia tidak memenuhi kriteria, berkas palsu, dsb)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex justify-end gap-3 mt-5">
              <Button variant="outline" onClick={() => { setIsRejecting(false); setRejectReason(""); }}>Batal</Button>
              <Button variant="danger" onClick={() => handleReject(selectedReg.id)} disabled={processingId === selectedReg.id}>
                {processingId === selectedReg.id ? "Memproses..." : "Konfirmasi Tolak"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
