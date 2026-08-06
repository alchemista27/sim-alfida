import React from "react";
import { StatCard } from "@/components/admin/stat-card";
import { UnitTable, UnitTableRow } from "@/components/admin/unit-table";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  // Protect route
  await requireRole([UserRole.super_admin]);

  // Fetch stats
  const totalUnits = await prisma.unit.count();
  const totalUsers = await prisma.user.count();
  const ppdbActiveUnitsCount = await prisma.academicYear.count({
    where: { ppdbActive: true },
  });

  // Calculate registrations this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const newRegistrations = await prisma.registration.count({
    where: {
      createdAt: {
        gte: startOfMonth,
      },
    },
  });

  // Fetch unit list for table
  const unitsRaw = await prisma.unit.findMany({
    include: {
      academicYears: {
        where: { ppdbActive: true },
        take: 1,
      },
      userRoles: {
        where: { role: UserRole.admin_unit },
        include: {
          user: true,
        },
        take: 1, // just picking one admin for summary
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const unitsData: UnitTableRow[] = unitsRaw.map((u) => {
    const activeAY = u.academicYears[0];
    return {
      id: u.id,
      name: u.name,
      level: u.level,
      isActive: u.isActive,
      quota: activeAY?.quota || 0,
      registered: activeAY?.registered || 0,
      ppdbActive: !!activeAY,
      adminName: u.userRoles[0]?.user.fullName || null,
    };
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading font-bold text-2xl text-primary">
          Dashboard Super Admin
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Ringkasan performa dan data Yayasan Alfida.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Unit"
          value={totalUnits}
          icon="domain"
        />
        <StatCard
          title="Total Pengguna"
          value={totalUsers}
          icon="group"
          trend="+12% dari bulan lalu"
          trendUp={true}
        />
        <StatCard
          title="PPDB Aktif"
          value={`${ppdbActiveUnitsCount} Unit`}
          icon="how_to_reg"
        />
        <StatCard
          title="Pendaftar Bulan Ini"
          value={newRegistrations}
          icon="person_add"
          trend="+5 pendaftar baru"
          trendUp={true}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-bold text-xl text-primary">
            Daftar Unit Pendidikan
          </h2>
        </div>
        <UnitTable data={unitsData} />
      </div>
    </div>
  );
}
