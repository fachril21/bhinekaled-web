"use client";

// Epic 5: Admin Kelola Produk & Kategori
// Lihat docs/plan/epic-5-admin-kelola-produk-kategori.md bagian 6.3.

import { Input } from "@/components/admin/ui/form/Input";
import { Button } from "@/components/admin/ui/Button";
import { Alert } from "@/components/admin/ui/Alert";

export type ManagedVariant = {
  id?: string;
  name: string;
  sku: string;
  priceOverride: string; // kosong = pakai base_price produk
  stock: string;
  weightOverride: string; // kosong = pakai weight_gram produk (Epic 12)
};

type ProductVariantEditorProps = {
  variants: ManagedVariant[];
  onChange: (variants: ManagedVariant[]) => void;
  deletedVariantIds: string[];
  onDeletedChange: (ids: string[]) => void;
};

export function ProductVariantEditor({
  variants,
  onChange,
  deletedVariantIds,
  onDeletedChange,
}: ProductVariantEditorProps) {
  function updateVariant(index: number, field: keyof ManagedVariant, value: string) {
    onChange(variants.map((v, i) => (i === index ? { ...v, [field]: value } : v)));
  }

  function removeVariant(index: number) {
    const variant = variants[index];
    if (variant.id) {
      onDeletedChange([...deletedVariantIds, variant.id]);
    }
    onChange(variants.filter((_, i) => i !== index));
  }

  function addVariant() {
    onChange([...variants, { name: "", sku: "", priceOverride: "", stock: "0", weightOverride: "" }]);
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
      <h2 className="text-base font-semibold text-gray-800">Varian Produk</h2>

      {variants.length > 0 && (
        <Alert
          variant="warning"
          title="Varian aktif"
          message="Harga & stok dasar produk diabaikan storefront selama produk punya varian — nilai dasar hanya dipakai sebagai fallback kalau semua varian dihapus lagi nanti."
        />
      )}

      {variants.map((variant, index) => (
        <div
          key={variant.id ?? `new-${index}`}
          className="grid grid-cols-1 gap-2 rounded-xl border border-gray-200 p-3 sm:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] sm:items-center"
        >
          <Input
            value={variant.name}
            onChange={(e) => updateVariant(index, "name", e.target.value)}
            placeholder="Nama varian (mis. Putih 6000K - H4)"
            aria-label="Nama varian"
          />
          <Input
            value={variant.sku}
            onChange={(e) => updateVariant(index, "sku", e.target.value)}
            placeholder="SKU"
            aria-label="SKU varian"
          />
          <Input
            value={variant.priceOverride}
            onChange={(e) => updateVariant(index, "priceOverride", e.target.value)}
            placeholder="Harga (opsional)"
            aria-label="Harga varian (opsional)"
            inputMode="numeric"
          />
          <Input
            value={variant.stock}
            onChange={(e) => updateVariant(index, "stock", e.target.value)}
            placeholder="Stok"
            aria-label="Stok varian"
            inputMode="numeric"
          />
          <Input
            value={variant.weightOverride}
            onChange={(e) => updateVariant(index, "weightOverride", e.target.value)}
            placeholder="Berat gram (opsional)"
            aria-label="Berat varian dalam gram (opsional)"
            inputMode="numeric"
          />
          <Button type="button" variant="danger" size="sm" onClick={() => removeVariant(index)}>
            Hapus
          </Button>
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={addVariant} className="self-start">
        + Tambah Varian
      </Button>
    </div>
  );
}
