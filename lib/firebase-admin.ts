import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth } from 'firebase-admin/auth';
import path from 'path';
import fs from 'fs';

let adminApp: App | undefined;
let adminDb: Firestore | undefined;
let adminAuth: Auth | undefined;

function initAdmin() {
  if (getApps().length === 0) {
    // Try to load service account from file first
    const serviceAccountPath = path.join(process.cwd(), 'flashcard-firebase-adminsdk.json');

    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));
      adminApp = initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id,
      });
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      // Fallback to env variable
      adminApp = initializeApp({
        credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    } else {
      throw new Error('Firebase Admin: No service account found');
    }
  } else {
    adminApp = getApps()[0];
  }

  adminDb = getFirestore(adminApp);
  adminAuth = getAuth(adminApp);
  return { adminApp, adminDb, adminAuth };
}

export function getAdminDb(): Firestore {
  if (!adminDb) {
    initAdmin();
  }
  return adminDb!;
}

export function getAdminAuth(): Auth {
  if (!adminAuth) {
    initAdmin();
  }
  return adminAuth!;
}

// Validate userId exists in Firebase Auth
export async function validateUserId(userId: string): Promise<boolean> {
  try {
    const auth = getAdminAuth();
    await auth.getUser(userId);
    return true;
  } catch {
    return false;
  }
}

export { adminApp, adminDb, adminAuth };
