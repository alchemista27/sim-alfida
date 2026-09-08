import { getLiqoGroups, getPotentialMurobbis, getPotentialMutarobbis, getLiqoAttendanceStats, getGlobalMutabaahStats } from "@/actions/bpi";
import { LiqoClient } from "./liqo-client";
import { requireRole } from "@/lib/auth-guard";
import { UserRole } from "@sim/database";

export const metadata = {
  title: "Manajemen Liqo | SIM-Alfida",
};

export default async function LiqoPage() {
  await requireRole([UserRole.super_admin, UserRole.admin_bidang]);

  const date = new Date();
  const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  const [groups, potentialMurobbis, potentialMutarobbis, stats, globalMutabaahStats] = await Promise.all([
    getLiqoGroups(),
    getPotentialMurobbis(),
    getPotentialMutarobbis(),
    getLiqoAttendanceStats(),
    getGlobalMutabaahStats(startOfMonth, endOfMonth),
  ]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold font-heading text-primary mb-6">Manajemen Pembinaan UPA/Liqo</h1>
      <LiqoClient 
        initialGroups={groups as any}
        potentialMurobbis={potentialMurobbis}
        potentialMutarobbis={potentialMutarobbis}
        stats={stats as any}
        globalMutabaahStats={globalMutabaahStats}
      />
    </div>
  );
}
