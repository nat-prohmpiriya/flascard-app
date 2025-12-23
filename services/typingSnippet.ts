import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch,
  or,
  and,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  TypingSnippet,
  TypingSnippetDocument,
  TypingSnippetFormData,
  toTypingSnippet,
} from '@/models/typingSnippet';

const COLLECTION = 'typingSnippets';

// Normalize line endings: CRLF → LF, CR → LF
function normalizeCode(code: string): string {
  return code.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

function getDb() {
  if (!db) throw new Error('Firebase Firestore not initialized');
  return db;
}

// Create a new snippet
export async function createTypingSnippet(
  userId: string,
  data: TypingSnippetFormData
): Promise<TypingSnippet> {
  const now = Timestamp.now();
  const docData: TypingSnippetDocument = {
    userId,
    language: data.language,
    languageName: data.languageName,
    title: data.title,
    description: data.description,
    code: normalizeCode(data.code),
    difficulty: data.difficulty,
    isPreset: false,
    isPublic: data.isPublic,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(collection(getDb(), COLLECTION), docData);
  return toTypingSnippet(docRef.id, docData);
}

// Create multiple snippets (for markdown import)
export async function bulkCreateTypingSnippets(
  userId: string,
  snippets: TypingSnippetFormData[]
): Promise<number> {
  const database = getDb();
  const batch = writeBatch(database);
  const now = Timestamp.now();

  snippets.forEach((snippet) => {
    const docRef = doc(collection(database, COLLECTION));
    const docData: TypingSnippetDocument = {
      userId,
      language: snippet.language,
      languageName: snippet.languageName,
      title: snippet.title,
      description: snippet.description,
      code: normalizeCode(snippet.code),
      difficulty: snippet.difficulty,
      isPreset: false,
      isPublic: snippet.isPublic,
      createdAt: now,
      updatedAt: now,
    };
    batch.set(docRef, docData);
  });

  await batch.commit();
  return snippets.length;
}

// Get a single snippet by ID
export async function getTypingSnippet(snippetId: string): Promise<TypingSnippet | null> {
  if (!db) return null;
  const docRef = doc(db, COLLECTION, snippetId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return toTypingSnippet(docSnap.id, docSnap.data() as TypingSnippetDocument);
}

// Get user's own snippets
export async function getUserSnippets(userId: string): Promise<TypingSnippet[]> {
  if (!db) return [];
  const q = query(
    collection(db, COLLECTION),
    where('userId', '==', userId),
    where('isPreset', '==', false),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((d) =>
    toTypingSnippet(d.id, d.data() as TypingSnippetDocument)
  );
}

// Get snippets by language (user's own + public + presets)
export async function getSnippetsByLanguage(
  userId: string,
  language: string
): Promise<TypingSnippet[]> {
  if (!db) return [];

  // Query for user's own, public, or preset snippets for this language
  const q = query(
    collection(db, COLLECTION),
    and(
      where('language', '==', language),
      or(
        where('userId', '==', userId),
        where('isPublic', '==', true),
        where('isPreset', '==', true)
      )
    )
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((d) =>
    toTypingSnippet(d.id, d.data() as TypingSnippetDocument)
  );
}

// Get all available snippets for a user (own + public + presets)
export async function getAvailableSnippets(userId: string): Promise<TypingSnippet[]> {
  if (!db) return [];

  const q = query(
    collection(db, COLLECTION),
    or(
      where('userId', '==', userId),
      where('isPublic', '==', true),
      where('isPreset', '==', true)
    )
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((d) =>
    toTypingSnippet(d.id, d.data() as TypingSnippetDocument)
  );
}

// Get preset snippets (admin created)
export async function getPresetSnippets(language?: string): Promise<TypingSnippet[]> {
  if (!db) return [];

  let q;
  if (language) {
    q = query(
      collection(db, COLLECTION),
      where('isPreset', '==', true),
      where('language', '==', language),
      orderBy('createdAt', 'desc')
    );
  } else {
    q = query(
      collection(db, COLLECTION),
      where('isPreset', '==', true),
      orderBy('createdAt', 'desc')
    );
  }

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((d) =>
    toTypingSnippet(d.id, d.data() as TypingSnippetDocument)
  );
}

// Update a snippet
export async function updateTypingSnippet(
  snippetId: string,
  data: Partial<TypingSnippetFormData>
): Promise<void> {
  const docRef = doc(getDb(), COLLECTION, snippetId);
  const updateData = { ...data };
  if (updateData.code) {
    updateData.code = normalizeCode(updateData.code);
  }
  await updateDoc(docRef, {
    ...updateData,
    updatedAt: Timestamp.now(),
  });
}

// Delete a snippet
export async function deleteTypingSnippet(snippetId: string): Promise<void> {
  await deleteDoc(doc(getDb(), COLLECTION, snippetId));
}

// Get languages that have snippets
export async function getLanguagesWithSnippets(userId: string): Promise<string[]> {
  const snippets = await getAvailableSnippets(userId);
  const languages = new Set(snippets.map((s) => s.language));
  return Array.from(languages);
}

// Count snippets by language
export async function countSnippetsByLanguage(
  userId: string
): Promise<Record<string, number>> {
  const snippets = await getAvailableSnippets(userId);
  const counts: Record<string, number> = {};
  snippets.forEach((s) => {
    counts[s.language] = (counts[s.language] || 0) + 1;
  });
  return counts;
}
