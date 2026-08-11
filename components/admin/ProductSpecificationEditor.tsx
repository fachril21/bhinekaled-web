"use client";

// Epic 5: Admin Kelola Produk & Kategori
// Lihat docs/plan/epic-5-admin-kelola-produk-kategori.md bagian 6.4.
//
// specifications (jsonb) generik key-value, bukan skema tetap — tidak ada
// validasi bentuk ketat di sini (watt/lumen/dsb bebas teks).

import { Input } from "@/components/admin/ui/form/Input";
import { Button } from "@/components/admin/ui/Button";

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
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
      <h2 className="text-base font-semibold text-gray-800">Spesifikasi</h2>
      {rows.map((row, index) => (
        <div key={index} className="flex gap-2">
          <Input
            value={row.key}
            onChange={(e) => updateRow(index, "key", e.target.value)}
            placeholder="Nama (mis. watt)"
            aria-label="Nama spesifikasi"
            className="w-1/3"
          />
          <Input
            value={row.value}
            onChange={(e) => updateRow(index, "value", e.target.value)}
            placeholder="Nilai (mis. 35)"
            aria-label="Nilai spesifikasi"
            className="flex-1"
          />
          <Button type="button" variant="danger" size="sm" onClick={() => removeRow(index)}>
            Hapus
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addRow} className="self-start">
        + Tambah Spesifikasi
      </Button>
    </div>
  );
}
