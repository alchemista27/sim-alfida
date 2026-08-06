import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth-guard";
import { requireUnitAccess } from "@/lib/auth-guard";
import { resolveUnitId } from "@/lib/unit-context";
import { prisma } from "@/lib/prisma";
import { UserRole, RegistrationStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Card } from "@/components/ui/card";

const ALL_STEPS: { key: RegistrationStatus; label: string; icon: string }[] = [
  { key: "pending_payment", label: "Pembayaran", icon: "payments" },
  { key: "payment_uploaded", label: "Bukti Diunggah", icon: "upload_file" },
  { key: "payment_verified", label: "Bayar Terverifikasi", icon: "verified" },
  { key: "form_filling", label: "Isi Formulir", icon: "assignment" },
  { key: "documents_uploaded", label: "Berkas Diupload", icon: "folder_open" },
  { key: "medical_pending", label: "Surat IMC", icon: "local_hospital" },
  { key: "medical_uploaded", label: "Hasil IMC", icon: "health_and_safety" },
  { key: "verification", label: "Verifikasi Berkas", icon: "fact_check" },
  { key: "observation_scheduled", label: "Booking Observasi", icon: "event_available" },
  { key: "observation_done", label: "Observasi Selesai", icon: "groups" },
  { key: "accepted", label: "Diterima", icon: "emoji_events" },
  { key: "enrolled", label: "Terdaftar", icon: "school" },
];

const STATUS_ORDER = ALL_STEPS.map((s) => s.key);

export default async function RegistrationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireRole([UserRole.admin_unit, UserRole.super_admin]);
  const unitId = await resolveUnitId();

  const reg = await prisma.registration.findUnique({
    where: { id },
    include: {
      academicYear: { include: { unit: true } },
      studentData: true,
      parentData: true,
      payment: true,
      documents: true,
    },
  });

  if (!reg) notFound();

  // Tenant isolation — ensure this reg belongs to the admin's unit
  await requireUnitAccess(reg.academicYear.unitId);

  const currentIdx = STATUS_ORDER.indexOf(reg.status);
  const isRejected = reg.status === "rejected";

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/unit/ppdb-registrations" className="hover:text-tertiary">
          Pendaftaran
        </Link>
        <Icon name="chevron_right" className="text-xs" />
        <span className="text-primary font-medium font-mono text-xs">
          {reg.registrationNumber}
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-primary">
            {reg.studentData?.fullName ?? "Nama Siswa Belum Diisi"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {reg.academicYear.unit.name} · {reg.academicYear.name}
          </p>
        </div>
        <div className="font-mono text-xs bg-neutral border border-border rounded-lg px-4 py-2">
          {reg.registrationNumber}
        </div>
      </div>

      {/* Status Progress Stepper */}
      <Card className="p-6 border-border shadow-sm overflow-x-auto">
        <h2 className="text-base font-bold text-primary mb-5">Tahapan Pendaftaran</h2>
        {isRejected ? (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <Icon name="cancel" className="text-2xl" />
            <div>
              <p className="font-bold text-sm">Pendaftaran Ditolak</p>
              {reg.rejectionReason && (
                <p className="text-xs mt-0.5">{reg.rejectionReason}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex gap-2 min-w-max">
            {ALL_STEPS.filter(s => s.key !== "enrolled" || reg.status === "enrolled").map((step, i) => {
              const stepIdx = STATUS_ORDER.indexOf(step.key);
              const isDone = stepIdx < currentIdx;
              const isActive = stepIdx === currentIdx;
              return (
                <div key={step.key} className="flex items-center gap-1">
                  <div className="flex flex-col items-center gap-1 w-14">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm
                      ${isDone ? "bg-green-100 text-green-600" : isActive ? "bg-teal-100 text-tertiary ring-2 ring-tertiary" : "bg-gray-100 text-gray-300"}`}>
                      <Icon name={isDone ? "check" : step.icon} className="text-sm" />
                    </div>
                    <span className={`text-[10px] text-center leading-tight ${isActive ? "text-tertiary font-bold" : isDone ? "text-green-600" : "text-gray-400"}`}>
                      {step.label}
                    </span>
                  </div>
                  {i < ALL_STEPS.length - 1 && (
                    <div className={`w-4 h-0.5 mb-5 ${isDone ? "bg-green-300" : "bg-gray-200"}`} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Data Siswa */}
        <Card className="p-6 border-border shadow-sm">
          <h2 className="text-base font-bold text-primary mb-4 pb-2 border-b border-border">
            Data Calon Siswa
          </h2>
          {reg.studentData ? (
            <dl className="space-y-2 text-sm">
              {[
                ["Nama Lengkap", reg.studentData.fullName],
                ["Nama Panggilan", reg.studentData.nickname],
                ["Jenis Kelamin", reg.studentData.gender === "male" ? "Laki-laki" : "Perempuan"],
                ["Tempat, Tanggal Lahir", `${reg.studentData.birthPlace}, ${new Date(reg.studentData.birthDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`],
                ["Agama", reg.studentData.religion],
                ["NISN", reg.studentData.nisn || "-"],
                ["Jumlah Saudara", String(reg.studentData.siblingsCount)],
                ["Alamat", reg.studentData.address],
                ["Transportasi", reg.studentData.transportation || "-"],
              ].map(([label, val]) => (
                <div key={label} className="flex gap-2">
                  <dt className="w-40 text-gray-500 shrink-0">{label}</dt>
                  <dd className="text-primary font-medium">{val || "-"}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-gray-400 text-sm italic">Belum diisi oleh orang tua.</p>
          )}
        </Card>

        {/* Data Pembayaran */}
        <Card className="p-6 border-border shadow-sm">
          <h2 className="text-base font-bold text-primary mb-4 pb-2 border-b border-border">
            Status Pembayaran
          </h2>
          {reg.payment ? (
            <dl className="space-y-2 text-sm">
              {[
                ["Nominal", `Rp ${Number(reg.payment.amount).toLocaleString("id-ID")}`],
                ["Status", reg.payment.status],
                ["Tanggal Upload", reg.payment.uploadedAt ? new Date(reg.payment.uploadedAt).toLocaleDateString("id-ID") : "-"],
                ["Tanggal Verifikasi", reg.payment.verifiedAt ? new Date(reg.payment.verifiedAt).toLocaleDateString("id-ID") : "-"],
              ].map(([label, val]) => (
                <div key={label} className="flex gap-2">
                  <dt className="w-36 text-gray-500 shrink-0">{label}</dt>
                  <dd className="text-primary font-medium">{val}</dd>
                </div>
              ))}
              {reg.payment.proofUrl && (
                <div className="mt-3 pt-3 border-t border-border">
                  <a
                    href={reg.payment.proofUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-tertiary text-xs font-semibold hover:underline flex items-center gap-1"
                  >
                    <Icon name="receipt_long" className="text-sm" />
                    Lihat Bukti Pembayaran
                  </a>
                </div>
              )}
            </dl>
          ) : (
            <p className="text-gray-400 text-sm italic">Belum ada data pembayaran.</p>
          )}
        </Card>

        {/* Data Orang Tua */}
        {reg.parentData.length > 0 && (
          <Card className="p-6 border-border shadow-sm lg:col-span-2">
            <h2 className="text-base font-bold text-primary mb-4 pb-2 border-b border-border">
              Data Orang Tua / Wali
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {reg.parentData.map((p) => (
                <div key={p.id}>
                  <p className="text-xs font-bold text-tertiary uppercase mb-2">
                    {p.type === "father" ? "Ayah" : p.type === "mother" ? "Ibu" : "Wali"}
                  </p>
                  <dl className="space-y-1 text-sm">
                    {[
                      ["Nama", p.fullName],
                      ["NIK", p.nik || "-"],
                      ["Pekerjaan", p.occupation || "-"],
                      ["Penghasilan", p.incomeRange || "-"],
                      ["No. HP", p.phone || "-"],
                    ].map(([label, val]) => (
                      <div key={label} className="flex gap-2">
                        <dt className="w-28 text-gray-500 shrink-0">{label}</dt>
                        <dd className="text-primary font-medium">{val}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Dokumen */}
        <Card className="p-6 border-border shadow-sm lg:col-span-2">
          <h2 className="text-base font-bold text-primary mb-4 pb-2 border-b border-border">
            Dokumen Persyaratan
          </h2>
          {reg.documents.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {reg.documents.map((doc) => (
                <a
                  key={doc.id}
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col items-center gap-2 p-4 border border-border rounded-lg hover:bg-neutral/30 transition-colors text-center"
                >
                  <Icon name="description" className="text-2xl text-tertiary" />
                  <span className="text-xs font-medium text-primary">{doc.type}</span>
                  <span className="text-[10px] text-gray-400 truncate w-full text-center">
                    {doc.fileName}
                  </span>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm italic">Belum ada dokumen diunggah.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
