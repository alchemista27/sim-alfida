'use client';

import React from 'react';
import { Table, Thead, Tbody, Tr, Th, Td } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

type RecapData = {
  userId: string;
  fullName: string | null;
  present: number;
  late: number;
  leave: number;
  absent: number;
};

export default function AttendanceRecapClient({ data }: { data: RecapData[] }) {
  const handleExportCSV = () => {
    const headers = ['Nama Pegawai', 'Hadir', 'Telat', 'Sakit/Izin/Cuti', 'Alpa'];
    const rows = data.map(row => [
      row.fullName || 'Unknown',
      row.present,
      row.late,
      row.leave,
      row.absent
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `rekap_kehadiran_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Kehadiran Bulan Ini</CardTitle>
        <Button onClick={handleExportCSV} variant="outline" size="sm">
          Export CSV
        </Button>
      </CardHeader>
      <Table>
        <Thead>
          <Tr>
            <Th>Nama Pegawai</Th>
            <Th>Hadir</Th>
            <Th>Telat</Th>
            <Th>Sakit/Izin/Cuti</Th>
            <Th>Alpa</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.map((row) => (
            <Tr key={row.userId}>
              <Td>{row.fullName || '-'}</Td>
              <Td>{row.present}</Td>
              <Td>{row.late}</Td>
              <Td>{row.leave}</Td>
              <Td>{row.absent}</Td>
            </Tr>
          ))}
          {data.length === 0 && (
            <Tr>
              <Td colSpan={5} className="text-center text-gray-500 py-4">
                Tidak ada data.
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </Card>
  );
}
