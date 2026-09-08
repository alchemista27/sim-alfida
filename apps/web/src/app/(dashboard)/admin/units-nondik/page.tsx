import React from "react";
import { UnitTableRow } from "@/components/admin/unit-table";
import { UnitNondikTable } from "@/components/admin/unit-nondik-table";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@sim/database";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import Link from "next/link";

export default async function AdminUnitsNondikPage() {
  await requireRole([UserRole.super_admin]);

  const unitsRaw = await prisma.unit.findMany({
    where: {
      level: { in: ['kantor_yayasan', 'non_pendidikan'] }
    },
    include: {
      userRoles: {
        where: { role: UserRole.admin_unit_nondik },
        include: {
          user: true,
        },
        take: 1,
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const unitsData: UnitTableRow[] = unitsRaw.map((u) => {
    return {
      id: u.id,
      name: u.name,
      level: u.level,
      isActive: u.isActive,
      quota: 0,
      registered: 0,
      ppdbActive: false,
      adminName: u.userRoles[0]?.user.fullName || null,
      activeStudents: 0,
      attendanceRate: 100,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-primary">
            Kelola Unit Non-Pendidikan
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Daftar kantor yayasan dan unit usaha/non-pendidikan lainnya.
          </p>
        </div>
        <Link href="/admin/units-nondik/new" passHref>
          <Button variant="primary">
            <Icon name="add" className="mr-2" /> Tambah Unit
          </Button>
        </Link>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="relative max-w-sm flex-1">
          <Icon
            name="search"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Cari unit..."
            className="w-full pl-10 pr-4 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-tertiary"
          />
        </div>
        <select className="border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-tertiary bg-white">
          <option value="">Semua Jenis</option>
          <option value="kantor_yayasan">Kantor Yayasan</option>
          <option value="non_pendidikan">Unit Lainnya</option>
        </select>
      </div>

      <UnitNondikTable data={unitsData} />
    </div>
  );
}
