import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import {
  INITIAL_COOPERATIVE_PRODUCTS,
  INITIAL_COOPERATIVE_PROFILE,
  INITIAL_GALLERY_ITEMS,
  INITIAL_JOIN_GUIDE,
  INITIAL_MEMBER_CATEGORIES,
  INITIAL_MEMBER_PRODUCTS,
  INITIAL_NEWS_ARTICLES,
  INITIAL_SITE_SETTINGS,
  INITIAL_TESTIMONIALS,
} from '../data/initialCooperativeData';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  CooperativeProduct,
  CooperativeProfile,
  GalleryItem,
  JoinGuide,
  MemberCategory,
  MemberProduct,
  NewsArticle,
  SiteSettings,
  Testimonial,
} from '../types';

interface SiteDataContextValue {
  siteSettings: SiteSettings;
  cooperativeProfile: CooperativeProfile;
  joinGuide: JoinGuide;
  cooperativeProducts: CooperativeProduct[];
  memberCategories: MemberCategory[];
  memberProducts: MemberProduct[];
  newsArticles: NewsArticle[];
  galleryItems: GalleryItem[];
  testimonials: Testimonial[];
  loading: boolean;
  isSeeded: boolean;
  refreshPublicData: () => Promise<void>;
  seedInitialData: () => Promise<void>;
  logPageVisit: (pagePath: string) => Promise<void>;
}

const SiteDataContext = createContext<SiteDataContextValue | undefined>(
  undefined
);

function mapInitialCoopProducts(): CooperativeProduct[] {
  return INITIAL_COOPERATIVE_PRODUCTS.map((item, idx) => ({
    ...item,
    id: `init-coop-${idx + 1}`,
  }));
}

function mapInitialCategories(): MemberCategory[] {
  return INITIAL_MEMBER_CATEGORIES.map((item, idx) => ({
    ...item,
    id: `init-cat-${idx + 1}`,
  }));
}

function mapInitialMemberProducts(): MemberProduct[] {
  return INITIAL_MEMBER_PRODUCTS.map((item, idx) => ({
    ...item,
    id: `init-mp-${idx + 1}`,
  }));
}

function mapInitialNews(): NewsArticle[] {
  return INITIAL_NEWS_ARTICLES.map((item, idx) => ({
    ...item,
    id: `init-news-${idx + 1}`,
  }));
}

function mapInitialGallery(): GalleryItem[] {
  return INITIAL_GALLERY_ITEMS.map((item, idx) => ({
    ...item,
    id: `init-gal-${idx + 1}`,
  }));
}

function mapInitialTestimonials(): Testimonial[] {
  return INITIAL_TESTIMONIALS.map((item, idx) => ({
    ...item,
    id: `init-testi-${idx + 1}`,
  }));
}

export const SiteDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(
    INITIAL_SITE_SETTINGS
  );
  const [cooperativeProfile, setCooperativeProfile] =
    useState<CooperativeProfile>(INITIAL_COOPERATIVE_PROFILE);
  const [joinGuide, setJoinGuide] = useState<JoinGuide>(INITIAL_JOIN_GUIDE);
  const [cooperativeProducts, setCooperativeProducts] = useState<
    CooperativeProduct[]
  >(mapInitialCoopProducts);
  const [memberCategories, setMemberCategories] = useState<MemberCategory[]>(
    mapInitialCategories
  );
  const [memberProducts, setMemberProducts] = useState<MemberProduct[]>(
    mapInitialMemberProducts
  );
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>(
    mapInitialNews
  );
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(
    mapInitialGallery
  );
  const [testimonials, setTestimonials] = useState<Testimonial[]>(
    mapInitialTestimonials
  );
  const [loading, setLoading] = useState(true);
  const [isSeeded, setIsSeeded] = useState(false);

  const refreshPublicData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        settingsSnap,
        profileSnap,
        joinSnap,
        coopProdSnap,
        catSnap,
        memberProdSnap,
        newsSnap,
        galSnap,
        testiSnap,
      ] = await Promise.all([
        getDoc(doc(db, 'siteSettings', 'main')),
        getDoc(doc(db, 'cooperativeProfile', 'main')),
        getDoc(doc(db, 'joinGuide', 'main')),
        getDocs(
          query(
            collection(db, 'cooperativeProducts'),
            where('isPublished', '==', true)
          )
        ),
        getDocs(collection(db, 'memberCategories')),
        getDocs(
          query(
            collection(db, 'memberProducts'),
            where('status', '==', 'approved')
          )
        ),
        getDocs(
          query(
            collection(db, 'newsArticles'),
            where('isPublished', '==', true)
          )
        ),
        getDocs(
          query(
            collection(db, 'galleryItems'),
            where('isPublished', '==', true)
          )
        ),
        getDocs(
          query(
            collection(db, 'testimonials'),
            where('isPublished', '==', true)
          )
        ),
      ]);

      setIsSeeded(settingsSnap.exists());

      if (settingsSnap.exists()) {
        setSiteSettings(settingsSnap.data() as SiteSettings);
      }
      if (profileSnap.exists()) {
        setCooperativeProfile(profileSnap.data() as CooperativeProfile);
      }
      if (joinSnap.exists()) {
        setJoinGuide(joinSnap.data() as JoinGuide);
      }

      if (!coopProdSnap.empty || settingsSnap.exists()) {
        const list = coopProdSnap.docs
          .map((d) => ({ id: d.id, ...d.data() }) as CooperativeProduct)
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
        setCooperativeProducts(list);
      }

      if (!catSnap.empty || settingsSnap.exists()) {
        const list = catSnap.docs
          .map((d) => ({ id: d.id, ...d.data() }) as MemberCategory)
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
        setMemberCategories(list);
      }

      if (!memberProdSnap.empty || settingsSnap.exists()) {
        const list = memberProdSnap.docs
          .map((d) => ({ id: d.id, ...d.data() }) as MemberProduct)
          .sort((a, b) => {
            const ta = a.createdAt?.toMillis?.() ?? 0;
            const tb = b.createdAt?.toMillis?.() ?? 0;
            return tb - ta;
          });
        setMemberProducts(list);
      }

      if (!newsSnap.empty || settingsSnap.exists()) {
        const list = newsSnap.docs
          .map((d) => ({ id: d.id, ...d.data() }) as NewsArticle)
          .sort((a, b) => {
            const ta = a.publishedAt?.toMillis?.() ?? 0;
            const tb = b.publishedAt?.toMillis?.() ?? 0;
            return tb - ta;
          });
        setNewsArticles(list);
      }

      if (!galSnap.empty || settingsSnap.exists()) {
        const list = galSnap.docs
          .map((d) => ({ id: d.id, ...d.data() }) as GalleryItem)
          .sort((a, b) => b.activityDate.localeCompare(a.activityDate));
        setGalleryItems(list);
      }

      if (!testiSnap.empty || settingsSnap.exists()) {
        const list = testiSnap.docs
          .map((d) => ({ id: d.id, ...d.data() }) as Testimonial)
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
        setTestimonials(list);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'publicSiteData');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshPublicData();
  }, [refreshPublicData]);

  const seedInitialData = useCallback(async () => {
    try {
      const batch = writeBatch(db);
      const now = serverTimestamp();

      batch.set(doc(db, 'siteSettings', 'main'), {
        ...INITIAL_SITE_SETTINGS,
        updatedAt: now,
      });

      batch.set(doc(db, 'cooperativeProfile', 'main'), {
        ...INITIAL_COOPERATIVE_PROFILE,
        updatedAt: now,
      });

      batch.set(doc(db, 'joinGuide', 'main'), {
        ...INITIAL_JOIN_GUIDE,
        updatedAt: now,
      });

      INITIAL_COOPERATIVE_PRODUCTS.forEach((item, idx) => {
        batch.set(doc(db, 'cooperativeProducts', `coop-prod-${idx + 1}`), {
          ...item,
          createdAt: now,
          updatedAt: now,
        });
      });

      INITIAL_MEMBER_CATEGORIES.forEach((item, idx) => {
        batch.set(doc(db, 'memberCategories', `member-cat-${idx + 1}`), {
          ...item,
          createdAt: now,
        });
      });

      INITIAL_MEMBER_PRODUCTS.forEach((item, idx) => {
        batch.set(doc(db, 'memberProducts', `member-prod-${idx + 1}`), {
          ...item,
          createdAt: now,
          updatedAt: now,
        });
      });

      INITIAL_NEWS_ARTICLES.forEach((item, idx) => {
        batch.set(doc(db, 'newsArticles', `news-article-${idx + 1}`), {
          ...item,
          publishedAt: now,
          updatedAt: now,
        });
      });

      INITIAL_GALLERY_ITEMS.forEach((item, idx) => {
        batch.set(doc(db, 'galleryItems', `gallery-item-${idx + 1}`), {
          ...item,
          createdAt: now,
        });
      });

      INITIAL_TESTIMONIALS.forEach((item, idx) => {
        batch.set(doc(db, 'testimonials', `testimonial-${idx + 1}`), {
          ...item,
          createdAt: now,
        });
      });

      await batch.commit();
      await refreshPublicData();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'seedInitialData');
    }
  }, [refreshPublicData]);

  const logPageVisit = useCallback(async (pagePath: string) => {
    const cleanPath = (pagePath.split('?')[0] || '/').toLowerCase();
    if (!/^\/[a-z0-9\-/]*$/.test(cleanPath) || cleanPath.startsWith('/admin')) {
      return;
    }
    const sessionKey = `visited_${cleanPath}`;
    if (sessionStorage.getItem(sessionKey)) {
      return;
    }
    sessionStorage.setItem(sessionKey, '1');
    try {
      const logId = `v-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      await setDoc(doc(db, 'visitLogs', logId), {
        page: cleanPath.slice(0, 100),
        createdAt: serverTimestamp(),
      });
    } catch {
      // Non-critical analytics write should not interrupt visitor browsing
    }
  }, []);

  return (
    <SiteDataContext.Provider
      value={{
        siteSettings,
        cooperativeProfile,
        joinGuide,
        cooperativeProducts,
        memberCategories,
        memberProducts,
        newsArticles,
        galleryItems,
        testimonials,
        loading,
        isSeeded,
        refreshPublicData,
        seedInitialData,
        logPageVisit,
      }}
    >
      {children}
    </SiteDataContext.Provider>
  );
};

export function useSiteData(): SiteDataContextValue {
  const ctx = useContext(SiteDataContext);
  if (!ctx) {
    throw new Error('useSiteData must be used within SiteDataProvider');
  }
  return ctx;
}
