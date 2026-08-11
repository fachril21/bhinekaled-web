// Epic 5: Admin Kelola Produk & Kategori
// Lihat docs/plan/epic-5-admin-kelola-produk-kategori.md bagian 5.1.

import Link from "next/link";
import { getAdminProductList } from "@/lib/queries/admin-products";
import { AdminProductTable } from "@/components/admin/AdminProductTable";
import { Label } from "@/components/admin/ui/form/Label";
import { Select } from "@/components/admin/ui/form/Select";
import { Button } from "@/components/admin/ui/Button";
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
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-title-sm font-bold text-gray-800">Kelola Produk</h1>
          <p className="mt-1 text-sm text-gray-500">CRUD produk beserta gambar, spesifikasi, dan varian.</p>
        </div>
        <Link
          href="/admin/produk/baru"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-5 py-3 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600"
        >
          + Tambah Produk
        </Link>
      </div>

      <form method="get" className="mt-6 flex items-end gap-3 rounded-2xl border border-gray-200 bg-white p-4">
        <div className="w-56">
          <Label htmlFor="status-filter">Filter status</Label>
          <Select id="status-filter" name="status" defaultValue={status} options={STATUS_FILTER_OPTIONS} />
        </div>
        <Button type="submit" variant="outline">
          Terapkan
        </Button>
      </form>

      <div className="mt-6">
        <AdminProductTable products={products} />
      </div>
    </div>
  );
}
