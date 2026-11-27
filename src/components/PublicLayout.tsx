import React, { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  ChevronDown,
  Eye,
  Mail,
  MapPin,
  Menu,
  Phone,
  X,
} from 'lucide-react';
import { useSiteData } from '../context/SiteDataContext';
import { formatWhatsappHref } from '../lib/firebase';

const SENIOR_MODE_STORAGE_KEY = 'argomanunggal_senior_mode';

export const PublicLayout: React.FC = () => {
  const { siteSettings, logPageVisit } = useSiteData();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<'profil' | 'produk' | null>(
    null
  );
  const [dismissedAnnouncement, setDismissedAnnouncement] = useState(false);
  const [seniorMode, setSeniorMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SENIOR_MODE_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('senior-mode', seniorMode);
    try {
      localStorage.setItem(SENIOR_MODE_STORAGE_KEY, String(seniorMode));
    } catch {
      // Ignore storage errors
    }
  }, [seniorMode]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setOpenDropdown(null);
    window.scrollTo({ top: 0, behavior: 'auto' });
    void logPageVisit(location.pathname);
  }, [location.pathname, logPageVisit]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Sticky Header: 3-Zone Top Bar Contract */}
      <header
        ref={navRef}
        className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 lg:gap-6">
          {/* Zone 1: Logo + Clean Wordmark */}
          <Link
            to="/"
            className="flex items-center gap-2.5 font-serif text-base sm:text-lg font-bold tracking-tight text-navy-900 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 rounded"
          >
            <img
              src="/assets/aistudio/logo_cuco_b0a9ab8b.jpg"
              alt="Logo Credit Union"
              referrerPolicy="no-referrer"
              className="h-9 w-9 sm:h-10 sm:w-10 object-contain shrink-0 rounded-md"
            />
            <span>{siteSettings.cooperativeName}</span>
          </Link>

          {/* Zone 2: 5 Concise Single-Line Nav Items */}
          <nav
            aria-label="Navigasi Utama"
            className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600"
          >
            <Link
              to="/"
              className={`whitespace-nowrap shrink-0 py-1 transition-colors hover:text-navy-900 ${
                isActive('/')
                  ? 'text-navy-900 font-semibold border-b-2 border-gold-500'
                  : ''
              }`}
            >
              Beranda
            </Link>

            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenDropdown((prev) =>
                    prev === 'profil' ? null : 'profil'
                  )
                }
                aria-expanded={openDropdown === 'profil'}
                className={`flex items-center gap-1 whitespace-nowrap shrink-0 py-1 transition-colors hover:text-navy-900 ${
                  ['/profil', '/cara-bergabung', '/hubungi-kami'].includes(
                    location.pathname
                  )
                    ? 'text-navy-900 font-semibold border-b-2 border-gold-500'
                    : ''
                }`}
              >
                <span>Profil</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {openDropdown === 'profil' && (
                <div className="absolute left-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50">
                  <Link
                    to="/profil"
                    className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-navy-900"
                  >
                    Profil Kami
                  </Link>
                  <Link
                    to="/cara-bergabung"
                    className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-navy-900"
                  >
                    Cara Bergabung
                  </Link>
                  <Link
                    to="/hubungi-kami"
                    className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-navy-900"
                  >
                    Hubungi Kami
                  </Link>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setOpenDropdown((prev) =>
                    prev === 'produk' ? null : 'produk'
                  )
                }
                aria-expanded={openDropdown === 'produk'}
                className={`flex items-center gap-1 whitespace-nowrap shrink-0 py-1 transition-colors hover:text-navy-900 ${
                  ['/produk', '/produk-anggota', '/cara-memesan'].includes(
                    location.pathname
                  )
                    ? 'text-navy-900 font-semibold border-b-2 border-gold-500'
                    : ''
                }`}
              >
                <span>Produk</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {openDropdown === 'produk' && (
                <div className="absolute left-0 top-full mt-2 w-60 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50">
                  <Link
                    to="/produk"
                    className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-navy-900"
                  >
                    Produk Simpan Pinjam
                  </Link>
                  <Link
                    to="/produk-anggota"
                    className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-navy-900"
                  >
                    Produk UMKM Anggota
                  </Link>
                  <Link
                    to="/cara-memesan"
                    className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-navy-900"
                  >
                    Cara Memesan Produk
                  </Link>
                </div>
              )}
            </div>

            <Link
              to="/berita"
              className={`whitespace-nowrap shrink-0 py-1 transition-colors hover:text-navy-900 ${
                location.pathname.startsWith('/berita')
                  ? 'text-navy-900 font-semibold border-b-2 border-gold-500'
                  : ''
              }`}
            >
              Berita
            </Link>

            <Link
              to="/galeri"
              className={`whitespace-nowrap shrink-0 py-1 transition-colors hover:text-navy-900 ${
                isActive('/galeri')
                  ? 'text-navy-900 font-semibold border-b-2 border-gold-500'
                  : ''
              }`}
            >
              Galeri
            </Link>
          </nav>

          {/* Zone 3: 1 Primary Action + Mobile Menu Toggle */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/cara-bergabung"
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 bg-navy-900 text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-navy-800 transition-colors whitespace-nowrap shrink-0"
            >
              Gabung Anggota
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
              aria-expanded={mobileMenuOpen}
              className="lg:hidden p-2.5 rounded-lg border border-slate-200 text-navy-900 hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-1 max-h-[80vh] overflow-y-auto">
            {[
              { to: '/', label: 'Beranda' },
              { to: '/profil', label: 'Profil Kami' },
              { to: '/produk', label: 'Produk Simpan Pinjam' },
              { to: '/produk-anggota', label: 'Produk-Produk Anggota' },
              { to: '/berita', label: 'Berita & Informasi' },
              { to: '/galeri', label: 'Galeri Foto & Video' },
              { to: '/cara-memesan', label: 'Cara Memesan Produk' },
              { to: '/cara-bergabung', label: 'Cara Bergabung' },
              { to: '/hubungi-kami', label: 'Hubungi Kami' },
              { to: '/admin', label: 'Panel Pengelola Website' },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`block px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.to)
                    ? 'bg-navy-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-2 mt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setSeniorMode((prev) => !prev)}
                aria-pressed={seniorMode}
                className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm font-semibold transition-colors ${
                  seniorMode
                    ? 'bg-gold-500 text-navy-950'
                    : 'bg-slate-100 text-navy-900 hover:bg-slate-200'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Eye className="w-4 h-4 shrink-0" />
                  <span>Mode Lansia (Huruf Standar Besar)</span>
                </span>
                <span>{seniorMode ? 'Aktif' : 'Nonaktif'}</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Slim Announcement Banner (Non-sticky, <= 40px) */}
      {siteSettings.showAnnouncement &&
        siteSettings.importantAnnouncement &&
        !dismissedAnnouncement && (
          <div className="bg-navy-950 text-slate-100 border-b border-navy-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center gap-3 text-xs sm:text-sm">
              <span className="font-semibold text-gold-400 whitespace-nowrap shrink-0">
                Pengumuman Resmi:
              </span>
              <div className="flex-1 overflow-hidden marquee-container">
                <div className="animate-marquee-left">
                  <span className="marquee-primary whitespace-nowrap pr-8">
                    {siteSettings.importantAnnouncement}
                  </span>
                  <span
                    aria-hidden="true"
                    className="marquee-duplicate whitespace-nowrap pr-8"
                  >
                    {siteSettings.importantAnnouncement}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDismissedAnnouncement(true)}
                aria-label="Tutup pengumuman"
                className="text-slate-400 hover:text-white shrink-0 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      {/* Main Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Complete Institutional Footer */}
      <footer className="bg-navy-950 text-slate-300 border-t border-navy-900 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-white rounded-lg p-1 h-10 w-10 shrink-0 flex items-center justify-center">
                  <img
                    src="/assets/aistudio/logo_cuco_b0a9ab8b.jpg"
                    alt="Logo Credit Union"
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-contain"
                  />
                </div>
                <h2 className="font-serif text-lg font-semibold text-white">
                  {siteSettings.cooperativeName}
                </h2>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                {siteSettings.tagline}
              </p>
              <div className="space-y-2.5 text-sm text-slate-300">
                <p className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                  <span>{siteSettings.address}</span>
                </p>
                <p className="text-xs text-slate-400">
                  {siteSettings.serviceHours}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white mb-4">
                Layanan & Produk
              </h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link to="/" className="hover:text-gold-400 transition-colors">
                    Beranda
                  </Link>
                </li>
                <li>
                  <Link
                    to="/profil"
                    className="hover:text-gold-400 transition-colors"
                  >
                    Profil Kami
                  </Link>
                </li>
                <li>
                  <Link
                    to="/produk"
                    className="hover:text-gold-400 transition-colors"
                  >
                    Produk Simpan Pinjam
                  </Link>
                </li>
                <li>
                  <Link
                    to="/produk-anggota"
                    className="hover:text-gold-400 transition-colors"
                  >
                    Produk-Produk Anggota
                  </Link>
                </li>
                <li>
                  <Link
                    to="/cara-memesan"
                    className="hover:text-gold-400 transition-colors"
                  >
                    Cara Memesan Produk
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white mb-4">
                Informasi & Keanggotaan
              </h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link
                    to="/berita"
                    className="hover:text-gold-400 transition-colors"
                  >
                    Berita & Pengumuman
                  </Link>
                </li>
                <li>
                  <Link
                    to="/galeri"
                    className="hover:text-gold-400 transition-colors"
                  >
                    Galeri Foto & Video
                  </Link>
                </li>
                <li>
                  <Link
                    to="/cara-bergabung"
                    className="hover:text-gold-400 transition-colors"
                  >
                    Cara Bergabung Anggota
                  </Link>
                </li>
                <li>
                  <Link
                    to="/hubungi-kami"
                    className="hover:text-gold-400 transition-colors"
                  >
                    Hubungi Kami
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin"
                    className="text-gold-400 hover:text-gold-300 transition-colors"
                  >
                    Login Pengelola Website
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white mb-4">
                Komunikasi Resmi
              </h3>
              <div className="space-y-3 text-sm">
                <a
                  href={formatWhatsappHref(
                    siteSettings.whatsappNumber,
                    'Halo Pengurus KSP CU Argomanunggal Santosa, saya ingin menanyakan informasi layanan koperasi.'
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 hover:text-gold-400 transition-colors"
                >
                  <Phone className="w-4 h-4 text-gold-400 shrink-0" />
                  <span className="tabular-nums">
                    +{siteSettings.whatsappNumber.replace(/[^0-9]/g, '')}
                  </span>
                </a>
                {siteSettings.email && (
                  <a
                    href={`mailto:${siteSettings.email}`}
                    className="flex items-center gap-2.5 hover:text-gold-400 transition-colors break-all"
                  >
                    <Mail className="w-4 h-4 text-gold-400 shrink-0" />
                    <span>{siteSettings.email}</span>
                  </a>
                )}
              </div>

              <div className="mt-6 pt-5 border-t border-navy-800 flex flex-wrap gap-4 text-xs font-medium">
                {siteSettings.socialLinks?.instagram && (
                  <a
                    href={siteSettings.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gold-400 transition-colors"
                  >
                    Instagram
                  </a>
                )}
                {siteSettings.socialLinks?.facebook && (
                  <a
                    href={siteSettings.socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gold-400 transition-colors"
                  >
                    Facebook
                  </a>
                )}
                {siteSettings.socialLinks?.youtube && (
                  <a
                    href={siteSettings.socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-gold-400 transition-colors"
                  >
                    YouTube
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-5 border-t border-navy-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <p>
              © {new Date().getFullYear()} {siteSettings.cooperativeName}. Seluruh
              hak cipta dilindungi.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => setSeniorMode((prev) => !prev)}
                aria-pressed={seniorMode}
                className="inline-flex items-center gap-1.5 text-gold-400 hover:text-gold-300 font-semibold transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>
                  Mode Lansia: {seniorMode ? 'Aktif (Huruf Standar)' : 'Nonaktif'}
                </span>
              </button>
              <span>Jali, Gayamharjo, Prambanan, Sleman, Yogyakarta 55572</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Accessibility Mode Lansia Toggle */}
      <button
        type="button"
        onClick={() => setSeniorMode((prev) => !prev)}
        aria-pressed={seniorMode}
        title="Aktifkan huruf standar besar & kontras tinggi untuk lansia"
        className={`fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border-2 text-xs sm:text-sm font-semibold shadow-lg transition-colors min-h-[44px] ${
          seniorMode
            ? 'bg-gold-500 border-navy-950 text-navy-950 hover:bg-gold-400'
            : 'bg-navy-900 border-gold-500 text-white hover:bg-navy-800'
        }`}
      >
        <Eye className="w-4 h-4 shrink-0" />
        <span>{seniorMode ? 'Mode Lansia: Aktif' : 'Mode Lansia'}</span>
      </button>
    </div>
  );
};
