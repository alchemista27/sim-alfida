"use client";

import React, { useState } from "react";
import { uploadPaymentReceiptAction } from "@/actions/parent";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export function PaymentUploadClient({ registrationId }: { registrationId: string }) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      setError("Ukuran file maksimal 2MB");
      return;
    }

    setIsUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("registrationId", registrationId);
      formData.append("file", file);
      await uploadPaymentReceiptAction(formData);
    } catch (e: any) {
      setError(e.message || "Gagal mengunggah bukti.");
      setIsUploading(false);
    }
  };

  return (
    <div className="mt-6">
      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded text-sm">{error}</div>}
      <label 
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer block
          ${isUploading ? "border-gray-200 bg-gray-50 pointer-events-none" : "border-tertiary/40 bg-teal-50/30 hover:bg-teal-50/50"}`}
      >
        <input type="file" accept="image/jpeg, image/png, application/pdf" className="hidden" onChange={handleFileChange} disabled={isUploading} />
        <Icon name={isUploading ? "sync" : "cloud_upload"} className={`text-4xl mb-3 ${isUploading ? "animate-spin text-gray-400" : "text-tertiary"}`} />
        <h4 className="font-bold text-primary mb-1">
          {isUploading ? "Mengunggah..." : "Pilih File Bukti Bayar"}
        </h4>
        <p className="text-xs text-gray-500">
          (Format JPG/PNG/PDF maks 2MB)
        </p>
      </label>
    </div>
  );
}
