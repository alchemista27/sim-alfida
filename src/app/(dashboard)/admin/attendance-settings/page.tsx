import { getGpsConfigs, getHolidays } from "@/actions/attendance-config";
import { prisma } from "@/lib/prisma";
import SettingsClient from "./settings-client";
import { getCurrentUser } from "@/actions/user";

export default async function AttendanceSettingsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const isSuperAdmin = user.roles.some((r: any) => r.role === "super_admin");
  const isAdminKepegawaian = user.roles.some((r: any) => r.role === "admin_kepegawaian");
  
  // Ambil ID unit yang dikepalai oleh user ini
  const adminUnitRoleIds = user.roles
    .filter((r: any) => (r.role === "admin_unit" || r.role === "admin_unit_nondik") && r.unitId)
    .map((r: any) => r.unitId as string);

  let units;
  
  // Jika super admin atau HR, lihat semua unit. Jika admin unit, hanya lihat unitnya.
  if (isSuperAdmin || isAdminKepegawaian) {
    units = await prisma.unit.findMany({ orderBy: { name: 'asc' } });
  } else {
    units = await prisma.unit.findMany({ 
      where: { id: { in: adminUnitRoleIds } },
      orderBy: { name: 'asc' } 
    });
  }
  
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
