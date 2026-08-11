"use client";

// Epic 11: Admin Pengaturan Biaya Lainnya
// Lihat docs/plan/epic-11-admin-pengaturan-biaya-lainnya.md bagian 6.2.

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatRupiah } from "@/lib/format";
import { deleteFeeAction } from "@/lib/actions/fees";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/admin/ui/Table";
import { Badge } from "@/components/admin/ui/Badge";
import { Alert } from "@/components/admin/ui/Alert";
import type { AdminFeeListItem } from "@/lib/queries/admin-fees";

const HEADER_CELL_CLASS = "px-5 py-3 text-start text-theme-xs font-medium uppercase text-gray-500";
const BODY_CELL_CLASS = "px-5 py-4 text-start text-theme-sm text-gray-500";

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
      <p className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
        Belum ada biaya.
      </p>
    );
  }

  return (
    <>
      {error && (
        <div className="mb-4">
          <Alert variant="error" title="Gagal menghapus biaya" message={error} />
        </div>
      )}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="max-w-full overflow-x-auto">
          <Table className="min-w-[640px]">
            <TableHeader className="border-b border-gray-100">
              <TableRow>
                <TableCell isHeader className={HEADER_CELL_CLASS}>
                  Label
                </TableCell>
                <TableCell isHeader className={HEADER_CELL_CLASS}>
                  Tipe
                </TableCell>
                <TableCell isHeader className={HEADER_CELL_CLASS}>
                  Nilai
                </TableCell>
                <TableCell isHeader className={HEADER_CELL_CLASS}>
                  Status
                </TableCell>
                <TableCell isHeader className={`${HEADER_CELL_CLASS} text-right`}>
                  Aksi
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100">
              {fees.map((fee) => (
                <TableRow key={fee.id}>
                  <TableCell className={`${BODY_CELL_CLASS} font-medium text-gray-800`}>{fee.label}</TableCell>
                  <TableCell className={BODY_CELL_CLASS}>{fee.feeType === "flat" ? "Flat" : "Persentase"}</TableCell>
                  <TableCell className={BODY_CELL_CLASS}>
                    {fee.feeType === "flat" ? formatRupiah(fee.amount) : `${fee.amount}%`}
                  </TableCell>
                  <TableCell className={BODY_CELL_CLASS}>
                    <Badge size="sm" color={fee.isActive ? "success" : "light"}>
                      {fee.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </TableCell>
                  <TableCell className={`${BODY_CELL_CLASS} text-right`}>
                    <div className="flex justify-end gap-4">
                      <button
                        type="button"
                        onClick={() => onEdit(fee)}
                        className="font-medium text-brand-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setError(null);
                          setPendingDeleteId(fee.id);
                        }}
                        className="font-medium text-gray-500 hover:text-error-600"
                      >
                        Hapus
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
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
