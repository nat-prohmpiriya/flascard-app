'use client';

import { useRef, useState } from 'react';
import { Card, Deck, ImportCard } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { downloadJSON, downloadCSV, importFromFile } from '@/services/importExport';
import { Download, Upload, FileJson, FileSpreadsheet } from 'lucide-react';

interface ImportExportProps {
  deck: Deck;
  cards: Card[];
  onImport: (cards: ImportCard[]) => Promise<boolean>;
}

export function ImportExport({ deck, cards, onImport }: ImportExportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importedCards, setImportedCards] = useState<ImportCard[]>([]);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExportJSON = () => {
    downloadJSON(deck, cards);
  };

  const handleExportCSV = () => {
    downloadCSV(deck, cards);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    try {
      const result = await importFromFile(file);
      if (result && result.cards.length > 0) {
        setImportedCards(result.cards);
        setImportDialogOpen(true);
      } else {
        setError('No valid cards found in file');
      }
    } catch {
      setError('Failed to read file');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmImport = async () => {
    setImporting(true);
    try {
      const success = await onImport(importedCards);
      if (success) {
        setImportDialogOpen(false);
        setImportedCards([]);
      } else {
        setError('Failed to import cards');
      }
    } finally {
      setImporting(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {/* Export Buttons */}
        <Button variant="outline" onClick={handleExportJSON}>
          <FileJson className="mr-2 h-4 w-4" />
          Export JSON
        </Button>
        <Button variant="outline" onClick={handleExportCSV}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export CSV
        </Button>

        {/* Import Button */}
        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
          <Upload className="mr-2 h-4 w-4" />
          Import
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.csv"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {error && <p className="text-sm text-destructive mt-2">{error}</p>}

      {/* Import Confirmation Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle>Import Cards</DialogTitle>
            <DialogDescription>
              Found {importedCards.length} cards to import. Preview:
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-75 overflow-y-auto border rounded-md p-4">
            {importedCards.slice(0, 5).map((card, index) => (
              <div key={index} className="mb-4 last:mb-0 pb-4 last:pb-0 border-b last:border-0">
                <p className="text-sm">
                  <span className="font-medium">Vocab:</span> {card.vocab.slice(0, 50)}
                  {card.vocab.length > 50 && '...'}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Meaning:</span> {card.meaning.slice(0, 50)}
                  {card.meaning.length > 50 && '...'}
                </p>
              </div>
            ))}
            {importedCards.length > 5 && (
              <p className="text-sm text-muted-foreground text-center">
                ... and {importedCards.length - 5} more cards
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmImport} disabled={importing}>
              {importing ? 'Importing...' : `Import ${importedCards.length} Cards`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
