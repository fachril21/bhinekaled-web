import type { Json } from "@/types/database.types";

type VehicleCompatibilityTagsProps = {
  tags: Json;
};

// Defensif terhadap vehicle_compatibility (jsonb) yang null/bukan array/berisi
// elemen non-string — lihat docs/plan bagian 8.1 #5. Diekspor terpisah supaya
// caller (mis. tab "Kompatibilitas" di halaman detail) bisa cek ada/tidaknya
// label valid tanpa duplikasi logic filtering.
export function getVehicleCompatibilityLabels(tags: Json): string[] {
  if (!Array.isArray(tags)) return [];
  return tags
    .map((tag) => {
      if (typeof tag === "string") return tag;
      if (typeof tag === "number") return String(tag);
      return null;
    })
    .filter((tag): tag is string => Boolean(tag && tag.trim().length > 0));
}

export function VehicleCompatibilityTags({ tags }: VehicleCompatibilityTagsProps) {
  const labels = getVehicleCompatibilityLabels(tags);
  if (labels.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {labels.map((label) => (
        <span key={label} className="rounded-full bg-neutral-100 px-3 py-1 text-sm text-neutral-700">
          {label}
        </span>
      ))}
    </div>
  );
}
