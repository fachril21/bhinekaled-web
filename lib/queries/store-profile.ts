// Epic 10: Halaman Legal & Kebijakan — profil toko (kontak + identitas usaha).
//
// Sumber tunggal untuk data kontak yang tampil di Footer (semua halaman
// storefront) dan halaman legal (/syarat-dan-ketentuan, /kebijakan-privasi).
// Disimpan sebagai singleton row (id = 1) di tabel store_profile, diisi admin
// lewat /admin/pengaturan-toko.

import { createClient } from "@/lib/supabase/server";

export type StoreProfile = {
  storeName: string | null;
  storeCity: string | null;
  contactPhone: string | null;
  contactAddress: string | null;
  contactEmail: string | null;
};

export const EMPTY_STORE_PROFILE: StoreProfile = {
  storeName: null,
  storeCity: null,
  contactPhone: null,
  contactAddress: null,
  contactEmail: null,
};

const STORE_PROFILE_ID = 1;

function normalize(value: string | null | undefined): string | null {
  const trimmed = (value ?? "").trim();
  return trimmed === "" ? null : trimmed;
}

/**
 * Profil toko (singleton row id=1). Publik — RLS "public read store_profile".
 *
 * TIDAK PERNAH throw: Footer & halaman legal dirender lewat fungsi ini, jadi
 * kalau tabel belum ada (migration belum dijalankan) atau query gagal, balikan
 * EMPTY_STORE_PROFILE supaya layout tidak ikut jatuh — pola sama dengan
 * app/(storefront)/layout.tsx yang membungkus query kategori dengan try/catch.
 */
export async function getStoreProfile(): Promise<StoreProfile> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("store_profile")
      .select("store_name, store_city, contact_phone, contact_address, contact_email")
      .eq("id", STORE_PROFILE_ID)
      .maybeSingle();

    if (error || !data) return EMPTY_STORE_PROFILE;

    return {
      storeName: normalize(data.store_name),
      storeCity: normalize(data.store_city),
      contactPhone: normalize(data.contact_phone),
      contactAddress: normalize(data.contact_address),
      contactEmail: normalize(data.contact_email),
    };
  } catch {
    return EMPTY_STORE_PROFILE;
  }
}

/** True kalau minimal satu dari telepon/alamat/email terisi — nama toko sendiri tidak dihitung. */
export function hasAnyContactInfo(profile: StoreProfile): boolean {
  return Boolean(profile.contactPhone || profile.contactAddress || profile.contactEmail);
}
