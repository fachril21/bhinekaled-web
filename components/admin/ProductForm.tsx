"use client";

// Epic 5: Admin Kelola Produk & Kategori
// Lihat docs/plan/epic-5-admin-kelola-produk-kategori.md bagian 6.1.
//
// Dipanggil sebagai fungsi async langsung (bukan <form action> + FormData —
// payload nested tidak cocok untuk FormData), konsisten dengan Temuan #8.

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/slug";
import { saveProductAction } from "@/lib/actions/products";
import { ProductImageManager, type DeletedImage, type ManagedImage } from "@/components/admin/ProductImageManager";
import { ProductVariantEditor, type ManagedVariant } from "@/components/admin/ProductVariantEditor";
import { ProductSpecificationEditor, type SpecificationRow } from "@/components/admin/ProductSpecificationEditor";
import { VehicleCompatibilityEditor } from "@/components/admin/VehicleCompatibilityEditor";
import type { Category } from "@/lib/queries/categories";
import type { AdminProductDetail } from "@/lib/queries/admin-products";
import type { ProductStatus } from "@/types/database.types";

type ProductFormProps = {
  mode: "create" | "edit";
  categories: Category[];
  initialProduct?: AdminProductDetail;
};

const STATUS_OPTIONS: { value: ProductStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Aktif" },
  { value: "archived", label: "Arsip" },
];

function toManagedImages(product?: AdminProductDetail): ManagedImage[] {
  return (product?.images ?? []).map((img) => ({
    id: img.id,
    url: img.url,
    altText: img.altText ?? "",
    sortOrder: img.sortOrder,
  }));
}

function toManagedVariants(product?: AdminProductDetail): ManagedVariant[] {
  return (product?.variants ?? []).map((v) => ({
    id: v.id,
    name: v.name,
    sku: v.sku ?? "",
    priceOverride: v.priceOverride === null ? "" : String(v.priceOverride),
    stock: String(v.stock),
    weightOverride: v.weightOverride === null ? "" : String(v.weightOverride),
  }));
}

export function ProductForm({ mode, categories, initialProduct }: ProductFormProps) {
  const router = useRouter();

  const [productId, setProductId] = useState<string | undefined>(initialProduct?.id);
  const [name, setName] = useState(initialProduct?.name ?? "");
  const [slug, setSlug] = useState(initialProduct?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [description, setDescription] = useState(initialProduct?.description ?? "");
  const [categoryId, setCategoryId] = useState(initialProduct?.categoryId ?? "");
  const [basePrice, setBasePrice] = useState(initialProduct ? String(initialProduct.basePrice) : "0");
  const [stock, setStock] = useState(initialProduct ? String(initialProduct.stock) : "0");
  const [weightGram, setWeightGram] = useState(initialProduct ? String(initialProduct.weightGram) : "0");
  const [status, setStatus] = useState<ProductStatus>(initialProduct?.status ?? "draft");
  const [metaTitle, setMetaTitle] = useState(initialProduct?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(initialProduct?.metaDescription ?? "");

  const [specifications, setSpecifications] = useState<SpecificationRow[]>(initialProduct?.specifications ?? []);
  const [vehicleCompatibility, setVehicleCompatibility] = useState<string[]>(
    initialProduct?.vehicleCompatibility ?? []
  );
  const [images, setImages] = useState<ManagedImage[]>(toManagedImages(initialProduct));
  const [deletedImages, setDeletedImages] = useState<DeletedImage[]>([]);
  const [variants, setVariants] = useState<ManagedVariant[]>(toManagedVariants(initialProduct));
  const [deletedVariantIds, setDeletedVariantIds] = useState<string[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<"name" | "slug", string>>>({});
  const [isPending, startTransition] = useTransition();

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // Baris kosong difilter di sini, admin tidak perlu hapus manual baris
    // trailing kosong — lihat edge case #12.
    const cleanedSpecifications = specifications.filter((s) => s.key.trim() && s.value.trim());
    const cleanedVehicleCompatibility = vehicleCompatibility.map((v) => v.trim()).filter(Boolean);

    startTransition(async () => {
      const result = await saveProductAction({
        id: productId,
        name,
        slug,
        description: description || null,
        categoryId: categoryId || null,
        basePrice: Number(basePrice) || 0,
        stock: Number(stock) || 0,
        weightGram: Number(weightGram) || 0,
        status,
        vehicleCompatibility: cleanedVehicleCompatibility,
        specifications: cleanedSpecifications,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        images: images.map((img) => ({
          id: img.id,
          url: img.url,
          altText: img.altText || null,
          sortOrder: img.sortOrder,
        })),
        deletedImages,
        variants: variants.map((v) => ({
          id: v.id,
          name: v.name,
          sku: v.sku || null,
          priceOverride: v.priceOverride === "" ? null : Number(v.priceOverride) || 0,
          stock: Number(v.stock) || 0,
          weightOverride: v.weightOverride === "" ? null : Number(v.weightOverride) || 0,
        })),
        deletedVariantIds,
      });

      if (!result.success) {
        setError(result.error);
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
        // Partial failure (Temuan #4) — produk sudah tersimpan, retry
        // berikutnya harus jadi update, bukan insert baru.
        if (result.productId) setProductId(result.productId);
        return;
      }

      router.push("/admin/produk");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="product-name" className="text-sm font-medium text-neutral-700">
            Nama Produk
          </label>
          <input
            id="product-name"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            required
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none"
          />
          {fieldErrors.name && <p className="text-xs text-red-600">{fieldErrors.name}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="product-slug" className="text-sm font-medium text-neutral-700">
            Slug
          </label>
          <input
            id="product-slug"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            required
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none"
          />
          {fieldErrors.slug && <p className="text-xs text-red-600">{fieldErrors.slug}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="product-description" className="text-sm font-medium text-neutral-700">
          Deskripsi
        </label>
        <textarea
          id="product-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
        <div className="flex flex-col gap-1">
          <label htmlFor="product-category" className="text-sm font-medium text-neutral-700">
            Kategori
          </label>
          <select
            id="product-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none"
          >
            <option value="">Tanpa kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="product-status" className="text-sm font-medium text-neutral-700">
            Status
          </label>
          <select
            id="product-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ProductStatus)}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="product-price" className="text-sm font-medium text-neutral-700">
            Harga Dasar
          </label>
          <input
            id="product-price"
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
            inputMode="numeric"
            required
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="product-stock" className="text-sm font-medium text-neutral-700">
            Stok Dasar
          </label>
          <input
            id="product-stock"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            inputMode="numeric"
            required
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="product-weight" className="text-sm font-medium text-neutral-700">
            Berat (gram)
          </label>
          <input
            id="product-weight"
            value={weightGram}
            onChange={(e) => setWeightGram(e.target.value)}
            inputMode="numeric"
            required
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none"
          />
        </div>
      </div>

      <ProductImageManager
        images={images}
        onChange={setImages}
        deletedImages={deletedImages}
        onDeletedChange={setDeletedImages}
      />

      <ProductVariantEditor
        variants={variants}
        onChange={setVariants}
        deletedVariantIds={deletedVariantIds}
        onDeletedChange={setDeletedVariantIds}
      />

      <ProductSpecificationEditor rows={specifications} onChange={setSpecifications} />

      <VehicleCompatibilityEditor values={vehicleCompatibility} onChange={setVehicleCompatibility} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="product-meta-title" className="text-sm font-medium text-neutral-700">
            Meta Title (SEO, opsional)
          </label>
          <input
            id="product-meta-title"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="product-meta-description" className="text-sm font-medium text-neutral-700">
            Meta Description (SEO, opsional)
          </label>
          <input
            id="product-meta-description"
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-brand-red px-6 py-2 text-sm font-semibold text-white hover:bg-brand-red/90 disabled:opacity-60"
        >
          {isPending ? "Menyimpan..." : mode === "edit" ? "Simpan Perubahan" : "Simpan Produk"}
        </button>
      </div>
    </form>
  );
}
