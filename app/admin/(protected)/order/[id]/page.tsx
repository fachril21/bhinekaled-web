// Epic 7: Admin Kelola Order
// Lihat docs/plan/epic-7-admin-kelola-order.md bagian 5.2.
//
// `id` di URL adalah orders.id (UUID), BUKAN order_number — konsisten pola
// produk/[id]/edit (Epic 5), beda dari checkout/sukses/[order_number]
// (Epic 3, storefront publik, konteks beda karena guest tidak tahu UUID).

import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminOrderById } from "@/lib/queries/orders";
import { formatDate, formatRupiah } from "@/lib/format";
import { AdminOrderStatusBadge } from "@/components/admin/AdminOrderStatusBadge";
import { OrderStatusStepper } from "@/components/admin/OrderStatusStepper";
import { OrderStatusUpdateForm } from "@/components/admin/OrderStatusUpdateForm";
import { PaymentStatusBadge } from "@/components/admin/PaymentStatusBadge";
import { RecheckPaymentButton } from "@/components/admin/RecheckPaymentButton";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/admin/ui/Table";

const HEADER_CELL_CLASS = "px-5 py-3 text-start text-theme-xs font-medium uppercase text-gray-500";
const BODY_CELL_CLASS = "px-5 py-4 text-start text-theme-sm text-gray-500";

type OrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const order = await getAdminOrderById(id);
  if (!order) notFound();

  return (
    <div>
      <Link href="/admin/order" className="text-sm text-brand-600 hover:underline">
        ← Kembali ke daftar order
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-title-sm font-bold text-gray-800">{order.orderNumber}</h1>
          <p className="text-sm text-gray-500">Dibuat {formatDate(order.createdAt)}</p>
        </div>
        <AdminOrderStatusBadge status={order.status} />
      </div>

      <section className="mt-6">
        <OrderStatusStepper status={order.status} createdAt={order.createdAt} updatedAt={order.updatedAt} />
      </section>

      <section className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="text-base font-semibold text-gray-800">Data Pengiriman</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-gray-500">Nama</dt>
              <dd className="text-gray-800">{order.customerName}</dd>
            </div>
            <div>
              <dt className="text-gray-500">No. HP</dt>
              <dd className="text-gray-800">{order.customerPhone}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Alamat</dt>
              <dd className="text-gray-800">{order.shippingAddress}</dd>
            </div>
            {order.notes && (
              <div>
                <dt className="text-gray-500">Catatan</dt>
                <dd className="text-gray-800">{order.notes}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="text-base font-semibold text-gray-800">Ringkasan Pembayaran</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Subtotal</dt>
              <dd className="text-gray-800">{formatRupiah(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Ongkir</dt>
              <dd className="text-gray-800">{formatRupiah(order.shippingCost)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Kurir</dt>
              <dd className="text-gray-800">{order.shippingCourierService ?? "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Tujuan Ongkir</dt>
              <dd className="text-gray-800">{order.shippingDestinationLabel ?? "—"}</dd>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 font-semibold">
              <dt className="text-gray-800">Total</dt>
              <dd className="text-gray-800">{formatRupiah(order.total)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Metode Pembayaran</dt>
              <dd className="text-gray-800">{order.midtransPaymentType ?? order.paymentMethod ?? "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Status Pembayaran</dt>
              <dd>
                <PaymentStatusBadge status={order.paymentStatus} />
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">No. Transaksi Midtrans</dt>
              <dd className="text-gray-800">{order.midtransTransactionId ?? "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Terakhir Notifikasi</dt>
              <dd className="text-gray-800">
                {order.midtransLastNotificationAt ? formatDate(order.midtransLastNotificationAt) : "—"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Dibayar pada</dt>
              <dd className="text-gray-800">{order.paidAt ? formatDate(order.paidAt) : "—"}</dd>
            </div>
          </dl>
          <div className="mt-4">
            <RecheckPaymentButton orderId={order.id} />
          </div>
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-base font-semibold text-gray-800">Item Dibeli</h2>
        {order.items.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
            Tidak ada item.
          </p>
        ) : (
          <div className="mt-3 overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="max-w-full overflow-x-auto">
              <Table className="min-w-[560px]">
                <TableHeader className="border-b border-gray-100">
                  <TableRow>
                    <TableCell isHeader className={HEADER_CELL_CLASS}>
                      Produk
                    </TableCell>
                    <TableCell isHeader className={HEADER_CELL_CLASS}>
                      Harga
                    </TableCell>
                    <TableCell isHeader className={HEADER_CELL_CLASS}>
                      Qty
                    </TableCell>
                    <TableCell isHeader className={HEADER_CELL_CLASS}>
                      Subtotal
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100">
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className={BODY_CELL_CLASS}>
                        <span className="font-medium text-gray-800">{item.productName}</span>
                        {item.variantName && <span className="block text-xs text-gray-500">{item.variantName}</span>}
                      </TableCell>
                      <TableCell className={BODY_CELL_CLASS}>{formatRupiah(item.priceSnapshot)}</TableCell>
                      <TableCell className={BODY_CELL_CLASS}>{item.qty}</TableCell>
                      <TableCell className={BODY_CELL_CLASS}>{formatRupiah(item.subtotal)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </section>

      <section className="mt-6 max-w-sm">
        <OrderStatusUpdateForm orderId={order.id} currentStatus={order.status} />
      </section>
    </div>
  );
}
