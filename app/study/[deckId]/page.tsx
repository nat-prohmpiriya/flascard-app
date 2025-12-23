'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { StudyCard } from '@/components/study/StudyCard';
import { StudyComplete } from '@/components/study/StudyComplete';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useStudy } from '@/hooks/useStudy';
import { getDeck } from '@/services/deck';
import { Deck } from '@/types';
import { ArrowLeft, Play } from 'lucide-react';

export default function StudyPage() {
  const params = useParams();
  const router = useRouter();
  const deckId = params.deckId as string;

  const [deck, setDeck] = useState<Deck | null>(null);
  const [started, setStarted] = useState(false);

  const {
    currentCard,
    isFlipped,
    isComplete,
    loading,
    stats,
    startStudySession,
    flipCard,
    answerCard,
    endSession,
    resetSession,
  } = useStudy(deckId);

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

  const handleStart = async () => {
    await startStudySession();
    setStarted(true);
  };

  const handleComplete = async () => {
    await endSession();
  };

  const handleRestart = async () => {
    resetSession();
    setStarted(false);
  };

  useEffect(() => {
    if (isComplete && started) {
      handleComplete();
    }
  }, [isComplete, started]);

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
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold">Study: {deck.name}</h1>
            <p className="text-sm text-muted-foreground">{deck.cardCount} cards in deck</p>
          </div>
        </div>

        {/* Content */}
        {!started ? (
          // Start Screen
          <Card className="text-center">
            <CardHeader>
              <CardTitle>Ready to Study?</CardTitle>
              <CardDescription>
                Review your flashcards with spaced repetition.
                Cards will be shown based on how well you know them.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="lg" onClick={handleStart} disabled={loading}>
                {loading ? (
                  'Loading...'
                ) : (
                  <>
                    <Play className="mr-2 h-5 w-5" />
                    Start Study Session
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : isComplete ? (
          // Complete Screen
          <StudyComplete
            stats={stats}
            onRestart={handleRestart}
            deckId={deckId}
          />
        ) : currentCard ? (
          // Study Card
          <StudyCard
            card={currentCard}
            isFlipped={isFlipped}
            onFlip={flipCard}
            onAnswer={answerCard}
            stats={stats}
          />
        ) : (
          // No cards to review
          <Card className="text-center">
            <CardHeader>
              <CardTitle>All caught up!</CardTitle>
              <CardDescription>
                No cards due for review right now. Come back later or add more cards.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4 justify-center">
              <Button variant="outline" asChild>
                <Link href={`/decks/${deckId}/cards`}>Add Cards</Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  );
}
