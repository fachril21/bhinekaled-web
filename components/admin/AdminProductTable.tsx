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
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/admin/ui/Table";
import { Alert } from "@/components/admin/ui/Alert";
import type { AdminProductListItem } from "@/lib/queries/admin-products";

const HEADER_CELL_CLASS = "px-5 py-3 text-start text-theme-xs font-medium uppercase text-gray-500";
const BODY_CELL_CLASS = "px-5 py-4 text-start text-theme-sm text-gray-500";

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
    return (
      <p className="rounded-2xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
        Belum ada produk.
      </p>
    );
  }

  return (
    <>
      {error && (
        <div className="mb-4">
          <Alert variant="error" title="Gagal menghapus produk" message={error} />
        </div>
      )}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="max-w-full overflow-x-auto">
          <Table className="min-w-[820px]">
            <TableHeader className="border-b border-gray-100">
              <TableRow>
                <TableCell isHeader className={HEADER_CELL_CLASS}>
                  Produk
                </TableCell>
                <TableCell isHeader className={HEADER_CELL_CLASS}>
                  Kategori
                </TableCell>
                <TableCell isHeader className={HEADER_CELL_CLASS}>
                  Harga
                </TableCell>
                <TableCell isHeader className={HEADER_CELL_CLASS}>
                  Stok
                </TableCell>
                <TableCell isHeader className={HEADER_CELL_CLASS}>
                  Varian
                </TableCell>
                <TableCell isHeader className={HEADER_CELL_CLASS}>
                  Status
                </TableCell>
                <TableCell isHeader className={`${HEADER_CELL_CLASS} text-right`}>
                  Aksi
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100">
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className={BODY_CELL_CLASS}>
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
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
                      <span className="font-medium text-gray-800">{product.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className={BODY_CELL_CLASS}>{product.categoryName ?? "Tanpa kategori"}</TableCell>
                  <TableCell className={BODY_CELL_CLASS}>{formatRupiah(product.basePrice)}</TableCell>
                  <TableCell className={BODY_CELL_CLASS}>{product.stock}</TableCell>
                  <TableCell className={BODY_CELL_CLASS}>
                    {product.variantCount > 0 ? product.variantCount : "-"}
                  </TableCell>
                  <TableCell className={BODY_CELL_CLASS}>
                    <AdminStatusBadge status={product.status} />
                  </TableCell>
                  <TableCell className={`${BODY_CELL_CLASS} text-right`}>
                    <div className="flex justify-end gap-4">
                      <Link href={`/admin/produk/${product.id}/edit`} className="font-medium text-brand-600 hover:underline">
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setError(null);
                          setPendingDeleteId(product.id);
                        }}
                        className="font-medium text-gray-500 hover:text-error-600"
                      >
                        Hapus
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
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
