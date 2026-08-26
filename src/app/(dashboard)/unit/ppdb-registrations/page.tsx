import React from "react";
import Link from "next/link";
import { requireRole } from "@/lib/auth-guard";
import { resolveUnitId } from "@/lib/unit-context";
import { prisma } from "@/lib/prisma";
import { UserRole, RegistrationStatus } from "@/generated/client";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";

const STATUS_LABELS: Record<RegistrationStatus, string> = {
  pending_payment: "Pending Bayar",
  payment_uploaded: "Bayar Diunggah",
  payment_verified: "Bayar Terverifikasi",
  form_filling: "Isi Formulir",
  documents_uploaded: "Berkas Diupload",
  medical_pending: "IMC Pending",
  medical_uploaded: "IMC Diupload",
  verification: "Verifikasi Berkas",
  observation_scheduled: "Jadwal Observasi",
  observation_done: "Observasi Selesai",
  accepted: "Diterima",
  rejected: "Ditolak",
  enrolled: "Terdaftar",
};

const STATUS_BADGE: Record<RegistrationStatus, React.ReactNode> = {
  pending_payment: <Badge variant="amber">Pending Bayar</Badge>,
  payment_uploaded: <Badge variant="blue">Bayar Diunggah</Badge>,
  payment_verified: <Badge variant="teal">Bayar Terverifikasi</Badge>,
  form_filling: <Badge variant="blue">Isi Formulir</Badge>,
  documents_uploaded: <Badge variant="blue">Berkas Diupload</Badge>,
  medical_pending: <Badge variant="amber">IMC Pending</Badge>,
  medical_uploaded: <Badge variant="blue">IMC Diupload</Badge>,
  verification: <Badge variant="amber">Verifikasi Berkas</Badge>,
  observation_scheduled: <Badge variant="blue">Jadwal Observasi</Badge>,
  observation_done: <Badge variant="teal">Observasi Selesai</Badge>,
  accepted: <Badge variant="green">Diterima</Badge>,
  rejected: <Badge variant="red">Ditolak</Badge>,
  enrolled: <Badge variant="teal">Terdaftar</Badge>,
};

interface PageProps {
  searchParams: Promise<{ status?: string; q?: string }>;
}

export default async function UnitRegistrationsPage({ searchParams }: PageProps) {
  await requireRole([UserRole.admin_unit, UserRole.super_admin]);
  const unitId = await resolveUnitId();
  const { status: filterStatus, q: searchQuery } = await searchParams;

  const unit = await prisma.unit.findUnique({
    where: { id: unitId },
    include: { academicYears: { where: { ppdbActive: true }, take: 1 } },
  });

  const activeAY = unit?.academicYears[0];

  const whereClause = {
    ...(activeAY
      ? { academicYearId: activeAY.id }
      : { academicYear: { unitId } }),
    ...(filterStatus && filterStatus !== "all"
      ? { status: filterStatus as RegistrationStatus }
      : {}),
    ...(searchQuery
      ? {
          studentData: {
            fullName: { contains: searchQuery, mode: "insensitive" as const },
          },
        }
      : {}),
  };

  const registrations = await prisma.registration.findMany({
    where: whereClause,
    include: {
      studentData: true,
      payment: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-tertiary font-semibold uppercase tracking-wider mb-1">
          PPDB · {unit?.name}
        </p>
        <h1 className="font-heading font-bold text-2xl text-primary">
          Daftar Pendaftaran
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {activeAY
            ? `Tahun Ajaran ${activeAY.name} · ${registrations.length} pendaftar`
            : "Semua tahun ajaran"}
        </p>
      </div>

      {/* Filters */}
      <form className="flex flex-wrap gap-3">
        <div className="relative">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            name="q"
            type="text"
            defaultValue={searchQuery}
            placeholder="Cari nama siswa..."
            className="pl-9 pr-4 py-2 border border-border rounded-md text-sm w-56 focus:outline-none focus:ring-1 focus:ring-tertiary"
          />
        </div>
        <select
          name="status"
          defaultValue={filterStatus ?? "all"}
          className="border border-border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-tertiary"
        >
          <option value="all">Semua Status</option>
          {Object.entries(STATUS_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
        <button type="submit" className="px-4 py-2 bg-tertiary text-white text-sm rounded-md hover:bg-tertiary/90 transition-colors">
          Filter
        </button>
      </form>

      {/* Table */}
      <div className="bg-surface rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-500 uppercase bg-neutral/50 border-b border-border">
            <tr>
              <th className="px-5 py-3 font-semibold">No. Daftar</th>
              <th className="px-5 py-3 font-semibold">Nama Siswa</th>
              <th className="px-5 py-3 font-semibold">Tanggal Daftar</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {registrations.map((reg) => (
              <tr key={reg.id} className="hover:bg-neutral/30 transition-colors">
                <td className="px-5 py-3 font-mono text-xs font-medium text-primary">
                  {reg.registrationNumber}
                </td>
                <td className="px-5 py-3 font-medium text-primary">
                  {reg.studentData?.fullName ?? (
                    <span className="text-gray-400 italic">Belum diisi</span>
                  )}
                </td>
                <td className="px-5 py-3 text-gray-500">
                  {new Date(reg.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="px-5 py-3">{STATUS_BADGE[reg.status]}</td>
                <td className="px-5 py-3 text-right">
                  <Link
                    href={`/unit/ppdb-registrations/${reg.id}`}
                    className="text-tertiary text-xs font-semibold hover:underline"
                  >
                    Detail
                  </Link>
                </td>
              </tr>
            ))}
            {registrations.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-gray-400">
                  <Icon name="inbox" className="text-4xl text-gray-200 mb-2 block mx-auto" />
                  Tidak ada data pendaftaran.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
