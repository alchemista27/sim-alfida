"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { removeAdminUnitAction } from "@/actions/admin";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";

export function RemoveAdminButton({ userId, unitId }: { userId: string, unitId: string }) {
  const [isRemoving, setIsRemoving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await removeAdminUnitAction(userId, unitId);
      setShowConfirm(false);
      router.refresh();
    } catch (e) {
      alert("Gagal menghapus admin");
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowConfirm(true)}
        disabled={isRemoving}
        className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
      >
        <Icon name="delete" className="text-sm" />
      </Button>

      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Hapus Admin Unit"
      >
        <div className="text-gray-600 mb-6 mt-2">
          Apakah Anda yakin ingin menghapus pengguna ini dari admin unit? Mereka tidak akan lagi memiliki akses ke pengaturan unit ini.
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setShowConfirm(false)} disabled={isRemoving}>
            Batal
          </Button>
          <Button 
            className="bg-red-500 hover:bg-red-600 text-white border-0" 
            onClick={handleRemove} 
            disabled={isRemoving}
          >
            {isRemoving ? "Menghapus..." : "Ya, Hapus Admin"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
