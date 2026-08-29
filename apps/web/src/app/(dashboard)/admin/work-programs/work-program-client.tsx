"use client";

import React, { useState } from "react";
import type {  WorkProgramStatus  } from "@sim/database";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { createWorkProgram, updateWorkProgramStatus } from "@/actions/work-programs";
import { useRouter } from "next/navigation";

type WorkProgram = {
  id: string;
  title: string;
  description: string | null;
  targetDate: Date | null;
  status: WorkProgramStatus;
  department: { name: string };
  user: { fullName: string } | null;
};

type Department = {
  id: string;
  name: string;
};

export function WorkProgramClient({
  initialWorkPrograms,
  departments,
}: {
  initialWorkPrograms: WorkProgram[];
  departments: Department[];
}) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const departmentId = formData.get("departmentId") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const targetDateStr = formData.get("targetDate") as string;

    try {
      await createWorkProgram({
        departmentId,
        title,
        description,
        targetDate: targetDateStr ? new Date(targetDateStr) : undefined,
        status: "planned",
      });
      setIsModalOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to create work program", error);
      alert("Gagal menambahkan proker");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStatusChange(id: string, newStatus: WorkProgramStatus) {
    try {
      await updateWorkProgramStatus(id, newStatus);
      router.refresh();
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Gagal mengubah status");
    }
  }

  function getStatusBadge(status: WorkProgramStatus) {
    switch (status) {
      case "planned":
        return <Badge variant="gray">Planned</Badge>;
      case "ongoing":
        return <Badge variant="blue">Ongoing</Badge>;
      case "completed":
        return <Badge variant="green">Completed</Badge>;
      default:
        return <Badge variant="gray">{status}</Badge>;
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsModalOpen(true)}>+ Tambah Proker</Button>
      </div>

      <Table>
        <Thead>
          <Tr>
            <Th>Judul</Th>
            <Th>Deskripsi</Th>
            <Th>Departemen</Th>
            <Th>Target Selesai</Th>
            <Th>Status</Th>
            <Th>Aksi</Th>
          </Tr>
        </Thead>
        <Tbody>
          {initialWorkPrograms.length === 0 ? (
            <Tr>
              <Td colSpan={6} className="text-center text-gray-500">
                Tidak ada data program kerja.
              </Td>
            </Tr>
          ) : (
            initialWorkPrograms.map((wp) => (
              <Tr key={wp.id}>
                <Td className="font-semibold">{wp.title}</Td>
                <Td className="max-w-xs truncate" title={wp.description || ""}>
                  {wp.description || "-"}
                </Td>
                <Td>{wp.department.name}</Td>
                <Td>
                  {wp.targetDate
                    ? new Intl.DateTimeFormat("id-ID", {
                        dateStyle: "medium",
                      }).format(new Date(wp.targetDate))
                    : "-"}
                </Td>
                <Td>{getStatusBadge(wp.status)}</Td>
                <Td>
                  <select
                    className="px-2 py-1 text-sm border border-border rounded bg-surface focus:outline-none focus:border-secondary"
                    value={wp.status}
                    onChange={(e) =>
                      handleStatusChange(wp.id, e.target.value as WorkProgramStatus)
                    }
                  >
                    <option value={"planned"}>Planned</option>
                    <option value={"ongoing"}>Ongoing</option>
                    <option value={"completed"}>Completed</option>
                  </select>
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah Program Kerja"
      >
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="departmentId" className="text-sm font-semibold text-primary">
              Departemen <span className="text-red-500">*</span>
            </label>
            <select
              name="departmentId"
              id="departmentId"
              required
              className="w-full px-3 py-2 text-sm bg-surface border border-border rounded text-primary focus:outline-none focus:border-secondary transition-colors"
            >
              <option value="">Pilih Departemen</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          
          <Input name="title" label="Judul" required placeholder="Judul Proker" />
          
          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className="text-sm font-semibold text-primary">
              Deskripsi
            </label>
            <textarea
              name="description"
              id="description"
              rows={3}
              placeholder="Deskripsi singkat..."
              className="w-full px-3 py-2 text-sm bg-surface border border-border rounded text-primary placeholder:text-gray-400 focus:outline-none focus:border-secondary transition-colors resize-none"
            />
          </div>
          
          <Input
            name="targetDate"
            type="date"
            label="Target Selesai"
          />

          <div className="flex justify-end gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
