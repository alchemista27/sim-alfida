"use client";

import React, { useState, useTransition } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { updateEmail, updatePassword } from "@/actions/profile";

export default function ProfileClient({ user }: { user: any }) {
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<"info" | "settings">("info");
  
  const [emailMsg, setEmailMsg] = useState("");
  const [passMsg, setPassMsg] = useState("");

  const handleUpdateEmail = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get("email") as string;
    startTransition(async () => {
      try {
        await updateEmail(email);
        setEmailMsg("Email berhasil diperbarui.");
      } catch (err: any) {
        setEmailMsg("Gagal: " + err.message);
      }
    });
  };

  const handleUpdatePassword = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const pass = new FormData(e.currentTarget).get("password") as string;
    const confirm = new FormData(e.currentTarget).get("confirm") as string;
    if (pass !== confirm) {
      setPassMsg("Konfirmasi password tidak cocok!");
      return;
    }
    startTransition(async () => {
      try {
        await updatePassword(pass);
        setPassMsg("Kata sandi berhasil diperbarui.");
      } catch (err: any) {
        setPassMsg("Gagal: " + err.message);
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("info")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "info" ? "border-tertiary text-tertiary" : "border-transparent text-gray-500 hover:text-primary"
          }`}
        >
          Informasi Akun
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "settings" ? "border-tertiary text-tertiary" : "border-transparent text-gray-500 hover:text-primary"
          }`}
        >
          Pengaturan
        </button>
      </div>

      {activeTab === "info" && (
        <Card>
          <CardHeader>
            <CardTitle>Data Pengguna</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Nama Lengkap</label>
                <p className="text-sm font-medium text-primary mt-1">{user.name}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Email</label>
                <p className="text-sm font-medium text-primary mt-1">{user.email}</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Peran & Unit</label>
              {user.roles && user.roles.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {user.roles.map((r: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 text-sm bg-neutral/50 p-2 rounded border border-border">
                      <Icon name="badge" className="text-tertiary text-lg" />
                      <span className="font-semibold text-primary capitalize">{r.role.replace(/_/g, " ")}</span>
                      <span className="text-gray-400">&bull;</span>
                      <span className="text-gray-600">{r.unit ? r.unit.name : "Lintas Unit / Pusat"}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Tidak ada peran yang ditugaskan.</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "settings" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Ganti Email</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateEmail} className="space-y-4">
                <Input
                  label="Email Baru"
                  name="email"
                  type="email"
                  defaultValue={user.email}
                  required
                />
                {emailMsg && <p className="text-xs font-medium text-tertiary">{emailMsg}</p>}
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Menyimpan..." : "Simpan Email"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ganti Kata Sandi</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <Input
                  label="Kata Sandi Baru"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                />
                <Input
                  label="Konfirmasi Kata Sandi"
                  name="confirm"
                  type="password"
                  required
                  minLength={6}
                />
                {passMsg && <p className="text-xs font-medium text-tertiary">{passMsg}</p>}
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Menyimpan..." : "Ubah Kata Sandi"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
