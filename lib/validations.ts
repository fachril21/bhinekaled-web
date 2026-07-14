import { z } from "zod";
import { SLUG_REGEX } from "@/lib/slug";

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

// Epic 4: Admin Auth
export const adminLoginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export type AdminLoginValues = z.infer<typeof adminLoginSchema>;

// Epic 5: Admin Kelola Produk & Kategori
export const categoryFormSchema = z.object({
  name: z.string().min(2, "Nama kategori minimal 2 karakter"),
  slug: z
    .string()
    .min(2, "Slug minimal 2 karakter")
    .regex(SLUG_REGEX, "Slug hanya boleh huruf kecil, angka, dan tanda -"),
  parentId: z.string().uuid().nullable(),
});
export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

const productImageInputSchema = z.object({
  id: z.string().uuid().optional(),
  url: z.string().url(),
  altText: z.string().trim().optional().nullable(),
  sortOrder: z.number().int().nonnegative(),
});

const productVariantInputSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Nama varian wajib diisi"),
  sku: z.string().trim().optional().nullable(),
  priceOverride: z.number().nonnegative().nullable(),
  stock: z.number().int().nonnegative(),
});

export const productFormSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(3, "Nama produk minimal 3 karakter"),
  slug: z
    .string()
    .min(3, "Slug minimal 3 karakter")
    .regex(SLUG_REGEX, "Slug hanya boleh huruf kecil, angka, dan tanda -"),
  description: z.string().trim().optional().nullable(),
  categoryId: z.string().uuid().nullable(),
  basePrice: z.number().nonnegative("Harga tidak boleh negatif"),
  stock: z.number().int().nonnegative("Stok tidak boleh negatif"),
  status: z.enum(["draft", "active", "archived"]),
  vehicleCompatibility: z.array(z.string().min(1)).default([]),
  specifications: z
    .array(z.object({ key: z.string().min(1), value: z.string().min(1) }))
    .default([]),
  metaTitle: z.string().trim().optional().nullable(),
  metaDescription: z.string().trim().optional().nullable(),
  images: z.array(productImageInputSchema).default([]),
  deletedImages: z.array(z.object({ id: z.string().uuid(), url: z.string().url() })).default([]),
  variants: z.array(productVariantInputSchema).default([]),
  deletedVariantIds: z.array(z.string().uuid()).default([]),
});
export type ProductFormValues = z.infer<typeof productFormSchema>;

// Epic 7: Admin Kelola Order
export const orderStatusUpdateSchema = z.object({
  orderId: z.string().uuid(),
  status: z.enum(["menunggu_konfirmasi", "diproses", "dikirim", "selesai", "dibatalkan"]),
});
export type OrderStatusUpdateValues = z.infer<typeof orderStatusUpdateSchema>;

// Epic 11: Admin Pengaturan Biaya Lainnya
export const additionalFeeFormSchema = z
  .object({
    label: z.string().trim().min(1, "Label wajib diisi"),
    feeType: z.enum(["flat", "percentage"]),
    amount: z.number().positive("Nilai harus lebih dari 0"),
    isActive: z.boolean(),
  })
  .refine((data) => data.feeType !== "percentage" || data.amount <= 100, {
    message: "Nilai persentase maksimal 100",
    path: ["amount"],
  });
export type AdditionalFeeFormValues = z.infer<typeof additionalFeeFormSchema>;
