export type Role =
  | "super_admin"
  | "admin_unit"
  | "guru"
  | "karyawan"
  | "orang_tua"
  | "observer"
  | "tim_ppdb";

export type UnitLevel = "tk" | "sd" | "smp" | "sma" | "pesantren" | "kantor_yayasan" | "non_pendidikan";

export interface UserSession {
  id: string;
  fullName: string;
  email: string;
  roles: {
    role: Role;
    unitId: string | null;
  }[];
}

export type RegistrationStatus =
  | "pending_payment"
  | "payment_uploaded"
  | "payment_verified"
  | "form_filling"
  | "documents_uploaded"
  | "medical_pending"
  | "medical_uploaded"
  | "verification"
  | "observation_scheduled"
  | "observation_done"
  | "accepted"
  | "rejected"
  | "enrolled";

export const DayOfWeek = {
  monday: "monday",
  tuesday: "tuesday",
  wednesday: "wednesday",
  thursday: "thursday",
  friday: "friday",
  saturday: "saturday",
} as const;

export type DayOfWeek = typeof DayOfWeek[keyof typeof DayOfWeek];
