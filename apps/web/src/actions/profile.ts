"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { apiFetch } from "@/lib/api";

export async function updatePassword(password: string) {
  throw new Error("Pembaruan password lewat Better Auth harus menggunakan old password, belum diimplementasikan di UI");
}

export async function updateEmail(email: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Not authenticated");
  
  await apiFetch("/auth/update-email", {
    method: "POST",
    body: JSON.stringify({ email: email.toLowerCase() })
  });
  
  return { success: true };
}
