// Epic 7: Admin Kelola Order
// Lihat docs/plan/epic-7-admin-kelola-order.md bagian 6.2.
//
// Presentational, server-safe — tidak ada aksi hapus/interaktif di listing
// (beda dari AdminProductTable), murni render + Link navigasi ke detail.

import Link from "next/link";
import { formatRupiah, formatDate } from "@/lib/format";
import { AdminOrderStatusBadge } from "@/components/admin/AdminOrderStatusBadge";
import type { AdminOrderListItem } from "@/lib/queries/orders";

type AdminOrderTableProps = {
  orders: AdminOrderListItem[];
};

export function AdminOrderTable({ orders }: AdminOrderTableProps) {
  if (orders.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500">
        Belum ada order.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-neutral-50 text-xs font-medium uppercase text-neutral-500">
          <tr>
            <th className="px-4 py-3">No. Order</th>
            <th className="px-4 py-3">Tanggal</th>
            <th className="px-4 py-3">Customer</th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100">
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="px-4 py-3">
                <Link href={`/admin/order/${order.id}`} className="font-medium text-brand-red hover:underline">
                  {order.orderNumber}
                </Link>
              </td>
              <td className="px-4 py-3 text-neutral-600">{formatDate(order.createdAt)}</td>
              <td className="px-4 py-3 text-neutral-600">{order.customerName}</td>
              <td className="px-4 py-3 text-neutral-600">{formatRupiah(order.total)}</td>
              <td className="px-4 py-3">
                <AdminOrderStatusBadge status={order.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
