"use client";

// Epic 5: Admin Kelola Produk & Kategori
// Lihat docs/plan/epic-5-admin-kelola-produk-kategori.md bagian 6.4.
//
// specifications (jsonb) generik key-value, bukan skema tetap — tidak ada
// validasi bentuk ketat di sini (watt/lumen/dsb bebas teks).

export type SpecificationRow = { key: string; value: string };

type ProductSpecificationEditorProps = {
  rows: SpecificationRow[];
  onChange: (rows: SpecificationRow[]) => void;
};

export function ProductSpecificationEditor({ rows, onChange }: ProductSpecificationEditorProps) {
  function updateRow(index: number, field: keyof SpecificationRow, value: string) {
    onChange(rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  }

  function removeRow(index: number) {
    onChange(rows.filter((_, i) => i !== index));
  }

  function addRow() {
    onChange([...rows, { key: "", value: "" }]);
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-neutral-700">Spesifikasi</label>
      {rows.map((row, index) => (
        <div key={index} className="flex gap-2">
          <input
            value={row.key}
            onChange={(e) => updateRow(index, "key", e.target.value)}
            placeholder="Nama (mis. watt)"
            className="w-1/3 rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none"
          />
          <input
            value={row.value}
            onChange={(e) => updateRow(index, "value", e.target.value)}
            placeholder="Nilai (mis. 35)"
            className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand-red focus:outline-none"
          />
          <button
            type="button"
            onClick={() => removeRow(index)}
            className="rounded-md border border-neutral-300 px-3 text-sm text-neutral-500 hover:text-red-600"
          >
            Hapus
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addRow}
        className="self-start text-sm font-medium text-brand-red hover:underline"
      >
        + Tambah Spesifikasi
      </button>
    </div>
  );
}
