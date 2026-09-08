"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { apiFetch } from "@/lib/api";

export async function getCurrentUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;
  if (!user) return null;

  // Fetch enriched user (with roles) from NestJS
  try {
    const dbUser = await apiFetch("/auth/me");
    return {
      ...user,
      name: dbUser?.fullName || user.name || user.email?.split("@")[0],
      fullName: dbUser?.fullName,
      roles: dbUser?.roles || [{ role: "orang_tua" }]
    };
  } catch {
    return {
      ...user,
      name: user.name || user.email?.split("@")[0],
      roles: [{ role: "orang_tua" }]
    };
  }
}
