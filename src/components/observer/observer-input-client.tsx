"use client";

import { useState } from "react";
import { submitObservationResult } from "@/actions/observation-result";

export function ObserverInputClient({ observerId, bookings }: { observerId: string, bookings: any[] }) {
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [score, setScore] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    
    setLoading(true);
    const res = await submitObservationResult({
      observationBookingId: selectedBooking.id,
      observerId,
      score,
      notes
    });
    setLoading(false);

    if (res.success) {
      setShowSuccessModal(true);
    } else {
      alert((res as any).error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
      {/* List Panel */}
      <div className="md:col-span-1 space-y-3 h-[600px] overflow-y-auto pr-2">
        {bookings.map(b => (
          <div 
            key={b.id} 
            onClick={() => { setSelectedBooking(b); setScore(0); setNotes(""); }}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedBooking?.id === b.id ? 'border-teal-500 bg-teal-50 shadow-sm' : 'border-gray-200 bg-white hover:border-teal-300'}`}
          >
            <div className="text-xs text-gray-500 mb-1 font-mono">{b.registrationNumber}</div>
            <div className="font-bold text-gray-900 mb-2">{b.studentName}</div>
            <div className="flex items-center text-xs text-gray-500">
              <span className="material-symbols-rounded text-sm mr-1">event</span>
              {new Date(b.date).toLocaleDateString('id-ID')} ({b.time})
            </div>
            <div className="mt-2 text-xs font-medium text-teal-700 bg-teal-100/50 inline-block px-2 py-1 rounded">
              {b.unitName}
            </div>
          </div>
        ))}
      </div>

      {/* Input Panel */}
      <div className="md:col-span-2">
        {selectedBooking ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">Form Penilaian</h2>
              <p className="text-sm text-gray-600">Siswa: <strong>{selectedBooking.studentName}</strong></p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Skor Akhir (0 - 100)</label>
                <input 
                  type="number" 
                  min="0" 
                  max="100" 
                  step="0.01" 
                  required 
                  value={score} 
                  onChange={e => setScore(Number(e.target.value))}
                  className="w-full text-2xl font-bold px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                />
                <p className="text-xs text-gray-500 mt-2">Masukkan nilai desimal menggunakan titik (contoh: 85.50).</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Catatan Observasi</label>
                <textarea 
                  required
                  rows={4}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Ketikkan catatan mengenai respons, psikologi, motorik, atau hal penting lainnya dari calon siswa..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all resize-none"
                ></textarea>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button type="button" onClick={() => setSelectedBooking(null)} className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={loading} className="px-5 py-2.5 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors disabled:opacity-50 flex items-center">
                  {loading && <span className="material-symbols-rounded animate-spin mr-2 text-sm">progress_activity</span>}
                  Simpan & Finalisasi
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200 p-8">
            <span className="material-symbols-rounded text-6xl mb-4">edit_document</span>
            <p>Pilih siswa dari daftar di sebelah kiri untuk mulai menginput nilai.</p>
          </div>
        )}
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6 shadow-2xl text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-rounded text-4xl">check_circle</span>
            </div>
            <h3 className="font-bold text-lg text-teal-700 mb-2">Nilai Berhasil Disimpan!</h3>
            <p className="text-sm text-gray-600 mb-6">
              Data penilaian observasi untuk calon siswa ini telah sukses dimasukkan ke dalam sistem.
            </p>
            <button 
              className="w-full bg-teal-600 text-white font-medium py-2.5 rounded-lg hover:bg-teal-700 transition-colors"
              onClick={() => {
                setShowSuccessModal(false);
                window.location.reload();
              }}
            >
              Tutup & Lanjutkan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
