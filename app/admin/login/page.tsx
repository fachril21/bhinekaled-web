// Epic 4: Admin Auth & Dashboard Shell
// Lihat docs/plan/epic-4-admin-auth-dashboard-shell.md bagian 5.1.
//
// Halaman ini sengaja di LUAR route group app/admin/(protected)/ — kalau
// dibungkus layout yang sama dengan halaman terproteksi, redirect
// "belum auth -> /admin/login" akan memicu redirect loop ke dirinya
// sendiri (lihat Temuan #1 plan tsb).

import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/admin-session";
import { LoginForm } from "@/components/admin/LoginForm";

export default async function Page() {
  const session = await getAdminSession();
  if (session) redirect("/admin");

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4 py-16">
      <div className="mb-8 text-center">
        <p className="inline-block rounded-md bg-brand-red px-3 py-1.5 text-lg font-extrabold tracking-tight text-white">
          BHINEKALED
        </p>
        <h1 className="mt-4 text-xl font-bold text-neutral-900">Login Admin</h1>
      </div>
      <LoginForm />
    </main>
  );
}
