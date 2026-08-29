"use server";

import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function updatePassword(password: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw new Error(error.message);
  return { success: true };
}

export async function updateEmail(email: string) {
  const supabase = await createClient();
  
  // 1. Update in Supabase Auth
  const { data, error } = await supabase.auth.updateUser({ email });
  if (error) throw new Error(error.message);
  
  // 2. Sync to Prisma User Table
  if (data?.user) {
    await prisma.user.update({
      where: { id: data.user.id },
      data: { email: email.toLowerCase() }
    });
  }
  
  return { success: true };
}
