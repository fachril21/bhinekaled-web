"use client";

// Epic 11: Admin Pengaturan Biaya Lainnya
// Lihat docs/plan/epic-11-admin-pengaturan-biaya-lainnya.md bagian 6.2.

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatRupiah } from "@/lib/format";
import { deleteFeeAction } from "@/lib/actions/fees";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import type { AdminFeeListItem } from "@/lib/queries/admin-fees";

type AdminFeeTableProps = {
  fees: AdminFeeListItem[];
  onEdit: (fee: AdminFeeListItem) => void;
};

export function AdminFeeTable({ fees, onEdit }: AdminFeeTableProps) {
  const router = useRouter();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const pendingDeleteFee = fees.find((f) => f.id === pendingDeleteId) ?? null;

  function handleConfirmDelete() {
    if (!pendingDeleteId) return;
    startTransition(async () => {
      const result = await deleteFeeAction(pendingDeleteId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setPendingDeleteId(null);
      router.refresh();
    });
  }

  if (fees.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500">
        Belum ada biaya.
      </p>
    );
  }

  return (
    <>
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      <div className="overflow-x-auto rounded-xl border border-neutral-200">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-neutral-50 text-xs font-medium uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3">Label</th>
              <th className="px-4 py-3">Tipe</th>
              <th className="px-4 py-3">Nilai</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {fees.map((fee) => (
              <tr key={fee.id}>
                <td className="px-4 py-3 font-medium text-neutral-900">{fee.label}</td>
                <td className="px-4 py-3 text-neutral-600">{fee.feeType === "flat" ? "Flat" : "Persentase"}</td>
                <td className="px-4 py-3 text-neutral-600">
                  {fee.feeType === "flat" ? formatRupiah(fee.amount) : `${fee.amount}%`}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      fee.isActive ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    {fee.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => onEdit(fee)} className="font-medium text-brand-red hover:underline">
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setError(null);
                        setPendingDeleteId(fee.id);
                      }}
                      className="font-medium text-neutral-500 hover:text-red-600"
                    >
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminConfirmDialog
        open={pendingDeleteFee !== null}
        title={`Hapus biaya "${pendingDeleteFee?.label ?? ""}"?`}
        description={
          <p>
            Order yang sudah memakai biaya ini TIDAK akan berubah — nilainya sudah tersimpan permanen di histori
            order masing-masing. Ini hanya menghapus konfigurasi biaya ini dari checkout selanjutnya.
          </p>
        }
        confirmLabel="Hapus Biaya"
        isPending={isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </>
  );
}
