# Brand Visual Guideline — BHINEKALED
*Diturunkan dari aset logo yang sudah ada. Dokumen ini jadi acuan visual untuk desain website (dan materi lain ke depannya).*

---

## 1. Logo

Logo terdiri dari:
- Wordmark **"BHINEKALED"** — huruf tebal, sudut membulat (rounded sans-serif), dengan outline putih di sekeliling huruf merah.
- Elemen garis tebal di atas & bawah wordmark, menegaskan wordmark sebagai satu blok yang solid.
- Elemen **sunburst/rays** di sisi kanan — memberi kesan energik, "menyala", cocok dengan asosiasi kata "LED" pada nama brand.

### Aturan Penggunaan Logo
| Boleh | Jangan |
|---|---|
| Gunakan logo di atas background putih atau netral terang (`#FFFFFF`, `#F5F5F4`) | Jangan taruh di atas background berwarna/kontras rendah yang bikin outline putih hilang |
| Beri ruang kosong (clear space) minimal setinggi elemen sunburst di sekeliling logo | Jangan mepetkan logo dengan elemen lain (teks, gambar produk, tepi layar) |
| Gunakan versi utuh (wordmark + sunburst) untuk header/branding utama | Jangan stretch/distorsi rasio logo |
| Untuk ukuran kecil (favicon, ikon app), boleh pakai elemen sunburst saja atau inisial "B" bergaya sama | Jangan ubah warna merah jadi warna lain di luar palet resmi |

---

## 2. Palet Warna

Warna diekstrak langsung dari file logo asli.

| Warna | Hex | Kegunaan |
|---|---|---|
| 🔴 **Primary Red** | `#E6212A` | Warna utama brand — dipakai di logo, CTA button, harga/highlight, elemen aksen utama di website |
| ⚪ **Outline White** | `#FFFFFF` | Background utama, outline logo, teks di atas background merah |
| ⚫ **Ink Black** | `#1A1A1A` | Warna teks body/heading di atas background terang, memberi kontras tegas ala logo |
| ◻️ **Neutral Background** | `#F5F5F4` | Background sekunder/section alternating, card background |

> **Catatan teknis:** untuk kebutuhan aksesibilitas (kontras teks), pastikan teks putih di atas `#E6212A` sudah memenuhi rasio kontras WCAG AA — sudah dicek dan aman untuk teks besar/bold (mengikuti gaya logo asli).

---

## 3. Tipografi

Karakter huruf di logo: **tebal, geometris, sudut membulat (rounded), sedikit condong/dinamis** — memberi kesan bold, energik, modern.

**Rekomendasi font untuk website** (karena font persis di logo kemungkinan custom-drawn, jadi kita cari padanan terdekat yang tersedia sebagai webfont):

| Elemen | Rekomendasi Font | Alasan |
|---|---|---|
| Heading / Judul produk | **Poppins ExtraBold** atau **Montserrat Black** | Geometris, bulat di sudut, tersedia gratis di Google Fonts, dekat dengan karakter logo |
| Body text | **Inter** atau **Poppins Regular** | Netral, mudah dibaca, kontras baik dengan heading yang bold |
| Angka harga/promo | Font heading yang sama (bold), warna Primary Red | Konsisten dengan gaya "berani" dari logo |

---

## 4. Elemen Visual Pendukung

- **Sunburst/rays**: bisa dipakai sebagai elemen dekoratif di background hero section, badge promo ("Diskon!", "Baru!"), atau divider antar section — untuk mempertahankan kesan "energik/menyala" dari logo.
- **Garis tebal (bar)**: elemen garis di atas-bawah wordmark bisa diadaptasi jadi separator/divider section di website.
- **Sudut membulat**: terapkan `border-radius` yang cukup besar pada button, card produk, dan badge — supaya konsisten dengan gaya rounded di logo (hindari sudut tajam 90° yang terkesan kaku, bertentangan dengan karakter logo).

---

## 5. Tone of Voice (Usulan Awal)

Berdasarkan gaya visual (bold, merah, energik, sunburst = "menyala"):
- **Energik & percaya diri** — copywriting singkat, tegas, tidak bertele-tele.
- **Approachable** — tetap ramah, bukan agresif; cocok untuk produk konsumen sehari-hari.
- *(Catatan: kalau nama "LED" merujuk ke produk pencahayaan/elektronik, tone bisa diarahkan lebih teknis-informatif untuk deskripsi produk, tapi tetap energik di bagian promosi/hero.)*

> Bagian tone of voice ini masih usulan awal — mohon dikonfirmasi/disesuaikan dengan karakter toko yang sebenarnya.

---

## 6. Next Step

- Guideline ini akan jadi acuan saat desain UI (wireframe → hi-fi mockup) website di tahap technical design.
- Kalau nanti ada aset tambahan dari toko (foto produk, banner promo Shopee, dsb), akan dicek konsistensinya dengan guideline ini.
