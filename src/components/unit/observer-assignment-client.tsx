"use client";

import React, { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { toggleObserverRoleAction } from "@/actions/unit-observers";

interface Teacher {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  isObserver: boolean;
}

export function ObserverAssignmentClient({ initialTeachers }: { initialTeachers: Teacher[] }) {
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const handleToggle = async (userId: string, currentStatus: boolean) => {
    setProcessingId(userId);
    try {
      const res = await toggleObserverRoleAction(userId, currentStatus);
      if (res.success) {
        // Optimistic update
        setTeachers(prev => prev.map(t => 
          t.id === userId ? { ...t, isObserver: !currentStatus } : t
        ));
      }
    } catch (e: any) {
      alert("Gagal memperbarui status observer.");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredTeachers = teachers.filter(t => 
    t.fullName.toLowerCase().includes(search.toLowerCase()) || 
    t.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
          <input
            type="text"
            placeholder="Cari nama guru..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-tertiary outline-none"
          />
        </div>
      </div>

      <div className="bg-surface border rounded-xl overflow-x-auto shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-neutral border-b text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-5 py-3 font-semibold">Nama Guru</th>
              <th className="px-5 py-3 font-semibold">Kontak</th>
              <th className="px-5 py-3 font-semibold text-center">Status Observer</th>
              <th className="px-5 py-3 font-semibold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredTeachers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-gray-500">
                  {search ? "Tidak ditemukan guru yang cocok." : "Belum ada data guru di unit ini."}
                </td>
              </tr>
            ) : filteredTeachers.map((teacher) => (
              <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4 font-medium text-primary">
                  {teacher.fullName}
                </td>
                <td className="px-5 py-4 text-gray-600">
                  <div className="flex flex-col gap-1">
                    <span className="flex items-center gap-1 text-xs">
                      <Icon name="mail" className="text-xs" /> {teacher.email}
                    </span>
                    {teacher.phone && (
                      <span className="flex items-center gap-1 text-xs">
                        <Icon name="call" className="text-xs" /> {teacher.phone}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4 text-center">
                  {teacher.isObserver ? (
                    <Badge variant="teal" className="flex items-center gap-1 w-max mx-auto">
                      <Icon name="check_circle" className="text-[10px]" /> Aktif
                    </Badge>
                  ) : (
                    <Badge variant="gray" className="flex items-center gap-1 w-max mx-auto text-gray-500">
                      <Icon name="cancel" className="text-[10px]" /> Tidak
                    </Badge>
                  )}
                </td>
                <td className="px-5 py-4 text-center">
                  <button
                    onClick={() => handleToggle(teacher.id, teacher.isObserver)}
                    disabled={processingId === teacher.id}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-tertiary focus:ring-offset-2 ${
                      teacher.isObserver ? "bg-tertiary" : "bg-gray-300"
                    } ${processingId === teacher.id ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        teacher.isObserver ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
