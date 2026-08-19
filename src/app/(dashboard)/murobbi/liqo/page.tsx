import { getMyMentoredGroup, getGroupMutabaahStats } from "@/actions/murobbi";
import { MurobbiLiqoClient } from "./murobbi-client";

export default async function MurobbiLiqoPage() {
  const group = await getMyMentoredGroup();
  let mutabaahStats: any[] = [];

  if (group) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);
    mutabaahStats = await getGroupMutabaahStats(group.id, startDate, endDate);
  }

  if (!group) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4 text-primary">Jadwal & Pengelolaan Liqo</h1>
        <p className="text-gray-600">Anda belum memiliki kelompok binaan/mentoring saat ini.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-primary">Jadwal & Pengelolaan Liqo</h1>
      <MurobbiLiqoClient group={group} mutabaahStats={mutabaahStats} />
    </div>
  );
}
