import Papa from 'papaparse';
import { ExportData, ImportCard, Card, Language } from '@/types';
import { Deck } from '@/types';

const EXPORT_VERSION = '2.1';

// JSON Export/Import
export function exportToJSON(deck: Deck, cards: Card[]): string {
  const exportData: ExportData = {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    deck: {
      name: deck.name,
      description: deck.description,
      category: deck.category,
      tags: deck.tags || [],
      sourceLang: deck.sourceLang,
      targetLang: deck.targetLang,
    },
    cards: cards.map((card) => ({
      vocab: card.vocab,
      pronunciation: card.pronunciation || '',
      meaning: card.meaning,
      example: card.example || '',
      exampleTranslation: card.exampleTranslation || '',
      ...(card.imageUrl && { imageUrl: card.imageUrl }),
    })),
  };

  return JSON.stringify(exportData, null, 2);
}

export function parseJSON(jsonString: string): {
  deck: { name: string; description: string; category: string; tags?: string[]; sourceLang?: Language; targetLang?: Language };
  cards: ImportCard[];
} | null {
  try {
    const data = JSON.parse(jsonString);

    if (!data.deck || !Array.isArray(data.cards)) {
      return null;
    }

    // Support both old format (front/back) and new format (vocab/meaning)
    const cards: ImportCard[] = data.cards
      .filter((card: Record<string, string>) => (card.vocab && card.meaning) || (card.front && card.back))
      .map((card: Record<string, string>) => ({
        vocab: card.vocab || card.front || '',
        pronunciation: card.pronunciation || '',
        meaning: card.meaning || card.back || '',
        example: card.example || '',
        exampleTranslation: card.exampleTranslation || '',
        ...(card.imageUrl && { imageUrl: card.imageUrl }),
      }));

    return {
      deck: {
        name: data.deck.name,
        description: data.deck.description,
        category: data.deck.category,
        tags: data.deck.tags || [],
        sourceLang: data.deck.sourceLang,
        targetLang: data.deck.targetLang,
      },
      cards,
    };
  } catch {
    return null;
  }
}

// CSV Export/Import
export function exportToCSV(cards: Card[]): string {
  const csvData = cards.map((card) => ({
    vocab: card.vocab,
    pronunciation: card.pronunciation || '',
    meaning: card.meaning,
    example: card.example || '',
    exampleTranslation: card.exampleTranslation || '',
    imageUrl: card.imageUrl || '',
  }));

  return Papa.unparse(csvData, {
    header: true,
    quotes: true,
  });
}

interface CSVRow {
  vocab?: string;
  pronunciation?: string;
  meaning?: string;
  example?: string;
  exampletranslation?: string;
  imageurl?: string;
  // Legacy support
  front?: string;
  back?: string;
}

export function parseCSV(csvString: string): ImportCard[] {
  const result = Papa.parse<CSVRow>(csvString, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.toLowerCase().trim(),
  });

  if (result.errors.length > 0) {
    console.error('CSV parse errors:', result.errors);
  }

  // Support both old format (front/back) and new format (vocab/meaning)
  return result.data
    .filter((row) => (row.vocab && row.meaning) || (row.front && row.back))
    .map((row) => ({
      vocab: (row.vocab || row.front || '').trim(),
      pronunciation: (row.pronunciation || '').trim(),
      meaning: (row.meaning || row.back || '').trim(),
      example: (row.example || '').trim(),
      exampleTranslation: (row.exampletranslation || '').trim(),
      ...(row.imageurl && { imageUrl: row.imageurl.trim() }),
    }));
}

// File download helpers
export function downloadFile(content: string, filename: string, type: string): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadJSON(deck: Deck, cards: Card[]): void {
  const content = exportToJSON(deck, cards);
  const filename = `${deck.name.replace(/\s+/g, '_')}_flashcards.json`;
  downloadFile(content, filename, 'application/json');
}

export function downloadCSV(deck: Deck, cards: Card[]): void {
  const content = exportToCSV(cards);
  const filename = `${deck.name.replace(/\s+/g, '_')}_flashcards.csv`;
  downloadFile(content, filename, 'text/csv');
}

// File read helper
export function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

export async function importFromFile(
  file: File
): Promise<{ cards: ImportCard[]; deck?: { name: string; description: string; category: string } } | null> {
  const content = await readFile(file);
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'json') {
    const result = parseJSON(content);
    if (result) {
      return { cards: result.cards, deck: result.deck };
    }
  } else if (extension === 'csv') {
    const cards = parseCSV(content);
    if (cards.length > 0) {
      return { cards };
    }
  }

  return null;
}
