import type { Json } from "@/types/database.types";

type ProductSpecificationsProps = {
  specifications: Json;
};

function isPlainObject(value: Json): value is { [key: string]: Json | undefined } {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPrimitive(value: Json | undefined): value is string | number | boolean {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}

// Defensif terhadap data specifications (jsonb) yang null/bukan object/berisi
// nested object — lihat docs/plan bagian 8.1 #6. Diekspor terpisah supaya
// caller (mis. tab "Spesifikasi" di halaman detail) bisa cek ada/tidaknya
// entry valid tanpa duplikasi logic filtering.
export function getSpecificationEntries(specifications: Json): [string, string | number | boolean][] {
  if (!isPlainObject(specifications)) return [];
  return Object.entries(specifications).filter(
    (entry): entry is [string, string | number | boolean] => isPrimitive(entry[1])
  );
}

export function ProductSpecifications({ specifications }: ProductSpecificationsProps) {
  const entries = getSpecificationEntries(specifications);
  if (entries.length === 0) return null;

  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
      {entries.map(([key, value]) => (
        <div key={key} className="flex justify-between border-b border-neutral-100 pb-2 text-sm">
          <dt className="capitalize text-neutral-500">{key.replace(/_/g, " ")}</dt>
          <dd className="font-medium text-neutral-900">{String(value)}</dd>
        </div>
      ))}
    </dl>
  );
}
