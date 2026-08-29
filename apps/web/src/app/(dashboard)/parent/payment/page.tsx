import React from "react";
import { getActiveRegistration } from "@/actions/parent";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@sim/database";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { PaymentUploadClient } from "@/components/parent/payment-upload-client";
import { redirect } from "next/navigation";

export default async function ParentPaymentPage() {
  await requireRole([UserRole.orang_tua]);
  const reg = await getActiveRegistration();

  if (!reg) {
    redirect("/parent/select-unit");
  }

  if (reg.status !== "pending_payment") {
    redirect("/parent/dashboard");
  }

  const foundation = await prisma.foundationSettings.findFirst();

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="font-heading font-bold text-2xl text-primary mb-2">
          Pembayaran PPDB
        </h1>
        <p className="text-gray-500 text-sm">
          Silakan selesaikan pembayaran biaya pendaftaran untuk unit {reg.academicYear.unit.name}.
        </p>
      </div>

      <Card className="p-0 border-border overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-tertiary to-secondary p-6 text-white text-center">
          <p className="text-sm opacity-90 mb-1">Nominal Pembayaran</p>
          <p className="font-heading font-bold text-4xl">Rp 250.000</p>
        </div>
        <div className="p-8">
          <h3 className="text-sm font-bold text-primary mb-4 uppercase tracking-wider text-center">
            Transfer ke Rekening Yayasan
          </h3>
          <div className="bg-neutral/50 rounded-xl p-6 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Nama Bank</p>
                <p className="font-bold text-primary text-lg">
                  {foundation?.bankName || "BSI"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Atas Nama</p>
                <p className="font-bold text-primary text-lg">
                  {foundation?.bankAccountHolder || "Yayasan Alfida"}
                </p>
              </div>
              <div className="sm:col-span-2 mt-2 pt-4 border-t border-gray-200 flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Nomor Rekening</p>
                  <p className="font-mono font-bold text-2xl tracking-widest text-primary">
                    {foundation?.bankAccountNumber || "7121234567"}
                  </p>
                </div>
                {/* Normally a copy button here */}
                <div className="w-10 h-10 bg-white rounded-full shadow flex items-center justify-center text-tertiary cursor-pointer hover:bg-neutral">
                  <Icon name="content_copy" className="text-xl" />
                </div>
              </div>
            </div>
          </div>

          <PaymentUploadClient registrationId={reg.id} />
        </div>
      </Card>
    </div>
  );
}
