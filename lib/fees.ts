// Epic 11: Admin Pengaturan Biaya Lainnya
// Lihat docs/plan/epic-11-admin-pengaturan-biaya-lainnya.md bagian 3.1.
//
// Pure function, tidak bergantung Supabase — dipakai DUA tempat dengan sumber
// data berbeda (preview publik di lib/queries/fees.ts vs. kalkulasi otoritatif
// di app/api/checkout/route.ts). Logic kalkulasinya harus identik di kedua
// tempat, jadi dipusatkan di sini (Temuan #3).

import type { FeeType } from "@/types/database.types";

export type ActiveFeeInput = {
  id: string;
  label: string;
  feeType: FeeType;
  amount: number;
};

export type CalculatedFee = {
  feeId: string;
  label: string;
  feeType: FeeType;
  rate: number; // nilai asli additional_fees.amount (rupiah utk flat, persen utk percentage)
  amount: number; // nominal final hasil kalkulasi, sudah dibulatkan (Temuan #4)
};

/**
 * percentage selalu dihitung dari `subtotal`, TIDAK compounding antar-fee
 * (lihat docs/schema.sql komentar bagian 10). Hasil percentage dibulatkan ke
 * rupiah terdekat SEBELUM disimpan, bukan cuma saat tampil (Temuan #4).
 */
export function calculateFees(fees: ActiveFeeInput[], subtotal: number): CalculatedFee[] {
  return fees.map((fee) => ({
    feeId: fee.id,
    label: fee.label,
    feeType: fee.feeType,
    rate: fee.amount,
    amount: fee.feeType === "flat" ? fee.amount : Math.round(subtotal * (fee.amount / 100)),
  }));
}

export function sumFees(fees: CalculatedFee[]): number {
  return fees.reduce((sum, fee) => sum + fee.amount, 0);
}
