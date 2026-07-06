import type { Metadata } from "next";
import "./globals.css";

// NOTE: Brand Guideline (docs/BRAND_GUIDELINE.md) merekomendasikan
// Poppins ExtraBold / Montserrat Black untuk heading. Font Google belum
// dipasang di sini supaya Epic 0 tetap bisa di-build tanpa dependency
// internet ke fonts.googleapis.com — pasang next/font/google beneran di
// Epic 8 (SEO, Analytics & Site-wide Enhancements) atau lebih awal kalau
// mau langsung sekalian pas bikin komponen UI.

export const metadata: Metadata = {
  title: "Bhinekaled — Aksesoris Lighting Kendaraan",
  description:
    "Toko aksesoris lighting kendaraan — channel resmi di luar Shopee.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
