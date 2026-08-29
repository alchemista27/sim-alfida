"use client";

import React, { useState } from "react";
import { verifyPaymentAction } from "@/actions/unit-ppdb";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export function PaymentVerificationClient({ registrationId }: { registrationId: string }) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleVerify = async (isApproved: boolean) => {
    // Basic confirm
    if (!isApproved && !confirm("Yakin ingin menolak pembayaran ini? Orang tua harus mengupload ulang.")) {
      return;
    }
    
    setIsProcessing(true);
    try {
      await verifyPaymentAction(registrationId, isApproved);
    } catch (e: any) {
      alert(e.message || "Gagal memproses verifikasi.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex justify-end gap-2">
      <Button
        variant="danger"
        size="sm"
        disabled={isProcessing}
        onClick={() => handleVerify(false)}
        className="px-2"
        title="Tolak Pembayaran"
      >
        <Icon name="close" />
      </Button>
      <Button
        variant="primary"
        size="sm"
        disabled={isProcessing}
        onClick={() => handleVerify(true)}
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        <Icon name="check" className="mr-1" /> Verifikasi
      </Button>
    </div>
  );
}
