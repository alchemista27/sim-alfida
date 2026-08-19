import { getMyMutabaah } from "@/actions/mutarobbi";
import { StaffMutabaahClient } from "./mutabaah-client";

export const metadata = {
  title: "Pelaporan Mutabaah Wajibat | SIM-Alfida",
};

export default async function StaffMutabaahPage() {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 6);
  startDate.setHours(0, 0, 0, 0);

  const initialData = await getMyMutabaah(startDate, endDate);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold font-heading text-primary mb-6">Mutabaah Wajibat</h1>
      <p className="text-gray-600 mb-6">Silakan isi pelaporan ibadah harian Anda untuk 7 hari terakhir.</p>
      <StaffMutabaahClient 
        initialData={initialData as any} 
        startDate={startDate.toISOString()} 
        endDate={endDate.toISOString()} 
      />
    </div>
  );
}
