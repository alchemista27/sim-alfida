"use client";

import { useState } from "react";
import { uploadSppProof } from "@/actions/spp";
import { DocumentViewerModal } from "@/components/unit/document-viewer-modal";

export function ParentSppClient({ 
  invoices,
  enrollments
}: { 
  invoices: any[],
  enrollments: any[]
}) {
  const [loading, setLoading] = useState(false);
  
  // Filter by child
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string>(
    enrollments.length > 0 ? enrollments[0].id : "all"
  );
  
  // Upload Modal State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadInvoice, setUploadInvoice] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);

  // Document Viewer
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Pilih file bukti pembayaran terlebih dahulu.");
    
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return alert("Ukuran file maksimal 2MB.");
    }
    
    // Only accept images or pdf
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      return alert("Format file harus berupa gambar (JPG/PNG) atau PDF.");
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("invoiceId", uploadInvoice.id);
    formData.append("file", file);

    const res = await uploadSppProof(formData);
    setLoading(false);
    
    if (res.success) {
      setIsUploadOpen(false);
      window.location.reload();
    } else {
      alert(res.error);
    }
  };

  const openUpload = (inv: any) => {
    setUploadInvoice(inv);
    setFile(null);
    setIsUploadOpen(true);
  };

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const filteredInvoices = invoices.filter(inv => 
    selectedEnrollmentId === "all" || inv.enrollmentId === selectedEnrollmentId
  );

  return (
    <div className="space-y-6">
      {enrollments.length > 1 && (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Anak</label>
          <select 
            className="w-full sm:w-1/2 p-2 border border-gray-300 rounded-md focus:ring-teal-500"
            value={selectedEnrollmentId}
            onChange={(e) => setSelectedEnrollmentId(e.target.value)}
          >
            <option value="all">Tampilkan Semua Anak</option>
            {enrollments.map(e => (
              <option key={e.id} value={e.id}>
                {e.studentData?.fullName} - {e.class?.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInvoices.map((inv) => (
          <div key={inv.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className={`p-4 border-b flex justify-between items-center ${
              inv.status === 'verified' ? 'bg-green-50 border-green-100' : 
              inv.status === 'rejected' ? 'bg-red-50 border-red-100' :
              inv.status === 'uploaded' ? 'bg-amber-50 border-amber-100' :
              'bg-gray-50 border-gray-100'
            }`}>
              <h3 className="font-bold text-gray-800">
                {monthNames[inv.month - 1]} {inv.year}
              </h3>
              
              {inv.status === 'unpaid' && <span className="bg-gray-200 text-gray-700 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm">Belum Bayar</span>}
              {inv.status === 'uploaded' && <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-xs font-bold border border-amber-200 shadow-sm">Menunggu Verifikasi</span>}
              {inv.status === 'verified' && <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold border border-green-200 shadow-sm flex items-center gap-1"><span className="text-[10px]">✅</span> Lunas</span>}
              {inv.status === 'rejected' && <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-bold border border-red-200 shadow-sm">Ditolak</span>}
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              {selectedEnrollmentId === "all" && (
                <div className="text-sm font-medium text-gray-800 mb-4 pb-4 border-b border-gray-100">
                  {inv.enrollment.studentData.fullName} <span className="text-gray-500 font-normal">({inv.enrollment.class.name})</span>
                </div>
              )}
              
              <div className="flex-1">
                <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Nominal Tagihan</div>
                <div className="text-2xl font-bold text-teal-700 mb-4">
                  Rp {Number(inv.amount).toLocaleString('id-ID')}
                </div>
                
                {inv.status === 'rejected' && inv.rejectionNote && (
                  <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 rounded-r-md">
                    <p className="text-xs text-red-800 font-medium">Alasan Penolakan:</p>
                    <p className="text-sm text-red-700 mt-1">{inv.rejectionNote}</p>
                  </div>
                )}

                {inv.proofUrl && (
                  <div className="mb-4">
                    <button 
                      onClick={() => setViewerUrl(inv.proofUrl)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                    >
                      <span>📎</span> Lihat bukti yang diunggah
                    </button>
                    {inv.uploadedAt && <div className="text-xs text-gray-400 mt-1">Diunggah pada: {new Date(inv.uploadedAt).toLocaleString('id-ID')}</div>}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                {(inv.status === 'unpaid' || inv.status === 'rejected') && (
                  <button 
                    onClick={() => openUpload(inv)}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex justify-center items-center gap-2"
                  >
                    <span>📤</span> Unggah Bukti Bayar
                  </button>
                )}
                
                {inv.status === 'uploaded' && (
                  <div className="text-center text-sm text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-100">
                    Bukti bayar sedang diperiksa oleh Admin Unit.
                  </div>
                )}
                
                {inv.status === 'verified' && (
                  <div className="text-center text-sm text-green-700 bg-green-50 p-2.5 rounded-lg border border-green-100">
                    Terima kasih, tagihan bulan ini sudah lunas.
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredInvoices.length === 0 && (
          <div className="col-span-full py-16 text-center text-gray-500 border border-dashed rounded-xl bg-gray-50">
            <span className="text-4xl block mb-2">🎉</span>
            Belum ada tagihan SPP untuk anak yang dipilih.
          </div>
        )}
      </div>

      {/* Modal Upload */}
      {isUploadOpen && uploadInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg">Unggah Bukti Bayar</h3>
              <button type="button" onClick={() => setIsUploadOpen(false)} className="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
            </div>
            
            <form onSubmit={handleUploadSubmit} className="p-6 space-y-5">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <div className="text-sm text-blue-800">
                  <span className="font-semibold block mb-1">Tagihan SPP: {monthNames[uploadInvoice.month - 1]} {uploadInvoice.year}</span>
                  Transfer sejumlah <b className="text-lg">Rp {Number(uploadInvoice.amount).toLocaleString('id-ID')}</b>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pilih File (JPG/PNG/PDF)</label>
                <input 
                  type="file" 
                  accept="image/jpeg,image/png,application/pdf"
                  required
                  onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 border p-2 rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-2">Ukuran maksimal file: 2MB.</p>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t mt-4">
                <button type="button" onClick={() => setIsUploadOpen(false)} className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">Batal</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2">
                  {loading ? 'Mengunggah...' : 'Kirim Bukti'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {viewerUrl && (
        <DocumentViewerModal 
          isOpen={!!viewerUrl} 
          onClose={() => setViewerUrl(null)} 
          docs={[{ type: 'other', label: 'Bukti Pembayaran', url: viewerUrl }]} 
        />
      )}
    </div>
  );
}
