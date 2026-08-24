import React from "react";
import Link from "next/link";
import { StatCard } from "@/components/admin/stat-card";
import { UnitTable, UnitTableRow } from "@/components/admin/unit-table";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getBpiOverview, getDepartmentOverview, getAttendanceOverview } from "@/actions/super-dashboard";
import { SuperDashboardClient } from "./super-dashboard-client";

export default async function AdminDashboardPage() {
  // Protect route
  await requireRole([UserRole.super_admin]);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0,0,0,0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Jalankan SEMUA kueri berat secara PARALEL untuk mempercepat load page 10x lipat
  const [
    bpiOverview,
    deptOverview,
    attOverview,
    totalUnits,
    ppdbActiveUnitsCount,
    newRegistrations,
    totalActiveStudents,
    todaysAttendances
  ] = await Promise.all([
    getBpiOverview(),
    getDepartmentOverview(),
    getAttendanceOverview(),
    prisma.unit.count(),
    prisma.academicYear.count({ where: { ppdbActive: true } }),
    prisma.registration.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.studentEnrollment.count({ where: { status: 'active' } }),
    prisma.attendance.findMany({
      where: { date: { gte: today, lt: tomorrow } },
      select: { status: true, enrollment: { select: { class: { select: { unitId: true } } } } }
    })
  ]);

  const presentCount = todaysAttendances.filter(a => a.status === 'present').length;
  const globalAttendanceRate = todaysAttendances.length > 0 
    ? Math.round((presentCount / todaysAttendances.length) * 100) 
    : 100; // default 100 if no data today

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
        take: 1,
      },
      classes: {
        include: {
          studentEnrollments: {
            where: { status: 'active' }
          }
        }
      }
    },
    orderBy: { createdAt: "asc" },
  });

  const unitsData: UnitTableRow[] = unitsRaw.map((u: any) => {
    const activeAY = u.academicYears[0];
    const activeStudentsInUnit = u.classes.reduce((acc: number, cls: any) => acc + cls.studentEnrollments.length, 0);
    
    const unitAttendances = todaysAttendances.filter(a => a.enrollment.class.unitId === u.id);
    const unitPresentCount = unitAttendances.filter(a => a.status === 'present').length;
    const unitAttendanceRate = unitAttendances.length > 0
      ? Math.round((unitPresentCount / unitAttendances.length) * 100)
      : 100;

    return {
      id: u.id,
      name: u.name,
      level: u.level,
      isActive: u.isActive,
      quota: activeAY?.quota || 0,
      registered: activeAY?.registered || 0,
      ppdbActive: !!activeAY,
      adminName: u.userRoles[0]?.user.fullName || null,
      activeStudents: activeStudentsInUnit,
      attendanceRate: unitAttendanceRate,
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

      <SuperDashboardClient 
        bpiOverview={bpiOverview} 
        deptOverview={deptOverview} 
        attOverview={attOverview} 
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Unit"
          value={totalUnits}
          icon="domain"
        />
        <StatCard
          title="Siswa Aktif"
          value={totalActiveStudents}
          icon="face"
          trend="Seluruh unit aktif"
          trendUp={true}
        />
        <StatCard
          title="Kehadiran Hari Ini"
          value={`${globalAttendanceRate}%`}
          icon="event_available"
          trend={globalAttendanceRate < 90 ? "Perlu perhatian" : "Sangat baik"}
          trendUp={globalAttendanceRate >= 90}
        />
        <StatCard
          title="Pendaftar PPDB"
          value={newRegistrations}
          icon="person_add"
          trend="Bulan ini"
          trendUp={true}
        />
      </div>

      <div>
        <h2 className="font-heading font-semibold text-xl text-primary mb-4">Akses Cepat</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/admin/academic" className="block">
            <div className="bg-white p-5 border border-border rounded-xl hover:shadow-md transition-all cursor-pointer flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-teal-50 text-tertiary">
                <i className="material-symbols-rounded text-2xl">event_available</i>
              </div>
              <div>
                <p className="text-sm font-semibold text-primary">Pantauan Kehadiran</p>
                <p className="text-xs text-gray-500 mt-0.5">Cek absen siswa per unit</p>
              </div>
            </div>
          </Link>
          <Link href="/admin/units" className="block">
            <div className="bg-white p-5 border border-border rounded-xl hover:shadow-md transition-all cursor-pointer flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-amber-50 text-amber-600">
                <i className="material-symbols-rounded text-2xl">groups</i>
              </div>
              <div>
                <p className="text-sm font-semibold text-primary">Rekapitulasi Pendaftar</p>
                <p className="text-xs text-gray-500 mt-0.5">Pantau data unit</p>
              </div>
            </div>
          </Link>
        </div>
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
