import Link from "next/link";

export default function OrderConfirmationNotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 py-24 text-center">
      <h1 className="text-2xl font-bold text-neutral-900">Pesanan Tidak Ditemukan</h1>
      <p className="text-sm text-neutral-600">
        Nomor order tidak ditemukan, atau bukan milik sesi belanja Anda saat ini.
      </p>
      <Link
        href="/"
        className="rounded-full bg-brand-red px-5 py-2 text-sm font-semibold text-white hover:bg-brand-red-hover"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
