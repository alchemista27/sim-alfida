"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Coba ambil dari database berdasarkan ID
  let dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      roles: true
    }
  });

  // Fallback: Jika ID Supabase berbeda dengan ID Prisma (akibat re-seed database),
  // cari berdasarkan email.
  if (!dbUser && user.email) {
    dbUser = await prisma.user.findUnique({
      where: { email: user.email },
      include: {
        roles: true
      }
    });
  }

  return {
    ...user,
    name: dbUser?.fullName || user.user_metadata?.full_name || user.email?.split("@")[0],
    roles: dbUser?.roles || [{ role: "orang_tua" }]
  };
}
