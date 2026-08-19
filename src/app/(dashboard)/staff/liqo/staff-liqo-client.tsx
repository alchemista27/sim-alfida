"use client";

import React from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";
import { AttendanceStatus } from "@prisma/client";

const DAYS: Record<string, string> = {
  monday: "Senin",
  tuesday: "Selasa",
  wednesday: "Rabu",
  thursday: "Kamis",
  friday: "Jumat",
  saturday: "Sabtu",
};

const getAttendanceBadge = (status: AttendanceStatus) => {
  switch (status) {
    case AttendanceStatus.present: return <Badge variant="green">Hadir</Badge>;
    case AttendanceStatus.sick: return <Badge variant="amber">Sakit</Badge>;
    case AttendanceStatus.permitted: return <Badge variant="amber">Izin</Badge>;
    case AttendanceStatus.absent: return <Badge variant="red">Alpa</Badge>;
    default: return <Badge variant="gray">Unknown</Badge>;
  }
};

export function StaffLiqoClient({ group }: { group: any }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informasi Kelompok</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Murobbi</p>
            <p className="font-semibold text-primary">{group.murobbi?.fullName || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Jadwal</p>
            <p className="font-semibold text-primary">
              {group.scheduleDay ? DAYS[group.scheduleDay as string] || group.scheduleDay : "-"}
              {group.scheduleTime ? `, Pukul ${group.scheduleTime}` : ""}
              {group.scheduleLocation ? ` di ${group.scheduleLocation}` : ""}
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Pertemuan</CardTitle>
        </CardHeader>
        <Table>
          <Thead>
            <Tr>
              <Th>Tanggal</Th>
              <Th>Materi</Th>
              <Th>Ringkasan</Th>
              <Th>Status Kehadiran</Th>
            </Tr>
          </Thead>
          <Tbody>
            {group.meetings.length === 0 ? (
              <Tr>
                <Td colSpan={4} className="text-center text-gray-500">Belum ada riwayat pertemuan</Td>
              </Tr>
            ) : (
              group.meetings.map((meeting: any) => (
                <Tr key={meeting.id}>
                  <Td>{new Date(meeting.date).toLocaleDateString("id-ID")}</Td>
                  <Td>{meeting.materialTitle}</Td>
                  <Td>{meeting.summary || "-"}</Td>
                  <Td>
                    {meeting.attendances && meeting.attendances.length > 0 ? (
                      getAttendanceBadge(meeting.attendances[0].status)
                    ) : (
                      <Badge variant="gray">Belum Diabsen</Badge>
                    )}
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Card>
    </div>
  );
}
