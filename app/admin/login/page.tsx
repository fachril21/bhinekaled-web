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
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4 py-16">
      <div className="mb-8 text-center">
        <Image
          src="/bhinekaled-logo.webp"
          alt="BHINEKALED"
          width={1600}
          height={448}
          className="mx-auto h-10 w-auto"
        />
        <h1 className="mt-4 text-xl font-bold text-neutral-900">Login Admin</h1>
      </div>
      <LoginForm />
    </main>
  );
}
