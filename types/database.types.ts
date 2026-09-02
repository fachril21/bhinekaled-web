// Hand-written types — SEMENTARA sampai project Supabase live & schema di-inject.
//
// Setelah itu, generate ulang file ini dengan:
//   npx supabase gen types typescript --project-id <project-id> > types/database.types.ts
//
// Struktur di bawah ini ditulis manual mengikuti docs/schema.sql persis (kolom,
// nullability, default value) — mencakup tabel yang dipakai Epic 1 (categories,
// products, product_images, product_variants) & Epic 2 (cart_items,
// wishlist_items). Tabel lain (orders, order_items, admin_profiles) masih
// stub kosong sampai epic yang membutuhkannya dikerjakan.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ProductStatus = "draft" | "active" | "archived";
export type OrderStatus = "menunggu_konfirmasi" | "diproses" | "dikirim" | "selesai" | "dibatalkan";
// Epic 13: Duitku Payment Integration (POP) — diperluas dari ("n/a","unpaid","paid").
// Duitku callback hanya mengirim resultCode 00 (paid) / 01 (failed) — lihat
// lib/payments/duitku-status-mapping.ts. State lain (refunded, review, dst)
// tetap tersedia untuk transisi manual admin, tidak di-set otomatis dari callback.
export type PaymentStatus =
  | "n/a"
  | "unpaid"
  | "pending"
  | "paid"
  | "failed"
  | "cancelled"
  | "expired"
  | "review"
  | "refunded"
  | "partially_refunded";
export type AdminRole = "admin" | "superadmin";
export type FeeType = "flat" | "percentage";

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          parent_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          id: string;
          category_id: string | null;
          name: string;
          slug: string;
          description: string | null;
          base_price: number;
          stock: number;
          status: ProductStatus;
          vehicle_compatibility: Json;
          specifications: Json;
          meta_title: string | null;
          meta_description: string | null;
          weight_gram: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id?: string | null;
          name: string;
          slug: string;
          description?: string | null;
          base_price?: number;
          stock?: number;
          status?: ProductStatus;
          vehicle_compatibility?: Json;
          specifications?: Json;
          meta_title?: string | null;
          meta_description?: string | null;
          weight_gram?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string | null;
          name?: string;
          slug?: string;
          description?: string | null;
          base_price?: number;
          stock?: number;
          status?: ProductStatus;
          vehicle_compatibility?: Json;
          specifications?: Json;
          meta_title?: string | null;
          meta_description?: string | null;
          weight_gram?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          url: string;
          alt_text: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          url: string;
          alt_text?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          url?: string;
          alt_text?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          name: string;
          sku: string | null;
          price_override: number | null;
          stock: number;
          attributes: Json;
          weight_override: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          name: string;
          sku?: string | null;
          price_override?: number | null;
          stock?: number;
          attributes?: Json;
          weight_override?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          name?: string;
          sku?: string | null;
          price_override?: number | null;
          stock?: number;
          attributes?: Json;
          weight_override?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      cart_items: {
        Row: {
          id: string;
          guest_session_id: string;
          product_id: string;
          variant_id: string | null;
          qty: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          guest_session_id: string;
          product_id: string;
          variant_id?: string | null;
          qty?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          guest_session_id?: string;
          product_id?: string;
          variant_id?: string | null;
          qty?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cart_items_variant_id_fkey";
            columns: ["variant_id"];
            isOneToOne: false;
            referencedRelation: "product_variants";
            referencedColumns: ["id"];
          },
        ];
      };
      wishlist_items: {
        Row: {
          id: string;
          guest_session_id: string;
          product_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          guest_session_id: string;
          product_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          guest_session_id?: string;
          product_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "wishlist_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          guest_session_id: string | null;
          customer_name: string;
          customer_phone: string;
          shipping_address: string;
          notes: string | null;
          subtotal: number;
          shipping_cost: number;
          total: number;
          status: OrderStatus;
          payment_method: string | null;
          payment_status: PaymentStatus;
          shipping_courier_code: string | null;
          shipping_courier_service: string | null;
          shipping_destination_label: string | null;
          // Epic 13: Duitku Payment Integration (POP) — replaces Midtrans
          customer_email: string;
          duitku_reference: string | null;
          duitku_payment_code: string | null;
          duitku_result_code: string | null;
          duitku_raw_callback: Json | null;
          duitku_last_callback_at: string | null;
          paid_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number?: string;
          guest_session_id?: string | null;
          customer_name: string;
          customer_phone: string;
          shipping_address: string;
          notes?: string | null;
          subtotal?: number;
          shipping_cost?: number;
          total?: number;
          status?: OrderStatus;
          payment_method?: string | null;
          payment_status?: PaymentStatus;
          shipping_courier_code?: string | null;
          shipping_courier_service?: string | null;
          shipping_destination_label?: string | null;
          customer_email: string;
          duitku_reference?: string | null;
          duitku_payment_code?: string | null;
          duitku_result_code?: string | null;
          duitku_raw_callback?: Json | null;
          duitku_last_callback_at?: string | null;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          guest_session_id?: string | null;
          customer_name?: string;
          customer_phone?: string;
          shipping_address?: string;
          notes?: string | null;
          subtotal?: number;
          shipping_cost?: number;
          total?: number;
          status?: OrderStatus;
          payment_method?: string | null;
          payment_status?: PaymentStatus;
          shipping_courier_code?: string | null;
          shipping_courier_service?: string | null;
          shipping_destination_label?: string | null;
          customer_email?: string;
          duitku_reference?: string | null;
          duitku_payment_code?: string | null;
          duitku_result_code?: string | null;
          duitku_raw_callback?: Json | null;
          duitku_last_callback_at?: string | null;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          variant_id: string | null;
          product_name_snapshot: string;
          variant_name_snapshot: string | null;
          price_snapshot: number;
          qty: number;
          subtotal: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          variant_id?: string | null;
          product_name_snapshot: string;
          variant_name_snapshot?: string | null;
          price_snapshot: number;
          qty: number;
          subtotal: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          variant_id?: string | null;
          product_name_snapshot?: string;
          variant_name_snapshot?: string | null;
          price_snapshot?: number;
          qty?: number;
          subtotal?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_variant_id_fkey";
            columns: ["variant_id"];
            isOneToOne: false;
            referencedRelation: "product_variants";
            referencedColumns: ["id"];
          },
        ];
      };
      admin_profiles: {
        Row: {
          id: string;
          full_name: string | null;
          role: AdminRole;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          role?: AdminRole;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          role?: AdminRole;
          created_at?: string;
        };
        Relationships: [];
      };
      // Epic 10: Halaman Legal & Kebijakan — singleton row (id = 1) berisi
      // kontak & identitas usaha yang tampil di footer + halaman legal.
      store_profile: {
        Row: {
          id: number;
          store_name: string;
          store_city: string;
          contact_phone: string;
          contact_address: string;
          contact_email: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          store_name?: string;
          store_city?: string;
          contact_phone?: string;
          contact_address?: string;
          contact_email?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          store_name?: string;
          store_city?: string;
          contact_phone?: string;
          contact_address?: string;
          contact_email?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      additional_fees: {
        Row: {
          id: string;
          label: string;
          fee_type: FeeType;
          amount: number;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          label: string;
          fee_type?: FeeType;
          amount: number;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          label?: string;
          fee_type?: FeeType;
          amount?: number;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      order_fees: {
        Row: {
          id: string;
          order_id: string;
          fee_id: string | null;
          label_snapshot: string;
          fee_type_snapshot: FeeType;
          rate_snapshot: number;
          amount: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          fee_id?: string | null;
          label_snapshot: string;
          fee_type_snapshot: FeeType;
          rate_snapshot: number;
          amount: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          fee_id?: string | null;
          label_snapshot?: string;
          fee_type_snapshot?: FeeType;
          rate_snapshot?: number;
          amount?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_fees_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_fees_fee_id_fkey";
            columns: ["fee_id"];
            isOneToOne: false;
            referencedRelation: "additional_fees";
            referencedColumns: ["id"];
          },
        ];
      };
      shipping_destination_cache: {
        Row: {
          id: string;
          search_query: string;
          results: Json;
          created_at: string;
          expires_at: string;
        };
        Insert: {
          id?: string;
          search_query: string;
          results: Json;
          created_at?: string;
          expires_at?: string;
        };
        Update: {
          id?: string;
          search_query?: string;
          results?: Json;
          created_at?: string;
          expires_at?: string;
        };
        Relationships: [];
      };
      shipping_destinations: {
        Row: {
          id: string;
          label: string;
          province: string | null;
          city: string | null;
          district: string | null;
          subdistrict: string | null;
          zip_code: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          label: string;
          province?: string | null;
          city?: string | null;
          district?: string | null;
          subdistrict?: string | null;
          zip_code?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          label?: string;
          province?: string | null;
          city?: string | null;
          district?: string | null;
          subdistrict?: string | null;
          zip_code?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      shipping_rate_cache: {
        Row: {
          id: string;
          origin_id: string;
          destination_id: string;
          weight_bucket: number;
          courier_set: string;
          results: Json;
          created_at: string;
          expires_at: string;
        };
        Insert: {
          id?: string;
          origin_id: string;
          destination_id: string;
          weight_bucket: number;
          courier_set: string;
          results: Json;
          created_at?: string;
          expires_at?: string;
        };
        Update: {
          id?: string;
          origin_id?: string;
          destination_id?: string;
          weight_bucket?: number;
          courier_set?: string;
          results?: Json;
          created_at?: string;
          expires_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
