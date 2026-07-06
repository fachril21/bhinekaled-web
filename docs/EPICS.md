# Epic Breakdown — BHINEKALED Fase 1

Breakdown ini nurunin scope dari `PRD.md` jadi epic-epic yang bisa dikerjain berurutan. Urutan di bawah ini juga merepresentasikan **urutan pengerjaan yang disarankan** (epic di atas jadi dependency epic di bawahnya).

---

## Epic 0 — Project & Database Foundation
**Goal:** Fondasi teknis siap sebelum fitur apapun mulai dibangun.

**Scope:**
- Setup project Next.js (App Router + TypeScript + Tailwind) sesuai `ARCHITECTURE.md`
- Setup project Supabase, inject `schema.sql`
- **Setup 2 environment terpisah — staging & production** (project Supabase terpisah, environment variable terpisah di hosting), supaya development tidak bercampur dengan data order asli
- Setup environment variables (`.env.local`) & koneksi Supabase client (browser/server/admin)
- Setup `docs/` folder & `AGENTS.md` di root repo
- Setup deployment awal ke hosting (kalau hosting sudah tersedia dari PO)

**Acceptance Criteria:**
- [ ] `npx create-next-app` jalan dengan struktur folder sesuai `ARCHITECTURE.md`
- [ ] Schema berhasil di-inject ke **kedua** project Supabase (staging & production) tanpa error, RLS aktif di semua tabel
- [ ] Koneksi ke Supabase berhasil dites (misal: query kosong ke tabel `products` sukses)
- [ ] Akun admin pertama sudah terdaftar via Supabase Auth + row di `admin_profiles` (di kedua environment)
- [ ] Project bisa di-deploy ke staging environment (walau masih halaman kosong)
- [ ] Jelas environment variable mana yang dipakai staging vs production, tidak tercampur

**Dependency:** Tidak ada (paling awal)

---

## Epic 1 — Landing Page & Katalog Produk
**Goal:** Customer bisa browsing produk tanpa perlu fitur transaksi apapun dulu.

**User Stories:**
- Sebagai customer, saya ingin melihat homepage dengan produk unggulan/terbaru, supaya saya tertarik eksplor lebih lanjut.
- Sebagai customer, saya ingin melihat daftar produk per kategori dengan filter (harga, sort), supaya saya bisa cari produk yang sesuai kendaraan saya.
- Sebagai customer, saya ingin melihat halaman detail produk (gambar, deskripsi, spesifikasi, harga, varian), supaya saya bisa memutuskan mau beli atau tidak.
- Sebagai customer, saya ingin mencari produk lewat search bar, supaya lebih cepat nemu barang yang saya mau.

**Acceptance Criteria:**
- [ ] Homepage menampilkan kategori unggulan & produk terbaru dari data Supabase (bukan dummy)
- [ ] Listing produk mendukung filter kategori, filter harga (range), dan sort (termurah/termahal/terbaru)
- [ ] Halaman detail produk menampilkan semua gambar (`product_images`), spesifikasi (`specifications`), dan kompatibilitas kendaraan (`vehicle_compatibility`)
- [ ] Kalau produk punya varian, customer bisa pilih varian dan harga/stok ikut berubah sesuai varian yang dipilih
- [ ] Search berjalan minimal berdasarkan nama produk
- [ ] Semua halaman di atas SEO-friendly: metadata dinamis, slug URL rapi, sitemap.xml otomatis update

**Dependency:** Epic 0

---

## Epic 2 — Cart & Wishlist (Guest Session)
**Goal:** Customer bisa mengumpulkan produk yang diminati sebelum checkout.

**User Stories:**
- Sebagai customer, saya ingin menambahkan produk ke cart, supaya bisa checkout beberapa barang sekaligus.
- Sebagai customer, saya ingin mengubah qty atau menghapus item dari cart.
- Sebagai customer, saya ingin menyimpan produk ke wishlist untuk dibeli nanti.

**Acceptance Criteria:**
- [ ] `guest_session_id` otomatis dibuat & disimpan di cookie saat customer pertama kali buka website
- [ ] Tambah/update qty/hapus item cart tersimpan ke tabel `cart_items` sesuai `guest_session_id`
- [ ] Halaman cart menampilkan subtotal (harga x qty, tanpa ongkir dulu)
- [ ] Tambah/hapus wishlist tersimpan ke `wishlist_items`, dan tercermin di halaman wishlist
- [ ] Cart & wishlist tetap ada kalau customer refresh halaman (selama browser/cookie sama)

**Dependency:** Epic 1 (butuh data produk untuk ditambahkan ke cart)

---

## Epic 3 — Checkout Flow (Tanpa Payment Gateway)
**Goal:** Customer bisa menyelesaikan pemesanan sampai order tersimpan di sistem, tanpa pembayaran online.

**User Stories:**
- Sebagai customer, saya ingin mengisi data pengiriman & submit order dari isi cart saya.
- Sebagai customer, saya ingin melihat halaman konfirmasi berisi nomor order setelah submit.
- Sebagai admin, saya ingin mendapat notifikasi (WA/email) setiap ada order baru masuk, supaya saya tidak perlu terus-menerus cek dashboard manual.

**Acceptance Criteria:**
- [ ] Form checkout: nama, no. HP, alamat lengkap, catatan (opsional) — dengan validasi (Zod)
- [ ] Ongkir ditampilkan sebagai flat rate placeholder (nilai final ditentukan PO — lihat Open Action Items di PRD)
- [ ] Metode pembayaran ditampilkan sebagai UI placeholder (belum ada logic pembayaran)
- [ ] Submit checkout memanggil `app/api/checkout/route.ts` → insert ke `orders` + `order_items` (validasi ulang harga & stok di server, bukan trust dari client)
- [ ] Order otomatis dapat `order_number` & status `menunggu_konfirmasi` (tanpa proses konfirmasi manual admin)
- [ ] Cart dikosongkan setelah order berhasil dibuat
- [ ] Halaman konfirmasi order menampilkan ringkasan pesanan + nomor order
- [ ] Setelah order berhasil dibuat, sistem otomatis mengirim notifikasi ke admin (WA grup/nomor admin atau email) berisi ringkasan order singkat (nomor order, nama customer, total)

**Dependency:** Epic 2

---

## Epic 4 — Admin: Auth & Dashboard Shell
**Goal:** Admin punya akses aman ke area pengelolaan toko.

**User Stories:**
- Sebagai admin, saya ingin login supaya bisa mengakses dashboard.
- Sebagai admin, saya ingin melihat ringkasan singkat (jumlah order, produk) saat pertama buka dashboard.

**Acceptance Criteria:**
- [ ] Halaman login admin terhubung ke Supabase Auth
- [ ] Route `/admin/*` terproteksi — redirect ke login kalau belum auth atau bukan admin (`admin_profiles`)
- [ ] Dashboard ringkasan menampilkan angka dasar (total order, total produk aktif) — nice to have, bukan blocking

> **Perlu dikonfirmasi ke PO:** berapa jumlah akun admin yang perlu didaftarkan di awal (hanya owner, atau ada staff lain?). Skema `admin_profiles` sudah mendukung multi-admin dengan role `admin`/`superadmin`.

**Dependency:** Epic 0

---

## Epic 5 — Admin: Kelola Produk & Kategori
**Goal:** Admin bisa mengelola katalog secara mandiri tanpa bantuan developer.

**User Stories:**
- Sebagai admin, saya ingin menambah/edit/hapus produk beserta gambar, spesifikasi, dan varian.
- Sebagai admin, saya ingin mengelola kategori produk.

**Acceptance Criteria:**
- [ ] CRUD produk lengkap: nama, deskripsi, harga, stok, kategori, gambar (upload multi), spesifikasi, kompatibilitas kendaraan
- [ ] CRUD varian produk (nama varian, sku, harga override, stok)
- [ ] CRUD kategori (termasuk sub-kategori)
- [ ] Perubahan status produk (`draft`/`active`/`archived`) langsung berefek ke visibilitas di storefront

**Dependency:** Epic 4

---

## Epic 6 — Admin: Import Produk dari Shopee
**Goal:** Mempercepat migrasi 50–200 produk existing tanpa input manual satu-satu.

**User Stories:**
- Sebagai admin, saya ingin upload file (CSV/Excel) hasil export dari Shopee Seller Center, supaya produk-produk existing otomatis masuk ke katalog website.

**Acceptance Criteria:**
- [ ] Format file export Shopee sudah dicek & mapping kolom ke skema `products` sudah didefinisikan *(action item — lihat PRD)*
- [ ] Upload file → preview hasil parsing sebelum benar-benar disimpan ke database
- [ ] Produk yang berhasil/gagal di-import ditampilkan jelas ke admin (misal: baris mana yang error & kenapa)
- [ ] Produk hasil import masuk dengan status `draft` dulu (admin review manual sebelum di-set `active`)

**Dependency:** Epic 5

---

## Epic 7 — Admin: Kelola Order
**Goal:** Admin bisa memantau & memproses order yang masuk dari website.

**User Stories:**
- Sebagai admin, saya ingin melihat daftar order masuk beserta detailnya.
- Sebagai admin, saya ingin mengubah status order (diproses → dikirim → selesai) sesuai progres pengiriman manual.

**Acceptance Criteria:**
- [ ] List order menampilkan status, tanggal, nama customer, total — bisa difilter berdasarkan status
- [ ] Detail order menampilkan item yang dibeli, data pengiriman, dan histori status
- [ ] Admin bisa update status order secara manual dari dashboard

**Dependency:** Epic 3, Epic 4

---

## Epic 8 — SEO, Analytics & Site-wide Enhancements
**Goal:** Memastikan requirement non-fungsional dari PRD (SEO, performance, responsiveness) terpenuhi, plus enhancement site-wide yang mendukung marketing & customer trust.

**Scope:**
- Audit metadata (title/description tiap halaman), structured data schema.org Product
- Optimasi gambar (`next/image`), cek Core Web Vitals
- Cek tampilan responsive di berbagai ukuran layar (mobile-first)
- Submit sitemap ke Google Search Console
- **Pasang Google Analytics & Meta Pixel** sejak sebelum go-live, supaya data traffic terekam dari hari pertama
- **Tombol floating WhatsApp** di semua halaman customer-facing, mengarah ke nomor WA toko

**Acceptance Criteria:**
- [ ] Semua halaman produk punya metadata unik & structured data valid (cek via Google Rich Results Test)
- [ ] Lighthouse score performance & SEO di atas ambang wajar (target internal, sepakati dengan tim)
- [ ] Tampilan website nyaman diakses dari mobile (mayoritas traffic e-commerce Indonesia)
- [ ] Google Analytics & Meta Pixel terpasang dan berhasil mencatat page view/event dasar (dicek lewat real-time report)
- [ ] Tombol WhatsApp floating muncul konsisten di semua halaman publik dan langsung membuka chat ke nomor toko yang benar

**Dependency:** Semua epic sebelumnya (dilakukan menjelang go-live)

---

## Epic 9 — Notifikasi Order ke Admin
**Goal:** Admin tahu ada order baru tanpa harus terus-menerus membuka dashboard secara manual.

**User Stories:**
- Sebagai admin, saya ingin mendapat notifikasi otomatis (WhatsApp atau email) setiap ada order baru masuk.

**Acceptance Criteria:**
- [ ] Ditentukan dulu channel notifikasi yang dipakai (WhatsApp Business API/webhook grup WA, atau email transaksional) — perlu keputusan PO soal preferensi & biaya
- [ ] Trigger notifikasi terpasang di alur checkout (bisa lewat Supabase Database Webhook/Edge Function yang jalan setiap ada insert baru ke tabel `orders`)
- [ ] Isi notifikasi minimal berisi: nomor order, nama customer, total, waktu order masuk
- [ ] Notifikasi ini satu arah (sistem → admin) — bukan notifikasi ke customer (tetap out-of-scope sesuai PRD)
- [ ] Kalau notifikasi gagal terkirim (misal API pihak ketiga down), order tetap berhasil tersimpan — notifikasi tidak boleh jadi blocking point transaksi

**Dependency:** Epic 3 (checkout harus jalan dulu sebelum notifikasi bisa di-trigger)

---

## Epic 10 — Halaman Legal & Kebijakan
**Goal:** Website punya dasar kepatuhan legal sebelum mengumpulkan data pribadi customer secara publik.

**User Stories:**
- Sebagai customer, saya ingin tahu bagaimana data pribadi saya digunakan sebelum checkout.
- Sebagai customer, saya ingin tahu kebijakan retur/tukar barang sebelum membeli.

**Acceptance Criteria:**
- [ ] Halaman Kebijakan Privasi tersedia & dapat diakses dari footer di semua halaman
- [ ] Halaman Syarat & Ketentuan (termasuk kebijakan retur/tukar) tersedia & dapat diakses dari footer
- [ ] Konten kedua halaman disiapkan/direview oleh PO — developer/AI agent hanya membuat struktur halaman & styling sesuai brand guideline
- [ ] Link ke kedua halaman ini muncul di area checkout (misal: "Dengan melanjutkan, Anda setuju dengan Syarat & Ketentuan kami")

**Dependency:** Epic 0 (bisa dikerjakan paralel dengan epic lain, tidak bergantung ke fitur transaksi)

---

## Ringkasan Urutan Pengerjaan

```
Epic 0 (Foundation, termasuk staging & production env)
   │
   ├─→ Epic 1 (Katalog) ──→ Epic 2 (Cart & Wishlist) ──→ Epic 3 (Checkout) ──→ Epic 9 (Notifikasi Admin)
   │
   ├─→ Epic 4 (Admin Auth) ──→ Epic 5 (Kelola Produk) ──┬─→ Epic 6 (Import Shopee)
   │                                                      └─→ Epic 7 (Kelola Order) *butuh Epic 3 juga
   │
   └─→ Epic 10 (Halaman Legal) — paralel, tidak bergantung fitur transaksi

Epic 8 (SEO, Analytics & Site-wide Enhancements) — dikerjakan paralel/menjelang akhir, menyentuh semua epic di atas
```

> Epic 1 & Epic 4 bisa dikerjakan **paralel** (dua developer berbeda, atau AI agent dikasih task terpisah) karena tidak saling bergantung — keduanya sama-sama cuma butuh Epic 0 selesai duluan. **Epic 10** (halaman legal) juga bisa dikerjakan kapan saja karena independen dari fitur transaksi.
