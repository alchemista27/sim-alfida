"use client";

import React, { useState } from "react";
import { uploadPaymentReceiptAction } from "@/actions/parent";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export function PaymentUploadClient({ registrationId }: { registrationId: string }) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async () => {
    setIsUploading(true);
    setError(null);
    try {
      await uploadPaymentReceiptAction(registrationId);
    } catch (e: any) {
      setError(e.message || "Gagal mengunggah bukti.");
      setIsUploading(false);
    }
  };

  return (
    <div className="mt-6">
      {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded text-sm">{error}</div>}
      <div 
        onClick={isUploading ? undefined : handleUpload}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
          ${isUploading ? "border-gray-200 bg-gray-50" : "border-tertiary/40 bg-teal-50/30 hover:bg-teal-50/50"}`}
      >
        <Icon name={isUploading ? "sync" : "cloud_upload"} className={`text-4xl mb-3 ${isUploading ? "animate-spin text-gray-400" : "text-tertiary"}`} />
        <h4 className="font-bold text-primary mb-1">
          {isUploading ? "Memproses Mock Upload..." : "Klik untuk Simulasi Upload"}
        </h4>
        <p className="text-xs text-gray-500">
          (Format JPG/PNG maks 2MB - Ini adalah simulasi untuk env dev)
        </p>
      </div>
    </div>
  );
}
