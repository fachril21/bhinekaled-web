"use client";

// Epic 5: Admin Kelola Produk & Kategori
// Lihat docs/plan/epic-5-admin-kelola-produk-kategori.md bagian 6.4.

type VehicleCompatibilityEditorProps = {
  values: string[];
  onChange: (values: string[]) => void;
};

export function VehicleCompatibilityEditor({ values, onChange }: VehicleCompatibilityEditorProps) {
  function updateValue(index: number, value: string) {
    onChange(values.map((v, i) => (i === index ? value : v)));
  }

  function removeValue(index: number) {
    onChange(values.filter((_, i) => i !== index));
  }

  function addValue() {
    onChange([...values, ""]);
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-neutral-700">Kompatibilitas Kendaraan</label>
      {values.map((value, index) => (
        <div key={index} className="flex gap-2">
          <input
            value={value}
            onChange={(e) => updateValue(index, e.target.value)}
            placeholder="Mis. Honda Vario 125/150"
            className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none"
          />
          <button
            type="button"
            onClick={() => removeValue(index)}
            className="rounded-md border border-neutral-300 px-3 text-sm text-neutral-500 hover:text-red-600"
          >
            Hapus
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addValue}
        className="self-start text-sm font-medium text-brand-red hover:underline"
      >
        + Tambah Kendaraan
      </button>
    </div>
  );
}
