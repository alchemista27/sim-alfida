"use client";

import { useState, useRef } from "react";
import { batchImportUsers } from "@/actions/users";

export function UserUploadClient() {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      alert("Harap unggah file berformat CSV.");
      return;
    }

    const confirmImport = confirm(`Apakah Anda yakin ingin mengimpor pengguna dari ${file.name}?`);
    if (!confirmImport) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setLoading(true);
    
    try {
      const text = await file.text();
      const res = await batchImportUsers(text);
      
      if (res.success) {
        alert(`Berhasil! ${res.count} pengguna telah diimpor/diperbarui.`);
      } else {
        alert(`Gagal: ${res.error}`);
      }
    } catch (error) {
      alert("Terjadi kesalahan saat membaca file CSV.");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
        className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 flex items-center"
      >
        <span className="material-symbols-rounded mr-2">upload_file</span>
        {loading ? "Memproses..." : "Upload CSV Pegawai"}
      </button>
    </div>
  );
}
