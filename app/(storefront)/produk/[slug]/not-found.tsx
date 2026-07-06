import Link from "next/link";

export default function ProductNotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-neutral-900">Produk Tidak Ditemukan</h1>
      <p className="text-sm text-neutral-600">
        Produk yang Anda cari mungkin sudah tidak tersedia atau tautannya salah.
      </p>
      <Link
        href="/produk"
        className="rounded-full bg-brand-red px-5 py-2 text-sm font-semibold text-white hover:bg-red-700"
      >
        Kembali ke Katalog
      </Link>
    </div>
  );
}
