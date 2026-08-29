import React from "react";
import { UnitForm } from "@/components/admin/unit-form";
import { AssignAdminModal } from "@/components/admin/assign-admin-modal";
import { RemoveAdminButton } from "@/components/admin/remove-admin-button";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@sim/database";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function AdminUnitDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireRole([UserRole.super_admin]);

  const unit = await prisma.unit.findUnique({
    where: { id },
    include: {
      unitSettings: true,
      userRoles: {
        where: { role: UserRole.admin_unit },
        include: { user: true },
      },
    },
  });

  if (!unit) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href="/admin/units" className="hover:text-tertiary">
          Unit Pendidikan
        </Link>
        <Icon name="chevron_right" className="text-xs" />
        <span className="text-primary font-medium">{unit.name}</span>
      </div>

      <div>
        <h1 className="font-heading font-bold text-2xl text-primary">
          Detail & Pengaturan Unit
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Kelola informasi, pengaturan, dan admin untuk unit pendidikan ini.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Column - 60% */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="p-6 border-border shadow-sm">
            <h2 className="text-lg font-bold text-primary mb-4 border-b border-border pb-2">
              Informasi Unit
            </h2>
            <UnitForm initialData={unit} />
          </Card>
        </div>

        {/* Right Column - 40% */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 border-border shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
              <h2 className="text-lg font-bold text-primary">Admin Unit</h2>
              <AssignAdminModal unitId={unit.id} />
            </div>

            <div className="space-y-3">
              {unit.userRoles.length === 0 ? (
                <div className="text-sm text-gray-500 italic text-center py-4 bg-neutral/50 rounded border border-dashed border-gray-300">
                  Belum ada admin yang ditugaskan
                </div>
              ) : (
                unit.userRoles.map((assignment) => (
                  <div
                    key={assignment.userId}
                    className="flex items-center justify-between p-3 border border-border rounded-lg bg-white"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                        {assignment.user.fullName.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-primary">
                          {assignment.user.fullName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {assignment.user.email}
                        </div>
                      </div>
                    </div>
                    <RemoveAdminButton userId={assignment.userId} unitId={unit.id} />
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="p-6 border-border shadow-sm">
            <h2 className="text-lg font-bold text-primary mb-4 border-b border-border pb-2">
              Settings Unit
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo Unit
                </label>
                <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 bg-neutral/30 hover:bg-neutral/50 transition-colors cursor-pointer">
                  <Icon name="photo_camera" className="text-3xl mb-2" />
                  <span className="text-xs font-medium">Klik untuk upload logo</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Kepala Sekolah
                </label>
                <input
                  type="text"
                  readOnly
                  value={unit.unitSettings?.principalName || ""}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-gray-50 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NIP Kepala Sekolah
                </label>
                <input
                  type="text"
                  readOnly
                  value={unit.unitSettings?.principalNip || ""}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-gray-50 text-gray-600"
                  placeholder="Belum diatur"
                />
              </div>

              <div className="pt-2">
                <Button variant="outline" className="w-full text-xs">
                  <Icon name="open_in_new" className="mr-2 text-sm" />
                  Buka Halaman Settings (Admin Unit)
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
