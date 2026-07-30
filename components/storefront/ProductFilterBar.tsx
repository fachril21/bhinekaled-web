"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { CategorySummary } from "@/lib/queries/categories";
import type { ProductSortOption } from "@/lib/queries/products";

const MAX_PRICE_CEILING = 2_000_000;
const MAX_PRICE_STEP = 25_000;

const SORT_LABELS: Record<ProductSortOption, string> = {
  terbaru: "Terbaru",
  termurah: "Harga Termurah",
  termahal: "Harga Termahal",
};

type ProductFilterBarProps = {
  categories: CategorySummary[];
  activeCategorySlug?: string;
  maxPrice?: number;
  sort: ProductSortOption;
  basePath: string;
  showCategoryFilter?: boolean;
};

export function ProductFilterBar({
  categories,
  activeCategorySlug,
  maxPrice,
  sort,
  basePath,
  showCategoryFilter = true,
}: ProductFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string | undefined) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    const query = params.toString();
    router.push(`${basePath}${query ? `?${query}` : ""}`);
  }

  return (
    <aside className="space-y-6">
      {showCategoryFilter && (
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-neutral-900">Kategori</h3>
          <ul className="space-y-1 text-sm">
            <li>
              <button
                type="button"
                onClick={() => updateParam("kategori", undefined)}
                className={`w-full rounded-lg px-3 py-2 text-left transition ${
                  !activeCategorySlug
                    ? "bg-brand-red font-semibold text-white"
                    : "text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                Semua Kategori
              </button>
            </li>
            {categories.map((category) => (
              <li key={category.slug}>
                <button
                  type="button"
                  onClick={() => updateParam("kategori", category.slug)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition ${
                    activeCategorySlug === category.slug
                      ? "bg-brand-red font-semibold text-white"
                      : "text-neutral-700 hover:bg-neutral-100"
                  }`}
                >
                  <span>{category.name}</span>
                  <span className="text-xs opacity-75">{category.activeProductCount}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-neutral-900">Harga Maksimal</h3>
        <input
          type="range"
          min={0}
          max={MAX_PRICE_CEILING}
          step={MAX_PRICE_STEP}
          value={maxPrice ?? MAX_PRICE_CEILING}
          onChange={(event) => {
            const value = Number(event.target.value);
            updateParam("max", value >= MAX_PRICE_CEILING ? undefined : String(value));
          }}
          className="w-full accent-[#e6212a]"
          aria-label="Harga maksimal"
        />
        <p className="mt-2 text-sm font-bold text-brand-red">
          Rp {(maxPrice ?? MAX_PRICE_CEILING).toLocaleString("id-ID")}
        </p>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        <label htmlFor="product-sort" className="mb-2 block text-sm font-semibold text-neutral-900">
          Urutkan
        </label>
        <select
          id="product-sort"
          value={sort}
          onChange={(event) => updateParam("sort", event.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        >
          {Object.entries(SORT_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </aside>
  );
}
