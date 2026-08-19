"use client";

import React, { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { upsertDepartment, assignDepartmentAdmin } from "@/actions/departments";

type Department = any;
type Unit = any;
type User = any;

interface DepartmentClientProps {
  departments: Department[];
  units: Unit[];
  users: User[];
}

export function DepartmentClient({ departments, units, users }: DepartmentClientProps) {
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleDeptSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      unitId: (formData.get("unitId") as string) || null,
      isActive: formData.get("isActive") === "true",
    };

    startTransition(async () => {
      await upsertDepartment(data);
      setIsDeptModalOpen(false);
    });
  };

  const handleAdminSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedDeptId) return;
    
    const formData = new FormData(e.currentTarget);
    const userId = formData.get("userId") as string;

    startTransition(async () => {
      await assignDepartmentAdmin({ departmentId: selectedDeptId, userId });
      setIsAdminModalOpen(false);
      setSelectedDeptId(null);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative max-w-sm w-full">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari bidang..."
            className="w-full pl-10 pr-4 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-tertiary"
          />
        </div>
        <Button onClick={() => setIsDeptModalOpen(true)} variant="primary">
          <Icon name="add" className="mr-2" /> Tambah Bidang
        </Button>
      </div>

      <div className="bg-surface rounded-xl border border-border">
        <Table>
          <Thead>
            <Tr>
              <Th>Nama</Th>
              <Th>Deskripsi</Th>
              <Th>Unit</Th>
              <Th>Status</Th>
              <Th>Admins</Th>
              <Th className="text-right">Aksi</Th>
            </Tr>
          </Thead>
          <Tbody>
            {departments.map((dept) => (
              <Tr key={dept.id}>
                <Td className="font-medium text-primary">{dept.name}</Td>
                <Td className="text-gray-500">{dept.description || "-"}</Td>
                <Td>{dept.unit?.name || "-"}</Td>
                <Td>
                  {dept.isActive ? (
                    <Badge variant="teal">Aktif</Badge>
                  ) : (
                    <Badge variant="gray">Nonaktif</Badge>
                  )}
                </Td>
                <Td>
                  {dept.admins?.length > 0 ? (
                    <div className="flex flex-col gap-1">
                      {dept.admins.map((a: any) => (
                        <span key={a.userId} className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {a.user.fullName}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">-</span>
                  )}
                </Td>
                <Td className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedDeptId(dept.id);
                      setIsAdminModalOpen(true);
                    }}
                  >
                    <Icon name="person_add" className="mr-1" /> Assign Admin
                  </Button>
                </Td>
              </Tr>
            ))}
            {departments.length === 0 && (
              <Tr>
                <Td colSpan={6} className="text-center py-8 text-gray-500">
                  Belum ada data bidang.
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </div>

      <Modal
        isOpen={isDeptModalOpen}
        onClose={() => setIsDeptModalOpen(false)}
        title="Tambah Bidang"
      >
        <form onSubmit={handleDeptSubmit} className="space-y-4">
          <Input label="Nama Bidang" name="name" required />
          <Input label="Deskripsi" name="description" />
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-primary">Unit (Opsional)</label>
            <select
              name="unitId"
              className="w-full px-3 py-2 text-sm bg-surface border border-border rounded focus:outline-none focus:border-secondary"
            >
              <option value="">Pilih Unit...</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-primary">Status</label>
            <select
              name="isActive"
              className="w-full px-3 py-2 text-sm bg-surface border border-border rounded focus:outline-none focus:border-secondary"
            >
              <option value="true">Aktif</option>
              <option value="false">Nonaktif</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setIsDeptModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isAdminModalOpen}
        onClose={() => {
          setIsAdminModalOpen(false);
          setSelectedDeptId(null);
        }}
        title="Assign Admin Bidang"
      >
        <form onSubmit={handleAdminSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-primary">Pilih Pengguna</label>
            <select
              name="userId"
              required
              className="w-full px-3 py-2 text-sm bg-surface border border-border rounded focus:outline-none focus:border-secondary"
            >
              <option value="">Pilih pengguna...</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullName} ({u.email})
                </option>
              ))}
            </select>
          </div>
          
          <div className="pt-4 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsAdminModalOpen(false);
                setSelectedDeptId(null);
              }}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Menyimpan..." : "Assign"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
