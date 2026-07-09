"use server";

// Epic 7: Admin Kelola Order
// Lihat docs/plan/epic-7-admin-kelola-order.md bagian 3.4.

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { orderStatusUpdateSchema } from "@/lib/validations";
import type { OrderStatus } from "@/types/database.types";

export type OrderActionResult = { success: true } | { success: false; error: string };

/**
 * Dropdown bebas ke status manapun (lihat Temuan #2 plan tsb) — tidak ada
 * guard forward-only. RLS "admin manage orders" (is_admin()) di
 * docs/schema.sql jadi satu-satunya gate — pakai createClient(), BUKAN
 * admin client (Temuan #6 plan tsb).
 */
export async function updateOrderStatusAction(
  orderId: string,
  status: OrderStatus
): Promise<OrderActionResult> {
  const parsed = orderStatusUpdateSchema.safeParse({ orderId, status });
  if (!parsed.success) return { success: false, error: "Status tidak valid." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.orderId);
  if (error) return { success: false, error: "Gagal mengubah status order, coba lagi." };

  revalidatePath("/admin/order");
  revalidatePath(`/admin/order/${orderId}`);
  return { success: true };
}
