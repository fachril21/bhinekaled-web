"use client";

// Epic 5: Admin Kelola Produk & Kategori
// Lihat docs/plan/epic-5-admin-kelola-produk-kategori.md bagian 6.3.

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
        <div key={variant.id ?? `new-${index}`} className="grid grid-cols-1 gap-2 rounded-lg border border-neutral-200 p-3 sm:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]">
          <input
            value={variant.name}
            onChange={(e) => updateVariant(index, "name", e.target.value)}
            placeholder="Nama varian (mis. Putih 6000K - H4)"
            aria-label="Nama varian"
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
          />
          <input
            value={variant.sku}
            onChange={(e) => updateVariant(index, "sku", e.target.value)}
            placeholder="SKU"
            aria-label="SKU varian"
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
          />
          <input
            value={variant.priceOverride}
            onChange={(e) => updateVariant(index, "priceOverride", e.target.value)}
            placeholder="Harga (opsional)"
            aria-label="Harga varian (opsional)"
            inputMode="numeric"
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
          />
          <input
            value={variant.stock}
            onChange={(e) => updateVariant(index, "stock", e.target.value)}
            placeholder="Stok"
            aria-label="Stok varian"
            inputMode="numeric"
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
          />
          <input
            value={variant.weightOverride}
            onChange={(e) => updateVariant(index, "weightOverride", e.target.value)}
            placeholder="Berat gram (opsional)"
            aria-label="Berat varian dalam gram (opsional)"
            inputMode="numeric"
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none focus:ring-1 focus:ring-brand-red"
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
