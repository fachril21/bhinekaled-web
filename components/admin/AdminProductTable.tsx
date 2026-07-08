"use client";

// Epic 5: Admin Kelola Produk & Kategori
// Lihat docs/plan/epic-5-admin-kelola-produk-kategori.md bagian 4 & 6.5.

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatRupiah } from "@/lib/format";
import { isUnoptimizedImage } from "@/lib/image";
import { deleteProductAction } from "@/lib/actions/products";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import type { AdminProductListItem } from "@/lib/queries/admin-products";

type AdminProductTableProps = {
  products: AdminProductListItem[];
};

export function AdminProductTable({ products }: AdminProductTableProps) {
  const router = useRouter();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const pendingDeleteProduct = products.find((p) => p.id === pendingDeleteId) ?? null;

  function handleConfirmDelete() {
    if (!pendingDeleteId) return;
    startTransition(async () => {
      const result = await deleteProductAction(pendingDeleteId);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setPendingDeleteId(null);
      router.refresh();
    });
  }

  if (products.length === 0) {
    return <p className="rounded-lg border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500">Belum ada produk.</p>;
  }

  return (
    <>
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      <div className="overflow-x-auto rounded-xl border border-neutral-200">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-neutral-50 text-xs font-medium uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3">Produk</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Harga</th>
              <th className="px-4 py-3">Stok</th>
              <th className="px-4 py-3">Varian</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="flex items-center gap-3 px-4 py-3">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-neutral-100">
                    {product.imageUrl && (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        sizes="40px"
                        className="object-cover"
                        unoptimized={isUnoptimizedImage(product.imageUrl)}
                      />
                    )}
                  </div>
                  <span className="font-medium text-neutral-900">{product.name}</span>
                </td>
                <td className="px-4 py-3 text-neutral-600">{product.categoryName ?? "Tanpa kategori"}</td>
                <td className="px-4 py-3 text-neutral-600">{formatRupiah(product.basePrice)}</td>
                <td className="px-4 py-3 text-neutral-600">{product.stock}</td>
                <td className="px-4 py-3 text-neutral-600">{product.variantCount > 0 ? product.variantCount : "-"}</td>
                <td className="px-4 py-3">
                  <AdminStatusBadge status={product.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <Link href={`/admin/produk/${product.id}/edit`} className="font-medium text-brand-red hover:underline">
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setError(null);
                        setPendingDeleteId(product.id);
                      }}
                      className="font-medium text-neutral-500 hover:text-red-600"
                    >
                      Hapus
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminConfirmDialog
        open={pendingDeleteProduct !== null}
        title={`Hapus "${pendingDeleteProduct?.name ?? ""}"?`}
        description={
          <div className="flex flex-col gap-2">
            <p>Tindakan ini tidak bisa dibatalkan. Menghapus produk ini akan:</p>
            <ul className="list-disc pl-5">
              <li>Menghapus semua gambar & varian produk ini secara permanen.</li>
              <li>Menghapus produk ini dari keranjang customer manapun yang sedang menyimpannya.</li>
              <li>Tidak memengaruhi riwayat order — data pesanan lama tetap utuh.</li>
            </ul>
          </div>
        }
        confirmLabel="Hapus Produk"
        isPending={isPending}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </>
  );
}
