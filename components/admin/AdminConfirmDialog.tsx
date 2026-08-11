"use client";

// Epic 5: Admin Kelola Produk & Kategori
// Lihat docs/plan/epic-5-admin-kelola-produk-kategori.md bagian 6.5.
//
// Native <dialog> — modal, focus-trap, dan backdrop sudah ditangani bawaan
// browser modern, tidak perlu dependency portal/focus-trap tambahan.

import type { ReactNode } from "react";
import { Modal } from "@/components/admin/ui/Modal";
import { Button } from "@/components/admin/ui/Button";

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
  return (
    <Modal isOpen={open} onClose={onCancel} className="max-w-md" showCloseButton={false}>
      <div className="flex flex-col gap-4 p-6">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        <div className="text-sm text-gray-500">{description}</div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel} disabled={isPending}>
            Batal
          </Button>
          <Button variant="primary" onClick={onConfirm} disabled={isPending}>
            {isPending ? "Memproses..." : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
