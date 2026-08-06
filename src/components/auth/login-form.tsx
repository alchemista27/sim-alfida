"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
// Removed next-auth
export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError("Email atau password yang Anda masukkan salah.");
      } else {
        router.push("/modules");
        router.refresh();
      }
    } catch {
      setError("Terjadi kesalahan sistem. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
      {error && (
        <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded flex items-center gap-2">
          <Icon name="error" className="text-base text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <Input
        label="Email"
        type="email"
        placeholder="nama@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <div className="relative w-full">
        <Input
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 text-sm"
        >
          <Icon name={showPassword ? "visibility_off" : "visibility"} className="text-lg" />
        </button>
      </div>

      <Button type="submit" variant="primary" size="lg" className="w-full mt-2" disabled={loading}>
        {loading ? (
          <>
            <Icon name="progress_activity" className="animate-spin" /> Memproses...
          </>
        ) : (
          <>
            <Icon name="login" /> Masuk
          </>
        )}
      </Button>
    </form>
  );
}
