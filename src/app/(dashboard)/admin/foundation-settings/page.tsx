import React from "react";
import { getFoundationSettings } from "@/actions/foundation-settings";
import { FoundationSettingsClient } from "./settings-client";

export default async function FoundationSettingsPage() {
  const settings = await getFoundationSettings();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading text-primary">Identitas Yayasan</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola logo, nama ketua, tanda tangan, dan rekening yayasan.</p>
      </div>

      <FoundationSettingsClient settings={settings} />
    </div>
  );
}
