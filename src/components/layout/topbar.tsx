"use client";

import React from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { UserNav } from "./user-nav";

interface TopbarProps {
  onToggleMobileSidebar?: () => void;
}

export function Topbar({ onToggleMobileSidebar }: TopbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full h-14 bg-surface border-b border-border px-4 md:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-1.5 rounded-md hover:bg-neutral text-gray-600 cursor-pointer"
        >
          <Icon name="menu" className="text-xl" />
        </button>
        <Link href="/modules" className="flex items-center gap-2 text-tertiary font-heading font-bold text-lg">
          <Icon name="hub" className="text-2xl" />
          <span>SIM-Alfida</span>
        </Link>
      </div>

      <UserNav />
    </header>
  );
}
