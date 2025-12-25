'use client';

import { useState } from 'react';
import { LearningPath, LearningPathFormData, Deck } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen, ArrowUp, ArrowDown } from 'lucide-react';

interface LearningPathFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: LearningPathFormData, decks: Deck[]) => Promise<void>;
  decks: Deck[];
  initialData?: LearningPath;
}

export function LearningPathForm({
  open,
  onClose,
  onSubmit,
  decks,
  initialData,
}: LearningPathFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [selectedDeckIds, setSelectedDeckIds] = useState<string[]>(
    initialData?.stages.map((s) => s.deckId) || []
  );
  const [targetAccuracy, setTargetAccuracy] = useState(
    initialData?.stages[0]?.targetAccuracy || 70
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedDeckIds.length === 0) {
      return;
    }

    const selectedDecks = selectedDeckIds
      .map((id) => decks.find((d) => d.id === id))
      .filter((d): d is Deck => d !== undefined);

    setLoading(true);
    try {
      await onSubmit(
        {
          name,
          description,
          deckIds: selectedDeckIds,
          targetAccuracy,
        },
        selectedDecks
      );
      // Reset form
      setName('');
      setDescription('');
      setSelectedDeckIds([]);
      setTargetAccuracy(70);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const toggleDeck = (deckId: string) => {
    setSelectedDeckIds((prev) =>
      prev.includes(deckId)
        ? prev.filter((id) => id !== deckId)
        : [...prev, deckId]
    );
  };

  const moveDeck = (deckId: string, direction: 'up' | 'down') => {
    const index = selectedDeckIds.indexOf(deckId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= selectedDeckIds.length) return;

    const newOrder = [...selectedDeckIds];
    [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
    setSelectedDeckIds(newOrder);
  };

  const selectedDecks = selectedDeckIds
    .map((id) => decks.find((d) => d.id === id))
    .filter((d): d is Deck => d !== undefined);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit Learning Path' : 'Create Learning Path'}
          </DialogTitle>
          <DialogDescription>
            Create a learning path by selecting decks in order
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Path Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., English A1 to B2"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your learning path..."
                rows={2}
              />
            </div>

            {/* Target Accuracy */}
            <div className="space-y-2">
              <Label htmlFor="targetAccuracy">Target Accuracy (%)</Label>
              <Input
                id="targetAccuracy"
                type="number"
                min={1}
                max={100}
                value={targetAccuracy}
                onChange={(e) =>
                  setTargetAccuracy(Math.min(100, parseInt(e.target.value) || 1))
                }
              />
              <p className="text-xs text-muted-foreground">
                Required accuracy to complete each stage
              </p>
            </div>

            {/* Deck Selection */}
            <div className="space-y-2">
              <Label>Select Decks *</Label>
              {decks.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No decks available. Create some decks first.
                </p>
              ) : (
                <ScrollArea className="h-[200px] border rounded-md p-2">
                  <div className="space-y-2">
                    {decks.map((deck) => (
                      <div
                        key={deck.id}
                        className="flex items-center gap-3 p-2 hover:bg-muted rounded-md"
                      >
                        <Checkbox
                          id={deck.id}
                          checked={selectedDeckIds.includes(deck.id)}
                          onCheckedChange={() => toggleDeck(deck.id)}
                        />
                        <label
                          htmlFor={deck.id}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{deck.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {deck.cardCount} cards
                            </Badge>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>

            {/* Selected Order */}
            {selectedDecks.length > 0 && (
              <div className="space-y-2">
                <Label>Stage Order (drag or use arrows to reorder)</Label>
                <div className="border rounded-md p-2 space-y-2">
                  {selectedDecks.map((deck, index) => (
                    <div
                      key={deck.id}
                      className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                          {index + 1}
                        </span>
                        <span>{deck.name}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => moveDeck(deck.id, 'up')}
                          disabled={index === 0}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => moveDeck(deck.id, 'down')}
                          disabled={index === selectedDecks.length - 1}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !name || selectedDeckIds.length === 0}
            >
              {loading
                ? 'Saving...'
                : initialData
                ? 'Update Path'
                : 'Create Path'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
