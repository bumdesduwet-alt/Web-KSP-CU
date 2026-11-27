import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle, ShieldCheck, ShoppingBag } from 'lucide-react';

const ORDER_STEPS = [
  {
    number: '01',
    title: 'Buka menu Produk Anggota',
    description:
      'Masuk ke halaman Produk-Produk Anggota untuk melihat ragam produk pangan, kerajinan, hasil pertanian, dan jasa milik anggota koperasi.',
  },
  {
    number: '02',
    title: 'Pilih produk yang diinginkan',
    description:
      'Gunakan kolom pencarian atau filter kategori untuk menemukan produk yang sesuai, lalu tinjau foto, harga satuan, serta lokasi penjual.',
  },
  {
    number: '03',
    title: 'Klik tombol Pesan Sekarang',
    description:
      'Tentukan jumlah pesanan pada jendela detail produk, kemudian klik tombol Pesan Sekarang via WhatsApp.',
  },
  {
    number: '04',
    title: 'Hubungi penjual melalui WhatsApp',
    description:
      'Sistem akan menyiapkan pesan otomatis berisi nama produk dan jumlah pesanan agar Anda langsung terhubung dengan nomor WhatsApp anggota penjual.',
  },
  {
    number: '05',
    title: 'Konfirmasi harga, ketersediaan, dan pengiriman',
    description:
      'Pastikan ketersediaan stok terkini, total harga, serta kesepakatan pengambilan di lokasi atau pengiriman bersama penjual.',
  },
  {
    number: '06',
    title: 'Selesaikan transaksi langsung dengan penjual',
    description:
      'Lakukan pembayaran dan serah terima barang secara langsung dengan penjual sesuai kesepakatan kedua belah pihak.',
  },
];

export const HowToOrderPage: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <section className="bg-navy-900 text-white py-8 lg:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold text-gold-400 mb-2">
            Panduan Transaksi Marketplace Anggota
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-white mb-3">
            Cara Memesan Produk Anggota
          </h1>
          <p className="text-base text-slate-200 max-w-2xl leading-relaxed">
            Portal Produk Anggota menghubungkan Anda langsung dengan pelaku UMKM anggota KSP CU Argomanunggal Santosa tanpa biaya perantara.
          </p>
        </div>
      </section>

      {/* 6 Steps Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ORDER_STEPS.map((step) => (
            <div
              key={step.number}
              className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 flex flex-col justify-between"
            >
              <div>
                <p className="font-mono text-2xl font-semibold text-gold-600 mb-2.5 tabular-nums">
                  {step.number}
                </p>
                <h2 className="font-serif text-xl font-semibold text-navy-900 mb-2">
                  {step.title}
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Safety & Direct CTA */}
        <div className="mt-7 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4 max-w-2xl">
            <ShieldCheck className="w-6 h-6 text-gold-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-semibold text-navy-900 mb-1">
                Transparansi Transaksi Langsung dengan Anggota
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Koperasi memfasilitasi etalase promosi digital bagi produk UMKM anggota. Pembayaran dan pengiriman disepakati langsung antara pembeli dan anggota penjual melalui WhatsApp resmi yang tertera di setiap produk.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              to="/produk-anggota"
              className="inline-flex items-center gap-2 px-5 py-3 bg-navy-900 text-white text-sm font-semibold rounded-lg hover:bg-navy-800 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Buka Produk Anggota</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/hubungi-kami"
              className="inline-flex items-center gap-2 px-5 py-3 border border-slate-300 text-navy-900 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Bantuan Pengurus</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
