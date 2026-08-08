"use client";

import React, { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { uploadRequiredDocumentsAction } from "@/actions/parent-documents";

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
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size > 2 * 1024 * 1024) {
      alert("Maksimal ukuran file 2MB");
      return;
    }
    setFiles(prev => ({ ...prev, [key]: file || null }));
  };

  const handleUploadAll = async () => {
    const formData = new FormData();
    formData.append("registrationId", registrationId);
    let hasNewFile = false;
    for (const key of Object.keys(files)) {
      if (files[key]) {
        formData.append(key, files[key]!);
        hasNewFile = true;
      }
    }

    if (!hasNewFile) {
      setError("Silakan pilih minimal satu file baru untuk diunggah.");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      await uploadRequiredDocumentsAction(formData);
    } catch (e: any) {
      setError(e.message || "Gagal mengunggah berkas.");
      setIsUploading(false);
    }
  };

  const getDocStatus = (key: string) => {
    if (files[key]) return { status: "selected", name: files[key]!.name };
    const existing = existingDocs.find(d => d.type === key);
    if (existing) return { status: "uploaded", url: existing.fileUrl };
    return { status: "missing" };
  };

  return (
    <div className="space-y-6">
      {error && <div className="p-3 bg-red-50 text-red-600 rounded text-sm">{error}</div>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {REQUIRED_DOCS.map((doc) => {
          const docState = getDocStatus(doc.key);
          return (
            <div key={doc.key} className="border border-border rounded-xl p-5 bg-surface relative">
              <h4 className="font-bold text-primary mb-1 flex items-center justify-between">
                <span>{doc.label}</span>
                {docState.status === "uploaded" && <Icon name="check_circle" className="text-green-500" />}
              </h4>
              <p className="text-xs text-gray-500 mb-4">{doc.optional ? "Opsional" : "Wajib"} • PDF/JPG/PNG max 2MB</p>
              
              {docState.status === "uploaded" ? (
                <div className="bg-green-50 text-green-700 text-sm p-3 rounded flex items-center gap-2">
                  <Icon name="description" />
                  <a href={docState.url} target="_blank" rel="noreferrer" className="underline truncate block flex-1">
                    Lihat Berkas
                  </a>
                  <label className="cursor-pointer text-xs underline text-green-800">
                    Ganti
                    <input type="file" className="hidden" accept="image/*,application/pdf" onChange={e => handleFileChange(doc.key, e)} />
                  </label>
                </div>
              ) : (
                <label className="border-2 border-dashed border-gray-300 rounded-lg h-24 flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:bg-neutral transition-colors">
                  <input type="file" className="hidden" accept="image/*,application/pdf" onChange={e => handleFileChange(doc.key, e)} />
                  {docState.status === "selected" ? (
                    <>
                      <Icon name="insert_drive_file" className="text-2xl text-tertiary mb-1" />
                      <span className="text-xs font-medium truncate w-3/4 text-center">{docState.name}</span>
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
          {isUploading ? "Mengunggah..." : "Simpan & Lanjutkan"}
        </Button>
      </div>
    </div>
  );
}
