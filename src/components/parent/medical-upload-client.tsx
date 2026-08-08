"use client";

import React, { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { uploadMedicalResultAction } from "@/actions/parent-documents";

export function MedicalUploadClient({ registrationId }: { registrationId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && f.size > 2 * 1024 * 1024) {
      setError("Maksimal ukuran file 2MB");
      return;
    }
    setError(null);
    setFile(f || null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Silakan pilih file hasil lab terlebih dahulu.");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("registrationId", registrationId);
      formData.append("file", file);
      
      await uploadMedicalResultAction(formData);
    } catch (e: any) {
      setError(e.message || "Gagal mengunggah hasil lab.");
      setIsUploading(false);
    }
  };

  return (
    <div className="border border-border rounded-xl p-6 bg-surface mt-6">
      <h3 className="font-bold text-lg text-primary mb-4">Upload Hasil Medis (IMC)</h3>
      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded text-sm">{error}</div>}
      
      <label className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer block
        ${isUploading ? "border-gray-200 bg-gray-50 pointer-events-none" : "border-tertiary/40 bg-teal-50/30 hover:bg-teal-50/50"}`}
      >
        <input type="file" accept="image/jpeg, image/png, application/pdf" className="hidden" onChange={handleFileChange} disabled={isUploading} />
        {file && !isUploading ? (
          <div className="text-tertiary">
            <Icon name="insert_drive_file" className="text-4xl mb-2" />
            <p className="font-medium">{file.name}</p>
          </div>
        ) : (
          <>
            <Icon name={isUploading ? "sync" : "cloud_upload"} className={`text-4xl mb-3 ${isUploading ? "animate-spin text-gray-400" : "text-tertiary"}`} />
            <h4 className="font-bold text-primary mb-1">
              {isUploading ? "Mengunggah..." : "Pilih File Hasil Laboratorium"}
            </h4>
            <p className="text-xs text-gray-500">
              (Format JPG/PNG/PDF maks 2MB)
            </p>
          </>
        )}
      </label>

      <div className="flex justify-end mt-4">
        <Button onClick={handleUpload} disabled={isUploading || !file} variant="primary">
          {isUploading ? "Memproses..." : "Upload & Ajukan Verifikasi"}
        </Button>
      </div>
    </div>
  );
}
