import React from 'react';
import { getAttendanceRecap } from '@/actions/hr-dashboard';
import AttendanceRecapClient from './attendance-recap-client';

export default async function AttendanceRecapPage() {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = now;

  const recapData = await getAttendanceRecap(startDate, endDate);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-heading text-primary">Rekapitulasi Kehadiran</h1>
      <AttendanceRecapClient data={recapData} />
    </div>
  );
}
