'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card as CardType, Deck } from '@/types';
import { useTTS } from '@/hooks/useTTS';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Mic, MicOff, Volume2, ArrowLeft, RotateCcw, Check, X } from 'lucide-react';

interface SpeakCheckProps {
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

export function SpeakCheck({ cards, deck, onEnd }: SpeakCheckProps) {
  const { speakEnglish, isSpeaking, isSupported: ttsSupported } = useTTS();
  const {
    isListening,
    isSupported: speechSupported,
    result,
    startListening,
    stopListening,
    resetResult,
    compareText,
  } = useSpeechRecognition({ lang: 'en-US' });

  const [shuffledCards, setShuffledCards] = useState<CardType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [accuracy, setAccuracy] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [gameEnded, setGameEnded] = useState(false);

  // Initialize game
  useEffect(() => {
    const shuffled = shuffleArray(cards).slice(0, 10);
    setShuffledCards(shuffled);
  }, [cards]);

  const currentCard = shuffledCards[currentIndex];

  // Check result when speech recognition completes
  useEffect(() => {
    if (result?.isFinal && currentCard) {
      const similarity = compareText(result.transcript, currentCard.vocab);
      setAccuracy(similarity);
      setAnswered(true);
      setScores((prev) => [...prev, similarity]);
    }
  }, [result, currentCard, compareText]);

  const handleSpeak = () => {
    if (isListening) {
      stopListening();
    } else {
      resetResult();
      setAnswered(false);
      setAccuracy(0);
      startListening();
    }
  };

  const playAudio = useCallback(() => {
    if (currentCard && ttsSupported) {
      speakEnglish(currentCard.vocab);
    }
  }, [currentCard, ttsSupported, speakEnglish]);

  const handleNext = () => {
    const nextIndex = currentIndex + 1;

    if (nextIndex >= shuffledCards.length) {
      setGameEnded(true);
      return;
    }

    setCurrentIndex(nextIndex);
    setAnswered(false);
    setAccuracy(0);
    resetResult();
  };

  const handleRestart = () => {
    const shuffled = shuffleArray(cards).slice(0, 10);
    setShuffledCards(shuffled);
    setCurrentIndex(0);
    setAnswered(false);
    setAccuracy(0);
    setScores([]);
    setGameEnded(false);
    resetResult();
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
    const avgScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    return (
      <div className="max-w-md mx-auto space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Speaking Complete!</h2>
            <div className="text-6xl font-bold text-primary mb-2">
              {avgScore}%
            </div>
            <p className="text-muted-foreground mb-6">average pronunciation accuracy</p>

            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={onEnd}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={handleRestart}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Practice Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getAccuracyColor = () => {
    if (accuracy >= 80) return 'text-green-500';
    if (accuracy >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

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
          Avg: {scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0}%
        </div>
      </div>

      {/* Progress */}
      <Progress
        value={((currentIndex + 1) / shuffledCards.length) * 100}
      />

      {/* Not Supported Warning */}
      {!speechSupported && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Speech recognition is not supported in your browser. Please use Chrome or Safari.
        </div>
      )}

      {/* Main Card */}
      <Card>
        <CardContent className="p-8">
          {/* Word to speak */}
          <div className="text-center mb-8">
            <p className="text-muted-foreground mb-2">Say this word:</p>
            <h2 className="text-4xl font-bold mb-2">{currentCard.vocab}</h2>
            {currentCard.pronunciation && (
              <p className="text-lg text-muted-foreground">{currentCard.pronunciation}</p>
            )}
            <p className="text-muted-foreground mt-2">{currentCard.meaning}</p>

            {/* Listen to correct pronunciation */}
            <Button
              variant="ghost"
              size="sm"
              onClick={playAudio}
              disabled={isSpeaking}
              className="mt-4"
            >
              <Volume2 className={`h-4 w-4 mr-2 ${isSpeaking ? 'animate-pulse' : ''}`} />
              Listen to pronunciation
            </Button>
          </div>

          {/* Microphone Button */}
          <div className="flex flex-col items-center">
            <Button
              size="lg"
              variant={isListening ? 'destructive' : 'default'}
              onClick={handleSpeak}
              disabled={!speechSupported || answered}
              className={`h-24 w-24 rounded-full ${isListening ? 'animate-pulse' : ''}`}
            >
              {isListening ? (
                <MicOff className="h-12 w-12" />
              ) : (
                <Mic className="h-12 w-12" />
              )}
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              {isListening ? 'Listening... Click to stop' : 'Click to start speaking'}
            </p>
          </div>

          {/* Interim Result */}
          {result && !result.isFinal && (
            <div className="mt-4 text-center">
              <p className="text-muted-foreground">Hearing: {result.transcript}</p>
            </div>
          )}

          {/* Result */}
          {answered && (
            <div className="mt-8 text-center">
              <div className={`flex items-center justify-center gap-2 mb-4 ${getAccuracyColor()}`}>
                {accuracy >= 80 ? (
                  <Check className="h-8 w-8" />
                ) : (
                  <X className="h-8 w-8" />
                )}
                <span className="text-4xl font-bold">{accuracy}%</span>
              </div>

              <div className="bg-muted rounded-lg p-4 mb-6">
                <p className="text-sm text-muted-foreground">You said:</p>
                <p className="text-xl font-medium">{result?.transcript || '-'}</p>
              </div>

              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={handleSpeak}>
                  <Mic className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Button onClick={handleNext}>
                  {currentIndex + 1 >= shuffledCards.length ? 'See Results' : 'Next Word'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
