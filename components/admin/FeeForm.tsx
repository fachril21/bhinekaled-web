"use client";

// Epic 11: Admin Pengaturan Biaya Lainnya
// Lihat docs/plan/epic-11-admin-pengaturan-biaya-lainnya.md bagian 6.1.
//
// Pola sama CategoryForm (Epic 5) — remount lewat `key` di parent (FeeManager)
// saat ganti target edit, bukan useEffect + setState.

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveFeeAction } from "@/lib/actions/fees";
import { Label } from "@/components/admin/ui/form/Label";
import { Input } from "@/components/admin/ui/form/Input";
import { Select } from "@/components/admin/ui/form/Select";
import { Checkbox } from "@/components/admin/ui/form/Checkbox";
import { Button } from "@/components/admin/ui/Button";
import { Alert } from "@/components/admin/ui/Alert";
import type { AdminFeeListItem } from "@/lib/queries/admin-fees";
import type { FeeType } from "@/types/database.types";

const FEE_TYPE_OPTIONS = [
  { value: "flat", label: "Nominal Tetap (Flat)" },
  { value: "percentage", label: "Persentase" },
];

type FeeFormProps = {
  mode: "create" | "edit";
  initialFee?: AdminFeeListItem;
  onSaved: () => void;
  onCancelEdit?: () => void;
};

export function FeeForm({ mode, initialFee, onSaved, onCancelEdit }: FeeFormProps) {
  const router = useRouter();
  const [label, setLabel] = useState(initialFee?.label ?? "");
  const [feeType, setFeeType] = useState<FeeType>(initialFee?.feeType ?? "flat");
  const [amount, setAmount] = useState(initialFee ? String(initialFee.amount) : "");
  const [isActive, setIsActive] = useState(initialFee?.isActive ?? true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount)) {
      setError("Nilai harus berupa angka.");
      return;
    }

    startTransition(async () => {
      const result = await saveFeeAction({
        id: initialFee?.id,
        label,
        feeType,
        amount: parsedAmount,
        isActive,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setLabel("");
      setFeeType("flat");
      setAmount("");
      setIsActive(true);
      onSaved();
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5">
      <h2 className="text-base font-semibold text-gray-800">
        {mode === "edit" ? `Edit Biaya: ${initialFee?.label}` : "Tambah Biaya"}
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <Label htmlFor="fee-label">Label</Label>
          <Input id="fee-label" value={label} onChange={(e) => setLabel(e.target.value)} required />
        </div>

        <div>
          <Label htmlFor="fee-type">Tipe</Label>
          <Select
            id="fee-type"
            value={feeType}
            onChange={(e) => setFeeType(e.target.value as FeeType)}
            options={FEE_TYPE_OPTIONS}
          />
        </div>

        <div>
          <Label htmlFor="fee-amount">{feeType === "flat" ? "Nilai (Rp)" : "Nilai (%)"}</Label>
          <Input
            id="fee-amount"
            type="number"
            step="any"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <Checkbox checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
        Aktifkan biaya ini
      </label>

      {error && <Alert variant="error" title="Gagal menyimpan biaya" message={error} />}

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Menyimpan..." : mode === "edit" ? "Simpan Perubahan" : "Tambah Biaya"}
        </Button>
        {mode === "edit" && (
          <Button type="button" variant="outline" onClick={onCancelEdit}>
            Batal
          </Button>
        )}
      </div>
    </form>
  );
}
