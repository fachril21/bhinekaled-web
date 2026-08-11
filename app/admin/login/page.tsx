// Epic 4: Admin Auth & Dashboard Shell
// Lihat docs/plan/epic-4-admin-auth-dashboard-shell.md bagian 5.1.
//
// Halaman ini sengaja di LUAR route group app/admin/(protected)/ — kalau
// dibungkus layout yang sama dengan halaman terproteksi, redirect
// "belum auth -> /admin/login" akan memicu redirect loop ke dirinya
// sendiri (lihat Temuan #1 plan tsb).

import Image from "next/image";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/admin-session";
import { LoginForm } from "@/components/admin/LoginForm";

export default async function Page() {
  const session = await getAdminSession();
  if (session) redirect("/admin");

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-theme-md">
        <div className="mb-8 text-center">
          <Image
            src="/bhinekaled-logo.webp"
            alt="BHINEKALED"
            width={1600}
            height={448}
            className="mx-auto h-10 w-auto"
          />
          <h1 className="mt-5 text-title-sm font-semibold text-gray-800">Login Admin</h1>
          <p className="mt-1 text-sm text-gray-500">Masuk untuk mengelola toko Bhinekaled.</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
