import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { isSearchIndexingAllowed } from "@/lib/seo-config";

// Sesuai docs/BRAND_GUIDELINE.md §3: Poppins ExtraBold untuk heading,
// Inter untuk body copy.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bhinekaled — Aksesoris Lighting Kendaraan",
  description:
    "Toko aksesoris lighting kendaraan — channel resmi di luar Shopee.",
  // Fase 1 masih testing — noindex/nofollow di semua halaman sampai
  // ALLOW_SEARCH_INDEXING=true (lihat lib/seo-config.ts).
  robots: isSearchIndexingAllowed()
    ? undefined
    : { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`h-full antialiased ${inter.variable} ${poppins.variable}`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
