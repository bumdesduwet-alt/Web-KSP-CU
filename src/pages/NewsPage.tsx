import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import { ResilientImage } from '../components/ResilientImage';
import { useSiteData } from '../context/SiteDataContext';
import { NewsCategory } from '../types';

const NEWS_CATEGORIES: Array<'Semua' | NewsCategory> = [
  'Semua',
  'Berita Koperasi',
  'Pengumuman',
  'Kegiatan Anggota',
  'Pendidikan dan Pelatihan',
  'Informasi Usaha',
  'Informasi Lainnya',
];

function formatDateIndonesian(ts?: { toDate?: () => Date } | null): string {
  if (!ts || typeof ts.toDate !== 'function') {
    return 'Publikasi Resmi';
  }
  return ts.toDate().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export const NewsPage: React.FC = () => {
  const { newsArticles } = useSiteData();
  const [selectedCategory, setSelectedCategory] = useState<
    'Semua' | NewsCategory
  >('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredArticles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return newsArticles.filter((article) => {
      const matchCategory =
        selectedCategory === 'Semua' || article.category === selectedCategory;
      const matchSearch =
        !q ||
        article.title.toLowerCase().includes(q) ||
        article.excerpt.toLowerCase().includes(q) ||
        article.author.toLowerCase().includes(q);
      return matchCategory && matchSearch;
    });
  }, [newsArticles, selectedCategory, searchQuery]);

  const leadArticle = filteredArticles[0];
  const restArticles = filteredArticles.slice(1);

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <section className="bg-navy-900 text-white py-8 lg:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold text-gold-400 mb-2">
            Portal Berita & Pengumuman Resmi
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-white mb-3">
            Berita dan Informasi Koperasi
          </h1>
          <p className="text-base text-slate-200 max-w-2xl leading-relaxed">
            Ikuti perkembangan kegiatan anggota, pengumuman resmi pengurus, jadwal pendidikan koperasi, serta informasi usaha produktif di KSP CU Argomanunggal Santosa.
          </p>
        </div>
      </section>

      {/* Search & Category Filter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul berita, pengumuman, atau penulis..."
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {NEWS_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-navy-900 text-white border-navy-900'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial Front-Page Layout */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">
        {filteredArticles.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
            <p className="text-slate-600 mb-3">
              Belum ada berita atau pengumuman yang cocok dengan filter Anda.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('Semua');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-navy-900 text-white text-xs font-semibold rounded-lg"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <>
            {/* Lead Story */}
            {leadArticle && (
              <Link
                to={`/berita/${leadArticle.slug}`}
                className="group block bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-navy-700 transition-colors"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
                  <div className="lg:col-span-6 aspect-[16/10] lg:aspect-auto bg-slate-100 overflow-hidden">
                    <ResilientImage
                      src={leadArticle.coverImageUrl}
                      alt={leadArticle.title}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
                    />
                  </div>
                  <div className="lg:col-span-6 p-5 sm:p-7 flex flex-col justify-center">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-2.5">
                      <span className="font-semibold text-gold-600">
                        {leadArticle.category}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">
                        {formatDateIndonesian(leadArticle.publishedAt)}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{leadArticle.author}</span>
                    </div>
                    <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-navy-900 group-hover:text-navy-700 mb-3">
                      {leadArticle.title}
                    </h2>
                    <p className="text-slate-600 leading-relaxed mb-5">
                      {leadArticle.excerpt}
                    </p>
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-navy-900">
                      <span>Baca Selengkapnya</span>
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            )}

            {/* Secondary Articles Grid */}
            {restArticles.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {restArticles.map((article) => (
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
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-2">
                        <span className="font-semibold text-gold-600">
                          {article.category}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          {formatDateIndonesian(article.publishedAt)}
                        </span>
                      </div>
                      <h3 className="font-serif text-xl font-semibold text-navy-900 group-hover:text-navy-700 mb-2.5">
                        {article.title}
                      </h3>
                      <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed mb-4 flex-1">
                        {article.excerpt}
                      </p>
                      <p className="text-xs text-slate-500 pt-3 border-t border-slate-100">
                        Oleh {article.author}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};
