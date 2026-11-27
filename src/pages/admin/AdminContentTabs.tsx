import React, { useEffect, useRef, useState } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  Bold,
  Check,
  Eye,
  EyeOff,
  Heading2,
  List,
  MessageSquareReply,
  Plus,
  Quote,
  Trash2,
} from 'lucide-react';
import { MediaInputField } from '../../components/MediaInputField';
import { RichTextRenderer } from '../../components/RichTextRenderer';
import { useSiteData } from '../../context/SiteDataContext';
import { ASSET_IMAGES } from '../../data/initialCooperativeData';
import {
  db,
  handleFirestoreError,
  OperationType,
  slugify,
} from '../../lib/firebase';
import {
  GalleryItem,
  NewsArticle,
  NewsCategory,
  NewsComment,
  Testimonial,
} from '../../types';

const NEWS_CATEGORIES: NewsCategory[] = [
  'Berita Koperasi',
  'Pengumuman',
  'Kegiatan Anggota',
  'Pendidikan dan Pelatihan',
  'Informasi Usaha',
  'Informasi Lainnya',
];

export const AdminNewsTab: React.FC = () => {
  const { refreshPublicData } = useSiteData();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const [form, setForm] = useState({
    title: '',
    category: 'Berita Koperasi' as NewsCategory,
    coverImageUrl: ASSET_IMAGES.communityMeeting,
    author: 'Pengurus KSP CU Argomanunggal Santosa',
    excerpt: '',
    content: '',
    supportingImages: [] as string[],
    isPublished: true,
    isImportant: false,
  });

  const loadArticles = async () => {
    try {
      const snap = await getDocs(collection(db, 'newsArticles'));
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }) as NewsArticle)
        .sort(
          (a, b) =>
            (b.publishedAt?.toMillis?.() ?? 0) -
            (a.publishedAt?.toMillis?.() ?? 0)
        );
      setArticles(list);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'newsArticles');
    }
  };

  useEffect(() => {
    void loadArticles();
  }, []);

  const insertFormat = (snippet: string) => {
    const textarea = contentRef.current;
    if (!textarea) {
      setForm((f) => ({ ...f, content: f.content + snippet }));
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = form.content.slice(0, start);
    const selected = form.content.slice(start, end);
    const after = form.content.slice(end);
    const replacement =
      snippet === '**teks**'
        ? `**${selected || 'teks tebal'}**`
        : `\n\n${snippet}${selected}`;
    setForm((f) => ({ ...f, content: before + replacement + after }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const docId = editingId || `news-${Date.now()}`;
      const existing = editingId
        ? articles.find((a) => a.id === editingId)
        : null;
      const supportingImages = form.supportingImages
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 6);

      await setDoc(doc(db, 'newsArticles', docId), {
        title: form.title.trim(),
        slug: existing?.slug || `${slugify(form.title)}-${Date.now().toString().slice(-4)}`,
        category: form.category,
        coverImageUrl: form.coverImageUrl.trim(),
        author: form.author.trim(),
        excerpt: form.excerpt.trim(),
        content: form.content.trim(),
        supportingImages,
        isPublished: form.isPublished,
        isImportant: form.isImportant,
        publishedAt: existing?.publishedAt || serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setEditingId(null);
      setForm({
        title: '',
        category: 'Berita Koperasi',
        coverImageUrl: ASSET_IMAGES.communityMeeting,
        author: 'Pengurus KSP CU Argomanunggal Santosa',
        excerpt: '',
        content: '',
        supportingImages: [],
        isPublished: true,
        isImportant: false,
      });
      await loadArticles();
      await refreshPublicData();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'newsArticles');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'newsArticles', id));
      await loadArticles();
      await refreshPublicData();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `newsArticles/${id}`);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-navy-900">
          Kelola Berita & Pengumuman
        </h2>
        <p className="text-sm text-slate-600">
          Buat artikel dengan format teks terstruktur, foto sampul, foto pendukung, dan pengaturan kategori.
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-navy-900">
            {editingId ? 'Edit Berita / Pengumuman' : 'Tulis Berita Baru'}
          </h3>
          <button
            type="button"
            onClick={() => setShowPreview((p) => !p)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold"
          >
            {showPreview ? (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>Tutup Pratinjau</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>Pratinjau Format</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Judul Berita *
            </label>
            <input
              type="text"
              required
              minLength={5}
              maxLength={200}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kategori *
            </label>
            <select
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value as NewsCategory })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
            >
              {NEWS_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Penulis *
            </label>
            <input
              type="text"
              required
              maxLength={120}
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <MediaInputField
              label="Foto Sampul Berita"
              mode="image"
              required
              value={form.coverImageUrl}
              onChange={(nextUrl) =>
                setForm((prev) => ({ ...prev, coverImageUrl: nextUrl }))
              }
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Ringkasan Singkat *
          </label>
          <textarea
            rows={2}
            required
            minLength={5}
            maxLength={450}
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
        </div>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Isi Berita Lengkap *
            </label>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => insertFormat('**teks**')}
                title="Tebal"
                className="p-1.5 hover:bg-white rounded text-slate-700"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormat('## Subjudul Bagian\n\n')}
                title="Subjudul"
                className="p-1.5 hover:bg-white rounded text-slate-700"
              >
                <Heading2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormat('- Poin daftar\n- Poin kedua')}
                title="Daftar Poin"
                className="p-1.5 hover:bg-white rounded text-slate-700"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormat('> Kutipan penting pengurus')}
                title="Kutipan"
                className="p-1.5 hover:bg-white rounded text-slate-700"
              >
                <Quote className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          {showPreview ? (
            <div className="p-5 border border-slate-300 rounded-lg bg-slate-50 min-h-[200px]">
              <RichTextRenderer content={form.content} />
            </div>
          ) : (
            <textarea
              ref={contentRef}
              rows={8}
              required
              minLength={10}
              maxLength={15000}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="Tulis isi berita. Gunakan ## untuk subjudul, - untuk daftar poin, > untuk kutipan, dan **teks** untuk huruf tebal."
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm"
            />
          )}
        </div>

        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between gap-2">
            <label className="block text-xs font-semibold text-slate-700">
              Foto Pendukung Tambahan (Opsional, maks. 6)
            </label>
            {form.supportingImages.length < 6 && (
              <button
                type="button"
                onClick={() =>
                  setForm((prev) => ({
                    ...prev,
                    supportingImages: [...prev.supportingImages, ''],
                  }))
                }
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Foto Pendukung</span>
              </button>
            )}
          </div>
          {form.supportingImages.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {form.supportingImages.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-navy-900">
                      Foto Pendukung #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          supportingImages: prev.supportingImages.filter(
                            (_, i) => i !== idx
                          ),
                        }))
                      }
                      aria-label="Hapus foto pendukung"
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <MediaInputField
                    label="Sumber Foto"
                    mode="image"
                    compact
                    maxImageChars={95000}
                    value={imgUrl}
                    onChange={(nextUrl) =>
                      setForm((prev) => {
                        const next = [...prev.supportingImages];
                        next[idx] = nextUrl;
                        return { ...prev, supportingImages: next };
                      })
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="flex flex-wrap gap-5">
            <label className="flex items-center gap-2 text-xs font-semibold text-navy-900">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) =>
                  setForm({ ...form, isPublished: e.target.checked })
                }
              />
              <span>Publikasikan Berita</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-navy-900">
              <input
                type="checkbox"
                checked={form.isImportant}
                onChange={(e) =>
                  setForm({ ...form, isImportant: e.target.checked })
                }
              />
              <span>Sorot di Pengumuman Penting Beranda</span>
            </label>
          </div>
          <div className="flex gap-2">
            {editingId && (
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold"
              >
                Batal
              </button>
            )}
            <button
              type="submit"
              className="px-5 py-2 bg-navy-900 text-white text-xs font-semibold rounded-lg hover:bg-navy-800"
            >
              {editingId ? 'Simpan Perubahan' : 'Terbitkan Berita'}
            </button>
          </div>
        </div>
      </form>

      {/* Articles List */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
        <h3 className="text-base font-semibold text-navy-900">
          Daftar Artikel Berita ({articles.length})
        </h3>
        <div className="divide-y divide-slate-100">
          {articles.map((art) => (
            <div
              key={art.id}
              className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <p className="text-xs text-slate-500">
                  <span className="font-semibold text-gold-600">
                    {art.category}
                  </span>{' '}
                  · {art.isPublished ? 'Tayang' : 'Draft'}
                  {art.isImportant ? ' · Pengumuman Penting' : ''}
                </p>
                <p className="text-sm font-semibold text-navy-900">
                  {art.title}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(art.id);
                    setForm({
                      title: art.title,
                      category: art.category,
                      coverImageUrl: art.coverImageUrl,
                      author: art.author,
                      excerpt: art.excerpt,
                      content: art.content,
                      supportingImages: art.supportingImages || [],
                      isPublished: art.isPublished,
                      isImportant: art.isImportant,
                    });
                  }}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete(art.id)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                  aria-label="Hapus berita"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const AdminCommentsTab: React.FC = () => {
  const [comments, setComments] = useState<NewsComment[]>([]);
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'pending' | 'approved' | 'hidden'
  >('all');
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [replyAuthor, setReplyAuthor] = useState(
    'Pengurus KSP CU Argomanunggal Santosa'
  );
  const [loading, setLoading] = useState(true);

  const loadComments = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'newsComments'));
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }) as NewsComment)
        .sort(
          (a, b) =>
            (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)
        );
      setComments(list);
      const drafts: Record<string, string> = {};
      list.forEach((c) => {
        drafts[c.id] = c.boardReply || '';
      });
      setReplyDrafts(drafts);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'newsComments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadComments();
  }, []);

  const handleModerate = async (
    cmt: NewsComment,
    nextStatus: NewsComment['status']
  ) => {
    try {
      const replyText = (replyDrafts[cmt.id] || '').trim();
      await updateDoc(doc(db, 'newsComments', cmt.id), {
        status: nextStatus,
        boardReply: replyText,
        boardReplyAuthor: replyText ? replyAuthor.trim() : '',
        updatedAt: serverTimestamp(),
      });
      await loadComments();
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.UPDATE,
        `newsComments/${cmt.id}`
      );
    }
  };

  const handleSaveReply = async (cmt: NewsComment) => {
    try {
      const replyText = (replyDrafts[cmt.id] || '').trim();
      await updateDoc(doc(db, 'newsComments', cmt.id), {
        status: cmt.status,
        boardReply: replyText,
        boardReplyAuthor: replyText ? replyAuthor.trim() : '',
        updatedAt: serverTimestamp(),
      });
      await loadComments();
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.UPDATE,
        `newsComments/${cmt.id}`
      );
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'newsComments', id));
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `newsComments/${id}`);
    }
  };

  const visibleComments = comments.filter((c) =>
    filterStatus === 'all' ? true : c.status === filterStatus
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-navy-900">
            Moderasi Komentar & Jawaban Pengurus
          </h2>
          <p className="text-sm text-slate-600">
            Setujui komentar pengunjung yang layak tayang, sembunyikan/hapus spam, dan tulis tanggapan resmi pengurus.
          </p>
        </div>
        <div className="inline-flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
          {[
            { id: 'all', label: 'Semua' },
            { id: 'pending', label: 'Menunggu' },
            { id: 'approved', label: 'Disetujui' },
            { id: 'hidden', label: 'Disembunyikan' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() =>
                setFilterStatus(
                  tab.id as 'all' | 'pending' | 'approved' | 'hidden'
                )
              }
              className={`px-3 py-1.5 text-xs font-semibold rounded-md ${
                filterStatus === tab.id
                  ? 'bg-white text-navy-900 shadow-sm'
                  : 'text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
          Nama Penjawab Resmi:
        </label>
        <input
          type="text"
          value={replyAuthor}
          onChange={(e) => setReplyAuthor(e.target.value)}
          className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
        />
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Memuat komentar...</p>
      ) : visibleComments.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-sm text-slate-500">
          Tidak ada komentar pada filter ini.
        </div>
      ) : (
        <div className="space-y-4">
          {visibleComments.map((cmt) => (
            <div
              key={cmt.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-gold-600">
                    Status:{' '}
                    {cmt.status === 'pending'
                      ? 'MENUNGGU MODERASI'
                      : cmt.status === 'approved'
                        ? 'DISETUJUI'
                        : 'DISEMBUNYIKAN'}
                  </p>
                  <p className="text-sm font-semibold text-navy-900">
                    {cmt.authorName}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {cmt.status !== 'approved' && (
                    <button
                      type="button"
                      onClick={() => void handleModerate(cmt, 'approved')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-700 text-white text-xs font-semibold rounded-lg"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Setujui</span>
                    </button>
                  )}
                  {cmt.status !== 'hidden' && (
                    <button
                      type="button"
                      onClick={() => void handleModerate(cmt, 'hidden')}
                      className="px-3 py-1.5 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg"
                    >
                      Sembunyikan
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => void handleDelete(cmt.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                    aria-label="Hapus komentar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                {cmt.content}
              </p>

              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-navy-900">
                  <MessageSquareReply className="w-3.5 h-3.5 text-gold-600" />
                  <span>Jawaban Resmi Pengurus:</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    maxLength={1500}
                    value={replyDrafts[cmt.id] || ''}
                    onChange={(e) =>
                      setReplyDrafts({
                        ...replyDrafts,
                        [cmt.id]: e.target.value,
                      })
                    }
                    placeholder="Tulis balasan pengurus di sini..."
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => void handleSaveReply(cmt)}
                    className="px-4 py-2 bg-navy-900 text-white text-xs font-semibold rounded-lg hover:bg-navy-800 whitespace-nowrap"
                  >
                    Simpan Jawaban
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const AdminGalleryTab: React.FC = () => {
  const { refreshPublicData } = useSiteData();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [form, setForm] = useState({
    type: 'photo' as 'photo' | 'video',
    title: '',
    caption: '',
    category: 'Kegiatan Anggota',
    activityDate: new Date().toISOString().slice(0, 10),
    mediaUrl: ASSET_IMAGES.communityBazaar,
    thumbnailUrl: ASSET_IMAGES.communityBazaar,
    isPublished: true,
  });

  const loadGallery = async () => {
    try {
      const snap = await getDocs(collection(db, 'galleryItems'));
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }) as GalleryItem)
        .sort((a, b) => b.activityDate.localeCompare(a.activityDate));
      setItems(list);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'galleryItems');
    }
  };

  useEffect(() => {
    void loadGallery();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.mediaUrl.trim()) return;
    try {
      const docId = `gal-${Date.now()}`;
      const resolvedThumbnail =
        form.type === 'photo'
          ? form.mediaUrl.trim()
          : form.thumbnailUrl.trim() || ASSET_IMAGES.communityMeeting;
      await setDoc(doc(db, 'galleryItems', docId), {
        ...form,
        mediaUrl: form.mediaUrl.trim(),
        thumbnailUrl: resolvedThumbnail,
        createdAt: serverTimestamp(),
      });
      setForm({
        type: 'photo',
        title: '',
        caption: '',
        category: 'Kegiatan Anggota',
        activityDate: new Date().toISOString().slice(0, 10),
        mediaUrl: ASSET_IMAGES.communityBazaar,
        thumbnailUrl: ASSET_IMAGES.communityBazaar,
        isPublished: true,
      });
      await loadGallery();
      await refreshPublicData();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'galleryItems');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'galleryItems', id));
      await loadGallery();
      await refreshPublicData();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `galleryItems/${id}`);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-navy-900">
          Kelola Galeri Foto & Video
        </h2>
        <p className="text-sm text-slate-600">
          Tambahkan dokumentasi foto atau tautan video YouTube/MP4 kegiatan koperasi.
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Jenis Media
            </label>
            <select
              value={form.type}
              onChange={(e) => {
                const nextType = e.target.value as 'photo' | 'video';
                setForm((prev) => ({
                  ...prev,
                  type: nextType,
                  mediaUrl:
                    nextType === 'video'
                      ? ''
                      : prev.mediaUrl || ASSET_IMAGES.communityBazaar,
                  thumbnailUrl:
                    nextType === 'video'
                      ? ASSET_IMAGES.communityMeeting
                      : prev.mediaUrl || ASSET_IMAGES.communityBazaar,
                }));
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
            >
              <option value="photo">Foto Kegiatan</option>
              <option value="video">Video (YouTube / Drive / MP4)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Kategori Kegiatan *
            </label>
            <input
              type="text"
              required
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tanggal Kegiatan *
            </label>
            <input
              type="date"
              required
              value={form.activityDate}
              onChange={(e) =>
                setForm({ ...form, activityDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Judul Dokumentasi *
          </label>
          <input
            type="text"
            required
            maxLength={160}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
        </div>

        <MediaInputField
          label={
            form.type === 'video'
              ? 'Sumber Video (YouTube / Google Drive / Upload Kompres)'
              : 'Sumber Foto Kegiatan'
          }
          mode={form.type === 'video' ? 'video' : 'image'}
          required
          value={form.mediaUrl}
          onChange={(nextUrl) =>
            setForm((prev) => ({
              ...prev,
              mediaUrl: nextUrl,
              thumbnailUrl:
                prev.type === 'photo' ? nextUrl : prev.thumbnailUrl,
            }))
          }
          onThumbnailDetected={(thumb) =>
            setForm((prev) => ({ ...prev, thumbnailUrl: thumb }))
          }
          helperText={
            form.type === 'video'
              ? 'Video singkat dikompres otomatis. Untuk video berdurasi panjang, tempel tautan YouTube / Shorts / Google Drive yang sudah siap.'
              : undefined
          }
        />

        {form.type === 'video' && (
          <MediaInputField
            label="Gambar Thumbnail Video"
            mode="image"
            compact
            maxImageChars={100000}
            value={form.thumbnailUrl}
            onChange={(nextUrl) =>
              setForm((prev) => ({ ...prev, thumbnailUrl: nextUrl }))
            }
            helperText="Otomatis terisi dari YouTube atau frame video yang diunggah, atau dapat diganti dengan foto lain."
          />
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Keterangan Singkat
          </label>
          <textarea
            rows={2}
            maxLength={600}
            value={form.caption}
            onChange={(e) => setForm({ ...form, caption: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-5 py-2 bg-navy-900 text-white text-xs font-semibold rounded-lg hover:bg-navy-800"
          >
            Tambahkan ke Galeri
          </button>
        </div>
      </form>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
        <h3 className="text-base font-semibold text-navy-900">
          Daftar Dokumentasi ({items.length})
        </h3>
        <div className="divide-y divide-slate-100">
          {items.map((item) => (
            <div
              key={item.id}
              className="py-3 flex items-center justify-between gap-4"
            >
              <div>
                <p className="text-xs text-slate-500">
                  <span className="font-semibold text-gold-600">
                    {item.type === 'video' ? 'VIDEO' : 'FOTO'}
                  </span>{' '}
                  · {item.category} ·{' '}
                  <span className="font-mono">{item.activityDate}</span>
                </p>
                <p className="text-sm font-semibold text-navy-900">
                  {item.title}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void handleDelete(item.id)}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                aria-label="Hapus galeri"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const AdminTestimonialsTab: React.FC = () => {
  const { refreshPublicData } = useSiteData();
  const [items, setItems] = useState<Testimonial[]>([]);
  const [form, setForm] = useState({
    memberName: '',
    memberRole: '',
    quote: '',
    sortOrder: 1,
  });

  const loadAll = async () => {
    try {
      const snap = await getDocs(collection(db, 'testimonials'));
      setItems(
        snap.docs
          .map((d) => ({ id: d.id, ...d.data() }) as Testimonial)
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'testimonials');
    }
  };

  useEffect(() => {
    void loadAll();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setDoc(doc(db, 'testimonials', `testi-${Date.now()}`), {
        memberName: form.memberName.trim(),
        memberRole: form.memberRole.trim(),
        quote: form.quote.trim(),
        isPublished: true,
        sortOrder: Number(form.sortOrder) || items.length + 1,
        createdAt: serverTimestamp(),
      });
      setForm({ memberName: '', memberRole: '', quote: '', sortOrder: 1 });
      await loadAll();
      await refreshPublicData();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'testimonials');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'testimonials', id));
      await loadAll();
      await refreshPublicData();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `testimonials/${id}`);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-navy-900">
          Kelola Testimoni Anggota
        </h2>
        <p className="text-sm text-slate-600">
          Tambahkan kisah nyata dampak positif keanggotaan koperasi di halaman beranda.
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Anggota *
            </label>
            <input
              type="text"
              required
              value={form.memberName}
              onChange={(e) => setForm({ ...form, memberName: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Peran / Usaha Anggota *
            </label>
            <input
              type="text"
              required
              value={form.memberRole}
              onChange={(e) => setForm({ ...form, memberRole: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Kutipan Testimoni *
          </label>
          <textarea
            rows={3}
            required
            minLength={10}
            maxLength={600}
            value={form.quote}
            onChange={(e) => setForm({ ...form, quote: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2 bg-navy-900 text-white text-xs font-semibold rounded-lg hover:bg-navy-800"
        >
          Simpan Testimoni
        </button>
      </form>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
        {items.map((t) => (
          <div
            key={t.id}
            className="py-3 border-b border-slate-100 last:border-b-0 flex items-start justify-between gap-4"
          >
            <div>
              <p className="text-sm font-semibold text-navy-900">
                {t.memberName}{' '}
                <span className="text-xs font-normal text-slate-500">
                  · {t.memberRole}
                </span>
              </p>
              <p className="text-xs text-slate-600 mt-1">"{t.quote}"</p>
            </div>
            <button
              type="button"
              onClick={() => void handleDelete(t.id)}
              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg shrink-0"
              aria-label="Hapus testimoni"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
