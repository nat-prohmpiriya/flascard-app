import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getAdminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { parseMarkdownToSnippets, validateMarkdown } from '@/lib/markdownParser';
import { SUPPORTED_LANGUAGES } from '@/models/typingSnippet';

const DATA_BASE_DIR = path.join(process.cwd(), 'data/typewriter');

function validateApiKey(request: Request): boolean {
  const apiKey = request.headers.get('X-API-Key');
  const expectedKey = process.env.IMPORT_API_KEY;
  return apiKey === expectedKey && !!expectedKey;
}

// Validate filename to prevent directory traversal
function validateFilename(filename: string): boolean {
  const normalized = path.normalize(filename);
  if (normalized.includes('..') || normalized.includes('/') || path.isAbsolute(normalized)) {
    return false;
  }
  return true;
}

interface ImportRequest {
  filename: string;
  userId: string;
  isPublic?: boolean;
  isPreset?: boolean;
}

// GET - List available typewriter markdown files
export async function GET(request: Request) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    if (!fs.existsSync(DATA_BASE_DIR)) {
      return NextResponse.json({
        success: true,
        path: 'data/typewriter',
        files: [],
        totalFiles: 0,
      });
    }

    const files = fs.readdirSync(DATA_BASE_DIR)
      .filter(file => file.endsWith('.md'))
      .map(file => {
        try {
          const filePath = path.join(DATA_BASE_DIR, file);
          const content = fs.readFileSync(filePath, 'utf-8');

          // Quick parse to get info
          const h1Match = content.match(/^#\s+(.+?)(?:\s+Snippets?)?\s*$/m);
          const snippetCount = (content.match(/^##\s+/gm) || []).length;
          const codeBlockCount = (content.match(/```\w+/g) || []).length;

          // Detect language
          let language = 'other';
          let languageName = h1Match?.[1]?.trim() || 'Unknown';

          if (h1Match) {
            const langText = h1Match[1].trim().toLowerCase();
            const matched = SUPPORTED_LANGUAGES.find(
              (l) => l.name.toLowerCase().includes(langText) ||
                     langText.includes(l.id) ||
                     langText.includes(l.name.toLowerCase())
            );
            if (matched) {
              language = matched.id;
              languageName = matched.name;
            }
          }

          return {
            filename: file,
            title: h1Match?.[1]?.trim() || file,
            language,
            languageName,
            snippetCount,
            codeBlockCount,
          };
        } catch {
          return {
            filename: file,
            title: 'Error reading file',
            language: 'other',
            languageName: 'Unknown',
            snippetCount: 0,
            codeBlockCount: 0,
          };
        }
      });

    return NextResponse.json({
      success: true,
      path: 'data/typewriter',
      files,
      totalFiles: files.length,
    });
  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json(
      { error: 'Failed to list files', details: String(error) },
      { status: 500 }
    );
  }
}

// POST - Import typewriter markdown to Firestore
export async function POST(request: Request) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body: ImportRequest = await request.json();
    const { filename, userId, isPublic = false, isPreset = true } = body;

    if (!filename || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: filename, userId' },
        { status: 400 }
      );
    }

    if (!validateFilename(filename)) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }

    const filePath = path.join(DATA_BASE_DIR, filename);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: `File not found: ${filename}` },
        { status: 404 }
      );
    }

    const content = fs.readFileSync(filePath, 'utf-8');

    // Validate markdown format
    const validation = validateMarkdown(content);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.message },
        { status: 400 }
      );
    }

    // Parse markdown to snippets
    const parseResult = parseMarkdownToSnippets(content);

    if (parseResult.errors.length > 0 && parseResult.snippets.length === 0) {
      return NextResponse.json(
        { error: 'Failed to parse markdown', details: parseResult.errors },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const now = Timestamp.now();

    // Create snippets using batch write (max 500 per batch)
    const snippetsCount = parseResult.snippets.length;
    const batchSize = 400;
    const createdIds: string[] = [];

    for (let i = 0; i < snippetsCount; i += batchSize) {
      const batch = db.batch();
      const chunk = parseResult.snippets.slice(i, i + batchSize);

      chunk.forEach((snippet) => {
        const snippetRef = db.collection('typingSnippets').doc();
        createdIds.push(snippetRef.id);

        batch.set(snippetRef, {
          userId,
          language: snippet.language || parseResult.language,
          languageName: parseResult.languageName,
          title: snippet.title,
          description: snippet.description || '',
          code: snippet.code,
          difficulty: snippet.difficulty,
          isPreset,
          isPublic,
          sourceFile: filename,
          createdAt: now,
          updatedAt: now,
        });
      });

      await batch.commit();
    }

    return NextResponse.json({
      success: true,
      message: `Imported ${snippetsCount} snippets from "${filename}"`,
      data: {
        filename,
        language: parseResult.language,
        languageName: parseResult.languageName,
        snippetsCount,
        createdIds: createdIds.slice(0, 10), // Return first 10 IDs
        warnings: parseResult.errors.length > 0 ? parseResult.errors : undefined,
      },
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Failed to import file', details: String(error) },
      { status: 500 }
    );
  }
}

// DELETE - Delete all snippets for a user (or by source file)
export async function DELETE(request: Request) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { userId, sourceFile } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing required field: userId' },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    let query = db.collection('typingSnippets').where('userId', '==', userId);

    // Optionally filter by source file
    if (sourceFile) {
      query = query.where('sourceFile', '==', sourceFile);
    }

    const snapshot = await query.get();

    // Delete in batches
    const batchSize = 400;
    let deletedCount = 0;
    const docs = snapshot.docs;

    for (let i = 0; i < docs.length; i += batchSize) {
      const batch = db.batch();
      const chunk = docs.slice(i, i + batchSize);
      chunk.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
      deletedCount += chunk.length;
    }

    return NextResponse.json({
      success: true,
      message: sourceFile
        ? `Deleted ${deletedCount} snippets from "${sourceFile}"`
        : `Deleted ${deletedCount} snippets for user`,
      deleted: {
        snippets: deletedCount,
        sourceFile: sourceFile || 'all',
      },
    });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete', details: String(error) },
      { status: 500 }
    );
  }
}
