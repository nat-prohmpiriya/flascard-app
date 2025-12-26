import { NextResponse } from 'next/server';
import { getAdminDb, validateUserId } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { PathStatus, StageStatus } from '@/types';

const COLLECTION = 'learningPaths';

function validateApiKey(request: Request): boolean {
  const apiKey = request.headers.get('X-API-Key');
  const expectedKey = process.env.IMPORT_API_KEY;
  return apiKey === expectedKey && !!expectedKey;
}

interface PathStageDocument {
  deckId: string;
  deckName: string;
  order: number;
  targetAccuracy: number;
  progress: {
    cardsStudied: number;
    totalCards: number;
    accuracy: number;
    completedAt?: Timestamp;
  };
  status: StageStatus;
}

interface LearningPathDocument {
  id: string;
  userId: string;
  name: string;
  description: string;
  stages: PathStageDocument[];
  currentStageIndex: number;
  status: PathStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// GET - List learning paths for a user
export async function GET(request: Request) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status') as PathStatus | null;

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
    let query = db.collection(COLLECTION).where('userId', '==', userId);

    if (status) {
      query = query.where('status', '==', status);
    }

    const snapshot = await query.orderBy('createdAt', 'desc').get();

    const paths = snapshot.docs.map((doc) => {
      const data = doc.data() as Omit<LearningPathDocument, 'id'>;
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
    });

    return NextResponse.json({
      success: true,
      userId,
      paths,
      totalPaths: paths.length,
    });
  } catch (error) {
    console.error('Error fetching learning paths:', error);
    return NextResponse.json(
      { error: 'Failed to fetch learning paths', details: String(error) },
      { status: 500 }
    );
  }
}

// POST - Create a new learning path
interface CreatePathRequest {
  userId: string;
  name: string;
  description?: string;
  deckIds: string[];
  targetAccuracy?: number;
}

export async function POST(request: Request) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body: CreatePathRequest = await request.json();
    const { userId, name, description = '', deckIds, targetAccuracy = 80 } = body;

    if (!userId || !name || !deckIds || deckIds.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, name, deckIds' },
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

    // Fetch deck info for each deckId
    const deckPromises = deckIds.map(async (deckId) => {
      const deckDoc = await db.collection('decks').doc(deckId).get();
      if (!deckDoc.exists) {
        return null;
      }
      const deckData = deckDoc.data();
      return {
        id: deckId,
        name: deckData?.name || 'Unknown Deck',
        cardCount: deckData?.cardCount || 0,
      };
    });

    const decks = await Promise.all(deckPromises);
    const validDecks = decks.filter((d) => d !== null);

    if (validDecks.length === 0) {
      return NextResponse.json(
        { error: 'No valid decks found for the provided deckIds' },
        { status: 400 }
      );
    }

    // Create stages from decks
    const stages: PathStageDocument[] = validDecks.map((deck, index) => ({
      deckId: deck.id,
      deckName: deck.name,
      order: index,
      targetAccuracy,
      progress: {
        cardsStudied: 0,
        totalCards: deck.cardCount,
        accuracy: 0,
      },
      status: index === 0 ? 'active' : 'locked',
    }));

    const pathData = {
      userId,
      name,
      description,
      stages,
      currentStageIndex: 0,
      status: 'active' as PathStatus,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await db.collection(COLLECTION).add(pathData);

    return NextResponse.json({
      success: true,
      message: `Created learning path "${name}" with ${stages.length} stages`,
      path: {
        id: docRef.id,
        ...pathData,
        createdAt: now.toDate().toISOString(),
        updatedAt: now.toDate().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error creating learning path:', error);
    return NextResponse.json(
      { error: 'Failed to create learning path', details: String(error) },
      { status: 500 }
    );
  }
}

// PUT - Update a learning path
interface UpdatePathRequest {
  pathId: string;
  data: {
    name?: string;
    description?: string;
    status?: PathStatus;
    stages?: PathStageDocument[];
    currentStageIndex?: number;
  };
}

export async function PUT(request: Request) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body: UpdatePathRequest = await request.json();
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
        { error: `Learning path not found: ${pathId}` },
        { status: 404 }
      );
    }

    const updateData = {
      ...data,
      updatedAt: Timestamp.now(),
    };

    await docRef.update(updateData);

    const updatedDoc = await docRef.get();
    const updatedData = updatedDoc.data() as Omit<LearningPathDocument, 'id'>;

    return NextResponse.json({
      success: true,
      message: 'Learning path updated successfully',
      path: {
        id: updatedDoc.id,
        ...updatedData,
        createdAt: updatedData.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: updatedData.updatedAt?.toDate?.()?.toISOString() || null,
      },
    });
  } catch (error) {
    console.error('Error updating learning path:', error);
    return NextResponse.json(
      { error: 'Failed to update learning path', details: String(error) },
      { status: 500 }
    );
  }
}

// DELETE - Delete a learning path or all paths for a user
interface DeletePathRequest {
  pathId?: string;
  userId?: string;
  deleteAll?: boolean;
}

export async function DELETE(request: Request) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body: DeletePathRequest = await request.json();
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
        message: `Deleted ${deletedCount} learning paths for user`,
        deleted: deletedCount,
      });
    }

    // Delete a single path
    if (pathId) {
      const docRef = db.collection(COLLECTION).doc(pathId);
      const docSnap = await docRef.get();

      if (!docSnap.exists) {
        return NextResponse.json(
          { error: `Learning path not found: ${pathId}` },
          { status: 404 }
        );
      }

      await docRef.delete();

      return NextResponse.json({
        success: true,
        message: 'Learning path deleted successfully',
        deleted: pathId,
      });
    }

    return NextResponse.json(
      { error: 'Missing required field: pathId or (userId with deleteAll)' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error deleting learning path:', error);
    return NextResponse.json(
      { error: 'Failed to delete learning path', details: String(error) },
      { status: 500 }
    );
  }
}
