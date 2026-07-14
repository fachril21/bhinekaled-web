"use client";

// Epic 11: Admin Pengaturan Biaya Lainnya
// Lihat docs/plan/epic-11-admin-pengaturan-biaya-lainnya.md bagian 6.3.
//
// Client wrapper yang menyimpan state "biaya mana yang sedang diedit" —
// pola sama CategoryManager (Epic 5).

import { useState } from "react";
import { FeeForm } from "@/components/admin/FeeForm";
import { AdminFeeTable } from "@/components/admin/AdminFeeTable";
import type { AdminFeeListItem } from "@/lib/queries/admin-fees";

type FeeManagerProps = {
  fees: AdminFeeListItem[];
};

export function FeeManager({ fees }: FeeManagerProps) {
  const [editingFee, setEditingFee] = useState<AdminFeeListItem | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <FeeForm
        key={editingFee?.id ?? "new"}
        mode={editingFee ? "edit" : "create"}
        initialFee={editingFee ?? undefined}
        onSaved={() => setEditingFee(null)}
        onCancelEdit={() => setEditingFee(null)}
      />
      <AdminFeeTable fees={fees} onEdit={setEditingFee} />
    </div>
  );
}
