'use client';

import { useState, useEffect, use, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getDeck } from '@/services/deck';
import { getDeckCards } from '@/services/card';
import { useTypingGame } from '@/hooks/useTypingGame';
import { TypingArea } from '@/components/typing/TypingArea';
import { TypingStats } from '@/components/typing/TypingStats';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, RotateCcw, Shuffle, Trophy, Loader2, BookOpen } from 'lucide-react';
import Link from 'next/link';
import type { Deck, Card as CardType } from '@/types';

type TypingMode = 'vocab' | 'meaning' | 'mixed';

interface PageProps {
  params: Promise<{ deckId: string }>;
}

export default function DeckTypingPage({ params }: PageProps) {
  const { deckId } = use(params);
  const router = useRouter();
  const { firebaseUser } = useAuth();

  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<TypingMode>('vocab');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [completedCards, setCompletedCards] = useState(0);

  // Load deck and cards
  useEffect(() => {
    async function loadData() {
      if (!firebaseUser) {
        setLoading(false);
        return;
      }

      try {
        const [deckData, cardsData] = await Promise.all([
          getDeck(deckId),
          getDeckCards(deckId, firebaseUser.uid),
        ]);
        setDeck(deckData);
        setCards(cardsData);
      } catch (error) {
        console.error('Failed to load deck:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [deckId, firebaseUser]);

  // Generate text based on mode
  const currentText = useMemo(() => {
    if (cards.length === 0) return '';
    const card = cards[currentCardIndex];
    if (!card) return '';

    switch (mode) {
      case 'vocab':
        return card.vocab;
      case 'meaning':
        return card.meaning;
      case 'mixed':
        return `${card.vocab} - ${card.meaning}`;
      default:
        return card.vocab;
    }
  }, [cards, currentCardIndex, mode]);

  const currentCard = cards[currentCardIndex];

  const {
    state,
    stats,
    start,
    reset,
    handleKeyPress,
    handleBackspace,
    isPlaying,
    isFinished,
    isIdle,
  } = useTypingGame({
    text: currentText,
    onComplete: () => {
      setShowResults(true);
      setCompletedCards((prev) => prev + 1);
    },
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!firebaseUser) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Please login to continue</h1>
        <Button asChild>
          <Link href="/login">Login</Link>
        </Button>
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Deck not found</h1>
        <Button asChild>
          <Link href="/typing">Back to Typing</Link>
        </Button>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold mb-4">No cards in this deck</h1>
        <p className="text-muted-foreground mb-4">
          Add some cards to start practicing!
        </p>
        <Button asChild>
          <Link href={`/decks/${deckId}/cards`}>Add Cards</Link>
        </Button>
      </div>
    );
  }

  const handleNextCard = () => {
    const nextIndex = (currentCardIndex + 1) % cards.length;
    setCurrentCardIndex(nextIndex);
    setShowResults(false);
    reset();
  };

  const handleRandomCard = () => {
    const randomIndex = Math.floor(Math.random() * cards.length);
    setCurrentCardIndex(randomIndex);
    setShowResults(false);
    reset();
  };

  const handleRestart = () => {
    setShowResults(false);
    reset();
  };

  const handleModeChange = (value: TypingMode) => {
    setMode(value);
    setShowResults(false);
    reset();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/typing')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">{deck.name}</h1>
              <p className="text-sm text-muted-foreground">
                Card {currentCardIndex + 1} of {cards.length}
              </p>
            </div>
          </div>
        </div>

        <Select value={mode} onValueChange={handleModeChange}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="vocab">Type Vocab</SelectItem>
            <SelectItem value="meaning">Type Meaning</SelectItem>
            <SelectItem value="mixed">Type Both</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Bar */}
      {(isPlaying || isFinished) && <TypingStats stats={stats} />}

      {/* Current Card Info */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {mode === 'meaning' ? 'Type the meaning' : mode === 'mixed' ? 'Type vocab and meaning' : 'Type the vocabulary'}
            </CardTitle>
            <Badge variant="secondary">
              {completedCards} completed
            </Badge>
          </div>
          {mode === 'vocab' && currentCard && (
            <CardDescription className="text-base">
              Meaning: <span className="font-medium">{currentCard.meaning}</span>
            </CardDescription>
          )}
          {mode === 'meaning' && currentCard && (
            <CardDescription className="text-base">
              Vocab: <span className="font-medium">{currentCard.vocab}</span>
              {currentCard.pronunciation && (
                <span className="ml-2 text-muted-foreground">
                  ({currentCard.pronunciation})
                </span>
              )}
            </CardDescription>
          )}
        </CardHeader>
      </Card>

      {/* Typing Area */}
      {!showResults && currentText && (
        <TypingArea
          text={currentText}
          currentIndex={state.currentIndex}
          errors={state.errors}
          userInput={state.userInput}
          isPlaying={isPlaying}
          onKeyPress={handleKeyPress}
          onBackspace={handleBackspace}
          onStart={start}
        />
      )}

      {/* Results */}
      {showResults && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              Card Complete!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <TypingStats stats={stats} showDetailed />

            <div className="flex gap-4 justify-center">
              <Button onClick={handleRestart} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button onClick={handleNextCard}>
                Next Card
              </Button>
              <Button onClick={handleRandomCard} variant="secondary">
                <Shuffle className="h-4 w-4 mr-2" />
                Random
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      {isIdle && !showResults && (
        <div className="flex justify-center gap-4">
          <Button onClick={handleRandomCard} variant="outline">
            <Shuffle className="h-4 w-4 mr-2" />
            Random Card
          </Button>
        </div>
      )}
    </div>
  );
}
