import type { MetadataRoute } from "next";

import { isSearchIndexingAllowed } from "@/lib/seo-config";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://example.com";

  // Fase 1 masih tahap testing — blokir semua crawler sampai
  // ALLOW_SEARCH_INDEXING=true di-set (lihat lib/seo-config.ts).
  if (!isSearchIndexingAllowed()) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
