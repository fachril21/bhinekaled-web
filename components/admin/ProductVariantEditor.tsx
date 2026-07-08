"use client";

// Epic 5: Admin Kelola Produk & Kategori
// Lihat docs/plan/epic-5-admin-kelola-produk-kategori.md bagian 6.3.

export type ManagedVariant = {
  id?: string;
  name: string;
  sku: string;
  priceOverride: string; // kosong = pakai base_price produk
  stock: string;
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
    onChange([...variants, { name: "", sku: "", priceOverride: "", stock: "0" }]);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-neutral-700">Varian Produk</label>
      </div>

      {variants.length > 0 && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Harga & stok dasar produk diabaikan storefront selama produk punya varian — nilai dasar hanya dipakai
          sebagai fallback kalau semua varian dihapus lagi nanti.
        </p>
      )}

      {variants.map((variant, index) => (
        <div key={variant.id ?? `new-${index}`} className="grid grid-cols-1 gap-2 rounded-lg border border-neutral-200 p-3 sm:grid-cols-[2fr_1fr_1fr_1fr_auto]">
          <input
            value={variant.name}
            onChange={(e) => updateVariant(index, "name", e.target.value)}
            placeholder="Nama varian (mis. Putih 6000K - H4)"
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none"
          />
          <input
            value={variant.sku}
            onChange={(e) => updateVariant(index, "sku", e.target.value)}
            placeholder="SKU"
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none"
          />
          <input
            value={variant.priceOverride}
            onChange={(e) => updateVariant(index, "priceOverride", e.target.value)}
            placeholder="Harga (opsional)"
            inputMode="numeric"
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none"
          />
          <input
            value={variant.stock}
            onChange={(e) => updateVariant(index, "stock", e.target.value)}
            placeholder="Stok"
            inputMode="numeric"
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none"
          />
          <button
            type="button"
            onClick={() => removeVariant(index)}
            className="rounded-md border border-neutral-300 px-3 text-sm text-neutral-500 hover:text-red-600"
          >
            Hapus
          </button>
        </div>
      ))}

      <button type="button" onClick={addVariant} className="self-start text-sm font-medium text-brand-red hover:underline">
        + Tambah Varian
      </button>
    </div>
  );
}
