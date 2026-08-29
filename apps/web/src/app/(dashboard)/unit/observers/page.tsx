import React from "react";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@sim/database";
import { getTeachersWithObserverStatus } from "@/actions/unit-observers";
import { ObserverAssignmentClient } from "@/components/unit/observer-assignment-client";

export default async function AssignObserverPage() {
  await requireRole([UserRole.admin_unit]);
  
  const teachers = await getTeachersWithObserverStatus();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-tertiary font-semibold uppercase tracking-wider mb-1">
          Manajemen PPDB
        </p>
        <h1 className="font-heading font-bold text-2xl text-primary">Assign Observer</h1>
        <p className="text-sm text-gray-500 mt-1">
          Tentukan guru mana saja yang bertugas sebagai tim Observer / Penilai pada tes wawancara PPDB.
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
        <ObserverAssignmentClient initialTeachers={teachers} />
      </div>
    </div>
  );
}
