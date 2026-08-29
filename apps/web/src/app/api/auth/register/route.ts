import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import { UserRole } from "@sim/database";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { fullName, email, phone, password } = parsed.data;

    // Check duplicate email in Prisma
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar. Silakan gunakan email lain atau login." },
        { status: 400 }
      );
    }

    // Initialize Supabase admin/anon client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Sign up with Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || "Gagal membuat akun autentikasi." },
        { status: 400 }
      );
    }

    const userId = authData.user.id;

    // Create user & assign orang_tua role in Prisma
    const user = await prisma.user.create({
      data: {
        id: userId,
        fullName,
        email,
        phone,
        passwordHash: "managed_by_supabase",
        isActive: true,
        roles: {
          create: {
            role: UserRole.orang_tua,
          },
        },
      },
    });

    return NextResponse.json(
      { message: "Registrasi berhasil.", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}

