"use client";

import React, { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { uploadSingleDocumentAction, finalizeDocumentUploadAction } from "@/actions/parent-documents";

const REQUIRED_DOCS = [
  { key: "photo", label: "Pasfoto Terbaru" },
  { key: "father_id", label: "KTP Ayah" },
  { key: "mother_id", label: "KTP Ibu" },
  { key: "birth_certificate", label: "Akte Kelahiran" },
  { key: "family_card", label: "Kartu Keluarga" },
  { key: "school_certificate", label: "Surat Ket. Sekolah Asal", optional: true },
];

export function DocumentUploadClient({ registrationId, existingDocs }: { registrationId: string, existingDocs: any[] }) {
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<{ [key: string]: string }>({});
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size > 2 * 1024 * 1024) {
      alert("Maksimal ukuran file 2MB");
      return;
    }
    setFiles(prev => ({ ...prev, [key]: file || null }));
    setProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[key];
      return newProgress;
    });
  };

  const handleUploadAll = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const fileKeysToUpload = Object.keys(files).filter(k => files[k] !== null);
    
    if (fileKeysToUpload.length === 0) {
      setError("Silakan pilih minimal satu file baru untuk diunggah.");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Upload secara berurutan untuk mencegah timeout/ECONNRESET dari koneksi klien lambat
      for (const key of fileKeysToUpload) {
        const file = files[key]!;
        setProgress(prev => ({ ...prev, [key]: "mengunggah..." }));
        
        const singleFormData = new FormData();
        singleFormData.append("registrationId", registrationId);
        singleFormData.append("key", key);
        singleFormData.append("file", file);
        
        await uploadSingleDocumentAction(singleFormData);
        
        setProgress(prev => ({ ...prev, [key]: "selesai" }));
      }
      
      // Jika semua sudah berhasil di-upload
      setProgress({});
      setFiles({});
      
      // Panggil fungsi finalisasi (ubah status & redirect)
      await finalizeDocumentUploadAction(registrationId);
    } catch (e: any) {
      setError(e.message || "Gagal mengunggah berkas. Silakan coba lagi.");
      setIsUploading(false);
    }
  };

  const getDocStatus = (key: string) => {
    if (progress[key] === "mengunggah...") return { status: "uploading", name: files[key]?.name };
    if (progress[key] === "selesai") return { status: "done", name: files[key]?.name };
    if (files[key]) return { status: "selected", name: files[key]!.name };
    
    const existing = existingDocs.find(d => d.type === key);
    if (existing) return { status: "uploaded", url: existing.fileUrl };
    
    return { status: "missing" };
  };

  return (
    <div className="space-y-6">
      {error && <div className="p-3 bg-red-50 text-red-600 rounded text-sm font-medium border border-red-200">{error}</div>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {REQUIRED_DOCS.map((doc) => {
          const docState = getDocStatus(doc.key);
          return (
            <div key={doc.key} className="border border-border rounded-xl p-5 bg-surface relative shadow-sm">
              <h4 className="font-bold text-primary mb-1 flex items-center justify-between">
                <span>{doc.label}</span>
                {(docState.status === "uploaded" || docState.status === "done") && <Icon name="check_circle" className="text-green-500" />}
                {docState.status === "uploading" && <Icon name="hourglass_empty" className="text-amber-500 animate-spin" />}
              </h4>
              <p className="text-xs text-gray-500 mb-4">{doc.optional ? "Opsional" : "Wajib"} • PDF/JPG/PNG max 2MB</p>
              
              {docState.status === "uploaded" ? (
                <div className="bg-green-50 text-green-700 text-sm p-3 rounded flex items-center gap-2">
                  <Icon name="description" />
                  <a href={docState.url} target="_blank" rel="noreferrer" className="underline truncate block flex-1">
                    Lihat Berkas
                  </a>
                  <label className={`cursor-pointer text-xs underline text-green-800 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    Ganti
                    <input type="file" disabled={isUploading} className="hidden" accept="image/*,application/pdf" onChange={e => handleFileChange(doc.key, e)} />
                  </label>
                </div>
              ) : (
                <label className={`border-2 border-dashed ${docState.status === "uploading" ? "border-amber-300 bg-amber-50" : "border-gray-300 hover:bg-neutral"} rounded-lg h-24 flex flex-col items-center justify-center text-gray-500 cursor-pointer transition-colors ${isUploading ? 'opacity-70 pointer-events-none' : ''}`}>
                  <input type="file" disabled={isUploading} className="hidden" accept="image/*,application/pdf" onChange={e => handleFileChange(doc.key, e)} />
                  {docState.status === "selected" || docState.status === "done" ? (
                    <>
                      <Icon name="insert_drive_file" className={`${docState.status === "done" ? "text-green-500" : "text-tertiary"} text-2xl mb-1`} />
                      <span className="text-xs font-medium truncate w-3/4 text-center">{docState.name}</span>
                    </>
                  ) : docState.status === "uploading" ? (
                    <>
                      <Icon name="cloud_upload" className="text-2xl text-amber-500 mb-1 animate-pulse" />
                      <span className="text-xs font-medium text-amber-600">Mengunggah...</span>
                    </>
                  ) : (
                    <>
                      <Icon name="cloud_upload" className="text-2xl mb-1" />
                      <span className="text-xs font-medium">Klik untuk upload</span>
                    </>
                  )}
                </label>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={handleUploadAll} disabled={isUploading} variant="primary">
          {isUploading ? "Memproses Unggahan..." : "Simpan & Lanjutkan"}
        </Button>
      </div>
    </div>
  );
}
