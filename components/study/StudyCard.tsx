'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, ReviewQuality, Language, LANG_TO_TTS } from '@/types';
import { FlashCard } from '@/components/flashcard/FlashCard';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useTTS } from '@/hooks/useTTS';
import { XCircle, HelpCircle, ThumbsUp, CheckCircle, Volume2, Pause, Play, Minus, Plus, Settings2 } from 'lucide-react';

interface StudyCardProps {
  card: Card;
  isFlipped: boolean;
  onFlip: () => void;
  onAnswer: (quality: ReviewQuality) => void;
  stats: {
    total: number;
    correct: number;
    incorrect: number;
    remaining: number;
  };
  sourceLang?: Language;
  targetLang?: Language;
}

export function StudyCard({
  card,
  isFlipped,
  onFlip,
  onAnswer,
  stats,
  sourceLang = 'en',
  targetLang = 'th'
}: StudyCardProps) {
  const progress = ((stats.total - stats.remaining) / stats.total) * 100;

  const [autoMode, setAutoMode] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [autoStep, setAutoStep] = useState<'idle' | 'reading-vocab' | 'waiting-flip' | 'reading-meaning' | 'reading-example' | 'reading-example-translation' | 'waiting-next'>('idle');
  const [speed, setSpeed] = useState(1.0);

  // Auto Play read settings
  const [readMeaning, setReadMeaning] = useState(true);
  const [readExample, setReadExample] = useState(true);
  const [readTranslation, setReadTranslation] = useState(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { speak, stop, isSpeaking, isSupported } = useTTS();

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('study-autoplay-settings');
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        if (typeof settings.readMeaning === 'boolean') setReadMeaning(settings.readMeaning);
        if (typeof settings.readExample === 'boolean') setReadExample(settings.readExample);
        if (typeof settings.readTranslation === 'boolean') setReadTranslation(settings.readTranslation);
        if (typeof settings.speed === 'number') setSpeed(settings.speed);
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

  // Save settings to localStorage when changed
  useEffect(() => {
    localStorage.setItem('study-autoplay-settings', JSON.stringify({
      readMeaning,
      readExample,
      readTranslation,
      speed,
    }));
  }, [readMeaning, readExample, readTranslation, speed]);

  // Helper to speak with language setting
  const speakText = (text: string, lang: Language, onEnd?: () => void) => {
    const plainText = text.replace(/[#*`>\[\]()_~]/g, '').trim();
    speak(plainText, { lang: LANG_TO_TTS[lang], rate: speed, onEnd });
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Auto mode: Start reading vocab when card changes
  useEffect(() => {
    if (autoMode && !isPaused && card && !isFlipped) {
      setAutoStep('reading-vocab');
      speakText(card.vocab, sourceLang, () => {
        if (!isPaused) {
          setAutoStep('waiting-flip');
          timerRef.current = setTimeout(() => {
            onFlip();
          }, 1500);
        }
      });
    }
  }, [card?.id, autoMode]);

  // Helper to go to next card
  const goToNextCard = () => {
    setAutoStep('waiting-next');
    timerRef.current = setTimeout(() => {
      onAnswer(3); // Good
      setAutoStep('idle');
    }, 1500);
  };

  // Helper to read translation then next
  const readTranslationThenNext = () => {
    if (readTranslation && card.exampleTranslation) {
      setAutoStep('reading-example-translation');
      speakText(card.exampleTranslation, targetLang, () => {
        if (!isPaused) goToNextCard();
      });
    } else {
      goToNextCard();
    }
  };

  // Helper to read example then translation
  const readExampleThenNext = () => {
    if (readExample && card.example) {
      setAutoStep('reading-example');
      speakText(card.example, sourceLang, () => {
        if (!isPaused) readTranslationThenNext();
      });
    } else {
      readTranslationThenNext();
    }
  };

  // Auto mode: Read meaning and example after flip
  useEffect(() => {
    if (autoMode && !isPaused && isFlipped && autoStep === 'waiting-flip') {
      if (readMeaning) {
        setAutoStep('reading-meaning');
        speakText(card.meaning, targetLang, () => {
          if (!isPaused) readExampleThenNext();
        });
      } else {
        readExampleThenNext();
      }
    }
  }, [isFlipped, autoStep, isPaused]);

  // Handle pause/resume
  const handlePauseToggle = () => {
    if (isPaused) {
      setIsPaused(false);
      // Resume from current state
      if (autoStep === 'idle' && !isFlipped) {
        // Restart reading vocab
        setAutoStep('reading-vocab');
        speakText(card.vocab, sourceLang, () => {
          setAutoStep('waiting-flip');
          timerRef.current = setTimeout(() => onFlip(), 1500);
        });
      }
    } else {
      setIsPaused(true);
      stop();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  // Speed control handlers
  const decreaseSpeed = () => setSpeed((s) => Math.max(0.5, +(s - 0.1).toFixed(1)));
  const increaseSpeed = () => setSpeed((s) => Math.min(2.0, +(s + 0.1).toFixed(1)));

  // Handle auto mode toggle
  const handleAutoModeToggle = (enabled: boolean) => {
    setAutoMode(enabled);
    if (!enabled) {
      stop();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setAutoStep('idle');
      setIsPaused(false);
    }
  };

  const answerButtons: { quality: ReviewQuality; label: string; icon: React.ReactNode; variant: 'destructive' | 'secondary' | 'default' | 'outline' }[] = [
    { quality: 0, label: 'Again', icon: <XCircle className="h-4 w-4" />, variant: 'destructive' },
    { quality: 2, label: 'Hard', icon: <HelpCircle className="h-4 w-4" />, variant: 'secondary' },
    { quality: 3, label: 'Good', icon: <ThumbsUp className="h-4 w-4" />, variant: 'outline' },
    { quality: 5, label: 'Easy', icon: <CheckCircle className="h-4 w-4" />, variant: 'default' },
  ];

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      {/* Auto Mode Controls */}
      {isSupported && (
        <div className="p-3 bg-muted/50 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Volume2 className="h-5 w-5 text-muted-foreground" />
              <Label htmlFor="auto-mode" className="text-sm font-medium cursor-pointer">
                Auto Play
              </Label>
              <Switch
                id="auto-mode"
                checked={autoMode}
                onCheckedChange={handleAutoModeToggle}
              />
            </div>
            <div className="flex items-center gap-2">
              {/* Settings Dialog */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Settings2 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[320px]">
                  <DialogHeader>
                    <DialogTitle>Auto Play Settings</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="read-meaning" className="cursor-pointer">Read Meaning</Label>
                      <Switch
                        id="read-meaning"
                        checked={readMeaning}
                        onCheckedChange={setReadMeaning}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="read-example" className="cursor-pointer">Read Example</Label>
                      <Switch
                        id="read-example"
                        checked={readExample}
                        onCheckedChange={setReadExample}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="read-translation" className="cursor-pointer">Read Translation</Label>
                      <Switch
                        id="read-translation"
                        checked={readTranslation}
                        onCheckedChange={setReadTranslation}
                      />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {autoMode && (
                <>
                  <span className="text-xs text-muted-foreground">
                    {autoStep === 'reading-vocab' && 'Reading vocab...'}
                    {autoStep === 'waiting-flip' && 'Flipping...'}
                    {autoStep === 'reading-meaning' && 'Reading meaning...'}
                    {autoStep === 'reading-example' && 'Reading example...'}
                    {autoStep === 'reading-example-translation' && 'Reading translation...'}
                    {autoStep === 'waiting-next' && 'Next...'}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handlePauseToggle}
                  >
                    {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  </Button>
                </>
              )}
            </div>
          </div>
          {/* Speed Control */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Speed</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={decreaseSpeed}
                disabled={speed <= 0.5}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="text-sm font-medium w-12 text-center">{speed.toFixed(1)}x</span>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={increaseSpeed}
                disabled={speed >= 2.0}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{stats.total - stats.remaining} / {stats.total}</span>
          <span>
            <span className="text-green-500">{stats.correct}</span>
            {' / '}
            <span className="text-red-500">{stats.incorrect}</span>
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Card */}
      <FlashCard
        card={card}
        isFlipped={isFlipped}
        onFlip={onFlip}
        showAudio
        sourceLang={sourceLang}
        targetLang={targetLang}
      />

      {/* Answer Buttons */}
      {isFlipped && (
        <div className="grid grid-cols-4 gap-2">
          {answerButtons.map((btn) => (
            <Button
              key={btn.quality}
              variant={btn.variant}
              className="flex flex-col gap-1 h-auto py-3"
              onClick={() => onAnswer(btn.quality)}
            >
              {btn.icon}
              <span className="text-xs">{btn.label}</span>
            </Button>
          ))}
        </div>
      )}

      {/* Flip instruction */}
      {!isFlipped && (
        <p className="text-center text-muted-foreground text-sm">
          Think of the answer, then click the card to reveal
        </p>
      )}
    </div>
  );
}
