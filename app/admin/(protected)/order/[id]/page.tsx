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

type OrderDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const order = await getAdminOrderById(id);
  if (!order) notFound();

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <Link href="/admin/order" className="text-sm text-brand-red hover:underline">
        ← Kembali ke daftar order
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">{order.orderNumber}</h1>
          <p className="text-sm text-neutral-500">Dibuat {formatDate(order.createdAt)}</p>
        </div>
        <AdminOrderStatusBadge status={order.status} />
      </div>

      <section className="mt-6">
        <OrderStatusStepper status={order.status} createdAt={order.createdAt} updatedAt={order.updatedAt} />
      </section>

      <section className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 p-4">
          <h2 className="text-sm font-semibold text-neutral-900">Data Pengiriman</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div>
              <dt className="text-neutral-500">Nama</dt>
              <dd className="text-neutral-900">{order.customerName}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">No. HP</dt>
              <dd className="text-neutral-900">{order.customerPhone}</dd>
            </div>
            <div>
              <dt className="text-neutral-500">Alamat</dt>
              <dd className="text-neutral-900">{order.shippingAddress}</dd>
            </div>
            {order.notes && (
              <div>
                <dt className="text-neutral-500">Catatan</dt>
                <dd className="text-neutral-900">{order.notes}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="rounded-xl border border-neutral-200 p-4">
          <h2 className="text-sm font-semibold text-neutral-900">Ringkasan Pembayaran</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-neutral-500">Subtotal</dt>
              <dd className="text-neutral-900">{formatRupiah(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-500">Ongkir</dt>
              <dd className="text-neutral-900">{formatRupiah(order.shippingCost)}</dd>
            </div>
            <div className="flex justify-between border-t border-neutral-200 pt-2 font-semibold">
              <dt className="text-neutral-900">Total</dt>
              <dd className="text-neutral-900">{formatRupiah(order.total)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-500">Metode Pembayaran</dt>
              <dd className="text-neutral-900">{order.paymentMethod ?? "n/a"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-500">Status Pembayaran</dt>
              <dd className="text-neutral-900">{order.paymentStatus}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-neutral-900">Item Dibeli</h2>
        {order.items.length === 0 ? (
          <p className="mt-3 rounded-lg border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
            Tidak ada item.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-xl border border-neutral-200">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="bg-neutral-50 text-xs font-medium uppercase text-neutral-500">
                <tr>
                  <th className="px-4 py-3">Produk</th>
                  <th className="px-4 py-3">Harga</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <span className="font-medium text-neutral-900">{item.productName}</span>
                      {item.variantName && <span className="block text-xs text-neutral-500">{item.variantName}</span>}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{formatRupiah(item.priceSnapshot)}</td>
                    <td className="px-4 py-3 text-neutral-600">{item.qty}</td>
                    <td className="px-4 py-3 text-neutral-600">{formatRupiah(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-8 max-w-sm">
        <OrderStatusUpdateForm orderId={order.id} currentStatus={order.status} />
      </section>
    </main>
  );
}
