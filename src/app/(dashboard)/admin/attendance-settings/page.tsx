import { getGpsConfigs, getHolidays } from "@/actions/attendance-config";
import { prisma } from "@/lib/prisma";
import SettingsClient from "./settings-client";

export default async function AttendanceSettingsPage() {
  const units = await prisma.unit.findMany({ orderBy: { name: 'asc' } });
  
  const gpsConfigs = await getGpsConfigs();
  
  const now = new Date();
  const holidays = await getHolidays(now.getMonth() + 1, now.getFullYear());

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-primary">Pengaturan Absensi</h1>
        <p className="text-muted-foreground text-sm text-gray-500">Kelola konfigurasi GPS dan hari libur untuk absensi.</p>
      </div>
      
      <SettingsClient 
        units={units} 
        gpsConfigs={gpsConfigs} 
        holidays={holidays} 
      />
    </div>
  );
}
