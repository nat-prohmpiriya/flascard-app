'use client';

import { useState, useMemo } from 'react';
import { useDecks } from '@/hooks/useDecks';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { DeckCard } from '@/components/deck/DeckCard';
import { DeckTable } from '@/components/deck/DeckTable';
import { DeckForm } from '@/components/deck/DeckForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Deck, DeckFormData } from '@/types';
import { toast } from 'sonner';
import { Plus, BookOpen, Search, Trash2, LayoutGrid, List, Filter, X, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export default function DecksPage() {
  const { decks, loading, addDeck, editDeck, removeDeck, removeAllDecks } = useDecks();

  const [showDeckForm, setShowDeckForm] = useState(false);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
  const [deletingDeck, setDeletingDeck] = useState<Deck | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Tag color mapping
  const TAG_COLORS: Record<string, string> = {
    english: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    A1: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    A2: 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200',
    B1: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    B2: 'bg-yellow-200 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200',
    C1: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    C2: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    vocabulary: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'phrasal-verb': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    collocation: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    phrase: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
    grammar: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
    programming: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  };

  // Extract all unique tags from decks
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    decks.forEach((deck) => {
      deck.tags?.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [decks]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearTags = () => setSelectedTags([]);

  const handleCreateDeck = async (data: DeckFormData) => {
    const deck = await addDeck(data);
    if (deck) {
      toast.success('Deck created successfully!');
    }
  };

  const handleEditDeck = async (data: DeckFormData) => {
    if (!editingDeck) return;
    const success = await editDeck(editingDeck.id, data);
    if (success) {
      toast.success('Deck updated successfully!');
      setEditingDeck(null);
    }
  };

  const handleDeleteDeck = async () => {
    if (!deletingDeck) return;
    const success = await removeDeck(deletingDeck.id);
    if (success) {
      toast.success('Deck deleted successfully!');
      setDeletingDeck(null);
    }
  };

  const handleDeleteAllDecks = async () => {
    const success = await removeAllDecks();
    if (success) {
      toast.success('All decks deleted successfully!');
      setShowDeleteAllConfirm(false);
    }
  };

  const totalCards = decks.reduce((sum, deck) => sum + deck.cardCount, 0);

  const filteredDecks = useMemo(() => {
    let filtered = decks;

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter((deck) =>
        selectedTags.every((tag) => deck.tags?.includes(tag))
      );
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(deck =>
        deck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deck.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [decks, selectedTags, searchQuery]);

  return (
    <ProtectedRoute>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              My Decks
            </h1>
            <p className="text-sm text-muted-foreground">
              {decks.length} decks · {totalCards} cards
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search decks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="icon-sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="icon-sm"
                onClick={() => setViewMode('table')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={() => setShowDeckForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Deck
            </Button>
            {decks.length > 0 && (
              <Button variant="destructive" onClick={() => setShowDeleteAllConfirm(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete All
              </Button>
            )}
          </div>
        </div>

        {/* Tag Filter */}
        {allTags.length > 0 && (
          <div className="p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filter by Tags</span>
              {selectedTags.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearTags} className="h-6 px-2">
                  <X className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                  className={`cursor-pointer transition-all ${
                    selectedTags.includes(tag)
                      ? ''
                      : TAG_COLORS[tag] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                  }`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
            {selectedTags.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                Found: <span className="font-medium">{filteredDecks.length} decks</span>
              </p>
            )}
          </div>
        )}

        {/* Decks List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredDecks.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            {decks.length === 0 ? (
              <>
                <h3 className="text-lg font-medium mb-2">No decks yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first deck to start learning
                </p>
                <Button onClick={() => setShowDeckForm(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Deck
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium mb-2">No decks found</h3>
                <p className="text-muted-foreground mb-4">
                  Try a different search term or filter
                </p>
                <div className="flex gap-2 justify-center">
                  {searchQuery && (
                    <Button variant="outline" onClick={() => setSearchQuery('')}>
                      Clear Search
                    </Button>
                  )}
                  {selectedTags.length > 0 && (
                    <Button variant="outline" onClick={clearTags}>
                      Clear Tags
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredDecks.map((deck) => (
              <DeckCard
                key={deck.id}
                deck={deck}
                onEdit={(d) => setEditingDeck(d)}
                onDelete={(d) => setDeletingDeck(d)}
              />
            ))}
          </div>
        ) : (
          <DeckTable
            decks={filteredDecks}
            onEdit={(d) => setEditingDeck(d)}
            onDelete={(d) => setDeletingDeck(d)}
          />
        )}

        {/* Create Deck Form */}
        <DeckForm
          open={showDeckForm}
          onClose={() => setShowDeckForm(false)}
          onSubmit={handleCreateDeck}
        />

        {/* Edit Deck Form */}
        {editingDeck && (
          <DeckForm
            open={!!editingDeck}
            onClose={() => setEditingDeck(null)}
            onSubmit={handleEditDeck}
            initialData={editingDeck}
          />
        )}

        {/* Delete Confirmation */}
        <Dialog open={!!deletingDeck} onOpenChange={() => setDeletingDeck(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Deck</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;{deletingDeck?.name}&quot;? This will also delete all cards in this deck. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeletingDeck(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteDeck}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete All Confirmation */}
        <Dialog open={showDeleteAllConfirm} onOpenChange={setShowDeleteAllConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete All Decks</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete all {decks.length} deck(s)? This will also delete all cards in these decks. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteAllConfirm(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteAllDecks}>
                Delete All
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
