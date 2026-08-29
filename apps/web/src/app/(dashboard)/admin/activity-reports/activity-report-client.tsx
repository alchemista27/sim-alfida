"use client";

import React, { useState } from "react";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { createActivityReport } from "@/actions/activity-reports";
import { useRouter } from "next/navigation";
import { ReportType } from "@sim/database";

type Department = { id: string; name: string };

type Report = {
  id: string;
  departmentId: string;
  type: ReportType;
  periodStart: Date;
  periodEnd: Date;
  content: string;
  attachmentUrl: string | null;
  submittedById: string;
  createdAt: Date;
  updatedAt: Date | null;
  department: { name: string };
  submittedBy: { fullName: string };
};

export default function ActivityReportClient({
  initialReports,
  departments,
}: {
  initialReports: Report[];
  departments: Department[];
}) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      departmentId: formData.get("departmentId") as string,
      type: formData.get("type") as ReportType,
      periodStart: new Date(formData.get("periodStart") as string),
      periodEnd: new Date(formData.get("periodEnd") as string),
      content: formData.get("content") as string,
      attachmentUrl: (formData.get("attachmentUrl") as string) || undefined,
    };

    try {
      await createActivityReport(data);
      setIsModalOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to create report");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 bg-surface p-4 rounded-xl border border-border shadow-sm">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-lg text-primary">Daftar Laporan</h2>
        <Button onClick={() => setIsModalOpen(true)}>+ Buat Laporan</Button>
      </div>

      <Table>
        <Thead>
          <Tr>
            <Th>Periode</Th>
            <Th>Tipe</Th>
            <Th>Departemen</Th>
            <Th>Pembuat Laporan</Th>
            <Th>Aksi</Th>
          </Tr>
        </Thead>
        <Tbody>
          {initialReports.length === 0 ? (
            <Tr>
              <Td colSpan={5} className="text-center py-4 text-gray-500">
                Belum ada laporan
              </Td>
            </Tr>
          ) : (
            initialReports.map((report) => (
              <Tr key={report.id}>
                <Td>
                  {new Date(report.periodStart).toLocaleDateString("id-ID")} -{" "}
                  {new Date(report.periodEnd).toLocaleDateString("id-ID")}
                </Td>
                <Td className="capitalize">{report.type}</Td>
                <Td>{report.department.name}</Td>
                <Td>{report.submittedBy.fullName}</Td>
                <Td>
                  <Button variant="outline" size="sm" onClick={() => alert(report.content)}>
                    Baca Detail
                  </Button>
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Buat Laporan Aktivitas">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-semibold text-primary">
              Departemen <span className="text-red-500">*</span>
            </label>
            <select
              name="departmentId"
              required
              className="w-full px-3 py-2 text-sm bg-surface border border-border rounded text-primary focus:outline-none focus:border-secondary transition-colors"
            >
              <option value="">Pilih Departemen</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-semibold text-primary">
              Tipe <span className="text-red-500">*</span>
            </label>
            <select
              name="type"
              required
              className="w-full px-3 py-2 text-sm bg-surface border border-border rounded text-primary focus:outline-none focus:border-secondary transition-colors"
            >
              <option value="weekly">Mingguan</option>
              <option value="monthly">Bulanan</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Periode Awal" name="periodStart" type="date" required />
            <Input label="Periode Akhir" name="periodEnd" type="date" required />
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-semibold text-primary">
              Isi Laporan / Evaluasi <span className="text-red-500">*</span>
            </label>
            <textarea
              name="content"
              required
              rows={4}
              className="w-full px-3 py-2 text-sm bg-surface border border-border rounded text-primary focus:outline-none focus:border-secondary transition-colors"
            ></textarea>
          </div>

          <Input label="Lampiran URL (Opsional)" name="attachmentUrl" type="url" />

          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
