import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/storefront/LegalPageLayout";

export const metadata: Metadata = {
  title: "Syarat dan Ketentuan — Bhinekaled",
  description:
    "Syarat dan Ketentuan penggunaan situs serta pemesanan produk di Bhinekaled, toko aksesoris lighting kendaraan.",
  alternates: { canonical: "/syarat-dan-ketentuan" },
};

const LAST_UPDATED = "3 September 2026";

export default function SyaratDanKetentuanPage() {
  return (
    <LegalPageLayout
      title="Syarat dan Ketentuan"
      lastUpdated={LAST_UPDATED}
      intro="Syarat dan Ketentuan ini mengatur penggunaan situs {{business}} serta proses pemesanan produk di dalamnya. Dengan mengakses situs ini dan/atau melakukan pemesanan, Anda dianggap telah membaca, memahami, dan menyetujui seluruh ketentuan di bawah ini."
    >
      <h2>1. Definisi</h2>
      <ul>
        <li>
          <strong>&ldquo;Kami&rdquo;</strong> merujuk pada penjual, yaitu pengelola dan pemilik situs
          ini (identitas usaha selengkapnya tercantum pada bagian Kontak di bawah).
        </li>
        <li>
          <strong>&ldquo;Anda&rdquo;</strong> atau <strong>&ldquo;Pengguna&rdquo;</strong> merujuk pada
          setiap orang yang mengakses situs, menelusuri katalog, atau melakukan pemesanan.
        </li>
        <li>
          <strong>&ldquo;Produk&rdquo;</strong> merujuk pada barang yang ditawarkan untuk dijual melalui
          situs ini, yaitu aksesoris dan komponen pencahayaan kendaraan beserta perlengkapan terkait.
        </li>
        <li>
          <strong>&ldquo;Pesanan&rdquo;</strong> merujuk pada permintaan pembelian Produk yang Anda
          ajukan melalui formulir pemesanan di situs.
        </li>
      </ul>

      <h2>2. Ketentuan Penggunaan Situs</h2>
      <ul>
        <li>Anda menyatakan berusia minimal 18 tahun atau telah memperoleh izin dari wali yang sah.</li>
        <li>
          Anda setuju untuk memberikan data yang benar, akurat, dan terkini saat melakukan pemesanan.
        </li>
        <li>
          Anda dilarang menggunakan situs untuk tujuan melanggar hukum, mengganggu operasional situs,
          melakukan pemesanan palsu, atau menyalahgunakan konten dan materi milik Kami.
        </li>
        <li>
          Seluruh konten pada situs (teks, gambar produk, logo, dan tata letak) adalah milik Kami atau
          pemberi lisensi Kami dan tidak boleh digunakan tanpa izin tertulis.
        </li>
      </ul>

      <h2>3. Akun dan Sesi Belanja</h2>
      <p>
        Situs ini belum menyediakan pendaftaran akun pelanggan. Keranjang belanja dan daftar favorit
        Anda disimpan sementara pada perangkat/peramban Anda melalui pengenal sesi tamu. Data ini dapat
        hilang jika Anda menghapus cookie, berganti perangkat, atau setelah jangka waktu tertentu.
      </p>

      <h2>4. Produk, Harga, dan Ketersediaan</h2>
      <ul>
        <li>
          Kami berupaya menampilkan deskripsi, spesifikasi, dan gambar Produk seakurat mungkin. Warna
          dan tampilan aktual dapat sedikit berbeda karena pengaturan layar masing-masing perangkat.
        </li>
        <li>
          Harga tercantum dalam Rupiah dan sudah termasuk pajak yang berlaku, kecuali dinyatakan lain.
        </li>
        <li>
          Kami dapat mengubah harga, spesifikasi, atau ketersediaan Produk sewaktu-waktu tanpa
          pemberitahuan terlebih dahulu. Harga yang berlaku adalah harga pada saat Pesanan dikonfirmasi.
        </li>
        <li>
          Jika Produk yang Anda pesan ternyata tidak tersedia setelah Pesanan masuk, Kami akan
          menghubungi Anda untuk penggantian barang atau pembatalan.
        </li>
      </ul>

      <h2>5. Pemesanan</h2>
      <ul>
        <li>
          Pesanan dianggap diterima setelah Anda menyelesaikan formulir pemesanan dan menerima nomor
          pesanan. Status awal setiap Pesanan adalah <strong>menunggu konfirmasi</strong>.
        </li>
        <li>
          Kami berhak menolak atau membatalkan Pesanan, antara lain karena kesalahan harga, indikasi
          penipuan, atau stok yang tidak mencukupi.
        </li>
        <li>
          Pastikan alamat pengiriman dan nomor kontak yang Anda cantumkan sudah benar. Kesalahan data
          yang menyebabkan keterlambatan atau kegagalan pengiriman bukan merupakan tanggung jawab Kami.
        </li>
      </ul>

      <h2>6. Pembayaran</h2>
      <p>
        Pada tahap ini pembayaran dilakukan secara manual. Setelah Pesanan Anda dikonfirmasi, Kami akan
        mengirimkan instruksi pembayaran melalui kanal komunikasi yang Anda berikan (misalnya WhatsApp).
        Pesanan akan diproses setelah pembayaran diterima dan diverifikasi. Pesanan yang tidak dibayar
        dalam jangka waktu yang diinformasikan dapat dibatalkan secara otomatis.
      </p>

      <h2>7. Pengiriman dan Ongkos Kirim</h2>
      <ul>
        <li>
          Produk dikirim ke alamat yang Anda cantumkan pada Pesanan menggunakan jasa pengiriman pihak
          ketiga.
        </li>
        <li>
          Estimasi ongkos kirim yang ditampilkan bersifat perkiraan. Biaya final dapat menyesuaikan
          berat, dimensi, dan tujuan pengiriman, dan akan dikonfirmasikan sebelum pembayaran.
        </li>
        <li>
          Estimasi waktu tiba bergantung pada jasa pengiriman dan kondisi di luar kendali Kami
          (cuaca, kahar, kebijakan operasional kurir).
        </li>
        <li>Risiko atas Produk beralih kepada Anda saat Produk diterima di alamat tujuan.</li>
      </ul>

      <h2>8. Pengembalian, Penukaran, dan Refund</h2>
      <ul>
        <li>
          Permintaan pengembalian atau penukaran dapat diajukan paling lambat 3 (tiga) hari sejak
          Produk diterima, dengan menghubungi Kami disertai nomor pesanan dan foto/bukti kondisi barang.
        </li>
        <li>
          Pengembalian hanya berlaku untuk Produk yang <strong>rusak saat diterima</strong>,
          <strong> cacat produksi</strong>, atau <strong>tidak sesuai pesanan</strong>. Produk harus
          dalam kondisi lengkap beserta kemasan dan kelengkapannya, serta belum dipasang/dipakai.
        </li>
        <li>
          Produk yang tidak dapat dikembalikan antara lain: barang yang rusak karena pemasangan atau
          pemakaian yang tidak sesuai petunjuk, serta barang yang dibeli dalam kondisi diskon khusus
          (kecuali cacat).
        </li>
        <li>
          Setelah Produk retur Kami terima dan verifikasi, Kami akan mengirim barang pengganti atau
          mengembalikan dana melalui metode yang disepakati dalam waktu wajar. Ongkos kirim retur
          ditanggung Kami apabila kesalahan berasal dari pihak Kami.
        </li>
      </ul>

      <h2>9. Garansi</h2>
      <p>
        Garansi (jika ada) mengikuti ketentuan yang tercantum pada halaman Produk atau kartu garansi
        yang disertakan. Garansi tidak mencakup kerusakan akibat pemasangan yang keliru, modifikasi,
        kelalaian, korsleting kelistrikan kendaraan, atau penggunaan di luar peruntukan Produk.
      </p>

      <h2>10. Batasan Tanggung Jawab</h2>
      <p>
        Sepanjang diizinkan oleh hukum yang berlaku, tanggung jawab Kami atas suatu Pesanan dibatasi
        pada nilai Produk yang bersangkutan. Kami tidak bertanggung jawab atas kerugian tidak langsung,
        termasuk kerusakan pada kendaraan atau komponen lain akibat pemasangan atau penggunaan Produk
        yang tidak sesuai petunjuk oleh Anda atau pihak ketiga.
      </p>

      <h2>11. Perubahan Syarat dan Ketentuan</h2>
      <p>
        Kami dapat memperbarui Syarat dan Ketentuan ini dari waktu ke waktu. Versi terbaru akan
        ditampilkan pada halaman ini beserta tanggal pembaruannya. Dengan tetap menggunakan situs
        setelah perubahan berlaku, Anda dianggap menyetujui ketentuan yang diperbarui.
      </p>

      <h2>12. Hukum yang Berlaku</h2>
      <p>
        Syarat dan Ketentuan ini tunduk pada hukum Republik Indonesia. Setiap perselisihan akan
        diselesaikan terlebih dahulu secara musyawarah, dan apabila tidak tercapai, melalui pengadilan
        yang berwenang di wilayah domisili Kami.
      </p>
    </LegalPageLayout>
  );
}
