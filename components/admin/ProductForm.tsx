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
import { Label } from "@/components/admin/ui/form/Label";
import { Input } from "@/components/admin/ui/form/Input";
import { TextArea } from "@/components/admin/ui/form/TextArea";
import { Select } from "@/components/admin/ui/form/Select";
import { Button } from "@/components/admin/ui/Button";
import { Alert } from "@/components/admin/ui/Alert";
import type { Category } from "@/lib/queries/categories";
import type { AdminProductDetail } from "@/lib/queries/admin-products";
import type { ProductStatus } from "@/types/database.types";

const CARD_CLASS = "flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 md:p-6";
const CARD_TITLE_CLASS = "text-base font-semibold text-gray-800";

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

  const statusSelectOptions = STATUS_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }));
  const categorySelectOptions = categories.map((c) => ({ value: c.id, label: c.name }));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className={CARD_CLASS}>
        <h2 className={CARD_TITLE_CLASS}>Informasi Dasar</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="product-name">Nama Produk</Label>
            <Input
              id="product-name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              error={Boolean(fieldErrors.name)}
              hint={fieldErrors.name}
            />
          </div>

          <div>
            <Label htmlFor="product-slug">Slug</Label>
            <Input
              id="product-slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              required
              error={Boolean(fieldErrors.slug)}
              hint={fieldErrors.slug}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="product-description">Deskripsi</Label>
          <TextArea
            id="product-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </div>
      </div>

      <div className={CARD_CLASS}>
        <h2 className={CARD_TITLE_CLASS}>Kategori, Harga &amp; Stok</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
          <div>
            <Label htmlFor="product-category">Kategori</Label>
            <Select
              id="product-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              placeholder="Tanpa kategori"
              options={categorySelectOptions}
            />
          </div>

          <div>
            <Label htmlFor="product-status">Status</Label>
            <Select
              id="product-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ProductStatus)}
              options={statusSelectOptions}
            />
          </div>

          <div>
            <Label htmlFor="product-price">Harga Dasar</Label>
            <Input
              id="product-price"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              inputMode="numeric"
              required
            />
          </div>

          <div>
            <Label htmlFor="product-stock">Stok Dasar</Label>
            <Input
              id="product-stock"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              inputMode="numeric"
              required
            />
          </div>

          <div>
            <Label htmlFor="product-weight">Berat (gram)</Label>
            <Input
              id="product-weight"
              value={weightGram}
              onChange={(e) => setWeightGram(e.target.value)}
              inputMode="numeric"
              required
            />
          </div>
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

      <div className={CARD_CLASS}>
        <h2 className={CARD_TITLE_CLASS}>SEO (opsional)</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="product-meta-title">Meta Title</Label>
            <Input id="product-meta-title" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="product-meta-description">Meta Description</Label>
            <Input
              id="product-meta-description"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
            />
          </div>
        </div>
      </div>

      {error && <Alert variant="error" title="Gagal menyimpan produk" message={error} />}

      <div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Menyimpan..." : mode === "edit" ? "Simpan Perubahan" : "Simpan Produk"}
        </Button>
      </div>
    </form>
  );
}
