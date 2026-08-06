"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { PasswordMeter } from "./password-meter";

export function RegisterForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, phone, password, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Pendaftaran gagal. Silakan periksa kembali data Anda.");
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-6 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-center max-w-sm">
        <Icon name="check_circle" className="text-4xl text-emerald-600 mb-2" />
        <h4 className="font-bold text-lg mb-1 font-heading">Pendaftaran Berhasil!</h4>
        <p className="text-xs text-emerald-700">
          Akun Anda telah dibuat. Mengalihkan ke halaman login...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 w-full max-w-sm">
      {error && (
        <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded flex items-center gap-2">
          <Icon name="error" className="text-base text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <Input
        label="Nama Lengkap"
        type="text"
        placeholder="Sesuai KTP"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
      />

      <Input
        label="Email"
        type="email"
        placeholder="nama@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <Input
        label="No. WA / HP"
        type="tel"
        placeholder="081234567890"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required
      />

      <div>
        <Input
          label="Password"
          type="password"
          placeholder="Min 8 karakter, 1 kapital, 1 angka"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <PasswordMeter password={password} />
      </div>

      <Input
        label="Konfirmasi Password"
        type="password"
        placeholder="Ulangi password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      />

      <Button type="submit" variant="primary" size="lg" className="w-full mt-2" disabled={loading}>
        {loading ? (
          <>
            <Icon name="progress_activity" className="animate-spin" /> Mendaftarkan...
          </>
        ) : (
          <>
            <Icon name="person_add" /> Daftar Akun
          </>
        )}
      </Button>
    </form>
  );
}
