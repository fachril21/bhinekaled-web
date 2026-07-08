"use client";

// Epic 5: Admin Kelola Produk & Kategori
// Lihat docs/plan/epic-5-admin-kelola-produk-kategori.md bagian 6.5.
//
// Native <dialog> — modal, focus-trap, dan backdrop sudah ditangani bawaan
// browser modern, tidak perlu dependency portal/focus-trap tambahan.

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

type AdminConfirmDialogProps = {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isPending?: boolean;
};

export function AdminConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Hapus",
  onConfirm,
  onCancel,
  isPending = false,
}: AdminConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={onCancel}
      className="w-full max-w-md rounded-xl border border-neutral-200 p-0 backdrop:bg-black/40"
    >
      <div className="flex flex-col gap-4 p-6">
        <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
        <div className="text-sm text-neutral-600">{description}</div>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isPending}
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-60"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {isPending ? "Memproses..." : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
