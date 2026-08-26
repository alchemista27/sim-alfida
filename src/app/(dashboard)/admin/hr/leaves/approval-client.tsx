"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LeaveStatus, LeaveType } from "@/generated/client";
import { approveLeaveRequest, rejectLeaveRequest } from "@/actions/leave-approval";
import { useRouter } from "next/navigation";
import { Prisma } from "@/generated/client";

type LeaveRequestWithUser = Prisma.LeaveRequestGetPayload<{
  include: {
    user: {
      select: {
        fullName: true;
        leaveQuota: true;
      };
    };
  };
}>;

interface ApprovalClientProps {
  initialLeaves: LeaveRequestWithUser[];
}

export function ApprovalClient({ initialLeaves }: ApprovalClientProps) {
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();

  const pendingLeaves = initialLeaves.filter(
    (leave) => leave.status === LeaveStatus.pending
  );
  const historyLeaves = initialLeaves.filter(
    (leave) => leave.status !== LeaveStatus.pending
  );

  const handleApprove = async (leave: LeaveRequestWithUser) => {
    const days =
      Math.ceil(
        (new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) /
          (1000 * 3600 * 24)
      ) + 1;

    if (leave.type === LeaveType.cuti) {
      if (
        !window.confirm(
          `Menyetujui cuti ini akan memotong sisa kuota cuti karyawan sebanyak ${days} hari. Lanjutkan?`
        )
      ) {
        return;
      }
    }

    try {
      setLoadingId(leave.id);
      await approveLeaveRequest(leave.id);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to approve leave request");
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (leave: LeaveRequestWithUser) => {
    if (!window.confirm("Tolak pengajuan ini?")) return;

    try {
      setLoadingId(leave.id);
      await rejectLeaveRequest(leave.id);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to reject leave request");
    } finally {
      setLoadingId(null);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
    }).format(new Date(date));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-heading">Persetujuan Cuti</h1>
        <div className="space-x-2 flex">
          <Button
            variant={activeTab === "pending" ? "primary" : "outline"}
            onClick={() => setActiveTab("pending")}
          >
            Pending Requests
          </Button>
          <Button
            variant={activeTab === "history" ? "primary" : "outline"}
            onClick={() => setActiveTab("history")}
          >
            Approval History
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {activeTab === "pending" ? "Pending Requests" : "Approval History"}
          </CardTitle>
        </CardHeader>
        <div className="mt-4">
          <Table>
            <Thead>
              <Tr>
                <Th>Karyawan</Th>
                <Th>Sisa Kuota</Th>
                <Th>Tanggal Pengajuan</Th>
                <Th>Rentang</Th>
                <Th>Tipe</Th>
                <Th>Alasan</Th>
                <Th>Bukti</Th>
                <Th>Aksi</Th>
              </Tr>
            </Thead>
            <Tbody>
              {(activeTab === "pending" ? pendingLeaves : historyLeaves).map(
                (leave) => (
                  <Tr key={leave.id}>
                    <Td>{leave.user.fullName}</Td>
                    <Td>{leave.user.leaveQuota} hari</Td>
                    <Td>{formatDate(leave.createdAt)}</Td>
                    <Td>
                      {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                    </Td>
                    <Td>
                      <Badge variant="gray" className="uppercase">
                        {leave.type}
                      </Badge>
                    </Td>
                    <Td>{leave.reason}</Td>
                    <Td>
                      {leave.attachmentUrl ? (
                        <a
                          href={leave.attachmentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Lihat Bukti
                        </a>
                      ) : (
                        "-"
                      )}
                    </Td>
                    <Td>
                      {activeTab === "pending" ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleApprove(leave)}
                            disabled={loadingId === leave.id}
                          >
                            Setujui
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleReject(leave)}
                            disabled={loadingId === leave.id}
                          >
                            Tolak
                          </Button>
                        </div>
                      ) : (
                        <Badge
                          variant={
                            leave.status === LeaveStatus.approved
                              ? "green"
                              : "red"
                          }
                          className="uppercase"
                        >
                          {leave.status}
                        </Badge>
                      )}
                    </Td>
                  </Tr>
                )
              )}
              {(activeTab === "pending" ? pendingLeaves : historyLeaves).length ===
                0 && (
                <Tr>
                  <Td colSpan={8} className="text-center py-4">
                    Tidak ada data.
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
