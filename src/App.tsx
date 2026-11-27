import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PublicLayout } from './components/PublicLayout';
import { AuthProvider } from './context/AuthContext';
import { SiteDataProvider } from './context/SiteDataContext';
import { ContactPage } from './pages/ContactPage';
import { GalleryPage } from './pages/GalleryPage';
import { HomePage } from './pages/HomePage';
import { HowToOrderPage } from './pages/HowToOrderPage';
import { JoinPage } from './pages/JoinPage';
import { MemberProductsPage } from './pages/MemberProductsPage';
import { NewsDetailPage } from './pages/NewsDetailPage';
import { NewsPage } from './pages/NewsPage';
import { ProductsPage } from './pages/ProductsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <SiteDataProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/profil" element={<ProfilePage />} />
                <Route path="/produk" element={<ProductsPage />} />
                <Route path="/produk-anggota" element={<MemberProductsPage />} />
                <Route path="/berita" element={<NewsPage />} />
                <Route path="/berita/:slug" element={<NewsDetailPage />} />
                <Route path="/galeri" element={<GalleryPage />} />
                <Route path="/cara-memesan" element={<HowToOrderPage />} />
                <Route path="/cara-bergabung" element={<JoinPage />} />
                <Route path="/hubungi-kami" element={<ContactPage />} />
              </Route>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </SiteDataProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
