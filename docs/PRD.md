# Product Requirements Document (PRD)
## BHINEKALED — Website E-Commerce, Channel Baru di Luar Shopee (Fase 1)

| | |
|---|---|
| **Dokumen** | PRD Fase 1 — Foundation & Struktur Dasar |
| **Tanggal** | 6 Juli 2026 (Rev. 1 — open questions dikonfirmasi PO) |
| **Status** | Disetujui untuk masuk technical design |
| **Tech Stack** | Next.js, Supabase |

---

## 1. Latar Belakang

Toko sudah memiliki channel penjualan aktif di Shopee. Tujuan project ini adalah membangun channel penjualan baru berupa website e-commerce mandiri untuk:
- Mengurangi ketergantungan pada satu marketplace (diversifikasi channel).
- Membangun brand presence sendiri yang lebih mudah ditemukan lewat pencarian organik (SEO).
- Memiliki kontrol penuh atas data pelanggan, katalog, dan pengalaman belanja — sesuatu yang terbatas di marketplace pihak ketiga.

**Pendekatan pengerjaan:** dibangun bertahap. Fase 1 berfokus pada membangun **struktur dan fondasi** platform — katalog, cart/checkout flow, wishlist, dan admin dashboard — **tanpa** payment gateway dan tracking ongkir real-time. Kedua fitur tersebut sengaja ditunda ke fase berikutnya sampai requirement dari Product Owner (pilihan payment gateway, kurir yang dipakai, kebijakan ongkir, dll) jelas.

---

## 2. Tujuan (Goals)

1. Membangun fondasi teknis website yang scalable dan SEO-friendly menggunakan Next.js.
2. Menyediakan pengalaman browsing & belanja dasar yang mulus: lihat produk → tambah ke cart/wishlist → checkout (simulasi).
3. Menyediakan admin dashboard agar tim toko bisa mengelola produk dan pesanan secara mandiri tanpa bantuan developer.
4. Menyiapkan struktur data (database schema) yang sudah mengakomodasi kebutuhan fase berikutnya (payment & ongkir), supaya integrasi nanti tidak perlu refactor besar.

### Non-Goals (Fase 1)
- Integrasi payment gateway (Midtrans/Xendit/dsb) — **ditunda**.
- Kalkulasi ongkir real-time & tracking pengiriman via API kurir — **ditunda**.
- Migrasi data produk otomatis dari Shopee (kalau dibutuhkan, dibahas terpisah).
- Multi-currency / multi-language.
- Notifikasi otomatis ke **customer** (email/WA konfirmasi order, update status) — **ditunda**. *(Catatan: notifikasi ke admin tetap in-scope, lihat poin E di section 4.1.)*

---

## 3. Target Pengguna & Role

| Role | Deskripsi |
|---|---|
| **Visitor/Customer (Guest)** | Pengunjung yang browsing produk, menambahkan ke cart/wishlist, dan melakukan checkout tanpa harus login (guest checkout) di fase 1. |
| **Admin/Owner Toko** | Mengelola produk, kategori, dan memantau pesanan masuk lewat dashboard. |

> **Keputusan:** Dikonfirmasi oleh PO — cart & wishlist fase 1 cukup berbasis **guest session (browser/local identifier)**, tidak perlu akun customer. Konsekuensinya: data cart/wishlist akan hilang jika customer ganti device/browser atau clear cookies. Ini acceptable untuk fase 1.

> **Perlu dikonfirmasi:** jumlah akun admin yang dibutuhkan (hanya owner, atau ada tim lain yang juga perlu akses dashboard?). Skema sudah mendukung multi-admin dengan role `admin`/`superadmin`, tapi perlu kejelasan siapa saja yang akan didaftarkan.

---

## 4. Ruang Lingkup Fitur (Scope)

### 4.1 In-Scope — Fase 1

#### A. Landing Page & Katalog Produk
- Homepage: hero/banner promosi, kategori unggulan, produk rekomendasi/terbaru.
- Halaman listing produk (grid) dengan filter dasar (kategori, harga, sort).
- Halaman detail produk: gambar (multi-image), deskripsi, harga, varian (misal ukuran/warna jika ada), stok.
- Search produk (basic, berbasis nama/kategori).
- Struktur URL & metadata yang SEO-friendly (slug, meta title/description, Open Graph, sitemap.xml, robots.txt).

#### B. Cart & Checkout Flow (UI/Simulasi)
- Tambah/hapus/update qty produk di cart.
- Halaman cart & ringkasan order.
- Ongkir ditampilkan di UI sebagai **flat rate/placeholder** (misal nilai tetap atau dummy), bukan hasil kalkulasi API kurir — akan digantikan logic real di Fase 3.
- Form checkout: data pengiriman (nama, alamat, no. HP, catatan).
- Placeholder metode pembayaran (tampil sebagai UI saja, belum terhubung payment gateway).
- Setelah submit, order otomatis tersimpan ke database dengan status **"Menunggu Konfirmasi"** — **tidak ada proses konfirmasi manual oleh admin di fase 1** (admin cukup memantau lewat dashboard, tanpa action wajib mengubah status).
- Halaman konfirmasi order (order summary + nomor order).

#### C. Wishlist / Favorit Produk
- Tambah/hapus produk dari wishlist.
- Halaman wishlist untuk melihat produk yang disimpan.
- Disimpan berbasis guest session (cookie/local identifier) di fase 1.

#### D. Admin Dashboard
- Login admin (auth via Supabase Auth).
- CRUD Produk: nama, deskripsi, harga, kategori, gambar, stok, varian.
- CRUD Kategori.
- **Import Produk dari Shopee**: fitur upload/import data produk (kemungkinan lewat file export Shopee — CSV/Excel) agar 50–200 produk existing tidak perlu diinput ulang manual satu-satu. *(Detail format file export Shopee perlu dicek dulu — lihat [Open Questions](#8-keputusan-yang-sudah-dikonfirmasi-po).)*
- Manajemen Order: melihat daftar order masuk, detail order, update status order manual (misal: Baru → Diproses → Dikirim → Selesai).
- Dashboard ringkasan sederhana (jumlah order, produk terlaris — nice to have, bukan prioritas utama).

#### E. Notifikasi Order Masuk (ke Admin)
- Setiap ada order baru, admin mendapat notifikasi otomatis lewat **WhatsApp atau email** (bentuk sederhana, misal via webhook ke grup WA atau email transaksional — bukan sistem notifikasi customer-facing yang kompleks).
- Tujuannya supaya admin tidak harus terus-menerus membuka dashboard manual untuk tahu ada order masuk, mengingat belum ada notifikasi otomatis ke customer di fase 1.
- Ini notifikasi satu arah (sistem → admin), bukan komunikasi dua arah atau notifikasi ke customer.

#### F. Halaman Legal & Kebijakan
- Halaman **Kebijakan Privasi** — mengingat website mengumpulkan data pribadi customer (nama, no. HP, alamat), perlu ada halaman yang menjelaskan bagaimana data ini digunakan, sejalan dengan UU PDP.
- Halaman **Syarat & Ketentuan**, termasuk kebijakan retur/tukar barang (relevan karena ini toko fisik yang berjualan online).
- Konten halaman-halaman ini disiapkan/direview oleh PO; developer/AI agent hanya membuat struktur halaman & template-nya.

#### G. Tombol Kontak Cepat (WhatsApp Floating Button)
- Tombol floating (biasanya pojok kanan bawah) yang mengarahkan customer langsung ke WhatsApp toko.
- Berguna terutama karena order belum ada live payment — customer sering perlu tanya status atau nego lewat WA.

#### H. Analytics Dasar
- Pemasangan **Google Analytics** dan/atau **Meta Pixel** sejak awal launch.
- Tujuannya supaya data traffic & perilaku customer sudah terekam dari hari pertama, terutama kalau nanti PO berencana menjalankan campaign iklan (Meta/Google Ads) dari channel ini — pemasangan pixel belakangan berarti kehilangan data historis.

### 4.2 Out-of-Scope — Ditunda ke Fase Berikutnya
- Integrasi payment gateway (pembayaran otomatis, callback status pembayaran).
- Kalkulasi ongkir otomatis via API kurir (JNE/J&T/SiCepat/dll) & live tracking resi.
- Akun customer (register/login, riwayat order personal).
- Promo/voucher/diskon otomatis.
- Notifikasi otomatis ke **customer** (email/WA konfirmasi order & update status pengiriman).

---

## 5. Struktur Data (Supabase/Postgres)

Skema final sudah dibuat dalam bentuk SQL siap-inject — lihat file terpisah **`schema_bhinekaled.sql`**. Ringkasan tabelnya:

- **categories** — kategori produk, mendukung sub-kategori (`parent_id`)
- **products** — data produk utama, termasuk kolom khusus untuk aksesoris lighting kendaraan: `vehicle_compatibility` (jsonb, tag kompatibilitas kendaraan) dan `specifications` (jsonb, spesifikasi teknis seperti watt/lumen/warna cahaya)
- **product_images** — multi-gambar per produk
- **product_variants** — varian produk (misal beda warna cahaya/konektor), opsional per produk
- **cart_items** & **wishlist_items** — berbasis `guest_session_id` (belum ada akun customer di fase 1)
- **orders** — `shipping_cost` & `payment_status` disiapkan sebagai kolom placeholder untuk integrasi fase 2/3; status default `menunggu_konfirmasi` tanpa proses konfirmasi manual admin
- **order_items** — snapshot data produk saat order dibuat, supaya histori order tidak berubah walau data produk diedit belakangan
- **admin_profiles** — role management admin di atas Supabase Auth

RLS (Row Level Security) sudah diaktifkan di semua tabel: publik hanya bisa baca produk berstatus `active` dan membuat order baru, sementara akses kelola penuh (produk, kategori, order) dibatasi hanya untuk admin.

---

## 6. Requirement Non-Fungsional

| Aspek | Requirement |
|---|---|
| **SEO** | Server-side rendering / static generation (Next.js App Router), metadata dinamis per produk, sitemap otomatis, structured data (schema.org Product). |
| **Performance** | Core Web Vitals baik (LCP, CLS) — optimasi gambar (next/image), lazy loading. |
| **Responsiveness** | Mobile-first, mengingat traffic e-commerce Indonesia mayoritas mobile. |
| **Security** | Row Level Security (RLS) di Supabase untuk proteksi data, admin dashboard hanya bisa diakses role admin. |
| **Scalability** | Struktur database & kode disiapkan agar mudah menambah fitur payment/ongkir tanpa refactor besar. |
| **Environment** | Disiapkan **2 environment terpisah** — staging (untuk testing/development) dan production (data order asli) — baik di sisi Supabase project maupun hosting, supaya proses development tidak bercampur dengan data customer sungguhan. |

---

## 7. Roadmap Fase

| Fase | Fokus | Status |
|---|---|---|
| **Fase 1 (dokumen ini)** | Struktur dasar: katalog, cart/checkout UI, wishlist, admin dashboard | 🔵 Akan dikerjakan |
| **Fase 2** | Integrasi payment gateway sesuai pilihan PO | ⏳ Menunggu requirement |
| **Fase 3** | Integrasi API tracking ongkir & kalkulasi biaya kirim real-time | ⏳ Menunggu requirement |
| **Fase 4 (opsional)** | Akun customer, riwayat order, promo/voucher | ⏳ Belum dibahas |

---

## 8. Keputusan yang Sudah Dikonfirmasi PO

| # | Topik | Keputusan |
|---|---|---|
| 1 | Cart/Wishlist tanpa akun user | ✅ Cukup **guest session** berbasis browser/local identifier. Tidak perlu akun customer di fase 1. |
| 2 | Status order tanpa payment gateway | ✅ Order otomatis masuk ke database dengan status **"Menunggu Konfirmasi"**. **Tidak ada** proses konfirmasi manual oleh admin di fase 1. |
| 3 | Ongkir placeholder | ✅ Tetap ditampilkan di UI, tapi sebagai **flat rate/placeholder** (nilai tetap, bukan hasil kalkulasi API). |
| 4 | Data produk (migrasi dari Shopee) | ✅ Perlu **fitur import** (bukan input manual satu-satu) — sudah ditambahkan ke scope Admin Dashboard (poin 4.1.D). |
| 5 | Domain & hosting | ✅ Domain sudah ada. Hosting akan **disediakan oleh PO**; tim development akan membantu proses **setup deployment** ke hosting tersebut saat tiba waktunya. |
| 6 | Branding | ✅ Logo sudah tersedia. Palet warna, tipografi, dan visual guideline lainnya akan diturunkan dari logo — lihat dokumen terpisah **Brand Visual Guideline**. |

### Sisa Action Item / Perlu Ditindaklanjuti
- **Format file import Shopee**: perlu dicek format export produk dari Shopee Seller Center (biasanya Excel/CSV) supaya struktur kolom import bisa disesuaikan mapping-nya ke skema `products` di Supabase.
- **Spesifikasi hosting**: begitu hosting sudah di-provide PO, perlu info provider (Vercel/VPS/cPanel/dll) untuk menentukan strategi deployment Next.js-nya.
- **Nilai flat rate ongkir**: perlu ditentukan nominal placeholder-nya (misal Rp0, Rp15.000, atau "gratis ongkir sementara") untuk ditampilkan di UI checkout.

---

## 9. Success Metrics (Fase 1)

- Website live & dapat diakses publik dengan katalog 50–200 produk lengkap.
- Customer bisa menyelesaikan alur: browse → cart → wishlist → submit order (tanpa error).
- Admin bisa mengelola produk & order sepenuhnya tanpa bantuan developer.
- Admin menerima notifikasi setiap ada order baru tanpa harus membuka dashboard terus-menerus.
- Website terindeks Google dengan sitemap & metadata yang valid (basic SEO health check pass).
- Halaman Kebijakan Privasi & Syarat Ketentuan tersedia sebelum go-live.
- Tracking Google Analytics/Meta Pixel sudah aktif sejak hari pertama launch.

---

*Dokumen ini adalah draft awal. Mohon direview dan dikonfirmasi terutama bagian [Open Questions](#8-open-questions--risiko) sebelum masuk ke tahap technical design & development.*
