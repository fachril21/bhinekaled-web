// Epic 7: Admin Kelola Order
// Lihat docs/plan/epic-7-admin-kelola-order.md bagian 5.1.

import { getAdminOrderList } from "@/lib/queries/orders";
import { AdminOrderTable } from "@/components/admin/AdminOrderTable";
import { AdminOrderPagination } from "@/components/admin/AdminOrderPagination";
import { ORDER_STATUS_LABEL } from "@/components/admin/AdminOrderStatusBadge";
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
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Kelola Order</h1>
        <p className="mt-1 text-sm text-neutral-600">Pantau order masuk dan perbarui status pengiriman.</p>
      </div>

      <form method="get" className="mt-6 flex flex-wrap items-center gap-2">
        <label htmlFor="status-filter" className="text-sm text-neutral-600">
          Filter status:
        </label>
        <select
          id="status-filter"
          name="status"
          defaultValue={status}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
        >
          {STATUS_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Cari nomor order..."
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
        />

        <button
          type="submit"
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
        >
          Terapkan
        </button>
      </form>

      <div className="mt-4">
        <AdminOrderTable orders={result.orders} />
      </div>

      <AdminOrderPagination
        currentPage={result.page}
        totalPages={result.totalPages}
        basePath="/admin/order"
        query={{ status: status === "semua" ? undefined : status, q: search }}
      />
    </main>
  );
}
