import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  MessageSquare,
  Share2,
} from 'lucide-react';
import { ResilientImage } from '../components/ResilientImage';
import { RichTextRenderer } from '../components/RichTextRenderer';
import { useSiteData } from '../context/SiteDataContext';
import {
  db,
  FIELD_LIMITS,
  formatWhatsappHref,
  handleFirestoreError,
  OperationType,
  sanitizePlainText,
} from '../lib/firebase';
import { NewsComment } from '../types';

function formatDateTime(ts?: { toDate?: () => Date } | null): string {
  if (!ts || typeof ts.toDate !== 'function') return 'Baru saja';
  return ts.toDate().toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const NewsDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { newsArticles, isSeeded } = useSiteData();

  const article = useMemo(
    () => newsArticles.find((a) => a.slug === slug || a.id === slug),
    [newsArticles, slug]
  );

  const [comments, setComments] = useState<NewsComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Comment form & anti-spam state
  const [authorName, setAuthorName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [mathAnswer, setMathAnswer] = useState('');
  const [mathChallenge] = useState(() => {
    const a = Math.floor(Math.random() * 6) + 2;
    const b = Math.floor(Math.random() * 5) + 1;
    return { a, b, sum: a + b };
  });
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentSubmitted, setCommentSubmitted] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);

  const fetchApprovedComments = useCallback(async (articleId: string) => {
    setLoadingComments(true);
    try {
      const q = query(
        collection(db, 'newsComments'),
        where('articleId', '==', articleId),
        where('status', '==', 'approved')
      );
      const snap = await getDocs(q);
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }) as NewsComment)
        .sort((a, b) => {
          const ta = a.createdAt?.toMillis?.() ?? 0;
          const tb = b.createdAt?.toMillis?.() ?? 0;
          return ta - tb;
        });
      setComments(list);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'newsComments');
    } finally {
      setLoadingComments(false);
    }
  }, []);

  useEffect(() => {
    if (article && !article.id.startsWith('init-news-')) {
      void fetchApprovedComments(article.id);
    } else {
      setComments([]);
    }
  }, [article, fetchApprovedComments]);

  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback ignored
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!article) return;
    if (honeypot) return;

    setCommentError(null);
    const cleanName = sanitizePlainText(authorName);
    const cleanContent = sanitizePlainText(commentText);

    if (cleanName.length < 2 || cleanName.length > 100) {
      setCommentError('Nama harus diisi antara 2 sampai 100 karakter.');
      return;
    }
    if (cleanContent.length < 3 || cleanContent.length > FIELD_LIMITS.COMMENT_MAX) {
      setCommentError('Komentar harus diisi antara 3 sampai 1.000 karakter.');
      return;
    }
    if (Number(mathAnswer.trim()) !== mathChallenge.sum) {
      setCommentError('Jawaban verifikasi anti-spam belum tepat.');
      return;
    }

    const lastSent = Number(sessionStorage.getItem('last_comment_ts') || '0');
    if (Date.now() - lastSent < 30000) {
      setCommentError(
        'Mohon tunggu 30 detik sebelum mengirim komentar berikutnya.'
      );
      return;
    }

    if (article.id.startsWith('init-news-') && !isSeeded) {
      setCommentError(
        'Artikel masih menggunakan pratinjau awal. Komentar aktif setelah pengurus menyinkronkan data awal di Panel Admin.'
      );
      return;
    }

    setSubmittingComment(true);
    try {
      const commentId = `cmt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      await setDoc(doc(db, 'newsComments', commentId), {
        articleId: article.id,
        authorName: cleanName,
        content: cleanContent,
        status: 'pending',
        boardReply: '',
        boardReplyAuthor: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      sessionStorage.setItem('last_comment_ts', String(Date.now()));
      setAuthorName('');
      setCommentText('');
      setMathAnswer('');
      setCommentSubmitted(true);
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.CREATE, 'newsComments');
      } catch {
        setCommentError(
          'Gagal mengirim komentar. Pastikan isi tidak mengandung karakter HTML (< atau >).'
        );
      }
    } finally {
      setSubmittingComment(false);
    }
  };

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="font-serif text-3xl font-semibold text-navy-900">
          Berita Tidak Ditemukan
        </h1>
        <p className="text-slate-600">
          Artikel yang Anda cari mungkin telah dipindahkan atau belum dipublikasikan.
        </p>
        <Link
          to="/berita"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-navy-900 text-white text-sm font-semibold rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Berita & Informasi</span>
        </Link>
      </div>
    );
  }

  return (
    <article className="bg-white min-h-screen py-8 lg:py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/berita"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-navy-900 mb-5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Berita</span>
        </Link>

        {/* Article Header */}
        <header className="space-y-3 mb-6">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-gold-600">
              {article.category}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">
              {formatDateTime(article.publishedAt)}
            </span>
            <span aria-hidden="true">·</span>
            <span>Oleh {article.author}</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-navy-900 leading-tight">
            {article.title}
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            {article.excerpt}
          </p>
        </header>

        {/* Cover Image */}
        <div className="aspect-[16/9] rounded-2xl overflow-hidden border border-slate-200 mb-6 bg-slate-100">
          <ResilientImage
            src={article.coverImageUrl}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Body Prose */}
        <div className="max-w-3xl">
          <RichTextRenderer content={article.content} />
        </div>

        {/* Supporting Images */}
        {article.supportingImages && article.supportingImages.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-200">
            <h2 className="font-serif text-xl font-semibold text-navy-900 mb-4">
              Dokumentasi Foto Pendukung
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {article.supportingImages.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 bg-slate-100"
                >
                  <ResilientImage
                    src={imgUrl}
                    alt={`${article.title} - foto pendukung ${idx + 1}`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Share Controls */}
        <div className="mt-7 py-5 border-y border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-navy-900">
            <Share2 className="w-4 h-4 text-gold-600" />
            <span>Bagikan Berita Ini</span>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href={formatWhatsappHref(
                '',
                `${article.title}\n\nBaca selengkapnya di portal resmi KSP CU Argomanunggal Santosa:\n${window.location.href}`
              ).replace('https://wa.me/', 'https://wa.me/?text=')}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-navy-900 text-white text-xs font-semibold rounded-lg hover:bg-navy-800 transition-colors"
            >
              Bagikan ke WhatsApp
            </a>
            <button
              type="button"
              onClick={handleCopyShareLink}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Tautan Disalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Tautan</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Comments & Board Replies */}
        <section className="mt-8 max-w-3xl space-y-6">
          <div className="flex items-center gap-2.5">
            <MessageSquare className="w-5 h-5 text-gold-600" />
            <h2 className="font-serif text-2xl font-semibold text-navy-900">
              Komentar & Tanggapan ({comments.length})
            </h2>
          </div>

          {loadingComments ? (
            <p className="text-sm text-slate-500">Memuat komentar...</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-5">
              Belum ada komentar yang dipublikasikan. Jadilah yang pertama memberikan tanggapan yang membangun.
            </p>
          ) : (
            <div className="space-y-5">
              {comments.map((cmt) => (
                <div
                  key={cmt.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4"
                >
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <p className="text-sm font-semibold text-navy-900">
                        {cmt.authorName}
                      </p>
                      <p className="font-mono text-xs text-slate-500 tabular-nums">
                        {formatDateTime(cmt.createdAt)}
                      </p>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                      {cmt.content}
                    </p>
                  </div>

                  {/* Official Board Reply */}
                  {cmt.boardReply && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5">
                      <p className="text-xs font-semibold text-navy-900">
                        Jawaban Pengurus ·{' '}
                        <span className="text-gold-600">
                          {cmt.boardReplyAuthor || 'Pengurus Koperasi'}
                        </span>
                      </p>
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                        {cmt.boardReply}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Comment Submission Form */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8">
            <h3 className="font-serif text-xl font-semibold text-navy-900 mb-1.5">
              Tulis Komentar atau Pertanyaan
            </h3>
            <p className="text-xs text-slate-600 mb-5">
              Setiap komentar akan dimoderasi oleh pengurus terlebih dahulu sebelum tampil untuk menjaga kenyamanan ruang komunikasi bersama.
            </p>

            {commentSubmitted ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 space-y-2">
                <div className="flex items-center gap-2 text-emerald-900 font-semibold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                  <span>Komentar Terkirim untuk Moderasi</span>
                </div>
                <p className="text-sm text-emerald-800">
                  Terima kasih atas tanggapan Anda. Pengurus akan meninjau dan menjawab komentar Anda segera.
                </p>
                <button
                  type="button"
                  onClick={() => setCommentSubmitted(false)}
                  className="text-xs font-semibold text-emerald-900 underline"
                >
                  Kirim komentar lain
                </button>
              </div>
            ) : (
              <form onSubmit={handleCommentSubmit} className="space-y-4">
                {/* Honeypot */}
                <input
                  type="text"
                  name="website_url"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                  aria-hidden="true"
                />

                {commentError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs sm:text-sm text-red-800">
                    {commentError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Nama Lengkap Anda *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Masukkan nama Anda"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Isi Tanggapan / Pertanyaan *
                  </label>
                  <textarea
                    required
                    rows={4}
                    maxLength={1000}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Tulis tanggapan Anda dengan bahasa yang santun..."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-700"
                  />
                </div>

                <div className="max-w-xs">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Verifikasi Keamanan: Berapa hasil {mathChallenge.a} +{' '}
                    {mathChallenge.b}? *
                  </label>
                  <input
                    type="number"
                    required
                    value={mathAnswer}
                    onChange={(e) => setMathAnswer(e.target.value)}
                    placeholder="Masukkan angka jawaban"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-navy-700"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingComment}
                  className="px-6 py-2.5 bg-navy-900 text-white text-sm font-semibold rounded-lg hover:bg-navy-800 disabled:opacity-60 transition-colors"
                >
                  {submittingComment ? 'Mengirim...' : 'Kirim Komentar'}
                </button>
              </form>
            )}
          </div>
        </section>
      </div>
    </article>
  );
};
