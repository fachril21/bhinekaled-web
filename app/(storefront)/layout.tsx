import type { ReactNode } from "react";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { getTopLevelCategoriesWithActiveProducts } from "@/lib/queries/categories";
import type { CategorySummary } from "@/lib/queries/categories";

const NAV_CATEGORY_LIMIT = 5;

export default async function StorefrontLayout({ children }: { children: ReactNode }) {
  let categories: CategorySummary[] = [];
  try {
    categories = await getTopLevelCategoriesWithActiveProducts(NAV_CATEGORY_LIMIT);
  } catch {
    // Supabase belum terkoneksi / gagal — nav tetap render tanpa link kategori
    // dinamis daripada menjatuhkan seluruh layout (lihat docs/plan #8.4 no.28).
    categories = [];
  }

  return (
    <>
      <Header categories={categories} />
      <main className="flex-1">{children}</main>
      <Footer categories={categories} />
    </>
  );
}
