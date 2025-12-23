import Papa from 'papaparse';
import { ExportData, ImportCard, Card } from '@/types';
import { Deck } from '@/types';

const EXPORT_VERSION = '1.0';

// JSON Export/Import
export function exportToJSON(deck: Deck, cards: Card[]): string {
  const exportData: ExportData = {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    deck: {
      name: deck.name,
      description: deck.description,
      category: deck.category,
    },
    cards: cards.map((card) => ({
      front: card.front,
      back: card.back,
    })),
  };

  return JSON.stringify(exportData, null, 2);
}

export function parseJSON(jsonString: string): {
  deck: { name: string; description: string; category: string };
  cards: ImportCard[];
} | null {
  try {
    const data: ExportData = JSON.parse(jsonString);

    if (!data.deck || !Array.isArray(data.cards)) {
      return null;
    }

    return {
      deck: data.deck,
      cards: data.cards.filter((card) => card.front && card.back),
    };
  } catch {
    return null;
  }
}

// CSV Export/Import
export function exportToCSV(cards: Card[]): string {
  const csvData = cards.map((card) => ({
    front: card.front,
    back: card.back,
  }));

  return Papa.unparse(csvData, {
    header: true,
    quotes: true,
  });
}

export function parseCSV(csvString: string): ImportCard[] {
  const result = Papa.parse<{ front: string; back: string }>(csvString, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.toLowerCase().trim(),
  });

  if (result.errors.length > 0) {
    console.error('CSV parse errors:', result.errors);
  }

  return result.data
    .filter((row) => row.front && row.back)
    .map((row) => ({
      front: row.front.trim(),
      back: row.back.trim(),
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
