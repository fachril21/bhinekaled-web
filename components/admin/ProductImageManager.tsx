"use client";

// Epic 5: Admin Kelola Produk & Kategori
// Lihat docs/plan/epic-5-admin-kelola-produk-kategori.md bagian 6.2.

import { useState } from "react";
import Image from "next/image";
import { isUnoptimizedImage } from "@/lib/image";
import { uploadProductImage } from "@/lib/storage/upload-product-image";
import { Label } from "@/components/admin/ui/form/Label";
import { Input } from "@/components/admin/ui/form/Input";
import { FileInput } from "@/components/admin/ui/form/FileInput";
import { Button } from "@/components/admin/ui/Button";
import { Alert } from "@/components/admin/ui/Alert";

export type ManagedImage = {
  id?: string;
  url: string;
  altText: string;
  sortOrder: number;
};

export type DeletedImage = { id: string; url: string };

type ProductImageManagerProps = {
  images: ManagedImage[];
  onChange: (images: ManagedImage[]) => void;
  deletedImages: DeletedImage[];
  onDeletedChange: (images: DeletedImage[]) => void;
};

export function ProductImageManager({ images, onChange, deletedImages, onDeletedChange }: ProductImageManagerProps) {
  const [folderId] = useState(() => crypto.randomUUID());
  const [isUploading, setIsUploading] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);

  function withSortOrder(list: ManagedImage[]): ManagedImage[] {
    return list.map((image, index) => ({ ...image, sortOrder: index }));
  }

  async function handleFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setIsUploading(true);
    setUploadErrors([]);

    const results = await Promise.allSettled(
      Array.from(fileList).map((file) => uploadProductImage(file, folderId))
    );

    const errors: string[] = [];
    const uploaded: ManagedImage[] = [];
    for (const result of results) {
      if (result.status === "fulfilled") {
        if (result.value.success) {
          uploaded.push({ url: result.value.url, altText: "", sortOrder: 0 });
        } else {
          errors.push(result.value.error);
        }
      } else {
        errors.push("Gagal mengupload salah satu file.");
      }
    }

    if (uploaded.length > 0) {
      onChange(withSortOrder([...images, ...uploaded]));
    }
    setUploadErrors(errors);
    setIsUploading(false);
  }

  function updateAltText(index: number, altText: string) {
    onChange(images.map((image, i) => (i === index ? { ...image, altText } : image)));
  }

  function removeImage(index: number) {
    const image = images[index];
    if (image.id) {
      onDeletedChange([...deletedImages, { id: image.id, url: image.url }]);
    }
    onChange(withSortOrder(images.filter((_, i) => i !== index)));
  }

  function moveImage(index: number, direction: -1 | 1) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    const next = [...images];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    onChange(withSortOrder(next));
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
      <h2 className="text-base font-semibold text-gray-800">Gambar Produk</h2>

      <div>
        <Label htmlFor="product-images">Upload gambar</Label>
        <FileInput
          id="product-images"
          multiple
          accept="image/jpeg,image/png,image/webp"
          disabled={isUploading}
          onChange={(e) => {
            void handleFilesSelected(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
      {isUploading && <p className="text-xs text-gray-500">Mengupload...</p>}
      {uploadErrors.length > 0 && (
        <Alert variant="error" title="Sebagian gambar gagal diupload" message={uploadErrors.join(" ")} />
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((image, index) => (
            <div key={image.id ?? image.url} className="flex flex-col gap-2 rounded-xl border border-gray-200 p-2">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                <Image
                  src={image.url}
                  alt={image.altText || "Gambar produk"}
                  fill
                  sizes="200px"
                  className="object-cover"
                  unoptimized={isUnoptimizedImage(image.url)}
                />
              </div>
              <Input
                value={image.altText}
                onChange={(e) => updateAltText(index, e.target.value)}
                placeholder="Alt text (opsional)"
                aria-label="Alt text gambar"
                className="!h-9 !px-2.5 !py-1.5 text-xs"
              />
              <div className="flex items-center justify-between text-xs">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => moveImage(index, -1)}
                    disabled={index === 0}
                    aria-label="Pindahkan gambar ke atas"
                    className="rounded border border-gray-300 px-2 py-0.5 text-gray-600 disabled:opacity-40"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImage(index, 1)}
                    disabled={index === images.length - 1}
                    aria-label="Pindahkan gambar ke bawah"
                    className="rounded border border-gray-300 px-2 py-0.5 text-gray-600 disabled:opacity-40"
                  >
                    ↓
                  </button>
                </div>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => removeImage(index)}
                  className="!px-2 !py-1 text-xs"
                >
                  Hapus
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
