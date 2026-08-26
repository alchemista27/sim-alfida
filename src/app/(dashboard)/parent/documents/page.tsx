import React from "react";
import { getActiveRegistration } from "@/actions/parent";
import { PpdbStepper } from "@/components/parent/ppdb-stepper";
import { RegistrationStatus } from "@/generated/client";
import { redirect } from "next/navigation";
import { DocumentUploadClient } from "@/components/parent/document-upload-client";
import { prisma } from "@/lib/prisma";

export default async function ParentDocumentsPage() {
  const reg = await getActiveRegistration();

  if (!reg) {
    redirect("/parent/select-unit");
  }

  // Allow access if documents_uploaded or medical_pending
  if (reg.status === RegistrationStatus.pending_payment || reg.status === RegistrationStatus.payment_uploaded || reg.status === RegistrationStatus.payment_verified) {
     redirect("/parent/dashboard");
  }

  const existingDocs = await prisma.document.findMany({
    where: { registrationId: reg.id }
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PpdbStepper status={reg.status} />

      <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
        <h2 className="text-xl font-bold text-primary mb-2">Upload Berkas Wajib</h2>
        <p className="text-sm text-gray-500 mb-6">
          Silakan unggah dokumen persyaratan administrasi berikut. Format yang didukung adalah JPG, PNG, dan PDF dengan ukuran maksimal 2MB per dokumen.
        </p>
        
        <DocumentUploadClient registrationId={reg.id} existingDocs={existingDocs} />
      </div>
    </div>
  );
}
