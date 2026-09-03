"use client";

import Image from "next/image";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { isUnoptimizedImage } from "@/lib/image";
import type { ProductImage } from "@/lib/queries/products";

type ProductGalleryProps = {
  images: ProductImage[];
  productName: string;
};

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex];

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-neutral-100">
        {activeImage ? (
          <Image
            src={activeImage.url}
            alt={activeImage.altText || productName}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
            priority
            unoptimized={isUnoptimizedImage(activeImage.url)}
          />
        ) : (
          <ImagePlaceholder />
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Lihat gambar ${index + 1}`}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${
                index === activeIndex ? "border-brand-red" : "border-transparent"
              }`}
            >
              <Image
                src={image.url}
                alt={image.altText || productName}
                fill
                sizes="64px"
                className="object-cover"
                unoptimized={isUnoptimizedImage(image.url)}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ImagePlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center text-neutral-300">
      <Icon name="gallery" size={64} />
      <span className="sr-only">Gambar belum tersedia</span>
    </div>
  );
}
