export type Role =
  | "super_admin"
  | "admin_unit"
  | "guru"
  | "karyawan"
  | "orang_tua"
  | "observer"
  | "tim_ppdb";

export type UnitLevel = "tk" | "sd" | "smp" | "sma" | "pesantren";

export interface UserSession {
  id: string;
  fullName: string;
  email: string;
  roles: {
    role: Role;
    unitId: string | null;
  }[];
}
