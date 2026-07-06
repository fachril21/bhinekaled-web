import type { MetadataRoute } from "next";

// Epic 8: SEO, Analytics & Site-wide Enhancements
// TODO: tambahkan URL produk & kategori secara dinamis dari Supabase
// (query semua produk berstatus 'active' dan kategori, generate entry-nya).

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://example.com";

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/produk`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];
}
