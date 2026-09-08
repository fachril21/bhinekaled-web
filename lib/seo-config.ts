/**
 * Kontrol satu pintu buat boleh/tidaknya situs di-index mesin pencari.
 *
 * Fase 1 masih tahap testing, jadi default-nya BLOKIR: robots.txt disallow
 * semua + meta tag `noindex, nofollow` di semua halaman. Begitu situs siap
 * live, set `ALLOW_SEARCH_INDEXING=true` di environment produksi.
 *
 * Server-only — tidak ada prefix NEXT_PUBLIC_ karena hanya dipakai di
 * app/robots.ts dan metadata Server Component (app/layout.tsx).
 */
export function isSearchIndexingAllowed(): boolean {
  return process.env.ALLOW_SEARCH_INDEXING === "true";
}
