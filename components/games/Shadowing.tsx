'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card as CardType, Deck } from '@/types';
import { useTTS } from '@/hooks/useTTS';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Volume2, Mic, MicOff, ArrowLeft, RotateCcw, Play, SkipForward } from 'lucide-react';

interface ShadowingProps {
  cards: CardType[];
  deck: Deck;
  onEnd: () => void;
}

type Phase = 'listen' | 'repeat' | 'result';

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function Shadowing({ cards, deck, onEnd }: ShadowingProps) {
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
  const [phase, setPhase] = useState<Phase>('listen');
  const [accuracy, setAccuracy] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [gameEnded, setGameEnded] = useState(false);

  // Initialize game
  useEffect(() => {
    const shuffled = shuffleArray(cards).slice(0, 10);
    setShuffledCards(shuffled);
  }, [cards]);

  const currentCard = shuffledCards[currentIndex];

  // Handle speech recognition result
  useEffect(() => {
    if (result?.isFinal && currentCard && phase === 'repeat') {
      const text = currentCard.example || currentCard.vocab;
      const similarity = compareText(result.transcript, text);
      setAccuracy(similarity);
      setPhase('result');
      setScores((prev) => [...prev, similarity]);
    }
  }, [result, currentCard, phase, compareText]);

  const playAudio = useCallback(() => {
    if (currentCard && ttsSupported) {
      const text = currentCard.example || currentCard.vocab;
      speakEnglish(text);
    }
  }, [currentCard, ttsSupported, speakEnglish]);

  const handleListen = () => {
    playAudio();
  };

  const handleStartRepeat = () => {
    setPhase('repeat');
    resetResult();
    startListening();
  };

  const handleStopRepeat = () => {
    stopListening();
  };

  const handleNext = () => {
    const nextIndex = currentIndex + 1;

    if (nextIndex >= shuffledCards.length) {
      setGameEnded(true);
      return;
    }

    setCurrentIndex(nextIndex);
    setPhase('listen');
    setAccuracy(0);
    resetResult();
  };

  const handleSkip = () => {
    setScores((prev) => [...prev, 0]);
    handleNext();
  };

  const handleRestart = () => {
    const shuffled = shuffleArray(cards).slice(0, 10);
    setShuffledCards(shuffled);
    setCurrentIndex(0);
    setPhase('listen');
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
            <h2 className="text-3xl font-bold mb-4">Shadowing Complete!</h2>
            <div className="text-6xl font-bold text-primary mb-2">
              {avgScore}%
            </div>
            <p className="text-muted-foreground mb-6">average accuracy</p>

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

  const displayText = currentCard.example || currentCard.vocab;
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
        <Button variant="ghost" size="sm" onClick={handleSkip}>
          <SkipForward className="h-4 w-4 mr-1" />
          Skip
        </Button>
      </div>

      {/* Progress */}
      <Progress
        value={((currentIndex + 1) / shuffledCards.length) * 100}
      />

      {/* Phase Indicator */}
      <div className="flex justify-center gap-4">
        <div className={`px-4 py-2 rounded-full ${phase === 'listen' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
          1. Listen
        </div>
        <div className={`px-4 py-2 rounded-full ${phase === 'repeat' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
          2. Repeat
        </div>
        <div className={`px-4 py-2 rounded-full ${phase === 'result' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
          3. Result
        </div>
      </div>

      {/* Not Supported Warning */}
      {!speechSupported && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Speech recognition is not supported in your browser. Please use Chrome or Safari.
        </div>
      )}

      {/* Main Card */}
      <Card>
        <CardContent className="p-8">
          {/* Phase: Listen */}
          {phase === 'listen' && (
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                Step 1: Listen carefully to the phrase
              </p>

              <div className="bg-muted rounded-lg p-6 mb-6">
                <p className="text-xl font-medium mb-2">{displayText}</p>
                {currentCard.exampleTranslation && (
                  <p className="text-muted-foreground">{currentCard.exampleTranslation}</p>
                )}
              </div>

              <Button
                size="lg"
                onClick={handleListen}
                disabled={isSpeaking}
                className="mb-4"
              >
                <Volume2 className={`mr-2 h-5 w-5 ${isSpeaking ? 'animate-pulse' : ''}`} />
                {isSpeaking ? 'Playing...' : 'Play Audio'}
              </Button>

              <div className="mt-6">
                <Button onClick={handleStartRepeat} disabled={!speechSupported}>
                  <Play className="mr-2 h-4 w-4" />
                  Ready to Repeat
                </Button>
              </div>
            </div>
          )}

          {/* Phase: Repeat */}
          {phase === 'repeat' && (
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                Step 2: Now repeat what you heard
              </p>

              <div className="bg-muted rounded-lg p-6 mb-6 opacity-50">
                <p className="text-xl font-medium">{displayText}</p>
              </div>

              <Button
                size="lg"
                variant={isListening ? 'destructive' : 'default'}
                onClick={isListening ? handleStopRepeat : handleStartRepeat}
                className={`h-24 w-24 rounded-full ${isListening ? 'animate-pulse' : ''}`}
              >
                {isListening ? (
                  <MicOff className="h-12 w-12" />
                ) : (
                  <Mic className="h-12 w-12" />
                )}
              </Button>

              <p className="text-sm text-muted-foreground mt-4">
                {isListening ? 'Listening... Click to stop' : 'Click to start speaking'}
              </p>

              {result && !result.isFinal && (
                <p className="mt-4 text-muted-foreground">
                  Hearing: {result.transcript}
                </p>
              )}

              <div className="mt-6">
                <Button variant="ghost" onClick={() => { setPhase('listen'); resetResult(); }}>
                  <Volume2 className="mr-2 h-4 w-4" />
                  Listen Again
                </Button>
              </div>
            </div>
          )}

          {/* Phase: Result */}
          {phase === 'result' && (
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                Step 3: Your result
              </p>

              <div className={`text-6xl font-bold mb-4 ${getAccuracyColor()}`}>
                {accuracy}%
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Original:</p>
                  <p className="font-medium">{displayText}</p>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">You said:</p>
                  <p className="font-medium">{result?.transcript || '-'}</p>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={() => { setPhase('listen'); resetResult(); }}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Button onClick={handleNext}>
                  {currentIndex + 1 >= shuffledCards.length ? 'See Results' : 'Next Phrase'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
