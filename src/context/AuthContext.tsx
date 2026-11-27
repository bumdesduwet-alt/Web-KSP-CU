import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import {
  auth,
  BOOTSTRAP_ADMIN_EMAIL,
  db,
  googleProvider,
} from '../lib/firebase';

interface AuthContextValue {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  authError: string | null;
  authErrorCode: string | null;
  loginWithGoogle: () => Promise<void>;
  loginWithRedirect: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function extractFirebaseAuthError(err: unknown): {
  code: string | null;
  message: string;
} {
  const code =
    typeof err === 'object' && err !== null && 'code' in err
      ? String((err as { code?: unknown }).code || '')
      : '';
  const hostname =
    typeof window !== 'undefined' ? window.location.hostname : '';

  switch (code) {
    case 'auth/unauthorized-domain':
      return {
        code,
        message: `Domain "${hostname}" belum diizinkan pada Firebase Authentication (auth/unauthorized-domain).`,
      };
    case 'auth/popup-blocked':
      return {
        code,
        message:
          'Jendela popup login Google diblokir oleh browser. Izinkan popup atau gunakan tombol alternatif di bawah.',
      };
    case 'auth/popup-closed-by-user':
      return {
        code,
        message:
          'Jendela login Google ditutup sebelum proses selesai. Silakan coba lagi.',
      };
    case 'auth/cancelled-popup-request':
      return {
        code,
        message:
          'Permintaan login sebelumnya dibatalkan. Silakan klik masuk sekali lagi.',
      };
    case 'auth/network-request-failed':
      return {
        code,
        message:
          'Koneksi internet bermasalah saat menghubungi Firebase Authentication.',
      };
    case 'auth/operation-not-allowed':
      return {
        code,
        message:
          'Provider Google Sign-In belum diaktifkan di Firebase Authentication.',
      };
    default:
      return {
        code: code || null,
        message:
          err instanceof Error
            ? err.message
            : 'Gagal masuk dengan akun Google.',
      };
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authErrorCode, setAuthErrorCode] = useState<string | null>(null);

  useEffect(() => {
    void getRedirectResult(auth).catch((err) => {
      const parsed = extractFirebaseAuthError(err);
      setAuthError(parsed.message);
      setAuthErrorCode(parsed.code);
    });

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (!firebaseUser) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      if (!firebaseUser.emailVerified) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      if (
        firebaseUser.email?.toLowerCase() ===
        BOOTSTRAP_ADMIN_EMAIL.toLowerCase()
      ) {
        setIsAdmin(true);
        setLoading(false);
        return;
      }

      try {
        const adminSnap = await getDoc(doc(db, 'admins', firebaseUser.uid));
        setIsAdmin(adminSnap.exists());
      } catch {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setAuthError(null);
    setAuthErrorCode(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const parsed = extractFirebaseAuthError(err);
      setAuthError(parsed.message);
      setAuthErrorCode(parsed.code);
    }
  };

  const loginWithRedirect = async () => {
    setAuthError(null);
    setAuthErrorCode(null);
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (err) {
      const parsed = extractFirebaseAuthError(err);
      setAuthError(parsed.message);
      setAuthErrorCode(parsed.code);
    }
  };

  const logout = async () => {
    setAuthError(null);
    setAuthErrorCode(null);
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        loading,
        authError,
        authErrorCode,
        loginWithGoogle,
        loginWithRedirect,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
