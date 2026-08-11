// Epic 5: Admin Kelola Produk & Kategori
// Lihat docs/plan/epic-5-admin-kelola-produk-kategori.md bagian 4.

import type { ProductStatus } from "@/types/database.types";
import { Badge, type BadgeColor } from "@/components/admin/ui/Badge";

type AdminStatusBadgeProps = {
  status: ProductStatus;
};

const STATUS_LABEL: Record<ProductStatus, string> = {
  draft: "Draft",
  active: "Aktif",
  archived: "Arsip",
};

const STATUS_COLOR: Record<ProductStatus, BadgeColor> = {
  draft: "light",
  active: "success",
  archived: "warning",
};

export function AdminStatusBadge({ status }: AdminStatusBadgeProps) {
  return (
    <Badge size="sm" color={STATUS_COLOR[status]}>
      {STATUS_LABEL[status]}
    </Badge>
  );
}
