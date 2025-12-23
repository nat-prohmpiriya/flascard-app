'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDecks } from '@/hooks/useDecks';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { DeckCard } from '@/components/deck/DeckCard';
import { DeckTable } from '@/components/deck/DeckTable';
import { DeckForm } from '@/components/deck/DeckForm';
import { StatsCard } from '@/components/progress/StatsCard';
import { ProgressChart } from '@/components/progress/ProgressChart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Deck, DeckFormData, DailyProgress } from '@/types';
import { getTodayStats, getDailyProgress } from '@/services/progress';
import { toast } from 'sonner';
import { Plus, BookOpen, Target, TrendingUp, Flame, Search, Trash2, LayoutGrid, List } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export default function DashboardPage() {
  const { firebaseUser, user } = useAuth();
  const { decks, loading, addDeck, editDeck, removeDeck, removeAllDecks } = useDecks();

  const [showDeckForm, setShowDeckForm] = useState(false);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
  const [deletingDeck, setDeletingDeck] = useState<Deck | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);

  const [todayStats, setTodayStats] = useState({ cardsStudied: 0, correctCount: 0, incorrectCount: 0 });
  const [weeklyProgress, setWeeklyProgress] = useState<DailyProgress[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  useEffect(() => {
    if (firebaseUser) {
      getTodayStats(firebaseUser.uid).then(setTodayStats);
      getDailyProgress(firebaseUser.uid, 7).then(setWeeklyProgress);
    }
  }, [firebaseUser]);

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
  const todayAccuracy = todayStats.cardsStudied > 0
    ? Math.round((todayStats.correctCount / todayStats.cardsStudied) * 100)
    : 0;

  const filteredDecks = decks.filter(deck =>
    deck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    deck.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}!
          </h1>
          <p className="text-muted-foreground">
            Continue your learning journey
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Decks"
            value={decks.length}
            icon={BookOpen}
          />
          <StatsCard
            title="Total Cards"
            value={totalCards}
            icon={Target}
          />
          <StatsCard
            title="Studied Today"
            value={todayStats.cardsStudied}
            subtitle={`${todayAccuracy}% accuracy`}
            icon={Flame}
          />
          <StatsCard
            title="Daily Goal"
            value={`${Math.min(todayStats.cardsStudied, user?.settings?.dailyGoal || 20)}/${user?.settings?.dailyGoal || 20}`}
            icon={TrendingUp}
          />
        </div>

        {/* Weekly Progress */}
        {weeklyProgress.length > 0 && (
          <ProgressChart data={weeklyProgress} />
        )}

        {/* Decks */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">My Decks</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search decks..."
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
                    Try a different search term
                  </p>
                  <Button variant="outline" onClick={() => setSearchQuery('')}>
                    Clear Search
                  </Button>
                </>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
        </div>

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
