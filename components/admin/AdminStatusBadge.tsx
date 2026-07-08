// Epic 5: Admin Kelola Produk & Kategori
// Lihat docs/plan/epic-5-admin-kelola-produk-kategori.md bagian 4.

import type { ProductStatus } from "@/types/database.types";

type AdminStatusBadgeProps = {
  status: ProductStatus;
};

const STATUS_LABEL: Record<ProductStatus, string> = {
  draft: "Draft",
  active: "Aktif",
  archived: "Arsip",
};

const STATUS_CLASSNAME: Record<ProductStatus, string> = {
  draft: "bg-neutral-100 text-neutral-700",
  active: "bg-green-100 text-green-700",
  archived: "bg-amber-100 text-amber-700",
};

export function AdminStatusBadge({ status }: AdminStatusBadgeProps) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASSNAME[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}
