'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { StudyCard } from '@/components/study/StudyCard';
import { StudyComplete } from '@/components/study/StudyComplete';
import { StudyModeSelector, StudyMode } from '@/components/study/StudyModeSelector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useStudy } from '@/hooks/useStudy';
import { useAuth } from '@/contexts/AuthContext';
import { getDeck } from '@/services/deck';
import { getDeckCards } from '@/services/card';
import { Deck, Card as CardType } from '@/types';
import { ArrowLeft, Play, MoreVertical, ListChecks, Settings2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ListeningChallenge,
  SpeedQuiz,
  Dictation,
  SpeakCheck,
  Shadowing,
} from '@/components/games';

export default function StudyPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const deckId = params.deckId as string;
  const { firebaseUser } = useAuth();

  const [deck, setDeck] = useState<Deck | null>(null);
  const [allCards, setAllCards] = useState<CardType[]>([]);
  const [mode, setMode] = useState<StudyMode | null>(null);
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

  // Load deck info
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

  // Load all cards for game modes
  useEffect(() => {
    if (deckId && firebaseUser && mode && mode !== 'flashcard') {
      getDeckCards(deckId, firebaseUser.uid).then(setAllCards);
    }
  }, [deckId, firebaseUser, mode]);

  // Check URL for mode parameter
  useEffect(() => {
    const modeParam = searchParams.get('mode') as StudyMode | null;
    if (modeParam) {
      setMode(modeParam);
    }
  }, [searchParams]);

  const handleSelectMode = (selectedMode: StudyMode) => {
    setMode(selectedMode);
    // Update URL without full navigation
    const url = new URL(window.location.href);
    url.searchParams.set('mode', selectedMode);
    window.history.pushState({}, '', url.toString());
  };

  const handleBackToModeSelection = () => {
    setMode(null);
    setStarted(false);
    resetSession();
    // Remove mode from URL
    const url = new URL(window.location.href);
    url.searchParams.delete('mode');
    window.history.pushState({}, '', url.toString());
  };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isComplete, started]);

  // Loading state
  if (!deck) {
    return (
      <ProtectedRoute>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </ProtectedRoute>
    );
  }

  // Mode selection screen
  if (!mode) {
    return (
      <ProtectedRoute>
        <StudyModeSelector deck={deck} onSelectMode={handleSelectMode} />
      </ProtectedRoute>
    );
  }

  // Game modes (not flashcard)
  if (mode !== 'flashcard') {
    // Loading cards for game
    if (allCards.length === 0) {
      return (
        <ProtectedRoute>
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </ProtectedRoute>
      );
    }

    // Not enough cards for game
    if (allCards.length < 4) {
      return (
        <ProtectedRoute>
          <div className="max-w-2xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <CardTitle>Not Enough Cards</CardTitle>
                <CardDescription>
                  This game requires at least 4 cards. Your deck has {allCards.length} card(s).
                </CardDescription>
              </CardHeader>
              <CardContent className="flex gap-4 justify-center">
                <Button variant="outline" onClick={handleBackToModeSelection}>
                  Choose Another Mode
                </Button>
                <Button asChild>
                  <Link href={`/decks/${deckId}/cards`}>Add Cards</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </ProtectedRoute>
      );
    }

    // Render game component based on mode
    const gameProps = {
      cards: allCards,
      deck: deck,
      onEnd: handleBackToModeSelection,
    };

    return (
      <ProtectedRoute>
        {mode === 'listening' && <ListeningChallenge {...gameProps} />}
        {mode === 'speed-quiz' && <SpeedQuiz {...gameProps} />}
        {mode === 'dictation' && <Dictation {...gameProps} />}
        {mode === 'speak' && <SpeakCheck {...gameProps} />}
        {mode === 'shadowing' && <Shadowing {...gameProps} />}
      </ProtectedRoute>
    );
  }

  // Flashcard mode
  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleBackToModeSelection}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Study: {deck.name}</h1>
              <p className="text-sm text-muted-foreground">{deck.cardCount} cards in deck</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/decks/${deckId}/cards`} className="flex items-center gap-2">
                  <ListChecks className="h-4 w-4" />
                  Manage Cards
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center gap-2">
                  <Settings2 className="h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
            sourceLang={deck.sourceLang}
            targetLang={deck.targetLang}
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
              <Button onClick={handleBackToModeSelection}>
                Try Other Modes
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </ProtectedRoute>
  );
}
