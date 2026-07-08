// Epic 4: Admin Auth & Dashboard Shell
//
// TODO: cek session Supabase Auth di sini. Kalau belum login atau bukan admin
// (tidak ada row di tabel `admin_profiles`), redirect ke /admin/login.
// Lihat docs/schema.sql untuk struktur tabel admin_profiles & function is_admin().

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b bg-white px-6 py-4">
        <p className="font-semibold text-[#E6212A]">Bhinekaled — Admin</p>
      </header>
      <div className="p-6">{children}</div>
    </div>
  );
}
