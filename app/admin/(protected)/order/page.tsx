// Epic 7: Admin Kelola Order
// Lihat docs/plan/epic-7-admin-kelola-order.md bagian 5.1.

import { getAdminOrderList } from "@/lib/queries/orders";
import { AdminOrderTable } from "@/components/admin/AdminOrderTable";
import { AdminOrderPagination } from "@/components/admin/AdminOrderPagination";
import { ORDER_STATUS_LABEL } from "@/components/admin/AdminOrderStatusBadge";
import { Label } from "@/components/admin/ui/form/Label";
import { Input } from "@/components/admin/ui/form/Input";
import { Select } from "@/components/admin/ui/form/Select";
import { Button } from "@/components/admin/ui/Button";
import type { OrderStatus } from "@/types/database.types";

const STATUS_FILTER_OPTIONS: { value: OrderStatus | "semua"; label: string }[] = [
  { value: "semua", label: "Semua Status" },
  ...(Object.keys(ORDER_STATUS_LABEL) as OrderStatus[]).map((status) => ({
    value: status,
    label: ORDER_STATUS_LABEL[status],
  })),
];

const SEARCH_MAX_LENGTH = 100;

function parseStatusParam(value: string | undefined): OrderStatus | "semua" {
  const found = STATUS_FILTER_OPTIONS.find((opt) => opt.value === value);
  return found?.value ?? "semua";
}

type OrderPageProps = {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
};

export default async function Page({ searchParams }: OrderPageProps) {
  const { status: rawStatus, q, page: rawPage } = await searchParams;
  const status = parseStatusParam(rawStatus);
  const search = q?.trim().slice(0, SEARCH_MAX_LENGTH) || undefined;
  const page = Math.max(1, Number(rawPage) || 1);

  const result = await getAdminOrderList({ status, search, page });

  return (
    <div>
      <div>
        <h1 className="text-title-sm font-bold text-gray-800">Kelola Order</h1>
        <p className="mt-1 text-sm text-gray-500">Pantau order masuk dan perbarui status pengiriman.</p>
      </div>

      <form method="get" className="mt-6 flex flex-wrap items-end gap-3 rounded-2xl border border-gray-200 bg-white p-4">
        <div className="w-56">
          <Label htmlFor="status-filter">Filter status</Label>
          <Select id="status-filter" name="status" defaultValue={status} options={STATUS_FILTER_OPTIONS} />
        </div>

        <div className="w-64">
          <Label htmlFor="order-search">Cari nomor order</Label>
          <Input id="order-search" type="text" name="q" defaultValue={q ?? ""} placeholder="Cari nomor order..." />
        </div>

        <Button type="submit" variant="outline">
          Terapkan
        </Button>
      </form>

      <div className="mt-6">
        <AdminOrderTable orders={result.orders} />
      </div>

      <AdminOrderPagination
        currentPage={result.page}
        totalPages={result.totalPages}
        basePath="/admin/order"
        query={{ status: status === "semua" ? undefined : status, q: search }}
      />
    </div>
  );
}
