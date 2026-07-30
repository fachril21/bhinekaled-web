import Image from "next/image";
import Link from "next/link";
import type { CategorySummary } from "@/lib/queries/categories";

type FooterProps = {
  categories: CategorySummary[];
};

export function Footer({ categories }: FooterProps) {
  return (
    <footer className="bg-brand-ink text-neutral-300">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 sm:grid-cols-3">
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

          {/*
            TODO Epic 10: tambahkan kolom "Informasi" berisi link Kebijakan
            Privasi, Syarat & Ketentuan begitu halaman legal-nya dibuat.
            Sengaja tidak ditaruh di sini supaya tidak mengarah ke 404.
          */}
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-xs text-neutral-500">
          © {new Date().getFullYear()} BHINEKALED. Hak cipta dilindungi.
        </div>
      </div>
    </footer>
  );
}
