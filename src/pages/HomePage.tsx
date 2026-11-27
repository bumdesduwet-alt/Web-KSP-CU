import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  Camera,
  CheckCircle2,
  MapPin,
  MessageCircle,
  Newspaper,
  ShoppingBag,
} from 'lucide-react';
import { ResilientImage } from '../components/ResilientImage';
import { ASSET_IMAGES } from '../data/initialCooperativeData';
import { useSiteData } from '../context/SiteDataContext';
import { formatWhatsappHref } from '../lib/firebase';

export const HomePage: React.FC = () => {
  const {
    siteSettings,
    cooperativeProfile,
    cooperativeProducts,
    memberProducts,
    newsArticles,
    galleryItems,
    testimonials,
  } = useSiteData();

  const savingsPreview = cooperativeProducts
    .filter((p) => p.category === 'simpanan')
    .slice(0, 3);
  const loanPreview = cooperativeProducts
    .filter((p) => p.category === 'pinjaman')
    .slice(0, 3);
  const featuredMemberProducts = memberProducts
    .filter((p) => p.isFeatured)
    .slice(0, 3);
  const displayMemberProducts =
    featuredMemberProducts.length > 0
      ? featuredMemberProducts
      : memberProducts.slice(0, 3);

  const importantNotices = newsArticles
    .filter((a) => a.isImportant || a.category === 'Pengumuman')
    .slice(0, 2);
  const latestNews = newsArticles.slice(0, 3);
  const latestGallery = galleryItems.slice(0, 4);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-navy-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center">
              <p className="text-xs sm:text-sm font-medium text-gold-400 tracking-wide mb-2.5">
                Prambanan · Sleman · Daerah Istimewa Yogyakarta
              </p>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold leading-[1.15] tracking-tight text-white mb-4">
                {siteSettings.welcomeTitle}
              </h1>
              <p className="text-base text-slate-200 leading-relaxed mb-6 max-w-xl">
                {siteSettings.welcomeMessage}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/cara-bergabung"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-gold-500 text-navy-950 text-sm font-semibold rounded-lg hover:bg-gold-400 transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Gabung Menjadi Anggota</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/produk"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-navy-800 border border-navy-700 text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Jelajahi Produk</span>
                </Link>
                <Link
                  to="/hubungi-kami"
                  className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-200 hover:text-gold-400 transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Hubungi Kami</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative h-64 sm:h-80 lg:h-full min-h-[320px] rounded-2xl overflow-hidden border border-navy-700">
                <ResilientImage
                  src={siteSettings.heroImageUrl || ASSET_IMAGES.heroOffice}
                  alt={`Kantor ${siteSettings.cooperativeName} di Gayamharjo, Prambanan`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/75 via-navy-950/15 to-transparent flex items-end p-6">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-100">
                    <MapPin className="w-4 h-4 text-gold-400 shrink-0" />
                    <span>{siteSettings.address}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4-Column Cooperative Stats Strip */}
          {siteSettings.stats && siteSettings.stats.length > 0 && (
            <div className="mt-8 pt-6 border-t border-navy-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {siteSettings.stats.map((stat, idx) => (
                <div key={idx} className="space-y-1">
                  <p className="text-xs font-medium text-slate-300">
                    {stat.label}
                  </p>
                  <p className="font-mono text-2xl sm:text-3xl font-semibold text-gold-400 tabular-nums">
                    {stat.value}
                  </p>
                  <p className="text-xs text-slate-300">
                    {stat.unit} · {stat.period}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Ringkasan Profil Koperasi */}
      <section className="py-10 lg:py-12 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            <div className="lg:col-span-5">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200">
                <ResilientImage
                  src={ASSET_IMAGES.communityMeeting}
                  alt="Pertemuan dan pemberdayaan anggota KSP CU Argomanunggal Santosa"
                />
              </div>
            </div>
            <div className="lg:col-span-7 space-y-3.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-gold-600">
                <Building2 className="w-4 h-4" />
                <span>Profil Lembaga</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-navy-900">
                Tumbuh Bersama Prinsip Pendidikan, Swadaya, dan Solidaritas
              </h2>
              <p className="text-slate-600 leading-relaxed">
                {cooperativeProfile.vision}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {cooperativeProfile.values.slice(0, 4).map((val, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200"
                  >
                    <h3 className="text-sm font-semibold text-navy-900 mb-1">
                      0{idx + 1}. {val.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {val.description}
                    </p>
                  </div>
                ))}
              </div>
              <div className="pt-2">
                <Link
                  to="/profil"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-navy-900 hover:text-gold-600 transition-colors"
                >
                  <span>Baca Profil & Susunan Pengurus Lengkap</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Layanan Simpanan & Pinjaman */}
      <section className="py-10 lg:py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <p className="text-xs font-semibold text-gold-600 mb-1.5">
                Layanan Keuangan Anggota
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-navy-900">
                Produk Simpanan dan Pinjaman Koperasi
              </h2>
            </div>
            <Link
              to="/produk"
              className="inline-flex items-center gap-2 text-sm font-semibold text-navy-900 hover:text-gold-600 transition-colors whitespace-nowrap shrink-0"
            >
              <span>Lihat Semua Produk</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6">
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-200">
                <div>
                  <span className="text-xs font-semibold text-gold-600">
                    Kategori A
                  </span>
                  <h3 className="font-serif text-xl font-semibold text-navy-900">
                    Produk Simpanan
                  </h3>
                </div>
                <Link
                  to="/produk?kategori=simpanan"
                  className="text-xs font-semibold text-navy-800 hover:text-gold-600"
                >
                  Selengkapnya
                </Link>
              </div>
              <div className="space-y-3.5">
                {savingsPreview.map((item) => (
                  <div
                    key={item.id}
                    className="pb-3.5 border-b border-slate-100 last:border-b-0 last:pb-0"
                  >
                    <p className="text-xs font-medium text-slate-500 mb-1">
                      {item.subType}
                    </p>
                    <h4 className="text-base font-semibold text-navy-900 mb-1">
                      {item.name}
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6">
              <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-200">
                <div>
                  <span className="text-xs font-semibold text-gold-600">
                    Kategori B
                  </span>
                  <h3 className="font-serif text-xl font-semibold text-navy-900">
                    Produk Pinjaman
                  </h3>
                </div>
                <Link
                  to="/produk?kategori=pinjaman"
                  className="text-xs font-semibold text-navy-800 hover:text-gold-600"
                >
                  Selengkapnya
                </Link>
              </div>
              <div className="space-y-3.5">
                {loanPreview.map((item) => (
                  <div
                    key={item.id}
                    className="pb-3.5 border-b border-slate-100 last:border-b-0 last:pb-0"
                  >
                    <p className="text-xs font-medium text-slate-500 mb-1">
                      {item.subType}
                    </p>
                    <h4 className="text-base font-semibold text-navy-900 mb-1.5">
                      {item.name}
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Produk Unggulan Anggota */}
      <section className="py-10 lg:py-12 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-gold-600 mb-1.5">
                <ShoppingBag className="w-4 h-4" />
                <span>Pemberdayaan UMKM Anggota</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-navy-900">
                Produk Unggulan Karya Anggota
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/cara-memesan"
                className="text-sm font-medium text-slate-600 hover:text-navy-900 whitespace-nowrap shrink-0"
              >
                Cara Memesan
              </Link>
              <Link
                to="/produk-anggota"
                className="inline-flex items-center gap-2 text-sm font-semibold text-navy-900 hover:text-gold-600 whitespace-nowrap shrink-0"
              >
                <span>Buka Marketplace Anggota</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {displayMemberProducts.map((product) => (
              <article
                key={product.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col hover:border-navy-700 transition-colors"
              >
                <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
                  <ResilientImage
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                    <span>{product.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{product.location}</span>
                  </div>
                  <h3 className="text-base font-semibold text-navy-900 mb-1.5">
                    {product.name}
                  </h3>
                  <p className="text-xs text-slate-600 mb-3">
                    Oleh {product.ownerName}
                    {product.businessName ? ` · ${product.businessName}` : ''}
                  </p>
                  <p className="text-sm text-slate-600 line-clamp-2 mb-5 flex-1">
                    {product.description}
                  </p>
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-mono text-base font-semibold text-navy-900 tabular-nums">
                        Rp {product.price.toLocaleString('id-ID')}
                      </p>
                      <p className="text-xs text-slate-500">/ {product.unit}</p>
                    </div>
                    <a
                      href={formatWhatsappHref(
                        product.whatsappNumber,
                        `Halo ${product.ownerName}, saya tertarik memesan produk "${product.name}" (1 ${product.unit}) dari Portal Produk Anggota KSP CU Argomanunggal Santosa.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-navy-900 text-white text-xs font-semibold rounded-lg hover:bg-navy-800 transition-colors whitespace-nowrap shrink-0"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Pesan</span>
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Berita Terbaru & Pengumuman Penting */}
      <section className="py-10 lg:py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-gold-600 mb-1.5">
                <Newspaper className="w-4 h-4" />
                <span>Portal Informasi Koperasi</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-navy-900">
                Berita Terbaru & Pengumuman Penting
              </h2>
            </div>
            <Link
              to="/berita"
              className="inline-flex items-center gap-2 text-sm font-semibold text-navy-900 hover:text-gold-600 whitespace-nowrap shrink-0"
            >
              <span>Semua Berita & Informasi</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Berita Terbaru */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {latestNews.slice(0, 2).map((article) => (
                <Link
                  key={article.id}
                  to={`/berita/${article.slug}`}
                  className="group bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col hover:border-navy-700 transition-colors"
                >
                  <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
                    <ResilientImage
                      src={article.coverImageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
                    />
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                      <span>{article.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{article.author}</span>
                    </div>
                    <h3 className="font-serif text-lg font-semibold text-navy-900 group-hover:text-navy-700 mb-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                      {article.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pengumuman Penting */}
            <div className="lg:col-span-4 bg-navy-900 text-white rounded-2xl p-6 sm:p-7 flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold text-gold-400 mb-2">
                  Pengumuman Resmi Pengurus
                </p>
                <h3 className="font-serif text-xl font-semibold text-white mb-5">
                  Informasi Penting Anggota
                </h3>
                <div className="space-y-5">
                  {importantNotices.map((notice) => (
                    <Link
                      key={notice.id}
                      to={`/berita/${notice.slug}`}
                      className="block pb-5 border-b border-navy-800 last:border-b-0 last:pb-0 group"
                    >
                      <p className="text-xs text-gold-400 mb-1">
                        {notice.category}
                      </p>
                      <h4 className="text-sm font-semibold text-white group-hover:text-gold-300 transition-colors mb-1.5">
                        {notice.title}
                      </h4>
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                        {notice.excerpt}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
              <div className="pt-6 mt-6 border-t border-navy-800">
                <Link
                  to="/berita"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-gold-400 hover:text-gold-300"
                >
                  <span>Baca Semua Pengumuman</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Galeri Kegiatan Terbaru */}
      <section className="py-10 lg:py-12 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-gold-600 mb-1.5">
                <Camera className="w-4 h-4" />
                <span>Dokumentasi Kegiatan</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-navy-900">
                Galeri Foto dan Video Terbaru
              </h2>
            </div>
            <Link
              to="/galeri"
              className="inline-flex items-center gap-2 text-sm font-semibold text-navy-900 hover:text-gold-600 whitespace-nowrap shrink-0"
            >
              <span>Buka Galeri Lengkap</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {latestGallery.map((item) => (
              <Link
                key={item.id}
                to="/galeri"
                className="group bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden hover:border-navy-700 transition-colors"
              >
                <div className="aspect-[4/3] overflow-hidden bg-slate-200">
                  <ResilientImage
                    src={item.thumbnailUrl || item.mediaUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-200"
                  />
                </div>
                <div className="p-4">
                  <p className="text-xs text-slate-500 mb-1">
                    {item.category} ·{' '}
                    <span className="font-mono tabular-nums">
                      {item.activityDate}
                    </span>
                  </p>
                  <h3 className="text-sm font-semibold text-navy-900 line-clamp-2">
                    {item.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimoni Anggota & Ajakan Bergabung */}
      <section className="py-10 lg:py-12 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-6">
            <p className="text-xs font-semibold text-gold-600 mb-1.5">
              Suara Anggota Koperasi
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-navy-900">
              Dampak Nyata bagi Keluarga dan Usaha Lokal
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {testimonials.slice(0, 3).map((t) => (
              <blockquote
                key={t.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between"
              >
                <p className="text-sm text-slate-700 leading-relaxed mb-4">
                  "{t.quote}"
                </p>
                <footer className="pt-3.5 border-t border-slate-100">
                  <p className="text-sm font-semibold text-navy-900">
                    {t.memberName}
                  </p>
                  <p className="text-xs text-slate-500">{t.memberRole}</p>
                </footer>
              </blockquote>
            ))}
          </div>

          {/* CTA Akhir */}
          <div className="bg-navy-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-white mb-2">
                Siap Bertumbuh Bersama KSP CU Argomanunggal Santosa?
              </h2>
              <p className="text-sm sm:text-base text-slate-200">
                Pelajari syarat keanggotaan, ikuti orientasi dasar, atau konsultasikan kebutuhan layanan koperasi secara langsung bersama pengurus kami.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link
                to="/cara-bergabung"
                className="inline-flex items-center gap-2 px-5 py-3 bg-gold-500 text-navy-950 text-sm font-semibold rounded-lg hover:bg-gold-400 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Cara Bergabung</span>
              </Link>
              <a
                href={formatWhatsappHref(
                  siteSettings.whatsappNumber,
                  'Halo Pengurus KSP CU Argomanunggal Santosa, saya ingin mendapatkan informasi pendaftaran anggota baru.'
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 bg-navy-800 border border-navy-700 text-white text-sm font-semibold rounded-lg hover:bg-navy-700 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Pengurus</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
