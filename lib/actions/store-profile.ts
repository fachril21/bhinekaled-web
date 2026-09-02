"use server";

// Epic 10: Halaman Legal & Kebijakan — simpan profil toko dari /admin/pengaturan-toko.
// Pola sama saveFeeAction (Epic 11): dipanggil langsung sebagai fungsi dari
// StoreProfileForm, validasi Zod di server, upsert, revalidatePath.

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { storeProfileFormSchema, type StoreProfileFormValues } from "@/lib/validations";

export type StoreProfileActionResult = { success: true } | { success: false; error: string };

const GENERIC_ERROR = "Gagal menyimpan profil toko, coba lagi.";
const STORE_PROFILE_ID = 1;

export async function saveStoreProfileAction(
  input: StoreProfileFormValues,
): Promise<StoreProfileActionResult> {
  const parsed = storeProfileFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Data tidak valid, cek kembali form.",
    };
  }

  const { storeName, storeCity, contactPhone, contactAddress, contactEmail } = parsed.data;
  const supabase = await createClient();

  const { error } = await supabase.from("store_profile").upsert(
    {
      id: STORE_PROFILE_ID,
      store_name: storeName,
      store_city: storeCity,
      contact_phone: contactPhone,
      contact_address: contactAddress,
      contact_email: contactEmail,
    },
    { onConflict: "id" },
  );

  if (error) return { success: false, error: GENERIC_ERROR };

  revalidatePath("/admin/pengaturan-toko");
  // Footer membaca profil ini di app/(storefront)/layout.tsx — revalidasi
  // seluruh subtree layout supaya perubahan langsung tampil di semua halaman.
  revalidatePath("/", "layout");
  return { success: true };
}
