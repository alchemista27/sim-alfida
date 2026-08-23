import React from "react";
import DashboardClient from "./dashboard-client";
import { prisma } from "@/generated/client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let logoUrl = null;
  let foundationName = "Yayasan Alfida";
  try {
    const settings = await prisma.foundationSettings.findFirst();
    if (settings) {
      logoUrl = settings.logoUrl;
      foundationName = settings.foundationName;
    }
  } catch (e) {
    // ignore
  }

  return (
    <DashboardClient logoUrl={logoUrl} foundationName={foundationName}>
      {children}
    </DashboardClient>
  );
}
