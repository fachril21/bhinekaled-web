import { z } from "zod";

// Epic 3: Checkout Flow
export const checkoutFormSchema = z.object({
  customer_name: z.string().min(3, "Nama minimal 3 karakter"),
  customer_phone: z
    .string()
    .min(9, "Nomor HP tidak valid")
    .regex(/^[0-9+ -]+$/, "Nomor HP hanya boleh berisi angka"),
  shipping_address: z.string().min(10, "Alamat terlalu singkat"),
  notes: z.string().optional(),
});

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;
