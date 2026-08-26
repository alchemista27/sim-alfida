import React from "react";
import { UnitForm } from "@/components/admin/unit-form";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@/generated/client";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";

export default async function AdminNewUnitPage() {
  await requireRole([UserRole.super_admin]);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/admin/units" className="hover:text-tertiary">
          Unit Pendidikan
        </Link>
        <Icon name="chevron_right" className="text-xs" />
        <span className="text-primary font-medium">Tambah Unit Baru</span>
      </div>

      <div>
        <h1 className="font-heading font-bold text-2xl text-primary">
          Tambah Unit Pendidikan
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Masukkan informasi dasar untuk unit pendidikan baru.
        </p>
      </div>

      <Card className="p-6 border-border shadow-sm">
        <UnitForm />
      </Card>
    </div>
  );
}
