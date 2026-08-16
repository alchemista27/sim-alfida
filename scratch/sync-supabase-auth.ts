import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const prisma = new PrismaClient();

async function main() {
  const email = "maryono@pegawai.al-fida.org";
  const password = "AlFida2026!";

  // Coba login terlebih dahulu untuk cek apakah sudah terdaftar
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  let sbUser = signInData?.user;

  if (signInError && signInError.message.includes("Invalid login credentials")) {
    console.log("User belum terdaftar di Supabase Auth atau password salah, mencoba mendaftarkan...");
    
    // Mendaftarkan via signUp biasa
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      // Mungkin sudah ada tapi password berbeda?
      throw signUpError;
    }
    
    sbUser = signUpData.user;
    console.log("Berhasil mendaftarkan ke Supabase Auth via signUp.");
  }

  if (sbUser) {
    const prismaUser = await prisma.user.findUnique({ where: { email } });
    if (!prismaUser) throw new Error("Tidak ditemukan di Prisma");

    if (sbUser.id !== prismaUser.id) {
      console.log(`Menyelaraskan ID Prisma (${prismaUser.id}) dengan Supabase (${sbUser.id})...`);
      await prisma.$executeRaw`UPDATE "shared"."users" SET id = ${sbUser.id}::uuid WHERE email = ${email}`;
      console.log("ID berhasil diselaraskan.");
    } else {
      console.log("ID sudah sesuai.");
    }
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
