import { getAllLeaveRequests } from "@/actions/leave-approval";
import { ApprovalClient } from "./approval-client";

export default async function LeavesApprovalPage() {
  const leaves = await getAllLeaveRequests();
  return <ApprovalClient initialLeaves={leaves} />;
}
