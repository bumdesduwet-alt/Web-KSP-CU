import { Timestamp } from 'firebase/firestore';

export interface CooperativeStat {
  label: string;
  value: string;
  unit: string;
  period: string;
}

export interface SocialLinks {
  instagram: string;
  facebook: string;
  youtube: string;
}

export interface SiteSettings {
  cooperativeName: string;
  tagline: string;
  welcomeTitle: string;
  welcomeMessage: string;
  heroImageUrl: string;
  importantAnnouncement: string;
  showAnnouncement: boolean;
  address: string;
  whatsappNumber: string;
  email: string;
  serviceHours: string;
  socialLinks: SocialLinks;
  stats: CooperativeStat[];
  updatedAt?: Timestamp | null;
}

export interface CooperativeValue {
  title: string;
  description: string;
}

export interface BoardMember {
  name: string;
  role: string;
  group: 'Pengurus' | 'Pengawas' | 'Pengelola';
  bio: string;
}

export interface CooperativeProfile {
  history: string;
  vision: string;
  missions: string[];
  values: CooperativeValue[];
  principles: string[];
  objectives: string[];
  orgStructureSummary: string;
  officePhotos: string[];
  boardMembers: BoardMember[];
  updatedAt?: Timestamp | null;
}

export interface JoinStep {
  stepNumber: number;
  title: string;
  description: string;
}

export interface JoinGuide {
  benefits: string[];
  requirements: string[];
  steps: JoinStep[];
  documents: string[];
  contactPersonName: string;
  contactPersonRole: string;
  contactWhatsapp: string;
  updatedAt?: Timestamp | null;
}

export interface CooperativeProduct {
  id: string;
  category: 'simpanan' | 'pinjaman';
  subType: string;
  name: string;
  imageUrl: string;
  description: string;
  requirements: string;
  terms: string;
  benefits: string;
  isPublished: boolean;
  sortOrder: number;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export interface MemberCategory {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  createdAt?: Timestamp | null;
}

export interface MemberProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  imageUrl: string;
  ownerName: string;
  businessName: string;
  description: string;
  location: string;
  whatsappNumber: string;
  isFeatured: boolean;
  status: 'approved' | 'pending' | 'hidden';
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export interface MemberProductSubmission {
  id: string;
  ownerName: string;
  businessName: string;
  productName: string;
  category: string;
  price: number;
  unit: string;
  description: string;
  location: string;
  whatsappNumber: string;
  imageUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: Timestamp | null;
}

export type NewsCategory =
  | 'Berita Koperasi'
  | 'Pengumuman'
  | 'Kegiatan Anggota'
  | 'Pendidikan dan Pelatihan'
  | 'Informasi Usaha'
  | 'Informasi Lainnya';

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  category: NewsCategory;
  coverImageUrl: string;
  author: string;
  excerpt: string;
  content: string;
  supportingImages: string[];
  isPublished: boolean;
  isImportant: boolean;
  publishedAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export interface NewsComment {
  id: string;
  articleId: string;
  authorName: string;
  content: string;
  status: 'pending' | 'approved' | 'hidden';
  boardReply: string;
  boardReplyAuthor: string;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export interface GalleryItem {
  id: string;
  type: 'photo' | 'video';
  title: string;
  caption: string;
  category: string;
  activityDate: string;
  mediaUrl: string;
  thumbnailUrl: string;
  isPublished: boolean;
  createdAt?: Timestamp | null;
}

export interface Testimonial {
  id: string;
  memberName: string;
  memberRole: string;
  quote: string;
  isPublished: boolean;
  sortOrder: number;
  createdAt?: Timestamp | null;
}

export interface JoinInquiry {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  message: string;
  status: 'baru' | 'dihubungi' | 'selesai';
  adminNotes: string;
  createdAt?: Timestamp | null;
}

export interface ContactMessage {
  id: string;
  senderName: string;
  senderContact: string;
  subject: string;
  message: string;
  status: 'baru' | 'dibaca' | 'dibalas';
  createdAt?: Timestamp | null;
}

export interface VisitLog {
  id: string;
  page: string;
  createdAt?: Timestamp | null;
}

export interface AdminUser {
  id: string;
  email: string;
  displayName: string;
  role: 'admin' | 'super_admin';
  createdAt?: Timestamp | null;
}
