import {
  collection,
  query,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  orderBy,
  limit,
  where,
  getCountFromServer,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User, UserRole, Deck } from '@/types';
import { toUser, UserDocument } from '@/models/user';

function getDb() {
  if (!db) throw new Error('Firebase Firestore not initialized');
  return db;
}

// User Management
export interface AdminUser extends User {
  isBanned: boolean;
  decksCount?: number;
  cardsCount?: number;
  lastActive?: Date;
}

export async function getAllUsers(limitCount: number = 50): Promise<AdminUser[]> {
  const usersRef = collection(getDb(), 'users');
  const q = query(usersRef, orderBy('createdAt', 'desc'), limit(limitCount));
  const snapshot = await getDocs(q);

  const users: AdminUser[] = [];
  for (const docSnap of snapshot.docs) {
    const userData = docSnap.data() as UserDocument;
    const user = toUser(userData);
    users.push({
      ...user,
      isBanned: userData.isBanned || false,
    });
  }

  return users;
}

export async function getUserById(userId: string): Promise<AdminUser | null> {
  const userDoc = await getDoc(doc(getDb(), 'users', userId));
  if (!userDoc.exists()) return null;

  const userData = userDoc.data() as UserDocument;
  const user = toUser(userData);

  // Get deck count
  const decksRef = collection(getDb(), 'decks');
  const decksQuery = query(decksRef, where('userId', '==', userId));
  const decksCount = await getCountFromServer(decksQuery);

  // Get cards count
  const cardsRef = collection(getDb(), 'cards');
  const cardsQuery = query(cardsRef, where('userId', '==', userId));
  const cardsCount = await getCountFromServer(cardsQuery);

  return {
    ...user,
    isBanned: (userData as { isBanned?: boolean }).isBanned || false,
    decksCount: decksCount.data().count,
    cardsCount: cardsCount.data().count,
  };
}

export async function updateUserRole(userId: string, role: UserRole): Promise<void> {
  const userRef = doc(getDb(), 'users', userId);
  await updateDoc(userRef, { role });
}

export async function banUser(userId: string, banned: boolean): Promise<void> {
  const userRef = doc(getDb(), 'users', userId);
  await updateDoc(userRef, { isBanned: banned });
}

// Deck Moderation
export type DeckStatus = 'pending' | 'approved' | 'rejected';

export interface PublicDeck extends Deck {
  ownerName: string | null;
  ownerEmail: string | null;
  status: DeckStatus;
}

export async function getPublicDecks(status?: DeckStatus): Promise<PublicDeck[]> {
  const decksRef = collection(getDb(), 'decks');
  let q = query(decksRef, where('isPublic', '==', true), orderBy('createdAt', 'desc'));

  if (status) {
    q = query(
      decksRef,
      where('isPublic', '==', true),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
  }

  const snapshot = await getDocs(q);
  const decks: PublicDeck[] = [];

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();

    // Get owner info
    const ownerDoc = await getDoc(doc(getDb(), 'users', data.userId));
    const ownerData = ownerDoc.exists() ? ownerDoc.data() : null;

    decks.push({
      id: docSnap.id,
      userId: data.userId,
      name: data.name,
      description: data.description,
      category: data.category,
      tags: data.tags || [],
      sourceLang: data.sourceLang,
      targetLang: data.targetLang,
      cardCount: data.cardCount || 0,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      ownerName: ownerData?.displayName || null,
      ownerEmail: ownerData?.email || null,
      status: data.status || 'pending',
    });
  }

  return decks;
}

export async function updateDeckStatus(deckId: string, status: DeckStatus): Promise<void> {
  const deckRef = doc(getDb(), 'decks', deckId);
  await updateDoc(deckRef, {
    status,
    moderatedAt: Timestamp.now(),
  });
}

// Admin Stats
export interface AdminStats {
  totalUsers: number;
  totalDecks: number;
  totalCards: number;
  totalStudySessions: number;
  pendingDecks: number;
  newUsersToday: number;
  activeUsersToday: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  const database = getDb();

  // Get counts using getCountFromServer for efficiency
  const usersCount = await getCountFromServer(collection(database, 'users'));
  const decksCount = await getCountFromServer(collection(database, 'decks'));
  const cardsCount = await getCountFromServer(collection(database, 'cards'));
  const sessionsCount = await getCountFromServer(collection(database, 'studySessions'));

  // Pending decks
  const pendingQuery = query(
    collection(database, 'decks'),
    where('isPublic', '==', true),
    where('status', '==', 'pending')
  );
  const pendingCount = await getCountFromServer(pendingQuery);

  // New users today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = Timestamp.fromDate(today);

  const newUsersQuery = query(
    collection(database, 'users'),
    where('createdAt', '>=', todayTimestamp)
  );
  const newUsersCount = await getCountFromServer(newUsersQuery);

  // Active users today (had a study session)
  const activeUsersQuery = query(
    collection(database, 'studySessions'),
    where('completedAt', '>=', todayTimestamp)
  );
  const activeSnapshot = await getDocs(activeUsersQuery);
  const uniqueActiveUsers = new Set(activeSnapshot.docs.map((d) => d.data().userId));

  return {
    totalUsers: usersCount.data().count,
    totalDecks: decksCount.data().count,
    totalCards: cardsCount.data().count,
    totalStudySessions: sessionsCount.data().count,
    pendingDecks: pendingCount.data().count,
    newUsersToday: newUsersCount.data().count,
    activeUsersToday: uniqueActiveUsers.size,
  };
}
