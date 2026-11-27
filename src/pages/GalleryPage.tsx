import React, { useMemo, useState } from 'react';
import { Play, X } from 'lucide-react';
import { ResilientImage } from '../components/ResilientImage';
import { useSiteData } from '../context/SiteDataContext';
import { GalleryItem } from '../types';

function toVideoEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url.trim());
    if (parsed.hostname.includes('youtu.be')) {
      const id = parsed.pathname.split('/').filter(Boolean)[0];
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (parsed.hostname.includes('youtube.com')) {
      const v = parsed.searchParams.get('v');
      if (v) return `https://www.youtube-nocookie.com/embed/${v}`;
      const parts = parsed.pathname.split('/').filter(Boolean);
      if ((parts[0] === 'embed' || parts[0] === 'shorts') && parts[1]) {
        return `https://www.youtube-nocookie.com/embed/${parts[1]}`;
      }
    }
    if (parsed.hostname.includes('drive.google.com')) {
      const match = parsed.pathname.match(/\/file\/d\/([^/]+)/);
      if (match?.[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    }
  } catch {
    return null;
  }
  return null;
}

export const GalleryPage: React.FC = () => {
  const { galleryItems } = useSiteData();
  const [typeFilter, setTypeFilter] = useState<'semua' | 'photo' | 'video'>(
    'semua'
  );
  const [categoryFilter, setCategoryFilter] = useState('Semua');
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);

  const categories = useMemo(() => {
    const set = new Set(galleryItems.map((i) => i.category));
    return ['Semua', ...Array.from(set)];
  }, [galleryItems]);

  const filteredItems = useMemo(() => {
    return galleryItems.filter((item) => {
      const matchType = typeFilter === 'semua' || item.type === typeFilter;
      const matchCat =
        categoryFilter === 'Semua' || item.category === categoryFilter;
      return matchType && matchCat;
    });
  }, [galleryItems, typeFilter, categoryFilter]);

  const youtubeEmbed =
    activeItem?.type === 'video'
      ? toVideoEmbedUrl(activeItem.mediaUrl)
      : null;

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <section className="bg-navy-900 text-white py-8 lg:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold text-gold-400 mb-2">
            Dokumentasi Kegiatan Koperasi
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-white mb-3">
            Galeri Foto dan Video
          </h1>
          <p className="text-base text-slate-200 max-w-2xl leading-relaxed">
            Rekam jejak kegiatan pendidikan anggota, Rapat Anggota Tahunan, bazar UMKM, serta aktivitas pelayanan KSP CU Argomanunggal Santosa.
          </p>
        </div>
      </section>

      {/* Filter Controls */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start">
            {[
              { id: 'semua', label: 'Semua Media' },
              { id: 'photo', label: 'Foto' },
              { id: 'video', label: 'Video' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() =>
                  setTypeFilter(tab.id as 'semua' | 'photo' | 'video')
                }
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  typeFilter === tab.id
                    ? 'bg-white text-navy-900 shadow-sm'
                    : 'text-slate-600 hover:text-navy-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap ${
                  categoryFilter === cat
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

      {/* Gallery Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {filteredItems.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
            <p className="text-slate-600">
              Belum ada dokumentasi pada kategori yang dipilih.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveItem(item)}
                className="group text-left bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-navy-700 transition-colors flex flex-col"
              >
                <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
                  <ResilientImage
                    src={item.thumbnailUrl || item.mediaUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-200"
                  />
                  {item.type === 'video' && (
                    <div className="absolute inset-0 bg-navy-950/35 flex items-center justify-center">
                      <span className="w-12 h-12 rounded-full bg-white/95 text-navy-900 flex items-center justify-center shadow-lg">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-5 space-y-1.5">
                  <p className="text-xs text-slate-500">
                    <span className="font-semibold text-gold-600">
                      {item.type === 'video' ? 'Video' : 'Foto'}
                    </span>{' '}
                    · {item.category} ·{' '}
                    <span className="font-mono tabular-nums">
                      {item.activityDate}
                    </span>
                  </p>
                  <h2 className="text-base font-semibold text-navy-900">
                    {item.title}
                  </h2>
                  {item.caption && (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {item.caption}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Lightbox / Video Modal */}
      {activeItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeItem.title}
          className="fixed inset-0 z-50 bg-navy-950/85 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <p className="text-xs text-slate-500">
                  {activeItem.category} ·{' '}
                  <span className="font-mono tabular-nums">
                    {activeItem.activityDate}
                  </span>
                </p>
                <h2 className="font-serif text-lg font-semibold text-navy-900">
                  {activeItem.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveItem(null)}
                aria-label="Tutup pratinjau"
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-navy-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-navy-950 flex items-center justify-center max-h-[70vh]">
              {activeItem.type === 'video' ? (
                youtubeEmbed ? (
                  <iframe
                    src={youtubeEmbed}
                    title={activeItem.title}
                    className="w-full aspect-video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={activeItem.mediaUrl}
                    controls
                    className="w-full max-h-[70vh]"
                  />
                )
              ) : (
                <ResilientImage
                  src={activeItem.mediaUrl}
                  alt={activeItem.title}
                  className="max-h-[70vh] w-auto object-contain"
                />
              )}
            </div>

            {activeItem.caption && (
              <div className="px-6 py-4 bg-white border-t border-slate-200">
                <p className="text-sm text-slate-700 leading-relaxed">
                  {activeItem.caption}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
