import React from "react";
import Link from "next/link";
import { getActiveRegistration } from "@/actions/parent";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@prisma/client";
import { PpdbStepper } from "@/components/parent/ppdb-stepper";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Card } from "@/components/ui/card";

export default async function ParentDashboardPage() {
  await requireRole([UserRole.orang_tua]);
  const reg = await getActiveRegistration();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <p className="text-xs text-tertiary font-semibold uppercase tracking-wider mb-1">
          Portal Orang Tua
        </p>
        <h1 className="font-heading font-bold text-2xl text-primary">Dashboard PPDB</h1>
      </div>

      {!reg ? (
        <Card className="p-8 border-dashed border-2 border-gray-300 text-center bg-neutral/30">
          <Icon name="school" className="text-5xl text-gray-300 mb-3 block mx-auto" />
          <h2 className="text-lg font-bold text-primary mb-1">
            Belum Ada Pendaftaran
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Anda belum mendaftarkan calon siswa. Silakan pilih unit pendidikan untuk memulai.
          </p>
          <Link href="/parent/select-unit">
            <Button variant="primary">
              <Icon name="add" className="mr-1" /> Mulai Pendaftaran
            </Button>
          </Link>
        </Card>
      ) : (
        <>
          {/* Active Registration Card */}
          <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-tertiary/20 rounded-xl p-6 flex flex-wrap justify-between items-center gap-4">
            <div>
              <p className="text-xs font-mono font-medium text-tertiary mb-1">
                {reg.registrationNumber}
              </p>
              <h2 className="text-xl font-bold font-heading text-primary">
                {reg.academicYear.unit.name}
              </h2>
              <p className="text-sm text-gray-600 mt-0.5">
                Tahun Ajaran {reg.academicYear.name}
              </p>
            </div>
            
            {/* Contextual Action Button based on State */}
            {reg.status === "pending_payment" && (
              <Link href="/parent/payment">
                <Button variant="primary">Lakukan Pembayaran</Button>
              </Link>
            )}
            {reg.status === "payment_uploaded" && (
              <div className="px-4 py-2 bg-amber-100 text-amber-700 text-sm font-medium rounded-md flex items-center gap-2">
                <Icon name="hourglass_empty" className="text-sm" /> Menunggu Verifikasi Bayar
              </div>
            )}
            {(reg.status === "payment_verified" || reg.status === "form_filling") && (
              <Link href="/parent/form-student">
                <Button variant="primary">Lengkapi Formulir</Button>
              </Link>
            )}
            {reg.status === "documents_uploaded" && (
              <Link href="/parent/documents">
                <Button variant="primary">Upload Berkas</Button>
              </Link>
            )}
            {reg.status === "medical_pending" && (
              <Link href="/parent/medical">
                <Button variant="primary">Proses Tes Medis (IMC)</Button>
              </Link>
            )}
            {reg.status === "medical_uploaded" && (
              <div className="px-4 py-2 bg-amber-100 text-amber-700 text-sm font-medium rounded-md flex items-center gap-2">
                <Icon name="hourglass_empty" className="text-sm" /> Antrian Verifikasi Berkas
              </div>
            )}
          </div>

          <PpdbStepper status={reg.status} />

          {/* Guidelines based on state */}
          <Card className="p-6 border-border">
            <h3 className="text-sm font-bold text-primary mb-2 flex items-center gap-2">
              <Icon name="info" className="text-tertiary" /> Panduan Langkah Selanjutnya
            </h3>
            <div className="text-sm text-gray-600">
              {reg.status === "pending_payment" && "Silakan lakukan pembayaran biaya pendaftaran. Klik tombol 'Lakukan Pembayaran' di atas."}
              {reg.status === "payment_uploaded" && "Bukti pembayaran Anda sedang dicek oleh Admin Unit. Proses ini memakan waktu 1x24 jam kerja."}
              {reg.status === "payment_verified" && "Pembayaran Anda telah diverifikasi! Sistem sedang menyiapkan formulir Anda."}
              {reg.status === "form_filling" && "Harap lengkapi formulir data calon siswa dan data orang tua/wali."}
              {reg.status === "documents_uploaded" && "Formulir lengkap! Silakan unggah dokumen persyaratan seperti KTP, Akte, dan KK."}
              {reg.status === "medical_pending" && "Silakan cetak surat pengantar IMC dan unggah hasil lab untuk melanjutkan."}
              {reg.status === "medical_uploaded" && "Berkas Anda sedang dalam proses verifikasi oleh Tim PPDB."}
              {["verification", "observation_scheduled", "observation_done"].includes(reg.status) && "Proses seleksi sedang berjalan. Harap pantau dashboard ini secara berkala."}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
