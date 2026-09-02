"use client";

// Epic 10: Admin Pengaturan Toko (Store Profile)
// Pola sama FeeForm (Epic 11): useState + useTransition, panggil server action
// langsung, tampilkan Alert sukses/gagal, router.refresh() setelah simpan.
// Bedanya form ini singleton (tidak ada mode create/edit) — selalu "simpan".

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveStoreProfileAction } from "@/lib/actions/store-profile";
import { Label } from "@/components/admin/ui/form/Label";
import { Input } from "@/components/admin/ui/form/Input";
import { TextArea } from "@/components/admin/ui/form/TextArea";
import { Button } from "@/components/admin/ui/Button";
import { Alert } from "@/components/admin/ui/Alert";
import type { StoreProfile } from "@/lib/queries/store-profile";

type StoreProfileFormProps = {
  profile: StoreProfile;
};

export function StoreProfileForm({ profile }: StoreProfileFormProps) {
  const router = useRouter();
  const [storeName, setStoreName] = useState(profile.storeName ?? "");
  const [storeCity, setStoreCity] = useState(profile.storeCity ?? "");
  const [contactPhone, setContactPhone] = useState(profile.contactPhone ?? "");
  const [contactAddress, setContactAddress] = useState(profile.contactAddress ?? "");
  const [contactEmail, setContactEmail] = useState(profile.contactEmail ?? "");
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSavedAt(null);

    startTransition(async () => {
      const result = await saveStoreProfileAction({
        storeName,
        storeCity,
        contactPhone,
        contactAddress,
        contactEmail,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setSavedAt(Date.now());
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 rounded-2xl border border-gray-200 bg-white p-5">
      <section className="flex flex-col gap-4">
        <h2 className="text-base font-semibold text-gray-800">Identitas Usaha</h2>
        <p className="-mt-2 text-sm text-gray-500">
          Dipakai di halaman Syarat &amp; Ketentuan dan Kebijakan Privasi.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="store-name">Nama Usaha / Badan Hukum</Label>
            <Input
              id="store-name"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="Contoh: BHINEKALED"
            />
          </div>
          <div>
            <Label htmlFor="store-city">Kota / Domisili Usaha</Label>
            <Input
              id="store-city"
              value={storeCity}
              onChange={(e) => setStoreCity(e.target.value)}
              placeholder="Contoh: Magetan, Jawa Timur"
            />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4 border-t border-gray-100 pt-6">
        <h2 className="text-base font-semibold text-gray-800">Kontak</h2>
        <p className="-mt-2 text-sm text-gray-500">
          Tampil di footer semua halaman. Field yang dikosongkan tidak ditampilkan.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="contact-phone">Nomor Telepon / WhatsApp</Label>
            <Input
              id="contact-phone"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="Contoh: +62 812-3456-7890"
              inputMode="tel"
            />
          </div>
          <div>
            <Label htmlFor="contact-email">Email</Label>
            <Input
              id="contact-email"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="Contoh: halo@bhinekaled.co.id"
            />
          </div>
        </div>
        <div>
          <Label htmlFor="contact-address">Alamat</Label>
          <TextArea
            id="contact-address"
            value={contactAddress}
            onChange={(e) => setContactAddress(e.target.value)}
            placeholder="Contoh: Jl. Contoh No. 123, Kec. Contoh, Magetan, Jawa Timur 63311"
            rows={3}
          />
        </div>
      </section>

      {error && <Alert variant="error" title="Gagal menyimpan" message={error} />}
      {savedAt !== null && !error && (
        <Alert variant="success" title="Tersimpan" message="Profil toko berhasil diperbarui." />
      )}

      <div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </div>
    </form>
  );
}
