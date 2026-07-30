"use client";

// Epic 11: Admin Pengaturan Biaya Lainnya
// Lihat docs/plan/epic-11-admin-pengaturan-biaya-lainnya.md bagian 6.1.
//
// Pola sama CategoryForm (Epic 5) — remount lewat `key` di parent (FeeManager)
// saat ganti target edit, bukan useEffect + setState.

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveFeeAction } from "@/lib/actions/fees";
import type { AdminFeeListItem } from "@/lib/queries/admin-fees";
import type { FeeType } from "@/types/database.types";

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-neutral-200 p-4">
      <h2 className="text-sm font-semibold text-neutral-900">
        {mode === "edit" ? `Edit Biaya: ${initialFee?.label}` : "Tambah Biaya"}
      </h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="fee-label" className="text-sm font-medium text-neutral-700">
            Label
          </label>
          <input
            id="fee-label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            required
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="fee-type" className="text-sm font-medium text-neutral-700">
            Tipe
          </label>
          <select
            id="fee-type"
            value={feeType}
            onChange={(e) => setFeeType(e.target.value as FeeType)}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
          >
            <option value="flat">Nominal Tetap (Flat)</option>
            <option value="percentage">Persentase</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="fee-amount" className="text-sm font-medium text-neutral-700">
            {feeType === "flat" ? "Nilai (Rp)" : "Nilai (%)"}
          </label>
          <input
            id="fee-amount"
            type="number"
            step="any"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-neutral-700">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 rounded border-neutral-300"
        />
        Aktifkan biaya ini
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-brand-red px-4 py-2 text-sm font-semibold text-white hover:bg-brand-red/90 disabled:opacity-60"
        >
          {isPending ? "Menyimpan..." : mode === "edit" ? "Simpan Perubahan" : "Tambah Biaya"}
        </button>
        {mode === "edit" && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Batal
          </button>
        )}
      </div>
    </form>
  );
}
