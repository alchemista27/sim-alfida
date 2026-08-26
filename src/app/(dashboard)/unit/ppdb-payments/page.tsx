import React from "react";
import { requireRole } from "@/lib/auth-guard";
import { resolveUnitId } from "@/lib/unit-context";
import { prisma } from "@/lib/prisma";
import { UserRole, RegistrationStatus } from "@/generated/client";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { PaymentVerificationClient } from "@/components/unit/payment-verification-client";

export default async function UnitPpdbPaymentsPage() {
  await requireRole([UserRole.admin_unit, UserRole.super_admin]);
  const unitId = await resolveUnitId();

  const unit = await prisma.unit.findUnique({
    where: { id: unitId },
    include: { academicYears: { where: { ppdbActive: true }, take: 1 } },
  });

  const activeAY = unit?.academicYears[0];

  const pendingPayments = await prisma.registration.findMany({
    where: {
      status: RegistrationStatus.payment_uploaded,
      ...(activeAY ? { academicYearId: activeAY.id } : { academicYear: { unitId } }),
    },
    include: { studentData: true, payment: true },
    orderBy: { payment: { uploadedAt: "asc" } },
  });

  const historyPayments = await prisma.registration.findMany({
    where: {
      status: { notIn: [RegistrationStatus.pending_payment, RegistrationStatus.payment_uploaded, RegistrationStatus.rejected] },
      ...(activeAY ? { academicYearId: activeAY.id } : { academicYear: { unitId } }),
    },
    include: { studentData: true, payment: true },
    orderBy: { payment: { verifiedAt: "desc" } },
    take: 10,
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-tertiary font-semibold uppercase tracking-wider mb-1">
          PPDB · {unit?.name}
        </p>
        <div className="flex items-center gap-3">
          <h1 className="font-heading font-bold text-2xl text-primary">Verifikasi Pembayaran</h1>
          {pendingPayments.length > 0 && (
            <Badge variant="amber">{pendingPayments.length} Menunggu</Badge>
          )}
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-500 uppercase bg-neutral/50 border-b border-border">
            <tr>
              <th className="px-5 py-3 font-semibold">No. Daftar / Nama</th>
              <th className="px-5 py-3 font-semibold">Nominal</th>
              <th className="px-5 py-3 font-semibold">Tanggal Upload</th>
              <th className="px-5 py-3 font-semibold">Bukti Bayar</th>
              <th className="px-5 py-3 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pendingPayments.map((reg) => (
              <tr key={reg.id} className="hover:bg-neutral/30 transition-colors">
                <td className="px-5 py-3">
                  <p className="font-mono text-xs font-bold text-primary mb-0.5">{reg.registrationNumber}</p>
                  <p className="font-medium text-gray-700">{reg.studentData?.fullName || "Belum isi nama"}</p>
                </td>
                <td className="px-5 py-3 font-medium">
                  Rp {reg.payment?.amount ? Number(reg.payment.amount).toLocaleString('id-ID') : "-"}
                </td>
                <td className="px-5 py-3 text-gray-500">
                  {reg.payment?.uploadedAt ? new Date(reg.payment.uploadedAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' }) : "-"}
                </td>
                <td className="px-5 py-3">
                  <a href={reg.payment?.proofUrl!} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-tertiary hover:underline text-xs font-semibold">
                    <Icon name="receipt" className="text-lg" /> Lihat Bukti
                  </a>
                </td>
                <td className="px-5 py-3">
                  <PaymentVerificationClient registrationId={reg.id} />
                </td>
              </tr>
            ))}
            {pendingPayments.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-gray-400">
                  <Icon name="check_circle" className="text-4xl text-green-300 mb-2 block mx-auto" />
                  Semua pembayaran telah diverifikasi.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div>
        <h2 className="text-lg font-bold text-primary mb-3 mt-8">Riwayat Verifikasi (10 Terakhir)</h2>
        <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm opacity-70">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-500 uppercase bg-neutral/50 border-b border-border">
              <tr>
                <th className="px-5 py-3 font-semibold">No. Daftar</th>
                <th className="px-5 py-3 font-semibold">Nama</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Tanggal Verifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {historyPayments.map((reg) => (
                <tr key={reg.id}>
                  <td className="px-5 py-3 font-mono text-xs">{reg.registrationNumber}</td>
                  <td className="px-5 py-3">{reg.studentData?.fullName || "-"}</td>
                  <td className="px-5 py-3"><Badge variant="teal">Terverifikasi</Badge></td>
                  <td className="px-5 py-3 text-gray-500">
                    {reg.payment?.verifiedAt ? new Date(reg.payment.verifiedAt).toLocaleDateString("id-ID") : "-"}
                  </td>
                </tr>
              ))}
              {historyPayments.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-6 text-center text-gray-400">Belum ada riwayat verifikasi.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
