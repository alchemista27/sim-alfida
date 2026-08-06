import React from "react";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";

export default async function AdminUsersPage() {
  await requireRole([UserRole.super_admin]);

  const users = await prisma.user.findMany({
    include: {
      roles: {
        include: {
          unit: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50, // simple pagination placeholder
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-primary">
            Manajemen Pengguna
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Kelola akses dan role seluruh pengguna di ekosistem SIM-Alfida.
          </p>
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="relative max-w-sm flex-1">
          <Icon
            name="search"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Cari email atau nama pengguna..."
            className="w-full pl-10 pr-4 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-tertiary"
          />
        </div>
      </div>

      <div className="overflow-x-auto bg-surface rounded-xl border border-border">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-500 uppercase bg-neutral/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 font-semibold">Nama Lengkap</th>
              <th className="px-6 py-4 font-semibold">Email</th>
              <th className="px-6 py-4 font-semibold">Role & Akses</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-neutral/30 transition-colors">
                <td className="px-6 py-4 font-medium text-primary">
                  {u.fullName}
                </td>
                <td className="px-6 py-4">{u.email}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {u.roles.length === 0 ? (
                      <span className="text-xs text-gray-400">Default (Orang Tua)</span>
                    ) : (
                      u.roles.map((r) => (
                        <Badge key={r.id} variant={r.role === "super_admin" ? "red" : "teal"}>
                          {r.role} {r.unit ? `(${r.unit.name})` : ""}
                        </Badge>
                      ))
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {u.isActive ? (
                    <Badge className="bg-green-100 text-green-700">Aktif</Badge>
                  ) : (
                    <Badge variant="gray">Nonaktif</Badge>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-tertiary hover:underline text-xs font-semibold">
                    Edit Akses
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
