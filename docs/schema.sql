-- =========================================================================
-- BHINEKALED — Database Schema (Fase 1)
-- Toko aksesoris lighting kendaraan — struktur dasar tanpa payment gateway
-- & tanpa integrasi ongkir real-time (lihat kolom placeholder di bawah).
--
-- Cara pakai: copy-paste seluruh file ini ke Supabase SQL Editor lalu Run.
-- Aman dijalankan dari awal di project Supabase yang masih kosong.
-- =========================================================================

-- Pastikan extension untuk UUID generator aktif
create extension if not exists "pgcrypto";

-- =========================================================================
-- 1. HELPER: fungsi auto-update kolom updated_at
-- =========================================================================
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- =========================================================================
-- 2. CATEGORIES
-- =========================================================================
create table categories (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  slug         text not null unique,
  parent_id    uuid references categories(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger trg_categories_updated_at
  before update on categories
  for each row execute function set_updated_at();

-- =========================================================================
-- 3. PRODUCTS
-- =========================================================================
create table products (
  id                    uuid primary key default gen_random_uuid(),
  category_id           uuid references categories(id) on delete set null,
  name                  text not null,
  slug                  text not null unique,
  description           text,
  base_price            numeric(12,2) not null default 0,
  stock                 integer not null default 0,           -- dipakai kalau produk TIDAK punya varian
  status                text not null default 'draft'
                          check (status in ('draft', 'active', 'archived')),

  -- Spesifik untuk aksesoris lighting kendaraan
  vehicle_compatibility jsonb default '[]'::jsonb,             -- contoh: ["Honda Vario 125/150", "Universal Motor"]
  specifications        jsonb default '{}'::jsonb,             -- contoh: {"watt": 35, "lumen": 6000, "warna_cahaya": "6000K putih"}

  -- SEO
  meta_title            text,
  meta_description      text,

  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index idx_products_category on products(category_id);
create index idx_products_status on products(status);
create index idx_products_vehicle_compat on products using gin (vehicle_compatibility);

create trigger trg_products_updated_at
  before update on products
  for each row execute function set_updated_at();

-- =========================================================================
-- 4. PRODUCT IMAGES (multi-gambar per produk)
-- =========================================================================
create table product_images (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null references products(id) on delete cascade,
  url          text not null,
  alt_text     text,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now()
);

create index idx_product_images_product on product_images(product_id);

-- =========================================================================
-- 5. PRODUCT VARIANTS (misal: beda warna cahaya, ukuran, tipe konektor)
--    Kalau produk tidak punya varian, tabel ini boleh kosong untuk produk itu
--    — harga & stok diambil langsung dari tabel products.
-- =========================================================================
create table product_variants (
  id              uuid primary key default gen_random_uuid(),
  product_id      uuid not null references products(id) on delete cascade,
  name            text not null,                 -- contoh: "Putih 6000K - Konektor H4"
  sku             text unique,
  price_override  numeric(12,2),                 -- null = pakai base_price dari produk
  stock           integer not null default 0,
  attributes      jsonb default '{}'::jsonb,      -- contoh: {"warna_cahaya": "putih", "konektor": "H4"}
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_variants_product on product_variants(product_id);

create trigger trg_variants_updated_at
  before update on product_variants
  for each row execute function set_updated_at();

-- =========================================================================
-- 6. CART ITEMS (guest session — belum ada akun customer di fase 1)
-- =========================================================================
create table cart_items (
  id                 uuid primary key default gen_random_uuid(),
  guest_session_id   text not null,               -- disimpan di cookie/localStorage browser customer
  product_id         uuid not null references products(id) on delete cascade,
  variant_id         uuid references product_variants(id) on delete cascade,
  qty                integer not null default 1 check (qty > 0),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (guest_session_id, product_id, variant_id)
);

create index idx_cart_guest on cart_items(guest_session_id);

create trigger trg_cart_updated_at
  before update on cart_items
  for each row execute function set_updated_at();

-- =========================================================================
-- 7. WISHLIST ITEMS (guest session)
-- =========================================================================
create table wishlist_items (
  id                 uuid primary key default gen_random_uuid(),
  guest_session_id   text not null,
  product_id         uuid not null references products(id) on delete cascade,
  created_at         timestamptz not null default now(),
  unique (guest_session_id, product_id)
);

create index idx_wishlist_guest on wishlist_items(guest_session_id);

-- =========================================================================
-- 8. ORDERS
--    - status default 'menunggu_konfirmasi', TIDAK ada proses konfirmasi
--      manual oleh admin di fase 1 (sesuai keputusan PO).
--    - shipping_cost & payment_status disiapkan sebagai placeholder untuk
--      integrasi ongkir & payment gateway di fase berikutnya.
-- =========================================================================
create sequence if not exists order_number_seq;

create table orders (
  id                 uuid primary key default gen_random_uuid(),
  order_number       text not null unique,
  guest_session_id   text,                         -- untuk mapping opsional ke cart/wishlist browser yang sama

  customer_name      text not null,
  customer_phone     text not null,
  shipping_address   text not null,
  notes              text,

  subtotal           numeric(12,2) not null default 0,
  shipping_cost      numeric(12,2) not null default 0,   -- PLACEHOLDER: flat rate, belum dari API kurir
  total              numeric(12,2) not null default 0,

  status             text not null default 'menunggu_konfirmasi'
                        check (status in (
                          'menunggu_konfirmasi', 'diproses', 'dikirim', 'selesai', 'dibatalkan'
                        )),

  payment_method     text,                                -- PLACEHOLDER: null sampai payment gateway masuk
  payment_status     text not null default 'n/a'
                        check (payment_status in ('n/a', 'unpaid', 'paid')),

  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index idx_orders_status on orders(status);
create index idx_orders_guest on orders(guest_session_id);

create trigger trg_orders_updated_at
  before update on orders
  for each row execute function set_updated_at();

-- Auto-generate order_number kalau tidak diisi manual, format: ORD-20260706-000123
create or replace function generate_order_number()
returns trigger as $$
begin
  if new.order_number is null then
    new.order_number := 'ORD-' || to_char(now(), 'YYYYMMDD') || '-' ||
                         lpad(nextval('order_number_seq')::text, 6, '0');
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_orders_order_number
  before insert on orders
  for each row execute function generate_order_number();

-- =========================================================================
-- 9. ORDER ITEMS (snapshot data produk saat order dibuat)
-- =========================================================================
create table order_items (
  id                       uuid primary key default gen_random_uuid(),
  order_id                 uuid not null references orders(id) on delete cascade,
  product_id               uuid references products(id) on delete set null,
  variant_id               uuid references product_variants(id) on delete set null,

  product_name_snapshot    text not null,     -- disimpan terpisah, supaya kalau nama produk diubah nanti, histori order tetap akurat
  variant_name_snapshot    text,
  price_snapshot           numeric(12,2) not null,
  qty                      integer not null check (qty > 0),
  subtotal                 numeric(12,2) not null,

  created_at               timestamptz not null default now()
);

create index idx_order_items_order on order_items(order_id);

-- =========================================================================
-- 10. ADMIN PROFILES (role management di atas Supabase Auth)
--     Admin login pakai Supabase Auth biasa, lalu didaftarkan manual ke
--     tabel ini supaya bisa dibedakan dari user biasa (fase depan).
-- =========================================================================
create table admin_profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text,
  role         text not null default 'admin' check (role in ('admin', 'superadmin')),
  created_at   timestamptz not null default now()
);

-- Helper function: cek apakah user yang lagi login adalah admin
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from admin_profiles where id = auth.uid()
  );
$$ language sql stable security definer;

-- =========================================================================
-- 11. ROW LEVEL SECURITY (RLS)
-- =========================================================================
alter table categories       enable row level security;
alter table products         enable row level security;
alter table product_images   enable row level security;
alter table product_variants enable row level security;
alter table cart_items       enable row level security;
alter table wishlist_items   enable row level security;
alter table orders           enable row level security;
alter table order_items      enable row level security;
alter table admin_profiles   enable row level security;

-- --- CATEGORIES: publik boleh baca, hanya admin yang boleh kelola ---
create policy "public read categories" on categories
  for select using (true);
create policy "admin manage categories" on categories
  for all using (is_admin()) with check (is_admin());

-- --- PRODUCTS: publik hanya boleh baca produk yang statusnya 'active' ---
create policy "public read active products" on products
  for select using (status = 'active');
create policy "admin manage products" on products
  for all using (is_admin()) with check (is_admin());

-- --- PRODUCT IMAGES & VARIANTS: publik boleh baca, admin kelola ---
create policy "public read product_images" on product_images
  for select using (true);
create policy "admin manage product_images" on product_images
  for all using (is_admin()) with check (is_admin());

create policy "public read product_variants" on product_variants
  for select using (true);
create policy "admin manage product_variants" on product_variants
  for all using (is_admin()) with check (is_admin());

-- --- CART & WISHLIST: guest bebas akses (tidak ada data sensitif/PII) ---
-- Catatan: proteksi cross-guest_session_id sepenuhnya diatur di layer aplikasi
-- (guest_session_id acak & tidak ditebak). Kalau butuh proteksi lebih ketat,
-- bisa upgrade ke Supabase anonymous auth di fase berikutnya.
create policy "public manage own cart" on cart_items
  for all using (true) with check (true);
create policy "public manage own wishlist" on wishlist_items
  for all using (true) with check (true);

-- --- ORDERS & ORDER ITEMS: publik boleh INSERT (checkout), tapi TIDAK
--     boleh membaca/mengubah order siapapun. Hanya admin yang boleh
--     melihat & mengubah status order. ---
create policy "public can create order" on orders
  for insert with check (true);
create policy "admin manage orders" on orders
  for all using (is_admin()) with check (is_admin());
create policy "admin can select orders only" on orders
  for select using (is_admin());

create policy "public can create order_items" on order_items
  for insert with check (true);
create policy "admin manage order_items" on order_items
  for all using (is_admin()) with check (is_admin());

-- --- ADMIN PROFILES: admin cuma bisa lihat datanya sendiri ---
create policy "admin read own profile" on admin_profiles
  for select using (auth.uid() = id);

-- =========================================================================
-- SELESAI
-- Langkah selanjutnya:
-- 1. Daftarkan akun admin pertama via Supabase Auth (Dashboard > Authentication),
--    lalu insert manual row-nya ke tabel admin_profiles dengan id yang sama.
-- 2. Import data produk awal (50-200 produk) — bisa lewat SQL insert massal
--    atau lewat fitur import di admin dashboard nanti.
-- =========================================================================
