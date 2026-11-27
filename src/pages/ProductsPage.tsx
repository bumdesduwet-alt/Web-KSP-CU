import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileText, MessageCircle, ShieldCheck } from 'lucide-react';
import { ResilientImage } from '../components/ResilientImage';
import { useSiteData } from '../context/SiteDataContext';
import { formatWhatsappHref } from '../lib/firebase';
import { CooperativeProduct } from '../types';

export const ProductsPage: React.FC = () => {
  const { cooperativeProducts, siteSettings } = useSiteData();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilter =
    searchParams.get('kategori') === 'simpanan' ||
    searchParams.get('kategori') === 'pinjaman'
      ? (searchParams.get('kategori') as 'simpanan' | 'pinjaman')
      : 'semua';

  const [categoryFilter, setCategoryFilter] = useState<
    'semua' | 'simpanan' | 'pinjaman'
  >(initialFilter);
  const [selectedProduct, setSelectedProduct] =
    useState<CooperativeProduct | null>(null);

  useEffect(() => {
    const param = searchParams.get('kategori');
    if (param === 'simpanan' || param === 'pinjaman') {
      setCategoryFilter(param);
    }
  }, [searchParams]);

  const handleFilterChange = (val: 'semua' | 'simpanan' | 'pinjaman') => {
    setCategoryFilter(val);
    if (val === 'semua') {
      setSearchParams({});
    } else {
      setSearchParams({ kategori: val });
    }
  };

  const filteredProducts = cooperativeProducts.filter((item) =>
    categoryFilter === 'semua' ? true : item.category === categoryFilter
  );

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <section className="bg-navy-900 text-white py-8 lg:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold text-gold-400 mb-2">
            Layanan Resmi Simpan Pinjam
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-white mb-3">
            Produk Simpanan dan Pinjaman Koperasi
          </h1>
          <p className="text-base text-slate-200 max-w-3xl leading-relaxed">
            Seluruh ketentuan, persyaratan, dan kebijakan layanan dikelola sesuai keputusan resmi Rapat Anggota dan Pengurus {siteSettings.cooperativeName}. Untuk konsultasi angka maupun simulasi resmi, silakan hubungi pengurus melalui WhatsApp.
          </p>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="inline-flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
            {[
              { id: 'semua', label: 'Semua Produk' },
              { id: 'simpanan', label: 'A. Produk Simpanan' },
              { id: 'pinjaman', label: 'B. Produk Pinjaman' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() =>
                  handleFilterChange(tab.id as 'semua' | 'simpanan' | 'pinjaman')
                }
                className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  categoryFilter === tab.id
                    ? 'bg-white text-navy-900 shadow-sm'
                    : 'text-slate-600 hover:text-navy-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500">
            Menampilkan {filteredProducts.length} produk resmi koperasi
          </p>
        </div>
      </section>

      {/* Product Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {filteredProducts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
            <p className="text-slate-600">
              Belum ada produk yang dipublikasikan pada kategori ini.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProducts.map((product) => (
              <article
                key={product.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col"
              >
                <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
                  <ResilientImage
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <p className="text-xs font-medium text-gold-600 mb-1.5">
                    {product.category === 'simpanan'
                      ? 'Produk Simpanan'
                      : 'Produk Pinjaman'}{' '}
                    · {product.subType}
                  </p>
                  <h2 className="font-serif text-xl font-semibold text-navy-900 mb-2">
                    {product.name}
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4 flex-1">
                    {product.description}
                  </p>

                  <div className="space-y-2.5 pt-3.5 border-t border-slate-100 text-xs text-slate-600 mb-4">
                    <div>
                      <p className="font-semibold text-navy-900 mb-0.5">
                        Persyaratan:
                      </p>
                      <p className="line-clamp-2">{product.requirements}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-navy-900 mb-0.5">
                        Ketentuan Resmi:
                      </p>
                      <p className="line-clamp-2">{product.terms}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSelectedProduct(product)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 border border-slate-300 text-navy-900 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Detail Lengkap</span>
                    </button>
                    <a
                      href={formatWhatsappHref(
                        siteSettings.whatsappNumber,
                        `Halo Pengurus ${siteSettings.cooperativeName}, saya ingin berkonsultasi mengenai produk "${product.name}".`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-navy-900 text-white text-xs font-semibold rounded-lg hover:bg-navy-800 transition-colors whitespace-nowrap"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Konsultasi WA</span>
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selectedProduct.name}
          className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl">
            <div className="aspect-[16/9] bg-slate-100 overflow-hidden">
              <ResilientImage
                src={selectedProduct.imageUrl}
                alt={selectedProduct.name}
              />
            </div>
            <div className="p-6 sm:p-8 space-y-5">
              <div>
                <p className="text-xs font-semibold text-gold-600 mb-1">
                  {selectedProduct.category === 'simpanan'
                    ? 'Produk Simpanan'
                    : 'Produk Pinjaman'}{' '}
                  · {selectedProduct.subType}
                </p>
                <h2 className="font-serif text-2xl font-semibold text-navy-900">
                  {selectedProduct.name}
                </h2>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {selectedProduct.description}
              </p>

              <div className="space-y-4 pt-4 border-t border-slate-200 text-sm">
                <div>
                  <h3 className="font-semibold text-navy-900 mb-1">
                    Persyaratan Anggota
                  </h3>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                    {selectedProduct.requirements}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-navy-900 mb-1">
                    Ketentuan Kebijakan Koperasi
                  </h3>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                    {selectedProduct.terms}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-navy-900 mb-1">
                    Informasi Manfaat
                  </h3>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                    {selectedProduct.benefits}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3 text-xs text-slate-600">
                <ShieldCheck className="w-4 h-4 text-gold-600 shrink-0 mt-0.5" />
                <span>
                  Kebijakan jasa simpanan, jasa pinjaman, dan plafon berlaku sesuai ketetapan resmi pengurus dan dapat dikonsultasikan langsung melalui kantor pelayanan atau WhatsApp resmi.
                </span>
              </div>

              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-2.5 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Tutup
                </button>
                <a
                  href={formatWhatsappHref(
                    siteSettings.whatsappNumber,
                    `Halo Pengurus ${siteSettings.cooperativeName}, saya ingin berkonsultasi mengenai produk "${selectedProduct.name}".`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-900 text-white text-sm font-semibold rounded-lg hover:bg-navy-800 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Konsultasi melalui WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
