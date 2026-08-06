import React from "react";
import { UnitTable, UnitTableRow } from "@/components/admin/unit-table";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import Link from "next/link";

export default async function AdminUnitsPage() {
  await requireRole([UserRole.super_admin]);

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-primary">
            Kelola Unit Pendidikan
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Daftar unit pendidikan yang berada di bawah naungan Yayasan Alfida.
          </p>
        </div>
        <Link href="/admin/units/new" passHref>
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
          <option value="">Semua Jenjang</option>
          <option value="tk">TK</option>
          <option value="sd">SD</option>
          <option value="smp">SMP</option>
          <option value="sma">SMA</option>
          <option value="pesantren">Pesantren</option>
        </select>
      </div>

      <UnitTable data={unitsData} />
    </div>
  );
}
