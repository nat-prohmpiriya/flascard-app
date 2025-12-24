import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data/cefr/english/a2');

function validateApiKey(request: Request): boolean {
  const apiKey = request.headers.get('X-API-Key');
  const expectedKey = process.env.IMPORT_API_KEY;
  return apiKey === expectedKey && !!expectedKey;
}

export async function GET(request: Request) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const files = fs.readdirSync(DATA_DIR)
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const filePath = path.join(DATA_DIR, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(content);
        return {
          filename: file,
          deckName: data.deck?.name || 'Unknown',
          cardCount: data.cards?.length || 0,
          category: data.deck?.category || 'Unknown',
        };
      });

    return NextResponse.json({
      success: true,
      dataDir: 'data/cefr/english/a2',
      files,
      totalFiles: files.length,
    });
  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json(
      { error: 'Failed to list files' },
      { status: 500 }
    );
  }
}
