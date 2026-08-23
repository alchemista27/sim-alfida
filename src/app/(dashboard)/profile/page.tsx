import React from "react";
import { getCurrentUser } from "@/actions/user";
import ProfileClient from "./profile-client";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  
  if (!user) {
    return <div>User not found.</div>;
  }

  // user.roles will now include unit details
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary tracking-tight">Profil Pengguna</h1>
        <p className="text-sm text-gray-500 mt-1">Informasi akun dan pengaturan kata sandi Anda.</p>
      </div>

      <ProfileClient user={user} />
    </div>
  );
}
