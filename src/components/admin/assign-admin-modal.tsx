"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { assignAdminUnitAction, searchUsersAction } from "@/actions/admin";
import { useRouter } from "next/navigation";

interface AssignAdminModalProps {
  unitId: string;
}

export function AssignAdminModal({ unitId }: AssignAdminModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{id: string, fullName: string | null, email: string}[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Jangan cari jika userId sudah ada (berarti sedang memilih)
    if (searchQuery.length >= 1 && !userId) {
      const timer = setTimeout(async () => {
        setIsSearching(true);
        try {
          const results = await searchUsersAction(searchQuery);
          setSearchResults(results);
        } catch (e) {
          console.error(e);
        } finally {
          setIsSearching(false);
        }
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, userId]);

  const handleAssign = async () => {
    if (!userId) {
      setError("Pilih pengguna terlebih dahulu.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await assignAdminUnitAction({ userId, unitId });
      setIsOpen(false);
      setUserId("");
      setSearchQuery("");
      router.refresh();
    } catch (e: any) {
      setError(e.message || "Gagal menetapkan admin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectUser = (user: {id: string, fullName: string | null}) => {
    setUserId(user.id);
    setSearchQuery(user.fullName || "User tanpa nama");
    setSearchResults([]);
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        <Icon name="add" className="mr-1" /> Tambah Admin
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface w-full max-w-md rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-primary mb-4">
              Tambah Admin Unit
            </h3>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 rounded text-sm mb-4">
                {error}
              </div>
            )}

            <div className="mb-4 relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cari Pengguna
              </label>
              <div className="relative">
                <Icon name="search" className="absolute left-3 top-2.5 text-gray-400" size="sm" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setUserId(""); // Reset selection if typing
                  }}
                  placeholder="Ketik nama atau email..."
                  className="w-full rounded-md border border-border pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-tertiary"
                />
              </div>
              
              {isSearching && (
                <div className="absolute z-10 w-full mt-1 p-2 bg-white border border-gray-200 rounded-md shadow-lg text-sm text-gray-500 text-center">
                  Mencari...
                </div>
              )}
              
              {searchResults.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                  {searchResults.map((user) => (
                    <li 
                      key={user.id}
                      onClick={() => selectUser(user)}
                      className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                    >
                      <div className="font-medium">{user.fullName || "User tanpa nama"}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </li>
                  ))}
                </ul>
              )}
              
              {!isSearching && searchQuery.length >= 1 && searchResults.length === 0 && !userId && (
                <div className="absolute z-10 w-full mt-1 p-3 bg-white border border-gray-200 rounded-md shadow-lg text-sm text-gray-500 text-center">
                  Tidak ditemukan.
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button
                variant="primary"
                onClick={handleAssign}
                disabled={isSubmitting || !userId}
              >
                {isSubmitting ? "Menyimpan..." : "Simpan Admin"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
