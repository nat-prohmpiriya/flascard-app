'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { CardList } from '@/components/flashcard/CardList';
import { CardTable } from '@/components/flashcard/CardTable';
import { CardForm } from '@/components/flashcard/CardForm';
import { ImportExport } from '@/components/flashcard/ImportExport';
import { Button } from '@/components/ui/button';
import { Card, CardFormData, Deck, ImportCard } from '@/types';
import { useCards } from '@/hooks/useCards';
import { getDeck } from '@/services/deck';
import { toast } from 'sonner';
import { ArrowLeft, Plus, LayoutGrid, List, Search, Play } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export default function DeckCardsPage() {
  const params = useParams();
  const router = useRouter();
  const deckId = params.deckId as string;

  const { cards, loading, addCard, editCard, removeCard, importCards } = useCards(deckId);
  const [deck, setDeck] = useState<Deck | null>(null);

  const [showCardForm, setShowCardForm] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [deletingCard, setDeletingCard] = useState<Card | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (deckId) {
      getDeck(deckId).then((d) => {
        if (!d) {
          router.push('/dashboard');
          return;
        }
        setDeck(d);
      });
    }
  }, [deckId, router]);

  const handleCreateCard = async (data: CardFormData) => {
    const card = await addCard(data);
    if (card) {
      toast.success('Card created successfully!');
    }
  };

  const handleEditCard = async (data: CardFormData) => {
    if (!editingCard) return;
    const success = await editCard(editingCard.id, data);
    if (success) {
      toast.success('Card updated successfully!');
      setEditingCard(null);
    }
  };

  const handleDeleteCard = async () => {
    if (!deletingCard) return;
    const success = await removeCard(deletingCard.id);
    if (success) {
      toast.success('Card deleted successfully!');
      setDeletingCard(null);
    }
  };

  const handleImport = async (importedCards: ImportCard[]): Promise<boolean> => {
    const success = await importCards(importedCards);
    if (success) {
      toast.success(`Imported ${importedCards.length} cards successfully!`);
    }
    return success;
  };

  const filteredCards = cards.filter(card => {
    const query = searchQuery.toLowerCase();
    return (
      card.vocab.toLowerCase().includes(query) ||
      card.meaning.toLowerCase().includes(query) ||
      card.example.toLowerCase().includes(query) ||
      card.pronunciation.toLowerCase().includes(query)
    );
  });

  if (!deck) {
    return (
      <ProtectedRoute>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </ProtectedRoute>
    );
  }

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
            <h1 className="text-2xl font-bold">{deck.name}</h1>
            <p className="text-muted-foreground">{cards.length} cards</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search cards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
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
          <Button onClick={() => setShowCardForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Card
          </Button>
          <Button asChild variant="secondary">
            <Link href={`/study/${deckId}`}>
              <Play className="mr-2 h-4 w-4" />
              Study
            </Link>
          </Button>
        </div>

        {/* Import/Export */}
        <ImportExport deck={deck} cards={cards} onImport={handleImport} />

        {/* Cards List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : viewMode === 'grid' ? (
          <CardList
            cards={filteredCards}
            onEdit={(c) => setEditingCard(c)}
            onDelete={(c) => setDeletingCard(c)}
            sourceLang={deck.sourceLang}
            targetLang={deck.targetLang}
          />
        ) : (
          <CardTable
            cards={filteredCards}
            onEdit={(c) => setEditingCard(c)}
            onDelete={(c) => setDeletingCard(c)}
            sourceLang={deck.sourceLang}
            targetLang={deck.targetLang}
          />
        )}

        {/* Create Card Form */}
        <CardForm
          open={showCardForm}
          onClose={() => setShowCardForm(false)}
          onSubmit={handleCreateCard}
        />

        {/* Edit Card Form */}
        {editingCard && (
          <CardForm
            open={!!editingCard}
            onClose={() => setEditingCard(null)}
            onSubmit={handleEditCard}
            initialData={editingCard}
          />
        )}

        {/* Delete Confirmation */}
        <Dialog open={!!deletingCard} onOpenChange={() => setDeletingCard(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Card</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this card? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeletingCard(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteCard}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
