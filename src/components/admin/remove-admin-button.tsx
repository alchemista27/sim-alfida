"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { removeAdminUnitAction } from "@/actions/admin";
import { useRouter } from "next/navigation";

export function RemoveAdminButton({ userId, unitId }: { userId: string, unitId: string }) {
  const [isRemoving, setIsRemoving] = useState(false);
  const router = useRouter();

  const handleRemove = async () => {
    if (!confirm("Hapus admin ini dari unit?")) return;
    setIsRemoving(true);
    try {
      await removeAdminUnitAction(userId, unitId);
      router.refresh();
    } catch (e) {
      alert("Gagal menghapus admin");
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRemove}
      disabled={isRemoving}
      className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
    >
      <Icon name="delete" className="text-sm" />
    </Button>
  );
}
