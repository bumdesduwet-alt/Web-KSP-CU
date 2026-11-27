import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  LogIn,
  LogOut,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import firebaseConfig from '../../../firebase-applet-config.json';
import { useAuth } from '../../context/AuthContext';
import { useSiteData } from '../../context/SiteDataContext';

export const AdminLoginScreen: React.FC = () => {
  const {
    user,
    isAdmin,
    loading,
    authError,
    authErrorCode,
    loginWithGoogle,
    loginWithRedirect,
    logout,
  } = useAuth();
  const { siteSettings } = useSiteData();
  const [copiedDomain, setCopiedDomain] = useState(false);

  const currentHost =
    typeof window !== 'undefined' ? window.location.hostname : '';
  const firebaseAuthSettingsUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/settings`;

  const handleCopyDomain = async () => {
    if (!currentHost || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(currentHost);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2000);
    } catch {
      // Abaikan jika clipboard ditolak browser
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-xl space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-gold-600">
            <ShieldCheck className="w-4 h-4" />
            <span>Panel Pengelola Website</span>
          </div>
          <h1 className="font-serif text-2xl font-semibold text-navy-900">
            {siteSettings.cooperativeName}
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Masuk menggunakan akun Google administrator terverifikasi untuk mengelola profil koperasi, produk, berita, komentar, galeri, dan pesan masuk.
          </p>
        </div>

        {authError && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 space-y-3">
            <p className="font-semibold leading-relaxed">{authError}</p>

            {authErrorCode === 'auth/unauthorized-domain' && currentHost && (
              <div className="pt-2 border-t border-red-200 space-y-2 text-red-800">
                <p className="font-semibold">
                  Cara Mengaktifkan Login di Domain Netlify:
                </p>
                <ol className="list-decimal list-inside space-y-1 leading-relaxed">
                  <li>
                    Salin domain website ini:{' '}
                    <span className="font-mono font-semibold bg-white px-1.5 py-0.5 rounded border border-red-200">
                      {currentHost}
                    </span>
                  </li>
                  <li>
                    Buka <strong>Firebase Console &rarr; Authentication &rarr; Settings &rarr; Authorized domains</strong>.
                  </li>
                  <li>
                    Klik <strong>Add domain</strong>, tempel domain tersebut, lalu simpan dan muat ulang halaman ini.
                  </li>
                </ol>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => void handleCopyDomain()}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-red-300 rounded-lg font-semibold text-red-900 hover:bg-red-100/50"
                  >
                    {copiedDomain ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Domain</span>
                      </>
                    )}
                  </button>
                  <a
                    href={firebaseAuthSettingsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-800 text-white rounded-lg font-semibold hover:bg-red-900"
                  >
                    <span>Buka Firebase Auth Settings</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="py-6 text-center text-sm text-slate-500">
            Memeriksa sesi autentikasi...
          </div>
        ) : user && !isAdmin ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-1.5">
              <div className="flex items-center gap-2 text-amber-900 text-sm font-semibold">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Akses Administrator Ditolak</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                Akun <strong>{user.email}</strong> tidak terdaftar sebagai pengelola resmi website koperasi. Silakan keluar dan masuk menggunakan akun administrator yang berwenang.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void logout()}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-navy-900 text-white text-sm font-semibold rounded-lg hover:bg-navy-800"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar dari Akun Ini</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => void loginWithGoogle()}
              className="w-full inline-flex items-center justify-center gap-2.5 px-5 py-3 bg-navy-900 text-white text-sm font-semibold rounded-lg hover:bg-navy-800 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk dengan Akun Google Admin</span>
            </button>
            {authErrorCode === 'auth/popup-blocked' && (
              <button
                type="button"
                onClick={() => void loginWithRedirect()}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-300 text-navy-900 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors"
              >
                <span>Alternatif: Masuk Mode Redirect (Tanpa Popup)</span>
              </button>
            )}
          </div>
        )}

        <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-slate-600 hover:text-navy-900 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Website Publik</span>
          </Link>
          <span className="text-slate-400">Akses Terproteksi</span>
        </div>
      </div>
    </div>
  );
};
