// Epic 5: Admin Kelola Produk & Kategori
// Lihat docs/plan/epic-5-admin-kelola-produk-kategori.md bagian 5.1.

import Link from "next/link";
import { getAdminProductList } from "@/lib/queries/admin-products";
import { AdminProductTable } from "@/components/admin/AdminProductTable";
import type { ProductStatus } from "@/types/database.types";

const STATUS_FILTER_OPTIONS: { value: ProductStatus | "semua"; label: string }[] = [
  { value: "semua", label: "Semua Status" },
  { value: "draft", label: "Draft" },
  { value: "active", label: "Aktif" },
  { value: "archived", label: "Arsip" },
];

function parseStatusParam(value: string | undefined): ProductStatus | "semua" {
  const found = STATUS_FILTER_OPTIONS.find((opt) => opt.value === value);
  return found?.value ?? "semua";
}

type ProdukPageProps = {
  searchParams: Promise<{ status?: string }>;
};

export default async function Page({ searchParams }: ProdukPageProps) {
  const { status: rawStatus } = await searchParams;
  const status = parseStatusParam(rawStatus);

  const products = await getAdminProductList({ status });

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Kelola Produk</h1>
          <p className="mt-1 text-sm text-neutral-600">CRUD produk beserta gambar, spesifikasi, dan varian.</p>
        </div>
        <Link
          href="/admin/produk/baru"
          className="rounded-md bg-brand-red px-4 py-2 text-sm font-semibold text-white hover:bg-brand-red/90"
        >
          + Tambah Produk
        </Link>
      </div>

      <form method="get" className="mt-6 flex items-center gap-2">
        <label htmlFor="status-filter" className="text-sm text-neutral-600">
          Filter status:
        </label>
        <select
          id="status-filter"
          name="status"
          defaultValue={status}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:border-brand-red focus:outline-none"
        >
          {STATUS_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
        >
          Terapkan
        </button>
      </form>

      <div className="mt-4">
        <AdminProductTable products={products} />
      </div>
    </main>
  );
}
