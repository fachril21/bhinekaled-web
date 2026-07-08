"use client";

// Epic 5: Admin Kelola Produk & Kategori
// Lihat docs/plan/epic-5-admin-kelola-produk-kategori.md bagian 6.2.

import { useState } from "react";
import Image from "next/image";
import { isUnoptimizedImage } from "@/lib/image";
import { uploadProductImage } from "@/lib/storage/upload-product-image";

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
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-neutral-700">Gambar Produk</label>

      <input
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        disabled={isUploading}
        onChange={(e) => {
          void handleFilesSelected(e.target.files);
          e.target.value = "";
        }}
        className="text-sm"
      />
      {isUploading && <p className="text-xs text-neutral-500">Mengupload...</p>}
      {uploadErrors.length > 0 && (
        <ul className="list-disc pl-5 text-xs text-red-600">
          {uploadErrors.map((error, i) => (
            <li key={i}>{error}</li>
          ))}
        </ul>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((image, index) => (
            <div key={image.id ?? image.url} className="flex flex-col gap-1 rounded-lg border border-neutral-200 p-2">
              <div className="relative aspect-square overflow-hidden rounded-md bg-neutral-100">
                <Image
                  src={image.url}
                  alt={image.altText || "Gambar produk"}
                  fill
                  sizes="200px"
                  className="object-cover"
                  unoptimized={isUnoptimizedImage(image.url)}
                />
              </div>
              <input
                value={image.altText}
                onChange={(e) => updateAltText(index, e.target.value)}
                placeholder="Alt text (opsional)"
                className="rounded-md border border-neutral-300 px-2 py-1 text-xs focus:border-brand-red focus:outline-none"
              />
              <div className="flex items-center justify-between text-xs">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => moveImage(index, -1)}
                    disabled={index === 0}
                    className="rounded border border-neutral-300 px-2 py-0.5 text-neutral-600 disabled:opacity-40"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveImage(index, 1)}
                    disabled={index === images.length - 1}
                    className="rounded border border-neutral-300 px-2 py-0.5 text-neutral-600 disabled:opacity-40"
                  >
                    ↓
                  </button>
                </div>
                <button type="button" onClick={() => removeImage(index)} className="text-neutral-500 hover:text-red-600">
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
