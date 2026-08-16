"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Coba ambil dari database
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      roles: true
    }
  });

  return {
    ...user,
    name: dbUser?.fullName || user.user_metadata?.full_name || user.email?.split("@")[0],
    roles: dbUser?.roles || [{ role: "orang_tua" }]
  };
}
