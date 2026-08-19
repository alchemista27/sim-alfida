import { getMyLeaveRequests } from "@/actions/leave-request";
import { LeaveClient } from "./leave-client";

export default async function LeavePage() {
  const requests = await getMyLeaveRequests();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-heading text-primary">Pengajuan Izin/Cuti</h1>
        <p className="text-gray-500 mt-1">Kelola dan buat pengajuan izin atau cuti Anda.</p>
      </div>
      
      <LeaveClient initialData={requests} />
    </div>
  );
}
