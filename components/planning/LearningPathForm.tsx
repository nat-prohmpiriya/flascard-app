'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { LearningPath, LearningPathFormData, Deck } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Search, GripVertical, X } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface LearningPathFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: LearningPathFormData, decks: Deck[]) => Promise<void>;
  decks: Deck[];
  initialData?: LearningPath;
}

// Sortable Stage Item Component
function SortableStageItem({
  deck,
  index,
  onRemove,
}: {
  deck: Deck;
  index: number;
  onRemove: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deck.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-3 bg-muted/50 rounded-md border ${
        isDragging ? 'border-primary shadow-lg' : 'border-transparent'
      }`}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5" />
        </button>
        <span className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
          {index + 1}
        </span>
        <div>
          <span className="font-medium">{deck.name}</span>
          <span className="text-xs text-muted-foreground ml-2">
            {deck.cardCount} cards
          </span>
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted-foreground hover:text-destructive"
        onClick={() => onRemove(deck.id)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

// Extract level from deck name or tags (A1, A2, B1, B2, C1, C2)
function extractLevel(deck: Deck): string {
  const levels = ['C2', 'C1', 'B2', 'B1', 'A2', 'A1'];

  // Check tags first
  for (const level of levels) {
    if (deck.tags?.some(tag => tag.toUpperCase() === level)) {
      return level;
    }
  }

  // Check deck name
  for (const level of levels) {
    if (deck.name.toUpperCase().includes(level)) {
      return level;
    }
  }

  return 'Other';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  // DnD sensors - stable reference
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Get unique levels from decks
  const availableLevels = useMemo(() => {
    const levels = new Set<string>();
    decks.forEach(deck => {
      levels.add(extractLevel(deck));
    });
    return ['all', ...Array.from(levels).sort()];
  }, [decks]);

  // Filter decks by search and level
  const filteredDecks = useMemo(() => {
    return decks.filter(deck => {
      const matchesSearch = searchQuery === '' ||
        deck.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLevel = selectedLevel === 'all' ||
        extractLevel(deck) === selectedLevel;
      return matchesSearch && matchesLevel;
    });
  }, [decks, searchQuery, selectedLevel]);

  // Group filtered decks by level
  const groupedDecks = useMemo(() => {
    const groups: Record<string, Deck[]> = {};
    filteredDecks.forEach(deck => {
      const level = extractLevel(deck);
      if (!groups[level]) {
        groups[level] = [];
      }
      groups[level].push(deck);
    });

    // Sort groups by level
    const sortedKeys = Object.keys(groups).sort((a, b) => {
      const order = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Other'];
      return order.indexOf(a) - order.indexOf(b);
    });

    const sortedGroups: Record<string, Deck[]> = {};
    sortedKeys.forEach(key => {
      sortedGroups[key] = groups[key];
    });

    return sortedGroups;
  }, [filteredDecks]);

  // Selected decks in order
  const selectedDecks = useMemo(() => {
    return selectedDeckIds
      .map((id) => decks.find((d) => d.id === id))
      .filter((d): d is Deck => d !== undefined);
  }, [selectedDeckIds, decks]);

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    e?.preventDefault();

    if (selectedDeckIds.length === 0 || !name) {
      return;
    }

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
      setSearchQuery('');
      setSelectedLevel('all');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const toggleDeck = useCallback((deckId: string) => {
    setSelectedDeckIds((prev) =>
      prev.includes(deckId)
        ? prev.filter((id) => id !== deckId)
        : [...prev, deckId]
    );
  }, []);

  const removeDeck = useCallback((deckId: string) => {
    setSelectedDeckIds((prev) => prev.filter((id) => id !== deckId));
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSelectedDeckIds((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }, []);

  const selectAll = useCallback(() => {
    const allFilteredIds = filteredDecks.map(d => d.id);
    setSelectedDeckIds(prev => {
      const newIds = new Set([...prev, ...allFilteredIds]);
      return Array.from(newIds);
    });
  }, [filteredDecks]);

  const selectAllByLevel = useCallback((levelDecks: Deck[]) => {
    const levelIds = levelDecks.map(d => d.id);
    setSelectedDeckIds(prev => {
      const newIds = new Set([...prev, ...levelIds]);
      return Array.from(newIds);
    });
  }, []);

  const deselectAllByLevel = useCallback((levelDecks: Deck[]) => {
    const levelIds = new Set(levelDecks.map(d => d.id));
    setSelectedDeckIds(prev => prev.filter(id => !levelIds.has(id)));
  }, []);

  const isLevelFullySelected = useCallback((levelDecks: Deck[]) => {
    return levelDecks.every(deck => selectedDeckIds.includes(deck.id));
  }, [selectedDeckIds]);

  const clearAll = useCallback(() => {
    setSelectedDeckIds([]);
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 animate-in fade-in-0"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-background rounded-lg border shadow-lg w-full max-w-[900px] max-h-[95vh] mx-4 overflow-hidden animate-in fade-in-0 zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-lg font-semibold">
              {initialData ? 'Edit Learning Path' : 'Create Learning Path'}
            </h2>
            <p className="text-sm text-muted-foreground">
              Select decks and drag to reorder your learning path
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-6 w-6 opacity-70 hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(95vh-180px)]">
          {/* Basic Info - Compact Row */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="col-span-2 space-y-1">
              <Label htmlFor="name">Path Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., English A1 to B2"
                required
              />
            </div>
            <div className="space-y-1">
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
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1 mb-4">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your learning path..."
              rows={2}
            />
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-2 gap-4">
            {/* Left: Deck Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Available Decks ({filteredDecks.length})</Label>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs"
                  onClick={selectAll}
                >
                  Select All
                </Button>
              </div>

              {/* Search & Filter */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search decks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 h-9"
                  />
                </div>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="h-9 px-3 rounded-md border bg-background text-sm"
                >
                  {availableLevels.map(level => (
                    <option key={level} value={level}>
                      {level === 'all' ? 'All Levels' : level}
                    </option>
                  ))}
                </select>
              </div>

              {/* Deck List */}
              {decks.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  No decks available. Create some decks first.
                </p>
              ) : (
                <div className="h-[300px] border rounded-md overflow-y-auto">
                  <div className="p-2 space-y-1">
                    {Object.entries(groupedDecks).map(([level, levelDecks]) => (
                      <div key={level}>
                        <div className="sticky top-0 bg-background py-1.5 px-2 text-xs font-semibold text-muted-foreground border-b mb-1 flex items-center justify-between">
                          <span>{level} ({levelDecks.length})</span>
                          <button
                            type="button"
                            onClick={() =>
                              isLevelFullySelected(levelDecks)
                                ? deselectAllByLevel(levelDecks)
                                : selectAllByLevel(levelDecks)
                            }
                            className="text-primary hover:underline text-xs"
                          >
                            {isLevelFullySelected(levelDecks) ? 'Deselect All' : 'Select All'}
                          </button>
                        </div>
                        {levelDecks.map((deck) => (
                          <label
                            key={deck.id}
                            htmlFor={`deck-${deck.id}`}
                            className={`flex items-center gap-3 p-2 hover:bg-muted rounded-md cursor-pointer ${
                              selectedDeckIds.includes(deck.id) ? 'bg-primary/10' : ''
                            }`}
                          >
                            <input
                              type="checkbox"
                              id={`deck-${deck.id}`}
                              checked={selectedDeckIds.includes(deck.id)}
                              onChange={() => toggleDeck(deck.id)}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                <span className="font-medium truncate">{deck.name}</span>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs flex-shrink-0">
                              {deck.cardCount}
                            </Badge>
                          </label>
                        ))}
                      </div>
                    ))}
                    {filteredDecks.length === 0 && (
                      <p className="text-sm text-muted-foreground py-8 text-center">
                        No decks match your search
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Stage Order with Drag & Drop */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Stage Order ({selectedDecks.length})</Label>
                {selectedDecks.length > 0 && (
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs text-destructive"
                    onClick={clearAll}
                  >
                    Clear All
                  </Button>
                )}
              </div>

              {selectedDecks.length === 0 ? (
                <div className="h-[340px] border-2 border-dashed rounded-md flex items-center justify-center">
                  <p className="text-sm text-muted-foreground text-center px-4">
                    Select decks from the left panel.<br />
                    Drag to reorder stages.
                  </p>
                </div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <div className="h-[340px] border rounded-md overflow-y-auto">
                    <div className="p-2 space-y-2">
                      <SortableContext
                        items={selectedDeckIds}
                        strategy={verticalListSortingStrategy}
                      >
                        {selectedDecks.map((deck, index) => (
                          <SortableStageItem
                            key={deck.id}
                            deck={deck}
                            index={index}
                            onRemove={removeDeck}
                          />
                        ))}
                      </SortableContext>
                    </div>
                  </div>
                </DndContext>
              )}
            </div>
          </div>

        </form>

        {/* Footer - Fixed at bottom */}
        <div className="flex justify-end gap-2 p-6 border-t bg-background">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !name || selectedDeckIds.length === 0}
          >
            {loading
              ? 'Saving...'
              : initialData
              ? 'Update Path'
              : `Create Path (${selectedDecks.length} stages)`}
          </Button>
        </div>
      </div>
    </div>
  );
}
