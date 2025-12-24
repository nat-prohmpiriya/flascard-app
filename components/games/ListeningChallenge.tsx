'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card as CardType, Deck } from '@/types';
import { useTTS } from '@/hooks/useTTS';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Volume2, Check, X, ArrowLeft, RotateCcw } from 'lucide-react';

interface ListeningChallengeProps {
  cards: CardType[];
  deck: Deck;
  onEnd: () => void;
}

interface GameState {
  currentIndex: number;
  score: number;
  answered: boolean;
  selectedAnswer: string | null;
  shuffledCards: CardType[];
  options: string[];
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function ListeningChallenge({ cards, deck, onEnd }: ListeningChallengeProps) {
  const { speakEnglish, isSpeaking, isSupported } = useTTS();
  const [gameState, setGameState] = useState<GameState>({
    currentIndex: 0,
    score: 0,
    answered: false,
    selectedAnswer: null,
    shuffledCards: [],
    options: [],
  });
  const [gameEnded, setGameEnded] = useState(false);

  // Initialize game
  useEffect(() => {
    const shuffled = shuffleArray(cards).slice(0, 10); // Max 10 questions
    setGameState({
      currentIndex: 0,
      score: 0,
      answered: false,
      selectedAnswer: null,
      shuffledCards: shuffled,
      options: generateOptions(shuffled[0], cards),
    });
  }, [cards]);

  const generateOptions = (currentCard: CardType, allCards: CardType[]): string[] => {
    const correctAnswer = currentCard.meaning;
    const wrongAnswers = allCards
      .filter((c) => c.id !== currentCard.id)
      .map((c) => c.meaning);

    const shuffledWrong = shuffleArray(wrongAnswers).slice(0, 3);
    return shuffleArray([correctAnswer, ...shuffledWrong]);
  };

  const currentCard = gameState.shuffledCards[gameState.currentIndex];

  const playAudio = useCallback(() => {
    if (currentCard && isSupported) {
      speakEnglish(currentCard.vocab);
    }
  }, [currentCard, isSupported, speakEnglish]);

  // Auto-play audio when card changes
  useEffect(() => {
    if (currentCard && !gameState.answered) {
      const timer = setTimeout(playAudio, 500);
      return () => clearTimeout(timer);
    }
  }, [currentCard, gameState.answered, playAudio]);

  const handleAnswer = (answer: string) => {
    if (gameState.answered) return;

    const isCorrect = answer === currentCard.meaning;
    setGameState((prev) => ({
      ...prev,
      answered: true,
      selectedAnswer: answer,
      score: isCorrect ? prev.score + 1 : prev.score,
    }));
  };

  const handleNext = () => {
    const nextIndex = gameState.currentIndex + 1;

    if (nextIndex >= gameState.shuffledCards.length) {
      setGameEnded(true);
      return;
    }

    const nextCard = gameState.shuffledCards[nextIndex];
    setGameState((prev) => ({
      ...prev,
      currentIndex: nextIndex,
      answered: false,
      selectedAnswer: null,
      options: generateOptions(nextCard, cards),
    }));
  };

  const handleRestart = () => {
    const shuffled = shuffleArray(cards).slice(0, 10);
    setGameState({
      currentIndex: 0,
      score: 0,
      answered: false,
      selectedAnswer: null,
      shuffledCards: shuffled,
      options: generateOptions(shuffled[0], cards),
    });
    setGameEnded(false);
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
    const percentage = Math.round((gameState.score / gameState.shuffledCards.length) * 100);

    return (
      <div className="max-w-md mx-auto space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-2">Game Complete!</h2>
            <div className="text-6xl font-bold text-primary mb-4">
              {gameState.score}/{gameState.shuffledCards.length}
            </div>
            <p className="text-xl text-muted-foreground mb-6">
              {percentage}% accuracy
            </p>
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
          Question {gameState.currentIndex + 1} of {gameState.shuffledCards.length}
        </div>
        <div className="text-sm font-medium">
          Score: {gameState.score}
        </div>
      </div>

      {/* Progress */}
      <Progress
        value={((gameState.currentIndex + 1) / gameState.shuffledCards.length) * 100}
      />

      {/* Audio Card */}
      <Card>
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <p className="text-muted-foreground mb-4">Listen and select the correct meaning</p>
            <Button
              size="lg"
              variant={isSpeaking ? 'secondary' : 'default'}
              onClick={playAudio}
              disabled={isSpeaking}
              className="h-24 w-24 rounded-full"
            >
              <Volume2 className={`h-12 w-12 ${isSpeaking ? 'animate-pulse' : ''}`} />
            </Button>
            {gameState.answered && (
              <p className="mt-4 text-2xl font-bold">{currentCard.vocab}</p>
            )}
          </div>

          {/* Options */}
          <div className="grid gap-3">
            {gameState.options.map((option, index) => {
              const isSelected = gameState.selectedAnswer === option;
              const isCorrect = option === currentCard.meaning;
              const showResult = gameState.answered;

              let buttonVariant: 'outline' | 'default' | 'destructive' = 'outline';
              if (showResult) {
                if (isCorrect) buttonVariant = 'default';
                else if (isSelected) buttonVariant = 'destructive';
              }

              return (
                <Button
                  key={index}
                  variant={buttonVariant}
                  className={`h-auto py-4 px-6 text-left justify-start ${
                    showResult && isCorrect ? 'bg-green-500 hover:bg-green-600' : ''
                  }`}
                  onClick={() => handleAnswer(option)}
                  disabled={gameState.answered}
                >
                  <span className="flex-1">{option}</span>
                  {showResult && isCorrect && <Check className="h-5 w-5 ml-2" />}
                  {showResult && isSelected && !isCorrect && <X className="h-5 w-5 ml-2" />}
                </Button>
              );
            })}
          </div>

          {/* Next Button */}
          {gameState.answered && (
            <div className="mt-6 text-center">
              <Button size="lg" onClick={handleNext}>
                {gameState.currentIndex + 1 >= gameState.shuffledCards.length ? 'See Results' : 'Next Question'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
