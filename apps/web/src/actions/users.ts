"use server";

import { revalidatePath } from "next/cache";
import { UserRole } from "@sim/database";
import { apiFetch } from "@/lib/api";

export async function batchImportUsers(usersData: any[]) {
  try {
    const res = await apiFetch("/admin/users/batch-import", {
      method: "POST",
      body: JSON.stringify({ usersData }),
    });
    revalidatePath("/admin/users");
    return res;
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal import." };
  }
}

export async function updateUserRoles(userId: string, roles: UserRole[], groups: string[]) {
  try {
    const res = await apiFetch(`/admin/users/${userId}/roles`, {
      method: "POST",
      body: JSON.stringify({ roles, groups }),
    });
    revalidatePath("/admin/users");
    return res;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createUserManual(data: {
  email: string;
  fullName: string;
  username: string;
  password?: string;
  roles: UserRole[];
  groups: string[];
}) {
  try {
    const res = await apiFetch("/admin/users/manual", {
      method: "POST",
      body: JSON.stringify(data),
    });
    revalidatePath("/admin/users");
    return res;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteUser(userId: string) {
  try {
    const res = await apiFetch(`/admin/users/${userId}`, {
      method: "DELETE",
    });
    revalidatePath("/admin/users");
    return res;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
