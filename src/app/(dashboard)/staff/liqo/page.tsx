import { getMyLiqoGroup } from "@/actions/mutarobbi";
import { StaffLiqoClient } from "./staff-liqo-client";

export default async function StaffLiqoPage() {
  const group = await getMyLiqoGroup();

  if (!group) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4 text-primary">Info Liqo</h1>
        <p className="text-gray-600">Anda belum tergabung ke kelompok manapun.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-primary">Info Liqo</h1>
      <StaffLiqoClient group={group} />
    </div>
  );
}
