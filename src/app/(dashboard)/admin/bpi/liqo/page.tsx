import { getLiqoGroups, getPotentialMurobbis, getPotentialMutarobbis, getLiqoAttendanceStats, getGlobalMutabaahStats } from "@/actions/bpi";
import { LiqoClient } from "./liqo-client";

export const metadata = {
  title: "Manajemen Liqo | SIM-Alfida",
};

export default async function LiqoPage() {
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
