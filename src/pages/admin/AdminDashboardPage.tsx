import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
  BarChart3,
  Building2,
  Camera,
  Database,
  ExternalLink,
  Home,
  Inbox,
  Landmark,
  LogOut,
  Menu,
  MessageSquare,
  Newspaper,
  Quote,
  ShieldCheck,
  ShoppingBag,
  Store,
  Trash2,
  UserPlus,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSiteData } from '../../context/SiteDataContext';
import {
  BOOTSTRAP_ADMIN_EMAIL,
  db,
  handleFirestoreError,
  OperationType,
} from '../../lib/firebase';
import { AdminUser, ContactMessage, VisitLog } from '../../types';
import {
  AdminCoopProductsTab,
  AdminMemberProductsTab,
  AdminProductSubmissionsTab,
} from './AdminCatalogTabs';
import {
  AdminCommentsTab,
  AdminGalleryTab,
  AdminNewsTab,
  AdminTestimonialsTab,
} from './AdminContentTabs';
import { AdminLoginScreen } from './AdminLoginScreen';
import {
  AdminHomeSettingsTab,
  AdminJoinTab,
  AdminProfileTab,
} from './AdminSettingsTabs';

type AdminTabId =
  | 'ringkasan'
  | 'beranda'
  | 'profil'
  | 'produk-koperasi'
  | 'produk-anggota'
  | 'pendaftaran-produk'
  | 'berita'
  | 'komentar'
  | 'galeri'
  | 'bergabung'
  | 'pesan'
  | 'testimoni'
  | 'kelola-admin';

interface DashboardCounts {
  visitsTotal: number;
  topPages: Array<{ page: string; count: number }>;
  pendingComments: number;
  pendingSubmissions: number;
  newInquiries: number;
  unreadMessages: number;
}

export const AdminDashboardPage: React.FC = () => {
  const { user, isAdmin, loading, logout } = useAuth();
  const {
    siteSettings,
    cooperativeProducts,
    memberProducts,
    newsArticles,
    galleryItems,
    isSeeded,
    seedInitialData,
  } = useSiteData();

  const [activeTab, setActiveTab] = useState<AdminTabId>('ringkasan');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedDoneMessage, setSeedDoneMessage] = useState<string | null>(null);

  const [counts, setCounts] = useState<DashboardCounts>({
    visitsTotal: 0,
    topPages: [],
    pendingComments: 0,
    pendingSubmissions: 0,
    newInquiries: 0,
    unreadMessages: 0,
  });

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [newAdminUid, setNewAdminUid] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');

  const loadAnalyticsAndInbox = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const [visitsSnap, commentsSnap, subsSnap, joinSnap, msgSnap, adminSnap] =
        await Promise.all([
          getDocs(collection(db, 'visitLogs')),
          getDocs(collection(db, 'newsComments')),
          getDocs(collection(db, 'memberProductSubmissions')),
          getDocs(collection(db, 'joinInquiries')),
          getDocs(collection(db, 'contactMessages')),
          getDocs(collection(db, 'admins')),
        ]);

      const visitList = visitsSnap.docs.map((d) => d.data() as VisitLog);
      const pageCounts = new Map<string, number>();
      visitList.forEach((v) => {
        pageCounts.set(v.page, (pageCounts.get(v.page) || 0) + 1);
      });
      const topPages = Array.from(pageCounts.entries())
        .map(([page, count]) => ({ page, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

      const pendingComments = commentsSnap.docs.filter(
        (d) => d.data().status === 'pending'
      ).length;
      const pendingSubmissions = subsSnap.docs.filter(
        (d) => d.data().status === 'pending'
      ).length;
      const newInquiries = joinSnap.docs.filter(
        (d) => d.data().status === 'baru'
      ).length;

      const msgList = msgSnap.docs
        .map((d) => ({ id: d.id, ...d.data() }) as ContactMessage)
        .sort(
          (a, b) =>
            (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0)
        );
      setMessages(msgList);

      setAdmins(
        adminSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as AdminUser)
      );

      setCounts({
        visitsTotal: visitList.length,
        topPages,
        pendingComments,
        pendingSubmissions,
        newInquiries,
        unreadMessages: msgList.filter((m) => m.status === 'baru').length,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'adminAnalytics');
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      void loadAnalyticsAndInbox();
    }
  }, [isAdmin, loadAnalyticsAndInbox]);

  if (loading || !user || !isAdmin) {
    return <AdminLoginScreen />;
  }

  const handleSeedData = async () => {
    setSeeding(true);
    setSeedDoneMessage(null);
    try {
      await seedInitialData();
      setSeedDoneMessage(
        'Seluruh data awal koperasi (profil, produk, kategori, berita, galeri, testimoni) berhasil disimpan ke Cloud Firestore.'
      );
      await loadAnalyticsAndInbox();
    } finally {
      setSeeding(false);
    }
  };

  const handleUpdateMessageStatus = async (
    id: string,
    status: ContactMessage['status']
  ) => {
    try {
      await updateDoc(doc(db, 'contactMessages', id), { status });
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status } : m))
      );
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.UPDATE,
        `contactMessages/${id}`
      );
    }
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'contactMessages', id));
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.DELETE,
        `contactMessages/${id}`
      );
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    const uid = newAdminUid.trim();
    if (!uid || !newAdminEmail.trim() || !newAdminName.trim()) return;
    try {
      await setDoc(doc(db, 'admins', uid), {
        email: newAdminEmail.trim(),
        displayName: newAdminName.trim(),
        role: 'admin',
        createdAt: serverTimestamp(),
      });
      setNewAdminUid('');
      setNewAdminEmail('');
      setNewAdminName('');
      await loadAnalyticsAndInbox();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `admins/${uid}`);
    }
  };

  const handleRemoveAdmin = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'admins', id));
      await loadAnalyticsAndInbox();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `admins/${id}`);
    }
  };

  const navItems: Array<{
    id: AdminTabId;
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }> = [
    {
      id: 'ringkasan',
      label: 'Ringkasan & Statistik',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'beranda',
      label: 'Beranda & Kontak',
      icon: <Home className="w-4 h-4" />,
    },
    {
      id: 'profil',
      label: 'Profil & Pengurus',
      icon: <Building2 className="w-4 h-4" />,
    },
    {
      id: 'produk-koperasi',
      label: 'Produk Simpan Pinjam',
      icon: <Landmark className="w-4 h-4" />,
    },
    {
      id: 'produk-anggota',
      label: 'Produk UMKM Anggota',
      icon: <ShoppingBag className="w-4 h-4" />,
    },
    {
      id: 'pendaftaran-produk',
      label: 'Pendaftaran Produk',
      icon: <Store className="w-4 h-4" />,
      badge: counts.pendingSubmissions,
    },
    {
      id: 'berita',
      label: 'Berita & Pengumuman',
      icon: <Newspaper className="w-4 h-4" />,
    },
    {
      id: 'komentar',
      label: 'Moderasi Komentar',
      icon: <MessageSquare className="w-4 h-4" />,
      badge: counts.pendingComments,
    },
    {
      id: 'galeri',
      label: 'Galeri Foto & Video',
      icon: <Camera className="w-4 h-4" />,
    },
    {
      id: 'bergabung',
      label: 'Cara Bergabung & Pendaftar',
      icon: <UserPlus className="w-4 h-4" />,
      badge: counts.newInquiries,
    },
    {
      id: 'pesan',
      label: 'Pesan Masuk',
      icon: <Inbox className="w-4 h-4" />,
      badge: counts.unreadMessages,
    },
    {
      id: 'testimoni',
      label: 'Testimoni Anggota',
      icon: <Quote className="w-4 h-4" />,
    },
    {
      id: 'kelola-admin',
      label: 'Akses Pengelola',
      icon: <ShieldCheck className="w-4 h-4" />,
    },
  ];

  const activeLabel =
    navItems.find((n) => n.id === activeTab)?.label || 'Dashboard';

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-68 bg-navy-950 text-slate-200 flex flex-col border-r border-navy-900 transition-transform lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 px-5 border-b border-navy-900 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="bg-white rounded-lg p-0.5 h-9 w-9 shrink-0 flex items-center justify-center">
              <img
                src="/assets/aistudio/logo_cuco_b0a9ab8b.jpg"
                alt="Logo Credit Union"
                referrerPolicy="no-referrer"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gold-400">
                Panel Pengelola
              </p>
              <p className="font-serif text-sm font-semibold text-white truncate max-w-[140px]">
                {siteSettings.cooperativeName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white"
            aria-label="Tutup sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left ${
                activeTab === item.id
                  ? 'bg-navy-800 text-white font-semibold'
                  : 'text-slate-300 hover:bg-navy-900 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5 truncate">
                {item.icon}
                <span className="truncate">{item.label}</span>
              </span>
              {typeof item.badge === 'number' && item.badge > 0 && (
                <span className="font-mono text-[11px] font-semibold text-gold-400 tabular-nums">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-navy-900 space-y-2">
          <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
          <button
            type="button"
            onClick={() => void logout()}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-navy-900 hover:bg-navy-800 text-slate-200 text-xs font-semibold rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </aside>

      {/* Workspace Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-slate-200 text-navy-900"
              aria-label="Buka menu admin"
            >
              <Menu className="w-5 h-5" />
            </button>
            <p className="text-sm font-semibold text-navy-900 truncate">
              Panel Admin / <span className="text-slate-500">{activeLabel}</span>
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-slate-300 text-navy-900 text-xs font-semibold rounded-lg hover:bg-slate-50 whitespace-nowrap shrink-0"
          >
            <span>Lihat Website Publik</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </header>

        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {activeTab === 'ringkasan' && (
            <div className="space-y-8 max-w-5xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-serif text-2xl font-semibold text-navy-900">
                    Ringkasan Aktivitas & Pengunjung Website
                  </h1>
                  <p className="text-sm text-slate-600">
                    Pantau statistik kunjungan publik, antrean moderasi, dan kelola seluruh konten tanpa menyentuh kode.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void handleSeedData()}
                  disabled={seeding}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-navy-900 text-white text-xs font-semibold rounded-lg hover:bg-navy-800 disabled:opacity-60 whitespace-nowrap shrink-0"
                >
                  <Database className="w-4 h-4" />
                  <span>
                    {seeding
                      ? 'Menyinkronkan...'
                      : isSeeded
                        ? 'Sinkronkan Ulang Data Bawaan'
                        : 'Simpan Data Awal ke Firestore'}
                  </span>
                </button>
              </div>

              {!isSeeded && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900">
                  Database Firestore belum memiliki salinan data awal. Klik tombol{' '}
                  <strong>Simpan Data Awal ke Firestore</strong> di atas agar seluruh profil, produk, berita, galeri, dan testimoni tersimpan permanen dan dapat langsung diedit.
                </div>
              )}

              {seedDoneMessage && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-900">
                  {seedDoneMessage}
                </div>
              )}

              {/* KPI Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5">
                  <p className="text-xs text-slate-500 mb-1">
                    Total Kunjungan Halaman
                  </p>
                  <p className="font-mono text-2xl font-semibold text-navy-900 tabular-nums">
                    {counts.visitsTotal}
                  </p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5">
                  <p className="text-xs text-slate-500 mb-1">
                    Komentar Menunggu Moderasi
                  </p>
                  <p className="font-mono text-2xl font-semibold text-navy-900 tabular-nums">
                    {counts.pendingComments}
                  </p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5">
                  <p className="text-xs text-slate-500 mb-1">
                    Pendaftar Anggota Baru
                  </p>
                  <p className="font-mono text-2xl font-semibold text-navy-900 tabular-nums">
                    {counts.newInquiries}
                  </p>
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl p-5">
                  <p className="text-xs text-slate-500 mb-1">
                    Pesan Masuk Belum Dibaca
                  </p>
                  <p className="font-mono text-2xl font-semibold text-navy-900 tabular-nums">
                    {counts.unreadMessages}
                  </p>
                </div>
              </div>

              {/* Konten & Halaman Populer */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                  <h2 className="font-serif text-lg font-semibold text-navy-900">
                    Halaman Paling Sering Dikunjungi
                  </h2>
                  {counts.topPages.length === 0 ? (
                    <p className="text-sm text-slate-500">
                      Belum ada rekaman kunjungan pengunjung.
                    </p>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {counts.topPages.map((row) => (
                        <div
                          key={row.page}
                          className="py-2.5 flex items-center justify-between text-sm"
                        >
                          <span className="font-mono text-xs text-slate-700">
                            {row.page}
                          </span>
                          <span className="font-mono text-xs font-semibold text-navy-900 tabular-nums">
                            {row.count} kunjungan
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                  <h2 className="font-serif text-lg font-semibold text-navy-900">
                    Inventaris Konten Publik
                  </h2>
                  <div className="divide-y divide-slate-100 text-sm">
                    <div className="py-2.5 flex justify-between">
                      <span className="text-slate-600">
                        Produk Simpanan & Pinjaman
                      </span>
                      <span className="font-mono font-semibold text-navy-900 tabular-nums">
                        {cooperativeProducts.length}
                      </span>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <span className="text-slate-600">
                        Produk UMKM Anggota Tayang
                      </span>
                      <span className="font-mono font-semibold text-navy-900 tabular-nums">
                        {memberProducts.length}
                      </span>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <span className="text-slate-600">
                        Artikel Berita & Pengumuman
                      </span>
                      <span className="font-mono font-semibold text-navy-900 tabular-nums">
                        {newsArticles.length}
                      </span>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <span className="text-slate-600">
                        Dokumentasi Foto & Video
                      </span>
                      <span className="font-mono font-semibold text-navy-900 tabular-nums">
                        {galleryItems.length}
                      </span>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <span className="text-slate-600">
                        Pendaftaran Produk Menunggu Tinjauan
                      </span>
                      <span className="font-mono font-semibold text-navy-900 tabular-nums">
                        {counts.pendingSubmissions}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'beranda' && <AdminHomeSettingsTab />}
          {activeTab === 'profil' && <AdminProfileTab />}
          {activeTab === 'produk-koperasi' && <AdminCoopProductsTab />}
          {activeTab === 'produk-anggota' && <AdminMemberProductsTab />}
          {activeTab === 'pendaftaran-produk' && (
            <AdminProductSubmissionsTab />
          )}
          {activeTab === 'berita' && <AdminNewsTab />}
          {activeTab === 'komentar' && <AdminCommentsTab />}
          {activeTab === 'galeri' && <AdminGalleryTab />}
          {activeTab === 'bergabung' && <AdminJoinTab />}
          {activeTab === 'testimoni' && <AdminTestimonialsTab />}

          {activeTab === 'pesan' && (
            <div className="space-y-6 max-w-5xl">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-navy-900">
                  Pesan Masuk dari Halaman Hubungi Kami ({messages.length})
                </h2>
                <p className="text-sm text-slate-600">
                  Pesan hanya dapat dibaca oleh pengelola terverifikasi untuk menjaga privasi pengirim.
                </p>
              </div>
              {messages.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-sm text-slate-500">
                  Belum ada pesan masuk.
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-navy-900">
                            {msg.subject}
                          </p>
                          <p className="text-xs text-slate-600">
                            Dari: {msg.senderName} ({msg.senderContact})
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={msg.status}
                            onChange={(e) =>
                              void handleUpdateMessageStatus(
                                msg.id,
                                e.target.value as ContactMessage['status']
                              )
                            }
                            className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold bg-white"
                          >
                            <option value="baru">Baru</option>
                            <option value="dibaca">Sudah Dibaca</option>
                            <option value="dibalas">Sudah Dibalas</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => void handleDeleteMessage(msg.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                            aria-label="Hapus pesan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200 whitespace-pre-line">
                        {msg.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'kelola-admin' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-navy-900">
                  Manajemen Hak Akses Pengelola Website
                </h2>
                <p className="text-sm text-slate-600">
                  Admin utama bootstrap ({BOOTSTRAP_ADMIN_EMAIL}) selalu memiliki akses. Anda dapat menambahkan UID Firebase Auth pengurus lain di bawah ini.
                </p>
              </div>

              <form
                onSubmit={handleAddAdmin}
                className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4"
              >
                <h3 className="text-base font-semibold text-navy-900">
                  Tambah Pengelola Baru
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Firebase Auth UID"
                    value={newAdminUid}
                    onChange={(e) => setNewAdminUid(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Email Google Terverifikasi"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Nama Pengurus"
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-navy-900 text-white text-xs font-semibold rounded-lg hover:bg-navy-800"
                >
                  Simpan Akses Admin
                </button>
              </form>

              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
                <h3 className="text-base font-semibold text-navy-900">
                  Pengelola Terdaftar ({admins.length})
                </h3>
                <div className="divide-y divide-slate-100">
                  <div className="py-3 flex items-center justify-between text-sm">
                    <div>
                      <p className="font-semibold text-navy-900">
                        Admin Utama Koperasi
                      </p>
                      <p className="text-xs text-slate-500">
                        {BOOTSTRAP_ADMIN_EMAIL} · Super Admin
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-emerald-700">
                      Aktif
                    </span>
                  </div>
                  {admins.map((adm) => (
                    <div
                      key={adm.id}
                      className="py-3 flex items-center justify-between text-sm"
                    >
                      <div>
                        <p className="font-semibold text-navy-900">
                          {adm.displayName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {adm.email} · UID: {adm.id}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void handleRemoveAdmin(adm.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                        aria-label="Hapus akses admin"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
