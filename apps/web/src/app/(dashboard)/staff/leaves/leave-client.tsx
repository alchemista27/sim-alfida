"use client";

import React, { useState } from "react";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type {  LeaveRequest, LeaveType, LeaveStatus  } from "@sim/database";
import { createLeaveRequest } from "@/actions/leave-request";

interface LeaveClientProps {
  initialData: LeaveRequest[];
}

export function LeaveClient({ initialData }: LeaveClientProps) {
  const [data, setData] = useState<LeaveRequest[]>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // form state
  const [type, setType] = useState<LeaveType>("cuti");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const result = await createLeaveRequest({
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        attachmentUrl: attachmentUrl || undefined,
      });
      
      if (result.success) {
        setIsModalOpen(false);
        window.location.reload();
      }
    } catch (err: any) {
      setError(err.message || "Gagal membuat pengajuan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: LeaveStatus) => {
    switch (status) {
      case "approved":
        return <Badge variant="green">Disetujui</Badge>;
      case "rejected":
        return <Badge variant="red">Ditolak</Badge>;
      default:
        return <Badge variant="orange">Pending</Badge>;
    }
  };

  const getTypeLabel = (type: LeaveType) => {
    switch (type) {
      case "cuti": return "Cuti";
      case "sakit": return "Sakit";
      case "izin": return "Izin";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Riwayat Pengajuan</CardTitle>
        <Button onClick={() => setIsModalOpen(true)} size="sm">
          + Buat Pengajuan
        </Button>
      </CardHeader>
      
      <Table>
        <Thead>
          <Tr>
            <Th>Tanggal Pengajuan</Th>
            <Th>Tipe</Th>
            <Th>Rentang Tanggal</Th>
            <Th>Alasan</Th>
            <Th>Lampiran</Th>
            <Th>Status</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.length === 0 ? (
            <Tr>
              <Td colSpan={6} className="text-center text-gray-500 py-4">Belum ada pengajuan</Td>
            </Tr>
          ) : (
            data.map((item) => (
              <Tr key={item.id}>
                <Td>{new Date(item.createdAt).toLocaleDateString("id-ID")}</Td>
                <Td>{getTypeLabel(item.type)}</Td>
                <Td>
                  {new Date(item.startDate).toLocaleDateString("id-ID")} -{" "}
                  {new Date(item.endDate).toLocaleDateString("id-ID")}
                </Td>
                <Td>{item.reason}</Td>
                <Td>
                  {item.attachmentUrl ? (
                    <a href={item.attachmentUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
                      Lihat Bukti
                    </a>
                  ) : (
                    "-"
                  )}
                </Td>
                <Td>{getStatusBadge(item.status)}</Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Buat Pengajuan">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <div className="text-red-500 text-sm">{error}</div>}
          
          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-semibold text-primary">Tipe Pengajuan <span className="text-red-500">*</span></label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as LeaveType)}
              className="w-full border border-border rounded px-3 py-2 bg-surface text-primary focus:outline-none focus:border-tertiary focus:ring-1 focus:ring-tertiary"
              required
            >
              <option value={"cuti"}>Cuti</option>
              <option value={"sakit"}>Sakit</option>
              <option value={"izin"}>Izin</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              label="Tanggal Mulai"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <Input
              type="date"
              label="Tanggal Selesai"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5 w-full">
            <label className="text-sm font-semibold text-primary">Alasan <span className="text-red-500">*</span></label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-border rounded px-3 py-2 bg-surface text-primary focus:outline-none focus:border-tertiary focus:ring-1 focus:ring-tertiary min-h-[80px]"
              required
              minLength={5}
            />
          </div>

          <Input
            type="url"
            label="Lampiran Bukti (Opsional / Wajib untuk Sakit)"
            placeholder="URL Gambar/PDF (Cloudinary)"
            value={attachmentUrl}
            onChange={(e) => setAttachmentUrl(e.target.value)}
            required={type === "sakit"}
          />

          <div className="flex justify-end gap-2 mt-4">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
}
