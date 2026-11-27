import React, { useMemo, useState } from 'react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import {
  CheckCircle2,
  MapPin,
  MessageCircle,
  Minus,
  Plus,
  Search,
  Store,
  X,
} from 'lucide-react';
import { MediaInputField } from '../components/MediaInputField';
import { ResilientImage } from '../components/ResilientImage';
import { useSiteData } from '../context/SiteDataContext';
import { ASSET_IMAGES } from '../data/initialCooperativeData';
import {
  db,
  FIELD_LIMITS,
  formatWhatsappHref,
  handleFirestoreError,
  OperationType,
  sanitizePlainText,
} from '../lib/firebase';
import { MemberProduct } from '../types';

export const MemberProductsPage: React.FC = () => {
  const { memberProducts, memberCategories } = useSiteData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [sortMode, setSortMode] = useState<'unggulan' | 'terbaru'>('unggulan');
  const [selectedProduct, setSelectedProduct] = useState<MemberProduct | null>(
    null
  );
  const [orderQty, setOrderQty] = useState(1);

  // Registration form state
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState('');
  const [formState, setFormState] = useState({
    ownerName: '',
    businessName: '',
    productName: '',
    category: memberCategories[0]?.name || 'Kuliner & Olahan Pangan',
    price: '',
    unit: 'kemasan',
    description: '',
    location: '',
    whatsappNumber: '',
    imageUrl: '',
  });

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return memberProducts
      .filter((p) => {
        const matchCategory =
          selectedCategory === 'Semua' || p.category === selectedCategory;
        const matchSearch =
          !q ||
          p.name.toLowerCase().includes(q) ||
          p.ownerName.toLowerCase().includes(q) ||
          p.businessName.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q);
        return matchCategory && matchSearch;
      })
      .sort((a, b) => {
        if (sortMode === 'unggulan') {
          if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
        }
        const ta = a.createdAt?.toMillis?.() ?? 0;
        const tb = b.createdAt?.toMillis?.() ?? 0;
        return tb - ta;
      });
  }, [memberProducts, searchQuery, selectedCategory, sortMode]);

  const openOrderModal = (product: MemberProduct) => {
    setSelectedProduct(product);
    setOrderQty(1);
  };

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return;

    setSubmitError(null);
    const ownerName = sanitizePlainText(formState.ownerName);
    const businessName = sanitizePlainText(formState.businessName);
    const productName = sanitizePlainText(formState.productName);
    const category = sanitizePlainText(formState.category);
    const unit = sanitizePlainText(formState.unit);
    const description = sanitizePlainText(formState.description);
    const location = sanitizePlainText(formState.location);
    const whatsappNumber = formState.whatsappNumber.trim();
    const parsedPrice = Number(formState.price);

    if (ownerName.length < 2 || ownerName.length > FIELD_LIMITS.NAME_MAX) {
      setSubmitError('Nama pemilik usaha minimal 2 karakter.');
      return;
    }
    if (
      productName.length < 2 ||
      productName.length > FIELD_LIMITS.PRODUCT_NAME_MAX
    ) {
      setSubmitError('Nama produk minimal 2 karakter.');
      return;
    }
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      setSubmitError('Masukkan harga produk yang valid (angka >= 0).');
      return;
    }
    if (description.length < 10) {
      setSubmitError('Deskripsi produk minimal 10 karakter.');
      return;
    }
    if (
      !FIELD_LIMITS.PHONE_REGEX.test(whatsappNumber) ||
      whatsappNumber.length < FIELD_LIMITS.PHONE_MIN
    ) {
      setSubmitError('Nomor WhatsApp tidak valid (minimal 8 digit angka).');
      return;
    }

    const fallbackImg = category.toLowerCase().includes('kerajinan')
      ? ASSET_IMAGES.batikCraft
      : ASSET_IMAGES.javaneseCoffee;
    const rawImage = formState.imageUrl.trim();
    if (rawImage.length > FIELD_LIMITS.IMAGE_DATA_MAX) {
      setSubmitError('Ukuran foto terlalu besar. Gunakan tombol upload kompres.');
      return;
    }
    const cleanImageUrl = rawImage || fallbackImg;

    setSubmitting(true);
    try {
      const submissionId = `sub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      await setDoc(doc(db, 'memberProductSubmissions', submissionId), {
        ownerName,
        businessName,
        productName,
        category,
        price: parsedPrice,
        unit: unit || 'pcs',
        description,
        location,
        whatsappNumber,
        imageUrl: cleanImageUrl,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      setSubmitSuccess(true);
      setFormState({
        ownerName: '',
        businessName: '',
        productName: '',
        category: memberCategories[0]?.name || 'Kuliner & Olahan Pangan',
        price: '',
        unit: 'kemasan',
        description: '',
        location: '',
        whatsappNumber: '',
        imageUrl: '',
      });
    } catch (err) {
      try {
        handleFirestoreError(
          err,
          OperationType.CREATE,
          'memberProductSubmissions'
        );
      } catch {
        setSubmitError(
          'Gagal mengirim pendaftaran produk. Mohon periksa isian dan coba kembali.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <section className="bg-navy-900 text-white py-8 lg:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold text-gold-400 mb-2">
              Marketplace Ekonomi Anggota
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-white mb-3">
              Produk-Produk UMKM Anggota Koperasi
            </h1>
            <p className="text-base text-slate-200 max-w-2xl leading-relaxed">
              Dukung usaha produktif sesama anggota dengan memesan langsung karya kerajinan, pangan olahan, hasil tani, dan jasa lokal melalui WhatsApp penjual.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowRegisterForm((prev) => !prev);
              setSubmitSuccess(false);
            }}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gold-500 text-navy-950 text-sm font-semibold rounded-lg hover:bg-gold-400 transition-colors whitespace-nowrap shrink-0"
          >
            <Store className="w-4 h-4" />
            <span>
              {showRegisterForm
                ? 'Tutup Form Pendaftaran'
                : 'Daftarkan Produk Anggota'}
            </span>
          </button>
        </div>
      </section>

      {/* Member Product Registration Form */}
      {showRegisterForm && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4 pb-5 mb-6 border-b border-slate-200">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-navy-900 mb-1">
                  Formulir Pendaftaran Produk Usaha Anggota
                </h2>
                <p className="text-sm text-slate-600">
                  Isi data produk Anda untuk diverifikasi oleh pengurus sebelum ditayangkan di etalase resmi koperasi.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRegisterForm(false)}
                aria-label="Tutup formulir"
                className="p-2 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center space-y-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-700 mx-auto" />
                <h3 className="text-lg font-semibold text-emerald-950">
                  Pendaftaran Produk Berhasil Dikirim
                </h3>
                <p className="text-sm text-emerald-800 max-w-md mx-auto">
                  Terima kasih! Data produk Anda telah tersimpan dan akan segera ditinjau oleh pengurus koperasi untuk dipublikasikan.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitSuccess(false)}
                  className="px-4 py-2 bg-emerald-800 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700"
                >
                  Daftarkan Produk Lainnya
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitRegistration} className="space-y-5">
                {/* Anti-spam honeypot */}
                <input
                  type="text"
                  name="company_website"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                  aria-hidden="true"
                />

                {submitError && (
                  <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800">
                    {submitError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Nama Anggota / Pemilik Usaha *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={120}
                      value={formState.ownerName}
                      onChange={(e) =>
                        setFormState({ ...formState, ownerName: e.target.value })
                      }
                      placeholder="Contoh: Ibu Sri Wahyuni"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Nama Usaha / UMKM
                    </label>
                    <input
                      type="text"
                      maxLength={140}
                      value={formState.businessName}
                      onChange={(e) =>
                        setFormState({
                          ...formState,
                          businessName: e.target.value,
                        })
                      }
                      placeholder="Contoh: Sanggar Batik Sekar Arum"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Nama Produk *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={140}
                      value={formState.productName}
                      onChange={(e) =>
                        setFormState({
                          ...formState,
                          productName: e.target.value,
                        })
                      }
                      placeholder="Contoh: Batik Tulis Motif Prambanan"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Kategori Produk *
                    </label>
                    <select
                      value={formState.category}
                      onChange={(e) =>
                        setFormState({ ...formState, category: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-navy-700"
                    >
                      {memberCategories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Harga (Rp) *
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formState.price}
                      onChange={(e) =>
                        setFormState({ ...formState, price: e.target.value })
                      }
                      placeholder="45000"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-navy-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Satuan *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={40}
                      value={formState.unit}
                      onChange={(e) =>
                        setFormState({ ...formState, unit: e.target.value })
                      }
                      placeholder="kemasan / pcs / kg"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Nomor WhatsApp Penjual *
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={25}
                      value={formState.whatsappNumber}
                      onChange={(e) =>
                        setFormState({
                          ...formState,
                          whatsappNumber: e.target.value,
                        })
                      }
                      placeholder="0812xxxxxxxx"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-navy-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Lokasi Penjual *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={160}
                      value={formState.location}
                      onChange={(e) =>
                        setFormState({ ...formState, location: e.target.value })
                      }
                      placeholder="Contoh: Gayamharjo, Prambanan, Sleman"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
                    />
                  </div>
                  <div>
                    <MediaInputField
                      label="Foto Produk (Opsional)"
                      mode="image"
                      value={formState.imageUrl}
                      onChange={(nextUrl) =>
                        setFormState({ ...formState, imageUrl: nextUrl })
                      }
                      showPresets={false}
                      placeholder="https://... (atau ambil foto / upload file di bawah)"
                      helperText="Kosongkan untuk foto standar, atau gunakan tombol Ambil Foto / Upload File (otomatis dikompres)."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Deskripsi Produk *
                  </label>
                  <textarea
                    required
                    rows={3}
                    maxLength={2000}
                    value={formState.description}
                    onChange={(e) =>
                      setFormState({ ...formState, description: e.target.value })
                    }
                    placeholder="Jelaskan keunggulan, ukuran, bahan, dan cara penyajian/pengiriman produk Anda..."
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowRegisterForm(false)}
                    className="px-4 py-2.5 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-100"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 bg-navy-900 text-white text-sm font-semibold rounded-lg hover:bg-navy-800 disabled:opacity-60"
                  >
                    {submitting ? 'Mengirim...' : 'Kirim Pendaftaran Produk'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      )}

      {/* Search & Filters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3.5">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama produk, pemilik usaha, atau lokasi..."
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
              />
            </div>

            <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start md:self-auto">
              <button
                type="button"
                onClick={() => setSortMode('unggulan')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  sortMode === 'unggulan'
                    ? 'bg-white text-navy-900 shadow-sm'
                    : 'text-slate-600 hover:text-navy-900'
                }`}
              >
                Produk Unggulan
              </button>
              <button
                type="button"
                onClick={() => setSortMode('terbaru')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  sortMode === 'terbaru'
                    ? 'bg-white text-navy-900 shadow-sm'
                    : 'text-slate-600 hover:text-navy-900'
                }`}
              >
                Terbaru
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategory('Semua')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap ${
                selectedCategory === 'Semua'
                  ? 'bg-navy-900 text-white border-navy-900'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              Semua Kategori
            </button>
            {memberCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap ${
                  selectedCategory === cat.name
                    ? 'bg-navy-900 text-white border-navy-900'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {filteredProducts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
            <p className="text-slate-600 mb-3">
              Tidak ada produk anggota yang sesuai dengan pencarian Anda.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Semua');
              }}
              className="px-4 py-2 bg-navy-900 text-white text-xs font-semibold rounded-lg"
            >
              Tampilkan Semua Produk
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProducts.map((product) => (
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
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5">
                    <span className="font-medium text-gold-600">
                      {product.category}
                    </span>
                    {product.isFeatured && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-semibold text-navy-800">
                          Unggulan
                        </span>
                      </>
                    )}
                  </div>
                  <h2 className="text-lg font-semibold text-navy-900 mb-1">
                    {product.name}
                  </h2>
                  <p className="text-xs text-slate-600 mb-1">
                    Penjual: {product.ownerName}
                    {product.businessName ? ` (${product.businessName})` : ''}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-slate-500 mb-3">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>{product.location}</span>
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
                    <button
                      type="button"
                      onClick={() => openOrderModal(product)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-navy-900 text-white text-xs font-semibold rounded-lg hover:bg-navy-800 transition-colors whitespace-nowrap shrink-0"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Pesan Sekarang</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Product Order & Quantity Modal */}
      {selectedProduct && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Pesan ${selectedProduct.name}`}
          className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl">
            <div className="aspect-[16/10] bg-slate-100 overflow-hidden">
              <ResilientImage
                src={selectedProduct.imageUrl}
                alt={selectedProduct.name}
              />
            </div>
            <div className="p-6 sm:p-8 space-y-5">
              <div>
                <p className="text-xs font-semibold text-gold-600 mb-1">
                  {selectedProduct.category} · {selectedProduct.location}
                </p>
                <h2 className="font-serif text-2xl font-semibold text-navy-900">
                  {selectedProduct.name}
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  Penjual: {selectedProduct.ownerName}
                  {selectedProduct.businessName
                    ? ` · ${selectedProduct.businessName}`
                    : ''}
                </p>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {selectedProduct.description}
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-500">Harga Satuan</p>
                  <p className="font-mono text-lg font-semibold text-navy-900 tabular-nums">
                    Rp {selectedProduct.price.toLocaleString('id-ID')}{' '}
                    <span className="text-xs font-sans font-normal text-slate-500">
                      / {selectedProduct.unit}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-700">
                    Jumlah:
                  </span>
                  <div className="inline-flex items-center border border-slate-300 bg-white rounded-lg">
                    <button
                      type="button"
                      onClick={() => setOrderQty((q) => Math.max(1, q - 1))}
                      aria-label="Kurangi jumlah"
                      className="p-2 text-slate-700 hover:bg-slate-100"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 font-mono text-sm font-semibold tabular-nums">
                      {orderQty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setOrderQty((q) => q + 1)}
                      aria-label="Tambah jumlah"
                      className="p-2 text-slate-700 hover:bg-slate-100"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm pt-1">
                <span className="text-slate-600">Estimasi Total:</span>
                <span className="font-mono text-lg font-bold text-navy-900 tabular-nums">
                  Rp {(selectedProduct.price * orderQty).toLocaleString('id-ID')}
                </span>
              </div>

              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-2.5 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-100"
                >
                  Tutup
                </button>
                <a
                  href={formatWhatsappHref(
                    selectedProduct.whatsappNumber,
                    `Halo ${selectedProduct.ownerName}, saya ingin memesan produk dari Portal KSP CU Argomanunggal Santosa:\n\n• Nama Produk: ${selectedProduct.name}\n• Jumlah Pesanan: ${orderQty} ${selectedProduct.unit}\n• Estimasi Harga: Rp ${(selectedProduct.price * orderQty).toLocaleString('id-ID')}\n\nMohon informasi ketersediaan dan pengiriman. Terima kasih.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-900 text-white text-sm font-semibold rounded-lg hover:bg-navy-800"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Pesan Sekarang via WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
