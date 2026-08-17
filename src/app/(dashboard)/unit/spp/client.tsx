"use client";

import { useState } from "react";
import { generateBulkSppInvoices, verifySppInvoice } from "@/actions/spp";
import { DocumentViewerModal } from "@/components/unit/document-viewer-modal";

export function UnitSppClient({ 
  invoices, 
  unitId, 
  academicYearId 
}: { 
  invoices: any[], 
  unitId: string,
  academicYearId: string
}) {
  const [loading, setLoading] = useState(false);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  
  // Generate Form
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const [genMonth, setGenMonth] = useState(currentMonth);
  const [genYear, setGenYear] = useState(currentYear);
  const [genAmount, setGenAmount] = useState(500000);

  // Verification Form
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [verifyInvoice, setVerifyInvoice] = useState<any>(null);
  const [verifyStatus, setVerifyStatus] = useState<"verified" | "rejected">("verified");
  const [rejectionNote, setRejectionNote] = useState("");

  // Filters
  const [filterMonth, setFilterMonth] = useState<number | "all">("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState("");

  // Document Viewer
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm(`Generate tagihan Rp ${genAmount.toLocaleString('id-ID')} untuk seluruh siswa aktif pada bulan ${genMonth}/${genYear}?`)) return;
    
    setLoading(true);
    const formData = new FormData();
    formData.append("unitId", unitId);
    formData.append("academicYearId", academicYearId);
    formData.append("month", genMonth.toString());
    formData.append("year", genYear.toString());
    formData.append("amount", genAmount.toString());

    const res = await generateBulkSppInvoices(formData);
    setLoading(false);
    
    if (res.success) {
      alert(res.message);
      setIsGenerateOpen(false);
      window.location.reload();
    } else {
      alert(res.error);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyStatus === 'rejected' && !rejectionNote) {
      return alert("Mohon isi alasan penolakan.");
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("invoiceId", verifyInvoice.id);
    formData.append("status", verifyStatus);
    if (verifyStatus === 'rejected') formData.append("rejectionNote", rejectionNote);

    const res = await verifySppInvoice(formData);
    setLoading(false);
    
    if (res.success) {
      setIsVerifyOpen(false);
      window.location.reload();
    } else {
      alert(res.error);
    }
  };

  const openVerify = (inv: any) => {
    setVerifyInvoice(inv);
    setVerifyStatus("verified");
    setRejectionNote("");
    setIsVerifyOpen(true);
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchMonth = filterMonth === "all" || inv.month === filterMonth;
    const matchStatus = filterStatus === "all" || inv.status === filterStatus;
    const matchSearch = inv.enrollment.studentData.fullName.toLowerCase().includes(search.toLowerCase()) ||
                        inv.enrollment.class.name.toLowerCase().includes(search.toLowerCase());
    return matchMonth && matchStatus && matchSearch;
  });

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto">
          <select 
            value={filterMonth} 
            onChange={(e) => setFilterMonth(e.target.value === "all" ? "all" : parseInt(e.target.value))}
            className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-teal-500"
          >
            <option value="all">Semua Bulan</option>
            {monthNames.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>

          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 text-sm focus:ring-teal-500"
          >
            <option value="all">Semua Status</option>
            <option value="unpaid">Belum Bayar</option>
            <option value="uploaded">Menunggu Verifikasi</option>
            <option value="verified">Lunas / Terverifikasi</option>
            <option value="rejected">Ditolak</option>
          </select>

          <input 
            type="text" 
            placeholder="Cari siswa atau kelas..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 text-sm flex-1 sm:w-64 focus:ring-teal-500"
          />
        </div>

        <button 
          onClick={() => setIsGenerateOpen(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg transition-colors w-full sm:w-auto whitespace-nowrap"
        >
          + Generate Tagihan
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="bg-gray-50 text-gray-700 uppercase text-xs border-b">
              <tr>
                <th className="px-4 py-3">Bulan/Tahun</th>
                <th className="px-4 py-3">Siswa & Kelas</th>
                <th className="px-4 py-3">Nominal</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Bukti</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium whitespace-nowrap">
                    {monthNames[inv.month - 1]} {inv.year}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-800">{inv.enrollment.studentData.fullName}</div>
                    <div className="text-xs text-gray-500">{inv.enrollment.class.name}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    Rp {Number(inv.amount).toLocaleString('id-ID')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {inv.status === 'unpaid' && <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-bold border border-gray-200">Belum Bayar</span>}
                    {inv.status === 'uploaded' && <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-bold border border-amber-200">Menunggu</span>}
                    {inv.status === 'verified' && <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold border border-green-200">Lunas</span>}
                    {inv.status === 'rejected' && <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold border border-red-200">Ditolak</span>}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {inv.proofUrl ? (
                      <button 
                        onClick={() => setViewerUrl(inv.proofUrl)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-xs underline"
                      >
                        Lihat Bukti
                      </button>
                    ) : "-"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {inv.status === 'uploaded' ? (
                      <button 
                        onClick={() => openVerify(inv)}
                        className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 px-3 py-1 rounded text-xs font-semibold transition-colors"
                      >
                        Verifikasi
                      </button>
                    ) : "-"}
                  </td>
                </tr>
              ))}
              {filteredInvoices.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">Tidak ada tagihan yang sesuai kriteria.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Generate Tagihan */}
      {isGenerateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg">Generate Tagihan Masal</h3>
              <button type="button" onClick={() => setIsGenerateOpen(false)} className="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
            </div>
            <form onSubmit={handleGenerate} className="p-6 space-y-4">
              <p className="text-sm text-gray-600 mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
                Fitur ini akan membuat tagihan baru untuk seluruh siswa berstatus <b>Aktif</b> di unit ini yang belum memiliki tagihan pada bulan yang dipilih.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bulan</label>
                  <select value={genMonth} onChange={e => setGenMonth(parseInt(e.target.value))} className="w-full p-2 border rounded-md">
                    {monthNames.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
                  <input type="number" min="2000" max="2100" value={genYear} onChange={e => setGenYear(parseInt(e.target.value))} className="w-full p-2 border rounded-md" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nominal Tagihan (Rp)</label>
                <input type="number" min="0" value={genAmount} onChange={e => setGenAmount(parseInt(e.target.value))} className="w-full p-2 border rounded-md" />
              </div>
              <div className="pt-4 flex justify-end gap-2 border-t mt-4">
                <button type="button" onClick={() => setIsGenerateOpen(false)} className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">Batal</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50">Buat Tagihan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Verifikasi */}
      {isVerifyOpen && verifyInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg">Verifikasi Pembayaran</h3>
              <button type="button" onClick={() => setIsVerifyOpen(false)} className="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
            </div>
            
            <div className="p-4 bg-gray-50 flex flex-col gap-1 border-b text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Siswa:</span> <span className="font-semibold">{verifyInvoice.enrollment.studentData.fullName}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Bulan:</span> <span className="font-semibold">{monthNames[verifyInvoice.month - 1]} {verifyInvoice.year}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Nominal:</span> <span className="font-semibold text-teal-700">Rp {Number(verifyInvoice.amount).toLocaleString('id-ID')}</span></div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-4 text-center">
                <a href={verifyInvoice.proofUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline text-sm mb-2 inline-block">Buka gambar ukuran penuh ↗</a>
                <div className="border rounded bg-gray-100 flex items-center justify-center overflow-hidden min-h-[200px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={verifyInvoice.proofUrl} alt="Bukti Transfer" className="max-w-full max-h-[300px] object-contain" />
                </div>
              </div>
              
              <form id="verify-form" onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tindakan</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="status" value="verified" checked={verifyStatus === 'verified'} onChange={() => setVerifyStatus('verified')} className="text-teal-600 focus:ring-teal-500" />
                      <span className="font-medium text-green-700">Sah / Lunas</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="status" value="rejected" checked={verifyStatus === 'rejected'} onChange={() => setVerifyStatus('rejected')} className="text-red-600 focus:ring-red-500" />
                      <span className="font-medium text-red-700">Tolak Bukti</span>
                    </label>
                  </div>
                </div>

                {verifyStatus === 'rejected' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alasan Penolakan <span className="text-red-500">*</span></label>
                    <textarea 
                      required
                      value={rejectionNote} 
                      onChange={e => setRejectionNote(e.target.value)} 
                      rows={2} 
                      placeholder="Contoh: Bukti buram, nominal tidak sesuai, dll." 
                      className="w-full p-2 border rounded-md border-red-300 focus:ring-red-500"
                    ></textarea>
                  </div>
                )}
              </form>
            </div>
            
            <div className="p-4 flex justify-end gap-2 border-t bg-gray-50">
              <button type="button" onClick={() => setIsVerifyOpen(false)} className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100">Batal</button>
              <button type="submit" form="verify-form" disabled={loading} className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${verifyStatus === 'verified' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

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
