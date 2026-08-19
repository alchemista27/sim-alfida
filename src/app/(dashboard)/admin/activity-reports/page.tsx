import { getActivityReports } from "@/actions/activity-reports";
import { prisma } from "@/lib/prisma";
import ActivityReportClient from "./activity-report-client";

export const metadata = {
  title: "Laporan Aktivitas Bidang | SIM Alfida",
};

export default async function ActivityReportsPage() {
  const reports = await getActivityReports();
  const departments = await prisma.department.findMany({ select: { id: true, name: true } });

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-primary">Laporan Aktivitas Bidang</h1>
        <p className="text-gray-500 mt-1">Kelola dan lihat laporan aktivitas tiap bidang.</p>
      </div>

      <ActivityReportClient initialReports={reports} departments={departments} />
    </div>
  );
}
