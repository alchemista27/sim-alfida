"use client";

import { useState, useRef } from "react";
import { batchImportUsers } from "@/actions/users";
import * as XLSX from "xlsx";

export function UserUploadClient() {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv") && !file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      alert("Harap unggah file berformat CSV atau XLSX.");
      return;
    }

    const confirmImport = confirm(`Apakah Anda yakin ingin mengimpor pengguna dari ${file.name}?`);
    if (!confirmImport) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setLoading(true);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: null });
      
      const res = await batchImportUsers(jsonData);
      
      if (res.success) {
        alert(`Berhasil! ${res.count} pengguna telah diimpor/diperbarui.`);
      } else {
        alert(`Gagal: ${res.error}`);
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat membaca file.");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <input
        type="file"
        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={loading}
        className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 flex items-center shadow-sm"
      >
        <span className="material-symbols-rounded mr-2">upload_file</span>
        {loading ? "Memproses..." : "Upload Pegawai"}
      </button>
    </div>
  );
}
