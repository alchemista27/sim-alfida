import React from "react";
import { getActiveRegistration } from "@/actions/parent";
import { PpdbStepper } from "@/components/parent/ppdb-stepper";
import { RegistrationStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { MedicalUploadClient } from "@/components/parent/medical-upload-client";

export default async function ParentMedicalPage() {
  const reg = await getActiveRegistration();

  if (!reg) {
    redirect("/parent/select-unit");
  }

  // Only allow access if in medical_pending or medical_uploaded or verification
  if (
    reg.status !== RegistrationStatus.medical_pending &&
    reg.status !== RegistrationStatus.medical_uploaded &&
    reg.status !== RegistrationStatus.verification
  ) {
     redirect("/parent/dashboard");
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PpdbStepper status={reg.status} />

      <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
        <h2 className="text-xl font-bold text-primary mb-2">Identifikasi Medis Calon Siswa (IMC)</h2>
        <p className="text-sm text-gray-500 mb-6">
          Sebagai salah satu syarat administrasi, calon siswa diwajibkan untuk melakukan pemeriksaan medis.
        </p>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 bg-teal-50/50 p-6 rounded-xl border border-tertiary/20 flex flex-col items-center text-center justify-center">
            <Icon name="print" className="text-5xl text-tertiary mb-4" />
            <h3 className="font-bold text-gray-800 mb-2">Cetak Surat Pengantar</h3>
            <p className="text-xs text-gray-600 mb-4 px-4">
              Unduh dan cetak surat pengantar ini, kemudian bawa ke laboratorium atau klinik terdekat untuk pemeriksaan.
            </p>
            <a
              href={`/api/pdf/imc?id=${reg.id}`}
              target="_blank"
              className="bg-tertiary hover:bg-teal-600 text-white px-6 py-2 rounded-full font-medium transition-colors inline-flex items-center gap-2"
            >
              <Icon name="download" /> Unduh PDF
            </a>
          </div>

          <div className="flex-1">
            <h4 className="font-bold text-sm text-gray-700 mb-3">Langkah-langkah:</h4>
            <ol className="list-decimal pl-5 space-y-3 text-sm text-gray-600">
              <li>Unduh dan cetak Surat Pengantar IMC di samping.</li>
              <li>Bawa surat tersebut ke klinik / puskesmas terdekat.</li>
              <li>Minta dokter untuk melakukan pemeriksaan sesuai format yang tertera pada surat.</li>
              <li>Minta hasil laboratorium/surat keterangan sehat dari klinik.</li>
              <li>Scan atau foto hasil tersebut dan unggah pada form di bawah.</li>
            </ol>
          </div>
        </div>

        {reg.status === RegistrationStatus.medical_pending && (
          <MedicalUploadClient registrationId={reg.id} />
        )}
        
        {reg.status !== RegistrationStatus.medical_pending && (
          <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <Icon name="check_circle" className="text-green-600 text-xl mt-0.5" />
            <div>
              <h4 className="font-bold text-green-800">Dokumen IMC Terunggah</h4>
              <p className="text-sm text-green-700">Berkas Anda dan hasil IMC sedang dalam antrian verifikasi oleh Tim PPDB.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
