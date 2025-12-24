'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card as CardType, Deck } from '@/types';
import { useTTS } from '@/hooks/useTTS';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Volume2, Check, X, ArrowLeft, RotateCcw, Timer, Flame } from 'lucide-react';

interface SpeedQuizProps {
  cards: CardType[];
  deck: Deck;
  onEnd: () => void;
}

const TIME_LIMIT = 10; // seconds per question
const POINTS_BASE = 100;
const STREAK_BONUS = 10;

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function SpeedQuiz({ cards, deck, onEnd }: SpeedQuizProps) {
  const { speakEnglish, isSpeaking, isSupported } = useTTS();
  const [shuffledCards, setShuffledCards] = useState<CardType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [gameEnded, setGameEnded] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const generateOptions = useCallback((currentCard: CardType, allCards: CardType[]): string[] => {
    const correctAnswer = currentCard.meaning;
    const wrongAnswers = allCards
      .filter((c) => c.id !== currentCard.id)
      .map((c) => c.meaning);
    const shuffledWrong = shuffleArray(wrongAnswers).slice(0, 3);
    return shuffleArray([correctAnswer, ...shuffledWrong]);
  }, []);

  // Initialize game
  useEffect(() => {
    const shuffled = shuffleArray(cards).slice(0, 15);
    setShuffledCards(shuffled);
    if (shuffled.length > 0) {
      setOptions(generateOptions(shuffled[0], cards));
    }
  }, [cards, generateOptions]);

  const currentCard = shuffledCards[currentIndex];

  // Timer
  useEffect(() => {
    if (answered || gameEnded || !currentCard) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up - mark as wrong
          setAnswered(true);
          setStreak(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [answered, gameEnded, currentCard, currentIndex]);

  const playAudio = useCallback(() => {
    if (currentCard && isSupported) {
      speakEnglish(currentCard.vocab);
    }
  }, [currentCard, isSupported, speakEnglish]);

  // Auto-play audio when card changes
  useEffect(() => {
    if (currentCard && !answered) {
      const timer = setTimeout(playAudio, 300);
      return () => clearTimeout(timer);
    }
  }, [currentCard, answered, playAudio]);

  const handleAnswer = (answer: string) => {
    if (answered) return;

    if (timerRef.current) clearInterval(timerRef.current);

    const isCorrect = answer === currentCard.meaning;
    setAnswered(true);
    setSelectedAnswer(answer);

    if (isCorrect) {
      const timeBonus = Math.floor((timeLeft / TIME_LIMIT) * POINTS_BASE);
      const streakBonus = streak * STREAK_BONUS;
      setScore((prev) => prev + timeBonus + streakBonus);
      setStreak((prev) => {
        const newStreak = prev + 1;
        if (newStreak > bestStreak) setBestStreak(newStreak);
        return newStreak;
      });
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    const nextIndex = currentIndex + 1;

    if (nextIndex >= shuffledCards.length) {
      setGameEnded(true);
      return;
    }

    setCurrentIndex(nextIndex);
    setOptions(generateOptions(shuffledCards[nextIndex], cards));
    setAnswered(false);
    setSelectedAnswer(null);
    setTimeLeft(TIME_LIMIT);
  };

  const handleRestart = () => {
    const shuffled = shuffleArray(cards).slice(0, 15);
    setShuffledCards(shuffled);
    setCurrentIndex(0);
    setOptions(generateOptions(shuffled[0], cards));
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setTimeLeft(TIME_LIMIT);
    setAnswered(false);
    setSelectedAnswer(null);
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
    return (
      <div className="max-w-md mx-auto space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Game Complete!</h2>
            <div className="text-6xl font-bold text-primary mb-2">
              {score}
            </div>
            <p className="text-muted-foreground mb-6">points</p>

            <div className="flex justify-center gap-8 mb-6">
              <div className="text-center">
                <Flame className="h-8 w-8 mx-auto text-orange-500 mb-1" />
                <p className="text-2xl font-bold">{bestStreak}</p>
                <p className="text-sm text-muted-foreground">Best Streak</p>
              </div>
            </div>

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

  const timerColor = timeLeft > 5 ? 'text-green-500' : timeLeft > 2 ? 'text-yellow-500' : 'text-red-500';

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onEnd}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Exit
        </Button>
        <div className="flex items-center gap-4">
          {streak > 0 && (
            <div className="flex items-center gap-1 text-orange-500">
              <Flame className="h-5 w-5" />
              <span className="font-bold">{streak}</span>
            </div>
          )}
          <div className="font-bold text-lg">
            {score} pts
          </div>
        </div>
      </div>

      {/* Progress */}
      <Progress
        value={((currentIndex + 1) / shuffledCards.length) * 100}
      />

      {/* Timer */}
      <div className="flex justify-center">
        <div className={`flex items-center gap-2 text-2xl font-bold ${timerColor}`}>
          <Timer className="h-6 w-6" />
          {timeLeft}s
        </div>
      </div>

      {/* Audio Card */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <Button
              size="lg"
              variant={isSpeaking ? 'secondary' : 'outline'}
              onClick={playAudio}
              disabled={isSpeaking}
              className="h-20 w-20 rounded-full"
            >
              <Volume2 className={`h-10 w-10 ${isSpeaking ? 'animate-pulse' : ''}`} />
            </Button>
            {answered && (
              <p className="mt-4 text-xl font-bold">{currentCard.vocab}</p>
            )}
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-3">
            {options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = option === currentCard.meaning;
              const showResult = answered;

              let className = 'h-auto py-4 px-4 text-sm';
              if (showResult) {
                if (isCorrect) className += ' bg-green-500 hover:bg-green-600 text-white';
                else if (isSelected) className += ' bg-red-500 hover:bg-red-600 text-white';
              }

              return (
                <Button
                  key={index}
                  variant={showResult && (isCorrect || isSelected) ? 'default' : 'outline'}
                  className={className}
                  onClick={() => handleAnswer(option)}
                  disabled={answered}
                >
                  <span className="line-clamp-2">{option}</span>
                  {showResult && isCorrect && <Check className="h-4 w-4 ml-1 flex-shrink-0" />}
                  {showResult && isSelected && !isCorrect && <X className="h-4 w-4 ml-1 flex-shrink-0" />}
                </Button>
              );
            })}
          </div>

          {/* Next Button */}
          {answered && (
            <div className="mt-6 text-center">
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
