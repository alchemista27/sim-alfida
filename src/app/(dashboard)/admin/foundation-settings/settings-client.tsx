"use client";

import React, { useState, useTransition } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateFoundationSettings } from "@/actions/foundation-settings";
import { Icon } from "@/components/ui/icon";

export function FoundationSettingsClient({ settings }: { settings: any }) {
  const [isPending, startTransition] = useTransition();
  const [logoPreview, setLogoPreview] = useState<string | null>(settings.logoUrl || null);
  const [sigPreview, setSigPreview] = useState<string | null>(settings.chairmanSignatureUrl || null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: any) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran maksimal 2MB!");
        e.target.value = "";
        return;
      }
      setter(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("id", settings.id);
    formData.append("logoUrl", settings.logoUrl || "");
    formData.append("chairmanSignatureUrl", settings.chairmanSignatureUrl || "");

    startTransition(async () => {
      try {
        await updateFoundationSettings(formData);
        alert("Pengaturan yayasan berhasil diperbarui!");
      } catch (err: any) {
        alert(err.message || "Gagal menyimpan pengaturan.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Data Utama Yayasan</CardTitle>
        </CardHeader>
        <div className="p-5 space-y-4">
          <Input 
            label="Nama Yayasan" 
            name="foundationName" 
            defaultValue={settings.foundationName} 
            required 
          />
          <Input 
            label="Nama Lengkap Ketua Yayasan (beserta gelar)" 
            name="chairmanName" 
            defaultValue={settings.chairmanName || ""} 
            placeholder="Dr. H. Fulan, M.Pd."
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-primary">Logo Yayasan</label>
              <div className="border border-border rounded-lg p-4 flex flex-col items-center justify-center gap-3 bg-surface">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo Yayasan" className="h-24 object-contain" />
                ) : (
                  <div className="h-24 w-24 bg-neutral rounded flex items-center justify-center text-gray-400">
                    <Icon name="image" className="text-3xl" />
                  </div>
                )}
                <input type="file" name="logoFile" accept="image/*" onChange={(e) => handleFileChange(e, setLogoPreview)} className="text-xs" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-primary">Tanda Tangan Ketua Yayasan</label>
              <div className="border border-border rounded-lg p-4 flex flex-col items-center justify-center gap-3 bg-surface">
                {sigPreview ? (
                  <img src={sigPreview} alt="Tanda Tangan" className="h-24 object-contain" />
                ) : (
                  <div className="h-24 w-48 bg-neutral rounded flex items-center justify-center text-gray-400">
                    <Icon name="draw" className="text-3xl" />
                  </div>
                )}
                <input type="file" name="signatureFile" accept="image/png, image/jpeg" onChange={(e) => handleFileChange(e, setSigPreview)} className="text-xs" />
                <p className="text-xs text-gray-500">Gunakan latar transparan (PNG) untuk hasil terbaik.</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rekening Pembayaran (PPDB / SPP)</CardTitle>
        </CardHeader>
        <div className="p-5 space-y-4">
          <Input 
            label="Nama Bank" 
            name="bankName" 
            defaultValue={settings.bankName || ""} 
            placeholder="BSI / Mandiri / BCA"
          />
          <Input 
            label="Nomor Rekening" 
            name="bankAccountNumber" 
            defaultValue={settings.bankAccountNumber || ""} 
            placeholder="1234567890"
          />
          <Input 
            label="Atas Nama Rekening" 
            name="bankAccountHolder" 
            defaultValue={settings.bankAccountHolder || ""} 
            placeholder="Yayasan Alfida"
          />
        </div>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending} variant="primary" className="px-8">
          {isPending ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </div>
    </form>
  );
}
