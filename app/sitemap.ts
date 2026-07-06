import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

// Epic 1: tambah entry dinamis produk (status='active') & kategori.
// Structured data (schema.org Product) tetap scope Epic 8, bukan di sini.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://example.com";

  const staticEntries: MetadataRoute.Sitemap = [
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

  try {
    const supabase = await createClient();

    const [{ data: products, error: productsError }, { data: categories, error: categoriesError }] =
      await Promise.all([
        supabase.from("products").select("slug, updated_at").eq("status", "active"),
        supabase.from("categories").select("slug, updated_at"),
      ]);

    if (productsError) throw productsError;
    if (categoriesError) throw categoriesError;

    const productEntries: MetadataRoute.Sitemap = (products ?? []).map((product) => ({
      url: `${baseUrl}/produk/${product.slug}`,
      lastModified: new Date(product.updated_at),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    const categoryEntries: MetadataRoute.Sitemap = (categories ?? []).map((category) => ({
      url: `${baseUrl}/kategori/${category.slug}`,
      lastModified: new Date(category.updated_at),
      changeFrequency: "weekly",
      priority: 0.6,
    }));

    return [...staticEntries, ...productEntries, ...categoryEntries];
  } catch {
    // Supabase belum terkoneksi / gagal diakses saat build — fallback ke
    // entry statis supaya `next build` tidak gagal total (docs/plan #8.4 no.30).
    return staticEntries;
  }
}
