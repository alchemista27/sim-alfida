import React from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { StatCard } from "@/components/admin/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { requireRole } from "@/lib/auth-guard";
import { resolveUnitId } from "@/lib/unit-context";
import { prisma } from "@/lib/prisma";
import { UserRole, RegistrationStatus } from "@prisma/client";

interface ShortcutCardProps {
  title: string;
  icon: string;
  count: number;
  countLabel: string;
  href: string;
  urgent?: boolean;
}

function ShortcutCard({ title, icon, count, countLabel, href, urgent }: ShortcutCardProps) {
  return (
    <Link href={href} className="block">
      <Card className={`p-5 border hover:shadow-md transition-all cursor-pointer ${urgent && count > 0 ? "border-amber-300 bg-amber-50/50" : "border-border"}`}>
        <div className="flex items-center gap-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${urgent && count > 0 ? "bg-amber-100 text-amber-600" : "bg-teal-50 text-tertiary"}`}>
            <Icon name={icon} className="text-2xl" />
          </div>
          <div>
            <p className="text-sm font-semibold text-primary">{title}</p>
            <p className={`text-xs mt-0.5 ${urgent && count > 0 ? "text-amber-600 font-bold" : "text-gray-500"}`}>
              {count} {countLabel}
            </p>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default async function UnitDashboardPage() {
  await requireRole([UserRole.admin_unit, UserRole.super_admin]);
  const unitId = await resolveUnitId();

  const unit = await prisma.unit.findUnique({
    where: { id: unitId },
    include: {
      academicYears: { where: { ppdbActive: true }, take: 1 },
    },
  });

  const activeAY = unit?.academicYears[0];

  // Aggregated stats scoped to this unit
  const whereRegistrations = activeAY
    ? { academicYearId: activeAY.id }
    : { academicYear: { unitId } };

  const [totalRegistrations, pendingPayment, filesVerified, accepted] = await Promise.all([
    prisma.registration.count({ where: whereRegistrations }),
    prisma.registration.count({
      where: { ...whereRegistrations, status: RegistrationStatus.pending_payment },
    }),
    prisma.registration.count({
      where: {
        ...whereRegistrations,
        status: { in: [RegistrationStatus.observation_scheduled, RegistrationStatus.observation_done, RegistrationStatus.accepted, RegistrationStatus.enrolled] },
      },
    }),
    prisma.registration.count({
      where: { ...whereRegistrations, status: RegistrationStatus.accepted },
    }),
  ]);

  const pendingPaymentUploaded = await prisma.registration.count({
    where: { ...whereRegistrations, status: RegistrationStatus.payment_uploaded },
  });
  const pendingVerification = await prisma.registration.count({
    where: { ...whereRegistrations, status: RegistrationStatus.verification },
  });

  const quota = activeAY?.quota ?? 0;
  const registered = activeAY?.registered ?? totalRegistrations;
  const progressPct = quota > 0 ? Math.round((registered / quota) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs text-tertiary font-semibold uppercase tracking-wider mb-1">Admin Unit</p>
        <h1 className="font-heading font-bold text-2xl text-primary">
          {unit?.name ?? "Dashboard Unit"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {activeAY
            ? `Tahun Ajaran ${activeAY.name} · PPDB Aktif`
            : "Belum ada tahun ajaran aktif"}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Pendaftar" value={totalRegistrations} icon="how_to_reg" />
        <StatCard
          title="Pending Bayar"
          value={pendingPayment}
          icon="schedule"
          trend={pendingPayment > 0 ? "Perlu tindakan" : undefined}
          trendUp={false}
        />
        <StatCard title="Berkas Diverifikasi" value={filesVerified} icon="verified" />
        <StatCard title="Diterima" value={accepted} icon="check_circle" />
      </div>

      {/* PPDB Quota Progress */}
      {activeAY && (
        <Card className="p-6 border-border shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading font-semibold text-primary">Progress PPDB {activeAY.name}</h2>
            <Badge variant={progressPct >= 90 ? "red" : progressPct >= 60 ? "amber" : "teal"}>
              {progressPct}% terisi
            </Badge>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-tertiary to-secondary transition-all duration-500"
              style={{ width: `${Math.min(progressPct, 100)}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            <span className="font-bold text-primary">{registered}</span> dari{" "}
            <span className="font-bold text-primary">{quota}</span> kuota terisi
          </p>
        </Card>
      )}

      {/* Shortcut Cards */}
      <div>
        <h2 className="font-heading font-semibold text-xl text-primary mb-4">Akses Cepat</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ShortcutCard
            title="Verifikasi Pembayaran"
            icon="receipt_long"
            count={pendingPaymentUploaded}
            countLabel="menunggu verifikasi"
            href="/unit/ppdb-payments"
            urgent={true}
          />
          <ShortcutCard
            title="Verifikasi Berkas"
            icon="folder_open"
            count={pendingVerification}
            countLabel="menunggu verifikasi"
            href="/unit/ppdb-verification"
            urgent={true}
          />
          <ShortcutCard
            title="Jadwal Observasi"
            icon="event_note"
            count={0}
            countLabel="jadwal tersedia"
            href="/unit/ppdb-observations"
          />
          <ShortcutCard
            title="Penempatan Kelas"
            icon="class"
            count={accepted}
            countLabel="siap di-assign"
            href="/unit/ppdb-classes"
          />
        </div>
      </div>
    </div>
  );
}
