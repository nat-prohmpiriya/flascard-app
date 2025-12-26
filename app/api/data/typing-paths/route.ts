import { NextResponse } from 'next/server';
import { getAdminDb, validateUserId } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { TypingPathStatus, TypingStageStatus } from '@/types';

const COLLECTION = 'typingPaths';

function validateApiKey(request: Request): boolean {
  const apiKey = request.headers.get('X-API-Key');
  const expectedKey = process.env.IMPORT_API_KEY;
  return apiKey === expectedKey && !!expectedKey;
}

interface TypingPathStageDocument {
  snippetId: string;
  snippetTitle: string;
  language: string;
  languageName: string;
  difficulty: 'easy' | 'medium' | 'hard';
  order: number;
  targetWpm: number;
  targetAccuracy: number;
  progress: {
    bestWpm: number;
    bestAccuracy: number;
    attempts: number;
    completedAt?: Timestamp;
  };
  status: TypingStageStatus;
}

interface TypingPathDocument {
  id: string;
  userId: string;
  name: string;
  description: string;
  stages: TypingPathStageDocument[];
  currentStageIndex: number;
  status: TypingPathStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// GET - List typing paths for a user
export async function GET(request: Request) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status') as TypingPathStatus | null;

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required parameter: userId' },
        { status: 400 }
      );
    }

    const isValidUser = await validateUserId(userId);
    if (!isValidUser) {
      return NextResponse.json(
        { error: `User not found: ${userId}` },
        { status: 404 }
      );
    }

    const db = getAdminDb();
    let queryRef = db.collection(COLLECTION).where('userId', '==', userId);

    if (status) {
      queryRef = queryRef.where('status', '==', status);
    }

    const snapshot = await queryRef.get();

    const paths = snapshot.docs
      .map((doc) => {
        const data = doc.data() as Omit<TypingPathDocument, 'id'>;
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
          stages: data.stages?.map((stage) => ({
            ...stage,
            progress: {
              ...stage.progress,
              completedAt: stage.progress.completedAt?.toDate?.()?.toISOString() || null,
            },
          })) || [],
        };
      })
      .sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

    return NextResponse.json({
      success: true,
      userId,
      paths,
      totalPaths: paths.length,
    });
  } catch (error) {
    console.error('Error fetching typing paths:', error);
    return NextResponse.json(
      { error: 'Failed to fetch typing paths', details: String(error) },
      { status: 500 }
    );
  }
}

// POST - Create a new typing path
interface CreateTypingPathRequest {
  userId: string;
  name: string;
  description?: string;
  snippetIds: string[];
  targetWpm?: number;
  targetAccuracy?: number;
}

export async function POST(request: Request) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body: CreateTypingPathRequest = await request.json();
    const {
      userId,
      name,
      description = '',
      snippetIds,
      targetWpm = 40,
      targetAccuracy = 95,
    } = body;

    if (!userId || !name || !snippetIds || snippetIds.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, name, snippetIds' },
        { status: 400 }
      );
    }

    const isValidUser = await validateUserId(userId);
    if (!isValidUser) {
      return NextResponse.json(
        { error: `User not found: ${userId}` },
        { status: 404 }
      );
    }

    const db = getAdminDb();
    const now = Timestamp.now();

    // Fetch snippet info for each snippetId
    const snippetPromises = snippetIds.map(async (snippetId) => {
      const snippetDoc = await db.collection('typingSnippets').doc(snippetId).get();
      if (!snippetDoc.exists) {
        return null;
      }
      const snippetData = snippetDoc.data();
      return {
        id: snippetId,
        title: snippetData?.title || 'Unknown Snippet',
        language: snippetData?.language || 'other',
        languageName: snippetData?.languageName || 'Other',
        difficulty: snippetData?.difficulty || 'medium',
      };
    });

    const snippets = await Promise.all(snippetPromises);
    const validSnippets = snippets.filter((s) => s !== null);

    if (validSnippets.length === 0) {
      return NextResponse.json(
        { error: 'No valid snippets found for the provided snippetIds' },
        { status: 400 }
      );
    }

    // Create stages from snippets
    const stages: TypingPathStageDocument[] = validSnippets.map((snippet, index) => ({
      snippetId: snippet.id,
      snippetTitle: snippet.title,
      language: snippet.language,
      languageName: snippet.languageName,
      difficulty: snippet.difficulty,
      order: index,
      targetWpm,
      targetAccuracy,
      progress: {
        bestWpm: 0,
        bestAccuracy: 0,
        attempts: 0,
      },
      status: index === 0 ? 'active' : 'locked',
    }));

    const pathData = {
      userId,
      name,
      description,
      stages,
      currentStageIndex: 0,
      status: 'active' as TypingPathStatus,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await db.collection(COLLECTION).add(pathData);

    return NextResponse.json({
      success: true,
      message: `Created typing path "${name}" with ${stages.length} stages`,
      path: {
        id: docRef.id,
        ...pathData,
        createdAt: now.toDate().toISOString(),
        updatedAt: now.toDate().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error creating typing path:', error);
    return NextResponse.json(
      { error: 'Failed to create typing path', details: String(error) },
      { status: 500 }
    );
  }
}

// PUT - Update a typing path
interface UpdateTypingPathRequest {
  pathId: string;
  data: {
    name?: string;
    description?: string;
    status?: TypingPathStatus;
    stages?: TypingPathStageDocument[];
    currentStageIndex?: number;
  };
}

export async function PUT(request: Request) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body: UpdateTypingPathRequest = await request.json();
    const { pathId, data } = body;

    if (!pathId || !data) {
      return NextResponse.json(
        { error: 'Missing required fields: pathId, data' },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const docRef = db.collection(COLLECTION).doc(pathId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json(
        { error: `Typing path not found: ${pathId}` },
        { status: 404 }
      );
    }

    const updateData = {
      ...data,
      updatedAt: Timestamp.now(),
    };

    await docRef.update(updateData);

    const updatedDoc = await docRef.get();
    const updatedData = updatedDoc.data() as Omit<TypingPathDocument, 'id'>;

    return NextResponse.json({
      success: true,
      message: 'Typing path updated successfully',
      path: {
        id: updatedDoc.id,
        ...updatedData,
        createdAt: updatedData.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: updatedData.updatedAt?.toDate?.()?.toISOString() || null,
      },
    });
  } catch (error) {
    console.error('Error updating typing path:', error);
    return NextResponse.json(
      { error: 'Failed to update typing path', details: String(error) },
      { status: 500 }
    );
  }
}

// DELETE - Delete a typing path or all paths for a user
interface DeleteTypingPathRequest {
  pathId?: string;
  userId?: string;
  deleteAll?: boolean;
}

export async function DELETE(request: Request) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body: DeleteTypingPathRequest = await request.json();
    const { pathId, userId, deleteAll } = body;

    const db = getAdminDb();

    // Delete all paths for a user
    if (deleteAll && userId) {
      const isValidUser = await validateUserId(userId);
      if (!isValidUser) {
        return NextResponse.json(
          { error: `User not found: ${userId}` },
          { status: 404 }
        );
      }

      const snapshot = await db
        .collection(COLLECTION)
        .where('userId', '==', userId)
        .get();

      const batchSize = 400;
      const docs = snapshot.docs;
      let deletedCount = 0;

      for (let i = 0; i < docs.length; i += batchSize) {
        const batch = db.batch();
        const chunk = docs.slice(i, i + batchSize);
        chunk.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
        deletedCount += chunk.length;
      }

      return NextResponse.json({
        success: true,
        message: `Deleted ${deletedCount} typing paths for user`,
        deleted: deletedCount,
      });
    }

    // Delete a single path
    if (pathId) {
      const docRef = db.collection(COLLECTION).doc(pathId);
      const docSnap = await docRef.get();

      if (!docSnap.exists) {
        return NextResponse.json(
          { error: `Typing path not found: ${pathId}` },
          { status: 404 }
        );
      }

      await docRef.delete();

      return NextResponse.json({
        success: true,
        message: 'Typing path deleted successfully',
        deleted: pathId,
      });
    }

    return NextResponse.json(
      { error: 'Missing required field: pathId or (userId with deleteAll)' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error deleting typing path:', error);
    return NextResponse.json(
      { error: 'Failed to delete typing path', details: String(error) },
      { status: 500 }
    );
  }
}
