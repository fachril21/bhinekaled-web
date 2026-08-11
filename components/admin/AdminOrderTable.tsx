// Epic 7: Admin Kelola Order
// Lihat docs/plan/epic-7-admin-kelola-order.md bagian 6.2.
//
// Presentational, server-safe — tidak ada aksi hapus/interaktif di listing
// (beda dari AdminProductTable), murni render + Link navigasi ke detail.

import Link from "next/link";
import { formatRupiah, formatDate } from "@/lib/format";
import { AdminOrderStatusBadge } from "@/components/admin/AdminOrderStatusBadge";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/admin/ui/Table";
import type { AdminOrderListItem } from "@/lib/queries/orders";

const HEADER_CELL_CLASS = "px-5 py-3 text-start text-theme-xs font-medium uppercase text-gray-500";
const BODY_CELL_CLASS = "px-5 py-4 text-start text-theme-sm text-gray-500";

type AdminOrderTableProps = {
  orders: AdminOrderListItem[];
};

export function AdminOrderTable({ orders }: AdminOrderTableProps) {
  if (orders.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
        Belum ada order.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="max-w-full overflow-x-auto">
        <Table className="min-w-[720px]">
          <TableHeader className="border-b border-gray-100">
            <TableRow>
              <TableCell isHeader className={HEADER_CELL_CLASS}>
                No. Order
              </TableCell>
              <TableCell isHeader className={HEADER_CELL_CLASS}>
                Tanggal
              </TableCell>
              <TableCell isHeader className={HEADER_CELL_CLASS}>
                Customer
              </TableCell>
              <TableCell isHeader className={HEADER_CELL_CLASS}>
                Total
              </TableCell>
              <TableCell isHeader className={HEADER_CELL_CLASS}>
                Status
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100">
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className={BODY_CELL_CLASS}>
                  <Link href={`/admin/order/${order.id}`} className="font-medium text-brand-600 hover:underline">
                    {order.orderNumber}
                  </Link>
                </TableCell>
                <TableCell className={BODY_CELL_CLASS}>{formatDate(order.createdAt)}</TableCell>
                <TableCell className={BODY_CELL_CLASS}>{order.customerName}</TableCell>
                <TableCell className={BODY_CELL_CLASS}>{formatRupiah(order.total)}</TableCell>
                <TableCell className={BODY_CELL_CLASS}>
                  <AdminOrderStatusBadge status={order.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
