import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User } from '@/types';
import { DEFAULT_USER_SETTINGS, toUser, UserDocument } from '@/models/user';

const googleProvider = new GoogleAuthProvider();

function getAuth() {
  if (!auth) throw new Error('Firebase Auth not initialized');
  return auth;
}

function getDb() {
  if (!db) throw new Error('Firebase Firestore not initialized');
  return db;
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<FirebaseUser> {
  const { user } = await createUserWithEmailAndPassword(getAuth(), email, password);
  await updateProfile(user, { displayName });
  await createUserDocument(user);
  return user;
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<FirebaseUser> {
  const { user } = await signInWithEmailAndPassword(getAuth(), email, password);
  return user;
}

export async function signInWithGoogle(): Promise<FirebaseUser> {
  const { user } = await signInWithPopup(getAuth(), googleProvider);
  const userDoc = await getDoc(doc(getDb(), 'users', user.uid));
  if (!userDoc.exists()) {
    await createUserDocument(user);
  }
  return user;
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(getAuth());
}

export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

async function createUserDocument(user: FirebaseUser): Promise<void> {
  const userDoc: UserDocument = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    role: 'user',
    createdAt: Timestamp.now(),
    settings: DEFAULT_USER_SETTINGS,
  };

  await setDoc(doc(getDb(), 'users', user.uid), userDoc);
}

export async function getUserData(uid: string): Promise<User | null> {
  if (!db) return null;
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (!userDoc.exists()) return null;
  return toUser(userDoc.data() as UserDocument);
}

export async function updateUserSettings(
  uid: string,
  settings: Partial<User['settings']>
): Promise<void> {
  const userRef = doc(getDb(), 'users', uid);
  const userDoc = await getDoc(userRef);
  if (userDoc.exists()) {
    const currentSettings = userDoc.data().settings;
    await setDoc(userRef, { settings: { ...currentSettings, ...settings } }, { merge: true });
  }
}
