'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card as CardType, Deck } from '@/types';
import { useTTS } from '@/hooks/useTTS';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Volume2, Check, X, ArrowLeft, RotateCcw, Eye } from 'lucide-react';

interface DictationProps {
  cards: CardType[];
  deck: Deck;
  onEnd: () => void;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function normalizeText(text: string): string {
  return text.toLowerCase().trim().replace(/[.,!?;:'"]/g, '');
}

export function Dictation({ cards, deck, onEnd }: DictationProps) {
  const { speakEnglish, isSpeaking, isSupported } = useTTS();
  const [shuffledCards, setShuffledCards] = useState<CardType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);
  const [playCount, setPlayCount] = useState(0);

  // Initialize game
  useEffect(() => {
    const shuffled = shuffleArray(cards).slice(0, 10);
    setShuffledCards(shuffled);
  }, [cards]);

  const currentCard = shuffledCards[currentIndex];

  const playAudio = useCallback(() => {
    if (currentCard && isSupported) {
      speakEnglish(currentCard.vocab);
      setPlayCount((prev) => prev + 1);
    }
  }, [currentCard, isSupported, speakEnglish]);

  // Auto-play audio when card changes
  useEffect(() => {
    if (currentCard && !answered) {
      const timer = setTimeout(playAudio, 500);
      return () => clearTimeout(timer);
    }
  }, [currentCard, answered, playAudio]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answered || !userInput.trim()) return;

    const normalizedInput = normalizeText(userInput);
    const normalizedAnswer = normalizeText(currentCard.vocab);
    const correct = normalizedInput === normalizedAnswer;

    setIsCorrect(correct);
    setAnswered(true);

    if (correct) {
      // Bonus for fewer plays and no hints
      let points = 10;
      if (playCount <= 1) points += 5;
      if (!showHint) points += 5;
      setScore((prev) => prev + points);
    }
  };

  const handleNext = () => {
    const nextIndex = currentIndex + 1;

    if (nextIndex >= shuffledCards.length) {
      setGameEnded(true);
      return;
    }

    setCurrentIndex(nextIndex);
    setUserInput('');
    setAnswered(false);
    setIsCorrect(false);
    setShowHint(false);
    setPlayCount(0);
  };

  const handleRestart = () => {
    const shuffled = shuffleArray(cards).slice(0, 10);
    setShuffledCards(shuffled);
    setCurrentIndex(0);
    setUserInput('');
    setAnswered(false);
    setIsCorrect(false);
    setShowHint(false);
    setScore(0);
    setPlayCount(0);
    setGameEnded(false);
  };

  const getHint = (): string => {
    if (!currentCard) return '';
    const word = currentCard.vocab;
    const hintLength = Math.ceil(word.length / 3);
    return word.slice(0, hintLength) + '_'.repeat(word.length - hintLength);
  };

  if (!currentCard) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Game ended screen
  if (gameEnded) {
    const maxScore = shuffledCards.length * 20;
    const percentage = Math.round((score / maxScore) * 100);

    return (
      <div className="max-w-md mx-auto space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Dictation Complete!</h2>
            <div className="text-6xl font-bold text-primary mb-2">
              {score}
            </div>
            <p className="text-muted-foreground mb-2">out of {maxScore} points</p>
            <p className="text-lg mb-6">{percentage}% accuracy</p>

            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={onEnd}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={handleRestart}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Play Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onEnd}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Exit
        </Button>
        <div className="text-sm text-muted-foreground">
          {currentIndex + 1} / {shuffledCards.length}
        </div>
        <div className="font-bold">
          {score} pts
        </div>
      </div>

      {/* Progress */}
      <Progress
        value={((currentIndex + 1) / shuffledCards.length) * 100}
      />

      {/* Main Card */}
      <Card>
        <CardContent className="p-8">
          {/* Audio Button */}
          <div className="text-center mb-6">
            <p className="text-muted-foreground mb-4">
              Listen and type what you hear
            </p>
            <Button
              size="lg"
              variant={isSpeaking ? 'secondary' : 'default'}
              onClick={playAudio}
              disabled={isSpeaking}
              className="h-24 w-24 rounded-full"
            >
              <Volume2 className={`h-12 w-12 ${isSpeaking ? 'animate-pulse' : ''}`} />
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Played {playCount} time(s)
            </p>
          </div>

          {/* Hint */}
          {!answered && (
            <div className="text-center mb-4">
              {showHint ? (
                <p className="font-mono text-lg tracking-wider">{getHint()}</p>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHint(true)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Show Hint (-5 pts)
                </Button>
              )}
            </div>
          )}

          {/* Input Form */}
          <form onSubmit={handleSubmit}>
            <div className="flex gap-2">
              <Input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type what you hear..."
                disabled={answered}
                className={`text-lg ${
                  answered
                    ? isCorrect
                      ? 'border-green-500 bg-green-50'
                      : 'border-red-500 bg-red-50'
                    : ''
                }`}
                autoFocus
              />
              {!answered && (
                <Button type="submit" disabled={!userInput.trim()}>
                  Check
                </Button>
              )}
            </div>
          </form>

          {/* Result */}
          {answered && (
            <div className="mt-6 text-center">
              <div className={`flex items-center justify-center gap-2 mb-4 ${
                isCorrect ? 'text-green-600' : 'text-red-600'
              }`}>
                {isCorrect ? (
                  <>
                    <Check className="h-6 w-6" />
                    <span className="text-lg font-bold">Correct!</span>
                  </>
                ) : (
                  <>
                    <X className="h-6 w-6" />
                    <span className="text-lg font-bold">Not quite</span>
                  </>
                )}
              </div>

              <div className="bg-muted rounded-lg p-4 mb-6">
                <p className="text-sm text-muted-foreground">Answer:</p>
                <p className="text-xl font-bold">{currentCard.vocab}</p>
                <p className="text-muted-foreground">{currentCard.meaning}</p>
              </div>

              <Button size="lg" onClick={handleNext}>
                {currentIndex + 1 >= shuffledCards.length ? 'See Results' : 'Next'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
