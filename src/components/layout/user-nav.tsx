"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { Icon } from "@/components/ui/icon";

export function UserNav() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const userName = (user?.name as string) || "Pengguna";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 p-1 rounded-full hover:bg-neutral transition-colors cursor-pointer"
      >
        <div className="w-8 h-8 rounded-full bg-tertiary text-white flex items-center justify-center font-bold text-xs">
          {userInitials}
        </div>
        <div className="hidden md:flex flex-col text-left">
          <span className="text-xs font-semibold text-primary">{userName}</span>
          <span className="text-[10px] text-gray-500">{user?.email}</span>
        </div>
        <Icon name="arrow_drop_down" className="text-gray-500" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-lg shadow-lg py-1 z-50 animate-fade-in">
          <div className="px-4 py-2 border-b border-border md:hidden">
            <p className="text-xs font-semibold text-primary">{userName}</p>
            <p className="text-[10px] text-gray-500">{user?.email}</p>
          </div>
          <button
            onClick={async () => {
              const supabase = createClient();
              await supabase.auth.signOut();
              window.location.href = "/login";
            }}
            className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
          >
            <Icon name="logout" className="text-sm" />
            <span>Keluar (Logout)</span>
          </button>
        </div>
      )}
    </div>
  );
}
