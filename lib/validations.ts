import { z } from "zod";
import { SLUG_REGEX } from "@/lib/slug";

// Epic 12: Cek Ongkir Real-Time (RajaOngkir) — dideklarasikan sebelum
// checkoutFormSchema karena dipakai sebagai field di dalamnya.
export const shippingDestinationSearchSchema = z.object({
  q: z.string().trim().min(3, "Ketik minimal 3 karakter"),
});

export const shippingRateRequestSchema = z.object({
  destinationId: z.string().min(1, "Tujuan wajib dipilih"),
});

export const shippingSelectionSchema = z.object({
  destinationId: z.string().min(1),
  courierCode: z.string().min(1),
  serviceCode: z.string().min(1),
});
export type ShippingSelectionValues = z.infer<typeof shippingSelectionSchema>;

// Epic 3: Checkout Flow
export const checkoutFormSchema = z.object({
  customer_name: z.string().min(3, "Nama minimal 3 karakter"),
  customer_phone: z
    .string()
    .min(9, "Nomor HP tidak valid")
    .regex(/^[0-9+ -]+$/, "Nomor HP hanya boleh berisi angka"),
  // Epic 13: Duitku Payment Integration (POP) — WAJIB (bukan opsional seperti
  // Midtrans sebelumnya), karena Duitku createInvoice mewajibkan parameter
  // `email` di setiap request transaksi.
  customer_email: z.string().trim().min(1, "Email wajib diisi").email("Email tidak valid"),
  shipping_address: z.string().min(10, "Alamat terlalu singkat"),
  notes: z.string().optional(),
  shipping: shippingSelectionSchema, // Epic 12 — wajib, user harus pilih 1 opsi kurir
});

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

// Epic 13: Duitku Payment Integration (POP)
export const duitkuInvoiceRequestSchema = z.object({
  orderNumber: z.string().min(1),
});

// Callback Duitku dikirim sebagai x-www-form-urlencoded, bukan JSON — route
// handler mem-parse lewat request.formData() lalu convert ke plain object
// sebelum di-parse Zod ini. Lihat app/api/payments/duitku/callback/route.ts.
export const duitkuCallbackSchema = z.object({
  merchantCode: z.string().min(1),
  amount: z.string().min(1),
  merchantOrderId: z.string().min(1),
  paymentCode: z.string().min(1),
  resultCode: z.enum(["00", "01"]),
  reference: z.string().min(1),
  signature: z.string().min(1),
});
// Zod .object() default STRIP field tak dikenal dari parsed.data (bukan
// reject) — TAPI duitku_raw_callback yang disimpan ke DB pakai `rawBody`
// mentah (sebelum parse), BUKAN `parsed.data`, supaya field spesifik-channel
// (spUserHash, issuerCode, settlementDate, dst — beda-beda tiap paymentCode)
// tidak hilang untuk keperluan audit/support. Lihat
// app/api/payments/duitku/callback/route.ts.

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
  weightOverride: z.number().int().nonnegative().nullable(), // Epic 12 — null = warisi weight_gram produk
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
  weightGram: z.number().int().nonnegative("Berat tidak boleh negatif"), // Epic 12
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

// Epic 10: Admin Pengaturan Toko (Store Profile)
// Semua field opsional — admin boleh isi bertahap. String kosong = "belum
// diisi" (bukan error); dinormalisasi ke null saat dibaca publik di
// lib/queries/store-profile.ts. Regex telepon sengaja longgar (angka, spasi,
// + - ( )) — nomor telepon Indonesia punya banyak format.
const CONTACT_PHONE_REGEX = /^[0-9()+\- ]+$/;

export const storeProfileFormSchema = z.object({
  storeName: z.string().trim().max(200, "Nama toko maksimal 200 karakter"),
  storeCity: z.string().trim().max(120, "Nama kota maksimal 120 karakter"),
  contactPhone: z
    .string()
    .trim()
    .max(40, "Nomor telepon maksimal 40 karakter")
    .refine(
      (value) => value === "" || CONTACT_PHONE_REGEX.test(value),
      "Nomor telepon hanya boleh berisi angka, spasi, dan tanda + - ( )",
    ),
  contactAddress: z.string().trim().max(500, "Alamat maksimal 500 karakter"),
  contactEmail: z
    .string()
    .trim()
    .max(200, "Email maksimal 200 karakter")
    .refine(
      (value) => value === "" || z.string().email().safeParse(value).success,
      "Email tidak valid",
    ),
});
export type StoreProfileFormValues = z.infer<typeof storeProfileFormSchema>;
