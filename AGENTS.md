<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# AGENTS.md — Instruksi untuk AI Coding Agent

Project: **BHINEKALED** — website e-commerce toko aksesoris lighting kendaraan (channel baru di luar Shopee).
Fase saat ini: **Fase 1 — Foundation** (tanpa payment gateway & tanpa API ongkir real-time).

---

## 1. Baca Dulu Sebelum Mulai Kerja

**Sebelum apapun**, baca notice di paling atas file ini soal breaking changes Next.js versi yang dipakai project ini — cek `node_modules/next/dist/docs/` untuk dokumentasi API terbaru yang sesuai, jangan asumsikan konvensi dari training data.

Setelah itu, baca file-file ini secara berurutan:

1. `docs/PRD.md` — scope fitur fase 1, apa yang IN scope dan OUT of scope
2. `docs/EPICS.md` — breakdown fitur jadi epic & user story, ini acuan urutan pengerjaan
3. `docs/BRAND_GUIDELINE.md` — warna, tipografi, tone of voice
4. `docs/schema.sql` — struktur tabel Supabase yang sudah jadi acuan (JANGAN diubah tanpa konfirmasi user)
5. `docs/ARCHITECTURE.md` — struktur folder & konvensi teknis project

Kerjakan **satu epic atau satu user story dalam satu waktu**. Jangan mengerjakan beberapa epic sekaligus dalam satu task besar — pecah jadi task-task kecil supaya mudah direview.

---

## 2. Batasan Keras Fase 1 (JANGAN dilanggar tanpa konfirmasi eksplisit dari user)

- ❌ **Jangan** implementasi payment gateway apapun (Midtrans/Xendit/dll). Checkout cukup insert order dengan status `menunggu_konfirmasi` dan `payment_status = 'n/a'`.
- ❌ **Jangan** implementasi kalkulasi ongkir via API kurir. Ongkir tampil sebagai flat rate placeholder di UI.
- ❌ **Jangan** membuat sistem akun/login untuk customer. Cart & wishlist berbasis `guest_session_id` dari cookie.
- ❌ **Jangan** mengubah struktur tabel di `docs/schema.sql` (tambah/hapus kolom, ubah tipe data) tanpa bertanya ke user dulu dan menjelaskan alasannya.
- ❌ **Jangan** menambah dependency/library besar (state management, UI kit, dll) tanpa menyebutkan alasannya ke user — cek dulu apakah kebutuhannya bisa diselesaikan dengan yang sudah ada.
- ❌ **Jangan** membuat proses konfirmasi order manual oleh admin — order otomatis masuk dengan status `menunggu_konfirmasi` begitu customer submit.

Kalau task yang diminta user sepertinya butuh melanggar salah satu batasan di atas (misal: "tolong tambahin fitur bayar pakai QRIS"), **berhenti dan tanya balik dulu** — kemungkinan besar itu scope fase 2/3 yang belum waktunya.

---

## 3. Konvensi Wajib

| Aspek | Aturan |
|---|---|
| Bahasa UI | Semua teks customer-facing & admin dashboard pakai **Bahasa Indonesia** |
| Warna primary | `#E6212A` (merah brand) — jangan pakai warna merah lain di luar palet `BRAND_GUIDELINE.md` |
| Routing | Next.js App Router — jangan campur dengan Pages Router |
| Data fetching | Server Component untuk data publik (produk, kategori); client-side hanya untuk interaksi (cart, wishlist, form) |
| Supabase client | Gunakan client yang sesuai context: `lib/supabase/client.ts` (browser), `server.ts` (Server Component), `admin.ts` (operasi admin, service role key — **hanya di server, tidak boleh diimpor di client component**) |
| Validasi form | Pakai Zod, jangan validasi manual pakai if-else bertumpuk |
| Commit | Satu commit per user story/task selesai, dengan pesan yang jelas menyebut epic-nya (misal: `feat(epic-1): tambah halaman detail produk`) |

---

## 4. Workflow yang Disarankan per Task

1. Konfirmasi ke user epic/story mana yang mau dikerjakan (kalau belum jelas dari instruksi).
2. Baca ulang acceptance criteria story tersebut di `docs/EPICS.md`.
3. Implementasi.
4. Jalankan/cek build & type-check sebelum melapor selesai.
5. Ringkas ke user: apa yang diubah, file apa saja yang disentuh, dan apakah ada acceptance criteria yang belum terpenuhi/butuh keputusan tambahan dari user.

---

## 5. Kalau Ada Ambiguitas

Kalau instruksi user ambigu atau requirement belum ada di `docs/PRD.md`, **jangan menebak sendiri lalu diam-diam mengimplementasikan asumsi tersebut**. Tanya ke user dulu, atau kalau memungkinkan, kerjakan bagian yang jelas dulu sambil menyebutkan asumsi yang diambil untuk bagian yang ambigu.
