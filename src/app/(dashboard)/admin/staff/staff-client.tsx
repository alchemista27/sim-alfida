"use client";

import React, { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { assignStaffToUnit, createStaffUser } from "@/actions/staff";
import { UserRole } from "@/generated/client";
import { Input } from "@/components/ui/input";

type User = any;
type Unit = any;

interface StaffClientProps {
  staff: User[];
  allUsers: User[];
  units: Unit[];
}

export function StaffClient({ staff, allUsers, units }: StaffClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleAssignSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      userId: formData.get("userId") as string,
      unitId: formData.get("unitId") as string,
      role: formData.get("role") as "guru" | "karyawan",
    };

    startTransition(async () => {
      await assignStaffToUnit(data);
      setIsModalOpen(false);
    });
  };

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      fullName: formData.get("fullName") as string,
      email: formData.get("email") as string,
      unitId: formData.get("unitId") as string,
      role: formData.get("role") as "guru" | "karyawan",
    };

    startTransition(async () => {
      try {
        await createStaffUser(data);
        setIsCreateModalOpen(false);
        alert("Pegawai berhasil ditambahkan dengan password default: Password123!");
      } catch (err: any) {
        alert(err.message || "Terjadi kesalahan");
      }
    });
  };

  // Only show staff that have specific roles, or show all with their assignments.
  // We'll show all from the staff array.
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative max-w-sm w-full">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari staf/guru..."
            className="w-full pl-10 pr-4 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-tertiary"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsCreateModalOpen(true)} variant="outline" className="bg-white">
            <Icon name="person_add" className="mr-2" /> Tambah Baru
          </Button>
          <Button onClick={() => setIsModalOpen(true)} variant="primary">
            <Icon name="add" className="mr-2" /> Assign Staf
          </Button>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border">
        <Table>
          <Thead>
            <Tr>
              <Th>Nama</Th>
              <Th>Email</Th>
              <Th>Penempatan (Roles)</Th>
            </Tr>
          </Thead>
          <Tbody>
            {staff.map((user) => (
              <Tr key={user.id}>
                <Td className="font-medium text-primary">{user.fullName}</Td>
                <Td className="text-gray-500">{user.email}</Td>
                <Td>
                  {user.roles && user.roles.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {user.roles.map((r: any) => (
                        <Badge key={r.id} variant="blue">
                          {r.role} {r.unit ? `- ${r.unit.name}` : ""}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">Belum ada penempatan</span>
                  )}
                </Td>
              </Tr>
            ))}
            {staff.length === 0 && (
              <Tr>
                <Td colSpan={3} className="text-center py-8 text-gray-500">
                  Belum ada data staf.
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Tambah Pegawai Baru"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-primary">Nama Lengkap</label>
            <Input name="fullName" required placeholder="Masukkan nama..." />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-primary">Email Akun (SSO)</label>
            <Input name="email" type="email" required placeholder="nama@pegawai.al-fida.org" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-primary">Pilih Unit</label>
            <select
              name="unitId"
              required
              defaultValue={units.length === 1 ? units[0].id : ""}
              className="w-full px-3 py-2 text-sm bg-surface border border-border rounded focus:outline-none focus:border-secondary"
            >
              {units.length > 1 && <option value="">Pilih unit...</option>}
              {units.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-primary">Role</label>
            <select
              name="role"
              required
              className="w-full px-3 py-2 text-sm bg-surface border border-border rounded focus:outline-none focus:border-secondary"
            >
              <option value="">Pilih role...</option>
              <option value="guru">Guru</option>
              <option value="karyawan">Karyawan</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : "Simpan & Buat Akun"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Assign Staf/Guru"
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-primary">Pilih Pengguna</label>
            <select
              name="userId"
              required
              className="w-full px-3 py-2 text-sm bg-surface border border-border rounded focus:outline-none focus:border-secondary"
            >
              <option value="">Pilih pengguna...</option>
              {allUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullName} ({u.email})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-primary">Pilih Unit</label>
            <select
              name="unitId"
              required
              defaultValue={units.length === 1 ? units[0].id : ""}
              className="w-full px-3 py-2 text-sm bg-surface border border-border rounded focus:outline-none focus:border-secondary"
            >
              {units.length > 1 && <option value="">Pilih unit...</option>}
              {units.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-primary">Role</label>
            <select
              name="role"
              required
              className="w-full px-3 py-2 text-sm bg-surface border border-border rounded focus:outline-none focus:border-secondary"
            >
              <option value="">Pilih role...</option>
              <option value="guru">Guru</option>
              <option value="karyawan">Karyawan</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
