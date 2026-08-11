"use client";

// Epic 4: Admin Auth & Dashboard Shell
// Lihat docs/plan/epic-4-admin-auth-dashboard-shell.md bagian 6.1.
//
// Uncontrolled inputs (native <form action> + FormData) — pola resmi
// Next.js untuk auth via Server Action, beda dari CheckoutForm (Epic 3)
// yang pakai useState terkontrol + fetch() manual karena checkout lewat
// Route Handler, bukan Server Action.

import { useActionState } from "react";
import { loginAction } from "@/lib/actions/auth";
import { Label } from "@/components/admin/ui/form/Label";
import { Input } from "@/components/admin/ui/form/Input";
import { Button } from "@/components/admin/ui/Button";
import { Alert } from "@/components/admin/ui/Alert";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, undefined);

  return (
    <form action={action} className="flex flex-col gap-5">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="username" />
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required autoComplete="current-password" />
      </div>

      {state?.error && <Alert variant="error" title="Gagal masuk" message={state.error} />}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Memproses..." : "Masuk"}
      </Button>
    </form>
  );
}
