import Image from "next/image";
import Link from "next/link";
import type { CategorySummary } from "@/lib/queries/categories";
import { hasAnyContactInfo, type StoreProfile } from "@/lib/queries/store-profile";

type FooterProps = {
  categories: CategorySummary[];
  profile: StoreProfile;
};

const INFO_LINKS = [
  { href: "/syarat-dan-ketentuan", label: "Syarat dan Ketentuan" },
  { href: "/kebijakan-privasi", label: "Kebijakan Privasi" },
];

// tel: href — buang semua karakter selain angka & "+" supaya jadi link yang valid.
function toTelHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function Footer({ categories, profile }: FooterProps) {
  const showContact = hasAnyContactInfo(profile);

  return (
    <footer className="bg-brand-ink text-neutral-300">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <span className="inline-block rounded-lg bg-white p-2">
              <Image src="/bhinekaled-logo.webp" alt="BHINEKALED" width={1600} height={448} className="h-9 w-auto" />
            </span>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-neutral-400">
              Spesialis lampu LED dan aksesoris pencahayaan kendaraan. Produk berkualitas, harga
              terjangkau.
            </p>
          </div>

          {categories.length > 0 && (
            <div>
              <h3 className="mb-4 text-sm font-semibold text-white">Kategori Produk</h3>
              <ul className="space-y-2 text-sm">
                {categories.map((category) => (
                  <li key={category.slug}>
                    <Link href={`/kategori/${category.slug}`} className="hover:text-white">
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {showContact && (
            <div>
              <h3 className="mb-4 text-sm font-semibold text-white">Hubungi Kami</h3>
              <ul className="space-y-2 text-sm">
                {profile.contactPhone && (
                  <li>
                    <a href={toTelHref(profile.contactPhone)} className="hover:text-white">
                      {profile.contactPhone}
                    </a>
                  </li>
                )}
                {profile.contactEmail && (
                  <li>
                    <a href={`mailto:${profile.contactEmail}`} className="hover:text-white">
                      {profile.contactEmail}
                    </a>
                  </li>
                )}
                {profile.contactAddress && (
                  <li className="max-w-xs leading-relaxed text-neutral-400">{profile.contactAddress}</li>
                )}
              </ul>
            </div>
          )}

          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Informasi</h3>
            <ul className="space-y-2 text-sm">
              {INFO_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-xs text-neutral-500">
          © {new Date().getFullYear()} BHINEKALED. Hak cipta dilindungi.
        </div>
      </div>
    </footer>
  );
}
