"use client";

// Epic 5: Admin Kelola Produk & Kategori
// Lihat docs/plan/epic-5-admin-kelola-produk-kategori.md bagian 6.4.

import { Input } from "@/components/admin/ui/form/Input";
import { Button } from "@/components/admin/ui/Button";

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
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
      <h2 className="text-base font-semibold text-gray-800">Kompatibilitas Kendaraan</h2>
      {values.map((value, index) => (
        <div key={index} className="flex gap-2">
          <Input
            value={value}
            onChange={(e) => updateValue(index, e.target.value)}
            placeholder="Mis. Honda Vario 125/150"
            className="flex-1"
          />
          <Button type="button" variant="danger" size="sm" onClick={() => removeValue(index)}>
            Hapus
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addValue} className="self-start">
        + Tambah Kendaraan
      </Button>
    </div>
  );
}
