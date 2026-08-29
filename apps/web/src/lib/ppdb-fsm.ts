import type { RegistrationStatus } from "@sim/shared";

export const PPDB_STEPS: RegistrationStatus[] = [
  "pending_payment",
  "payment_uploaded",
  "payment_verified",
  "form_filling",
  "documents_uploaded",
  "medical_pending",
  "medical_uploaded",
  "verification",
  "observation_scheduled",
  "observation_done",
  "accepted",
  "enrolled",
];

// Map each state to the frontend step index (for Stepper UI)
export const STEP_INDEX_MAP: Record<RegistrationStatus, number> = {
  pending_payment: 0,
  payment_uploaded: 1,
  payment_verified: 2,
  form_filling: 3,
  documents_uploaded: 4,
  medical_pending: 5,
  medical_uploaded: 6,
  verification: 7,
  observation_scheduled: 8,
  observation_done: 9,
  accepted: 10,
  rejected: -1, // special state
  enrolled: 11,
};

// Allowed forward transitions
const VALID_TRANSITIONS: Record<RegistrationStatus, RegistrationStatus[]> = {
  pending_payment: ["payment_uploaded"],
  payment_uploaded: ["payment_verified", "pending_payment", "rejected"],
  payment_verified: ["form_filling"],
  form_filling: ["documents_uploaded"],
  documents_uploaded: ["medical_pending"],
  medical_pending: ["medical_uploaded"],
  medical_uploaded: ["verification"],
  verification: ["observation_scheduled", "rejected"],
  observation_scheduled: ["observation_done"],
  observation_done: ["accepted", "rejected"],
  accepted: ["enrolled"],
  rejected: [],
  enrolled: [],
};

export class PpdbFsm {
  static canTransition(from: RegistrationStatus, to: RegistrationStatus): boolean {
    const allowed = VALID_TRANSITIONS[from];
    return allowed?.includes(to) ?? false;
  }
}
