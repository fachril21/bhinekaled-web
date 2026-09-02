import type { ReactNode } from "react";
import { getStoreProfile } from "@/lib/queries/store-profile";

type LegalPageLayoutProps = {
  title: string;
  lastUpdated: string;
  /** Kalimat pembuka singkat di bawah judul. */
  intro: string;
  children: ReactNode;
};

// Tailwind v4 di project ini tidak memakai @tailwindcss/typography, jadi gaya
// "prose" untuk konten legal di-inline lewat arbitrary variants pada wrapper.
const PROSE =
  "space-y-4 text-sm leading-relaxed text-neutral-700 " +
  "[&_h2]:mt-10 [&_h2]:font-heading [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-neutral-900 " +
  "[&_h2:first-child]:mt-0 " +
  "[&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 " +
  "[&_ol]:mt-3 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5 " +
  "[&_a]:text-brand-red [&_a]:underline [&_strong]:font-semibold [&_strong]:text-neutral-900";

export async function LegalPageLayout({ title, lastUpdated, intro, children }: LegalPageLayoutProps) {
  const profile = await getStoreProfile();
  const businessName = profile.storeName ?? "BHINEKALED";
  const location = profile.storeCity ? ` yang berdomisili di ${profile.storeCity}` : "";
  const introText = intro.replace(/\{\{business\}\}/g, businessName);

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <span aria-hidden="true" className="mb-3 block h-1 w-10 rounded-full bg-brand-red" />
      <h1 className="font-heading text-2xl font-bold text-neutral-900 sm:text-3xl">{title}</h1>
      <p className="mt-2 text-xs text-neutral-500">Terakhir diperbarui: {lastUpdated}</p>

      <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-800">
        Dokumen ini adalah draf awal berisi ketentuan umum. Sebelum dipublikasikan,
        mohon ditinjau oleh pemilik usaha dan/atau penasihat hukum agar sesuai dengan
        praktik bisnis dan peraturan yang berlaku.
      </div>

      <p className="mt-6 text-sm leading-relaxed text-neutral-700">{introText}</p>

      <div className={`mt-8 ${PROSE}`}>{children}</div>

      <div className="mt-12 rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
        <h2 className="font-heading text-base font-bold text-neutral-900">Kontak</h2>
        <p className="mt-2 text-sm leading-relaxed text-neutral-700">
          Untuk pertanyaan terkait halaman ini, silakan hubungi {businessName}
          {location}:
        </p>
        <ul className="mt-3 space-y-1 text-sm text-neutral-700">
          {profile.contactEmail && (
            <li>
              Email:{" "}
              <a href={`mailto:${profile.contactEmail}`} className="text-brand-red underline">
                {profile.contactEmail}
              </a>
            </li>
          )}
          {profile.contactPhone && <li>Telepon/WhatsApp: {profile.contactPhone}</li>}
          {profile.contactAddress && <li>Alamat: {profile.contactAddress}</li>}
          {!profile.contactEmail && !profile.contactPhone && !profile.contactAddress && (
            <li className="text-neutral-500">
              Informasi kontak akan segera diperbarui. Sementara ini, hubungi kami melalui kanal
              resmi toko.
            </li>
          )}
        </ul>
      </div>
    </main>
  );
}
