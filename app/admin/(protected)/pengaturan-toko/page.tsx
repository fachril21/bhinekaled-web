// Epic 10: Admin Pengaturan Toko (Store Profile)
// Pola sama app/admin/(protected)/biaya/page.tsx — Server Component ambil data,
// render client form.

import { getStoreProfile } from "@/lib/queries/store-profile";
import { StoreProfileForm } from "@/components/admin/StoreProfileForm";

export const metadata = {
  title: "Pengaturan Toko — Admin Bhinekaled",
};

export default async function Page() {
  const profile = await getStoreProfile();

  return (
    <div>
      <h1 className="text-title-sm font-bold text-gray-800">Pengaturan Toko</h1>
      <p className="mt-1 text-sm text-gray-500">
        Kontak yang tampil di footer semua halaman, serta identitas usaha di halaman legal.
      </p>
      <div className="mt-6">
        <StoreProfileForm profile={profile} />
      </div>
    </div>
  );
}
