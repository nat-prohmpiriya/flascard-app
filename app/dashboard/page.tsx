'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useDecks } from '@/hooks/useDecks';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { DeckCard } from '@/components/deck/DeckCard';
import { DeckForm } from '@/components/deck/DeckForm';
import { StatsCard } from '@/components/progress/StatsCard';
import { ProgressChart } from '@/components/progress/ProgressChart';
import { Button } from '@/components/ui/button';
import { Deck, DeckFormData, DailyProgress } from '@/types';
import { getTodayStats, getDailyProgress } from '@/services/progress';
import { toast } from 'sonner';
import { Plus, BookOpen, Target, TrendingUp, Flame } from 'lucide-react';
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
  const { decks, loading, addDeck, editDeck, removeDeck } = useDecks();

  const [showDeckForm, setShowDeckForm] = useState(false);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
  const [deletingDeck, setDeletingDeck] = useState<Deck | null>(null);

  const [todayStats, setTodayStats] = useState({ cardsStudied: 0, correctCount: 0, incorrectCount: 0 });
  const [weeklyProgress, setWeeklyProgress] = useState<DailyProgress[]>([]);

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

  const totalCards = decks.reduce((sum, deck) => sum + deck.cardCount, 0);
  const todayAccuracy = todayStats.cardsStudied > 0
    ? Math.round((todayStats.correctCount / todayStats.cardsStudied) * 100)
    : 0;

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
            <Button onClick={() => setShowDeckForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Deck
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : decks.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No decks yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first deck to start learning
              </p>
              <Button onClick={() => setShowDeckForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Deck
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {decks.map((deck) => (
                <DeckCard
                  key={deck.id}
                  deck={deck}
                  onEdit={(d) => setEditingDeck(d)}
                  onDelete={(d) => setDeletingDeck(d)}
                />
              ))}
            </div>
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
      </div>
    </ProtectedRoute>
  );
}
