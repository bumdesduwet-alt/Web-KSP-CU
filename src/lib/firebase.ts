import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDocFromServer, getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const BOOTSTRAP_ADMIN_EMAIL = 'bumdesduwet@gmail.com';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

void testConnection();

// Blueprint validation constants synced with firebase-blueprint.json & firestore.rules
export const FIELD_LIMITS = {
  NAME_MAX: 120,
  PRODUCT_NAME_MAX: 140,
  SHORT_TEXT_MAX: 160,
  ADDRESS_MAX: 300,
  PHONE_MIN: 8,
  PHONE_MAX: 25,
  COMMENT_MAX: 1000,
  MESSAGE_MAX: 2000,
  DESCRIPTION_MAX: 2500,
  CONTENT_MAX: 15000,
  IMAGE_DATA_MAX: 250000,
  MEDIA_DATA_MAX: 650000,
  SAFE_TEXT_REGEX: /^[^<>]+$/,
  PHONE_REGEX: /^[0-9+\-\s]+$/,
  SLUG_REGEX: /^[a-z0-9-]+$/,
};

export function sanitizePlainText(input: string): string {
  return input.replace(/[<>]/g, '').trim();
}

export function slugify(text: string): string {
  const cleaned = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  return cleaned || `item-${Date.now()}`;
}

export function formatWhatsappHref(phone: string, text?: string): string {
  const digits = phone.replace(/[^0-9]/g, '');
  const normalized = digits.startsWith('0') ? `62${digits.slice(1)}` : digits;
  const query = text ? `?text=${encodeURIComponent(text)}` : '';
  return `https://wa.me/${normalized}${query}`;
}
