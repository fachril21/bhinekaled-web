import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/storefront/LegalPageLayout";

export const metadata: Metadata = {
  title: "Kebijakan Privasi — Bhinekaled",
  description:
    "Kebijakan Privasi Bhinekaled: data pribadi yang dikumpulkan, cara penggunaannya, serta hak Anda atas data tersebut.",
  alternates: { canonical: "/kebijakan-privasi" },
};

const LAST_UPDATED = "3 September 2026";

export default function KebijakanPrivasiPage() {
  return (
    <LegalPageLayout
      title="Kebijakan Privasi"
      lastUpdated={LAST_UPDATED}
      intro="Kebijakan Privasi ini menjelaskan bagaimana {{business}} mengumpulkan, menggunakan, menyimpan, dan melindungi data pribadi Anda ketika Anda menggunakan situs ini dan melakukan pemesanan. Kami berkomitmen memproses data Anda secara wajar, transparan, dan sesuai peraturan perlindungan data pribadi yang berlaku di Indonesia."
    >
      <h2>1. Data Pribadi yang Kami Kumpulkan</h2>
      <ul>
        <li>
          <strong>Data identitas dan kontak:</strong> nama, nomor telepon/WhatsApp, dan alamat email
          yang Anda isikan saat memesan.
        </li>
        <li>
          <strong>Data pengiriman:</strong> alamat lengkap tujuan pengiriman dan catatan pesanan.
        </li>
        <li>
          <strong>Data transaksi:</strong> rincian produk yang dipesan, jumlah, nilai pesanan, dan
          bukti pembayaran yang Anda kirimkan.
        </li>
        <li>
          <strong>Data teknis:</strong> pengenal sesi tamu yang disimpan di cookie peramban untuk
          menjaga isi keranjang dan daftar favorit, serta data log standar seperti alamat IP dan jenis
          peramban.
        </li>
      </ul>
      <p>
        Kami tidak secara sengaja mengumpulkan data pribadi yang bersifat spesifik/sensitif dan tidak
        meminta data anak di bawah umur.
      </p>

      <h2>2. Cara dan Tujuan Penggunaan Data</h2>
      <ul>
        <li>Memproses, mengonfirmasi, dan mengirimkan pesanan Anda.</li>
        <li>Menghubungi Anda terkait status pesanan, pembayaran, atau kendala pengiriman.</li>
        <li>Melayani permintaan pengembalian, penukaran, atau pertanyaan layanan pelanggan.</li>
        <li>Menjaga keamanan situs serta mencegah penyalahgunaan dan penipuan.</li>
        <li>Memenuhi kewajiban hukum, perpajakan, dan pembukuan.</li>
      </ul>

      <h2>3. Dasar Pemrosesan</h2>
      <p>
        Kami memproses data Anda berdasarkan: pelaksanaan pemesanan yang Anda minta, pemenuhan
        kewajiban hukum Kami, dan kepentingan sah Kami untuk menjalankan serta mengamankan usaha,
        sepanjang tidak bertentangan dengan hak Anda.
      </p>

      <h2>4. Pembagian Data kepada Pihak Ketiga</h2>
      <p>Kami tidak menjual data pribadi Anda. Data dapat dibagikan secara terbatas kepada:</p>
      <ul>
        <li>
          <strong>Jasa pengiriman/kurir</strong> — nama, alamat, dan nomor telepon penerima, untuk
          keperluan pengantaran.
        </li>
        <li>
          <strong>Penyedia layanan pembayaran</strong> (bila digunakan) — data yang diperlukan untuk
          memproses dan memverifikasi pembayaran.
        </li>
        <li>
          <strong>Penyedia infrastruktur teknologi</strong> — layanan hosting dan basis data tempat
          data pesanan disimpan.
        </li>
        <li>
          <strong>Aparat/otoritas yang berwenang</strong> — apabila diwajibkan oleh hukum atau proses
          hukum yang sah.
        </li>
      </ul>

      <h2>5. Cookie dan Teknologi Serupa</h2>
      <p>
        Situs menggunakan cookie yang diperlukan agar fungsi dasar seperti keranjang belanja dan daftar
        favorit dapat bekerja. Anda dapat menghapus atau memblokir cookie melalui pengaturan peramban,
        namun sebagian fitur situs mungkin tidak berfungsi sebagaimana mestinya.
      </p>

      <h2>6. Penyimpanan dan Retensi Data</h2>
      <p>
        Data pesanan disimpan selama diperlukan untuk keperluan layanan, penyelesaian sengketa, serta
        pemenuhan kewajiban hukum dan pembukuan. Setelah tidak lagi diperlukan, data akan dihapus atau
        dianonimkan. Pengenal sesi tamu di peramban Anda memiliki masa berlaku terbatas dan dapat Anda
        hapus kapan saja.
      </p>

      <h2>7. Keamanan Data</h2>
      <p>
        Kami menerapkan langkah pengamanan yang wajar secara teknis dan organisasi, antara lain
        pembatasan akses ke data pesanan hanya untuk pihak yang berkepentingan dan penggunaan koneksi
        terenkripsi (HTTPS). Meskipun demikian, tidak ada metode penyimpanan atau transmisi data yang
        sepenuhnya bebas risiko.
      </p>

      <h2>8. Hak Anda atas Data Pribadi</h2>
      <ul>
        <li>Meminta informasi mengenai data pribadi Anda yang Kami proses.</li>
        <li>Meminta perbaikan data yang tidak akurat atau tidak lengkap.</li>
        <li>Meminta penghapusan data sepanjang tidak bertentangan dengan kewajiban hukum Kami.</li>
        <li>Menarik persetujuan atau mengajukan keberatan atas pemrosesan tertentu.</li>
      </ul>
      <p>
        Permintaan dapat diajukan melalui kontak di bawah. Kami dapat meminta verifikasi identitas
        sebelum menindaklanjuti permintaan Anda.
      </p>

      <h2>9. Data Anak</h2>
      <p>
        Situs ini ditujukan untuk pengguna dewasa. Kami tidak dengan sengaja mengumpulkan data anak di
        bawah umur. Bila Anda menyadari adanya data anak yang terkirim kepada Kami, mohon segera
        hubungi Kami untuk penghapusan.
      </p>

      <h2>10. Perubahan Kebijakan Privasi</h2>
      <p>
        Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Versi terbaru beserta tanggal
        pembaruannya akan ditampilkan pada halaman ini. Perubahan berlaku sejak dipublikasikan.
      </p>
    </LegalPageLayout>
  );
}
