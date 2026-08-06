import Link from "next/link";
import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="w-full flex flex-col items-center text-center">
      <h2 className="font-heading text-2xl font-bold text-primary mb-1">
        Daftar Akun Orang Tua
      </h2>
      <p className="text-xs text-gray-500 mb-6">
        Lengkapi formulir pendaftaran akun untuk memulai PPDB.
      </p>

      <RegisterForm />

      <div className="mt-6 pt-4 border-t border-border w-full max-w-sm text-xs text-gray-600">
        Sudah punya akun?{" "}
        <Link
          href="/login"
          className="text-tertiary font-semibold hover:underline"
        >
          Masuk di sini
        </Link>
      </div>
    </div>
  );
}
